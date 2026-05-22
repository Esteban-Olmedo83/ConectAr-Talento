'use client'

import * as React from 'react'
import Link from 'next/link'
import { Bell, Calendar, Clock, AlertTriangle, Settings } from 'lucide-react'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotifSettings {
  interviewHours: number
  closingDays: number
  openDays: number
}

const DEFAULT_SETTINGS: NotifSettings = {
  interviewHours: 24,
  closingDays: 7,
  openDays: 30,
}

type NotifType = 'interview' | 'closing' | 'long_open'
type Urgency = 'high' | 'medium' | 'low'

interface Notif {
  id: string
  type: NotifType
  title: string
  message: string
  urgency: Urgency
  href: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ct_notif_settings'

function loadSettings(): NotifSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS
}

function saveSettings(s: NotifSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

const SEEN_KEY = 'ct_notif_seen'

function loadSeen(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY)
    if (raw) return new Set(JSON.parse(raw) as string[])
  } catch { /* ignore */ }
  return new Set()
}

function addSeen(ids: string[]) {
  const seen = loadSeen()
  ids.forEach(id => seen.add(id))
  try { sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen])) } catch { /* ignore */ }
  return seen
}

const URGENCY_COLOR: Record<Urgency, string> = {
  high:   '#f87171',
  medium: '#fbbf24',
  low:    'var(--muted2)',
}

