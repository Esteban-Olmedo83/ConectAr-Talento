'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Clock, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useDraggable } from '@/hooks/useDraggable'
import { useLanguage } from '@/lib/context/language-context'
import { useUser } from '@/lib/context/user-context'
import { Button } from '@/components/ui/button'

interface PendingInterview {
  id: string
  scheduledAt: string
  candidateName: string
  vacancyTitle: string
}

const DISMISS_DURATION_MS = 60 * 60 * 1000 // 1 hour
const POLL_INTERVAL_MS = 5 * 60 * 1000     // 5 minutes
const THRESHOLD_MINUTES = 30

type MessageTier = 'neutral' | 'friendly' | 'urgent'

function getMessageTier(elapsedMinutes: number): MessageTier {
  if (elapsedMinutes >= 12 * 60) return 'urgent'
  if (elapsedMinutes >= 2 * 60) return 'friendly'
  return 'neutral'
}

function isDismissed(id: string): boolean {
  try {
    const raw = localStorage.getItem(`ct_interview_reminder_${id}`)
    if (!raw) return false
    return Date.now() - Number(raw) < DISMISS_DURATION_MS
  } catch {
    return false
  }
}

function setDismissed(id: string) {
  try {
    localStorage.setItem(`ct_interview_reminder_${id}`, String(Date.now()))
  } catch {}
}

export function InterviewReminderModal() {
  const { t } = useLanguage()
  const { user } = useUser()
  const router = useRouter()
  const [interview, setInterview] = React.useState<PendingInterview | null>(null)
  const { style: dragStyle, headerStyle, onMouseDown } = useDraggable()

  const checkPending = React.useCallback(async () => {
    if (!user?.tenantId) return
    const supabase = createClient()
    const threshold = new Date(Date.now() - THRESHOLD_MINUTES * 60 * 1000).toISOString()

    const { data } = await supabase
      .from('interviews')
      .select(`
        id,
        scheduled_at,
        candidate:candidates!candidate_id(full_name, tenant_id),
        vacancy:vacancies!vacancy_id(title)
      `)
      .eq('status', 'Programada')
      .lt('scheduled_at', threshold)
      .order('scheduled_at', { ascending: true })
      .limit(20)

    if (!data) return

    const pending = (data as Array<{ id: string; scheduled_at: string; candidate: { full_name: string; tenant_id: string } | null; vacancy: { title: string } | null }>).find(row => {
      if (!row.candidate || row.candidate.tenant_id !== user.tenantId) return false
      return !isDismissed(row.id)
    })

    if (!pending) {
      setInterview(null)
      return
    }

    setInterview({
      id: pending.id,
      scheduledAt: pending.scheduled_at,
      candidateName: pending.candidate!.full_name,
      vacancyTitle: pending.vacancy?.title ?? '',
    })
  }, [user?.tenantId])

  React.useEffect(() => {
    checkPending()
    const interval = setInterval(checkPending, POLL_INTERVAL_MS)
    const onFocus = () => checkPending()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [checkPending])

  if (!interview) return null

  const elapsedMinutes = Math.floor(
    (Date.now() - new Date(interview.scheduledAt).getTime()) / 60000
  )
  const tier = getMessageTier(elapsedMinutes)

  const elapsedText =
    elapsedMinutes >= 60
      ? t.interviews.reminder.hoursAgo.replace('{n}', String(Math.floor(elapsedMinutes / 60)))
      : t.interviews.reminder.minutesAgo.replace('{n}', String(elapsedMinutes))

  const message = (() => {
    const base =
      tier === 'urgent'
        ? t.interviews.reminder.messageUrgent
        : tier === 'friendly'
          ? t.interviews.reminder.messageFriendly
          : t.interviews.reminder.messageNeutral
    return base
      .replace('{candidate}', interview.candidateName)
      .replace('{vacancy}', interview.vacancyTitle)
      .replace('{elapsed}', elapsedText)
  })()

  const accentColor =
    tier === 'urgent' ? '#ef4444' : tier === 'friendly' ? '#f59e0b' : 'var(--accent)'

  const dismiss = () => {
    setDismissed(interview.id)
    setInterview(null)
    setTimeout(checkPending, 200)
  }

  const complete = () => {
    router.push('/interviews')
    dismiss()
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        ...dragStyle,
        zIndex: 9999,
        width: '360px',
        maxWidth: 'calc(100vw - 48px)',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: `1.5px solid ${accentColor}`,
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* draggable header */}
        <div
          style={{
            ...headerStyle,
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: '10px 14px',
          }}
          onMouseDown={onMouseDown}
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
          <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {t.interviews.reminder.title}
          </span>
          <button
            type="button"
            onClick={dismiss}
            className="rounded p-0.5 transition-colors hover:bg-[var(--accent-soft)]"
            style={{ color: 'var(--muted)' }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* content */}
        <div style={{ padding: '14px 16px' }}>
          <p className="text-sm" style={{ color: 'var(--text)', lineHeight: '1.55' }}>
            {message}
          </p>
          <p className="mt-1.5 text-xs font-medium" style={{ color: accentColor }}>
            {elapsedText}
          </p>
        </div>

        {/* footer */}
        <div
          style={{
            padding: '0 16px 14px',
            display: 'flex',
            gap: '8px',
          }}
        >
          <Button size="sm" onClick={complete} className="flex-1">
            {t.interviews.reminder.complete}
          </Button>
          <Button size="sm" variant="outline" onClick={dismiss} className="flex-1">
            {t.interviews.reminder.remindLater}
          </Button>
        </div>
      </div>
    </div>
  )
}