const TYPE_ICON: Record<NotifType, React.ElementType> = {
  interview: Calendar,
  closing:   Clock,
  long_open: AlertTriangle,
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationBell() {
  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  const [open, setOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<Notif[]>([])
  const [settings, setSettings] = React.useState<NotifSettings>(DEFAULT_SETTINGS)
  const [tempSettings, setTempSettings] = React.useState<NotifSettings>(DEFAULT_SETTINGS)
  const [seenIds, setSeenIds] = React.useState<Set<string>>(new Set())
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const s = loadSettings()
    setSettings(s)
    setTempSettings(s)
  }, [])

  React.useEffect(() => {
    setSeenIds(loadSeen())
  }, [])

  const compute = React.useCallback(async (s: NotifSettings) => {
    if (!user?.tenantId) return
    const now = Date.now()
    const result: Notif[] = []

    const [intRes, vacRes, candRes] = await Promise.all([
      provider.getInterviews(undefined, user.tenantId),
      provider.getVacancies(user.tenantId),
      provider.getCandidates(user.tenantId),
    ])

    const vacMap = new Map((vacRes.data ?? []).map(v => [v.id, v]))
    const candMap = new Map((candRes.data ?? []).map(c => [c.id, c]))

    // Upcoming interviews
    for (const i of intRes.data ?? []) {
      if (i.status !== 'Programada') continue
      const ms = new Date(i.scheduledAt).getTime() - now
      if (ms <= 0 || ms > s.interviewHours * 3_600_000) continue
      const hoursLeft = Math.round(ms / 3_600_000)
      const d = new Date(i.scheduledAt)
      const candidateName = candMap.get(i.candidateId)?.fullName ?? ''
      const vacancyTitle = vacMap.get(i.vacancyId)?.title ?? ''
      const dateStr = `${d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
      result.push({
        id: `int-${i.id}`,
        type: 'interview',
        title: `Entrevista en ${hoursLeft}h`,
        message: [vacancyTitle, candidateName, dateStr].filter(Boolean).join(' · '),
        urgency: hoursLeft <= 2 ? 'high' : hoursLeft <= 8 ? 'medium' : 'low',
        href: '/interviews',
      })
    }

    // Vacancies approaching closing date or long open
    for (const v of vacRes.data ?? []) {
      if (v.status === 'Contratado') continue

      if (v.closingDate) {
        const daysLeft = Math.round((new Date(v.closingDate).getTime() - now) / 86_400_000)
        if (daysLeft >= 0 && daysLeft <= s.closingDays) {
          result.push({
            id: `close-${v.id}`,
            type: 'closing',
            title: daysLeft === 0 ? 'Vacante vence hoy' : `Cierra en ${daysLeft}d`,
            message: v.title,
            urgency: daysLeft <= 1 ? 'high' : daysLeft <= 3 ? 'medium' : 'low',
            href: '/vacancies',
          })
        }
      }

      const daysOpen = Math.floor((now - new Date(v.createdAt).getTime()) / 86_400_000)
      if (daysOpen >= s.openDays) {
        result.push({
          id: `open-${v.id}`,
          type: 'long_open',
          title: `Proceso abierto ${daysOpen}d`,
          message: v.title,
          urgency: daysOpen >= s.openDays * 1.5 ? 'medium' : 'low',
          href: '/vacancies',
        })
      }
    }

    // Sort: high urgency first
    result.sort((a, b) => {
      const order: Record<Urgency, number> = { high: 0, medium: 1, low: 2 }
      return order[a.urgency] - order[b.urgency]
    })

    setNotifications(result)
  }, [provider, user?.tenantId])

  React.useEffect(() => {
    compute(settings)
    const id = setInterval(() => compute(settings), 5 * 60_000)
    return () => clearInterval(id)
  }, [compute, settings])

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function applySettings() {
    saveSettings(tempSettings)
    setSettings(tempSettings)
    setSettingsOpen(false)
    compute(tempSettings)
  }

  const total = notifications.length
  const unseenCount = notifications.filter(n => !seenIds.has(n.id)).length
  const highCount = notifications.filter(n => n.urgency === 'high' && !seenIds.has(n.id)).length

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => {
          const willOpen = !open
          if (willOpen && notifications.length > 0) {
            const newSeen = addSeen(notifications.map(n => n.id))
            setSeenIds(newSeen)
          }
          setOpen(v => !v)
        }}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-[var(--surface2)]"
        aria-label="Notificaciones"
        style={{ color: 'var(--muted)' }}
      >
        <Bell className="h-4 w-4" />
        {unseenCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white font-bold leading-none"
            style={{
              background: highCount > 0 ? '#f87171' : 'var(--accent)',
              fontSize: 9,
              minWidth: 15,
              height: 15,
              paddingInline: 2,
            }}
          >
            {unseenCount > 9 ? '9+' : unseenCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-80 rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Alertas
              {total > 0 && (
                <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--muted)' }}>
                  ({total})
                </span>
              )}
            </h3>
            <button
              onClick={() => setSettingsOpen(v => !v)}
              className="p-1 rounded-lg transition-colors hover:bg-[var(--surface2)]"
              title="Configurar umbrales"
              style={{ color: settingsOpen ? 'var(--accent)' : 'var(--muted)' }}
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Settings panel */}
          {settingsOpen && (
            <div
              className="px-4 py-3 space-y-3"
              style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}
            >
              <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                Configurar alertas
              </p>
              {([
                { key: 'interviewHours', label: 'Avisar antes de entrevista', unit: 'horas', min: 1, max: 72 },
                { key: 'closingDays',    label: 'Avisar antes del cierre de vacante', unit: 'días', min: 1, max: 30 },
                { key: 'openDays',       label: 'Alerta si proceso lleva más de', unit: 'días abierto', min: 7, max: 180 },
              ] as const).map(({ key, label, unit, min, max }) => (
                <div key={key}>
                  <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={min}
                      max={max}
                      value={tempSettings[key]}
                      onChange={e => setTempSettings(p => ({ ...p, [key]: Math.max(min, Math.min(max, Number(e.target.value))) }))}
                      className="w-16 px-2 py-1 text-sm rounded-lg outline-none text-center"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{unit}</span>
                  </div>
                </div>
              ))}
              <button
                onClick={applySettings}
                className="w-full py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)' }}
              >
                Guardar
              </button>
            </div>
          )}

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center px-4">
                <Bell className="h-8 w-8 mb-2" style={{ color: 'var(--muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Sin alertas activas
                </p>
                <p className="text-xs mt-1 max-w-[200px]" style={{ color: 'var(--muted)' }}>
                  Te avisaremos cuando haya entrevistas próximas o vacantes por vencer.
                </p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = TYPE_ICON[n.type]
                const color = URGENCY_COLOR[n.urgency]
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface2)]"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <div
                      className="shrink-0 flex items-center justify-center rounded-lg mt-0.5"
                      style={{ width: 28, height: 28, background: `${color}22` }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color }}>
                        {n.title}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted2)' }}>
                        {n.message}
                      </p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
