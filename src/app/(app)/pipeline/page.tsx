'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Mail,
  MessageCircle,
  X,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  ChevronUp,
  UserX,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import type {
  Application,
  Candidate,
  Vacancy,
  VacancyStatus,
  MessageTemplate,
  InterviewType,
  MeetingPlatform,
  Recommendation,
} from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────
const STAGES: VacancyStatus[] = [
  'Nuevas Vacantes',
  'En Proceso',
  'Entrevistas',
  'Oferta Enviada',
  'Contratado',
]

const STAGE_COLORS: Record<VacancyStatus, string> = {
  'Nuevas Vacantes': '#94a3b8',
  'En Proceso': '#38bdf8',
  'Entrevistas': '#a78bfa',
  'Oferta Enviada': '#fbbf24',
  'Contratado': '#34d399',
  'Descartado': '#6b7280',
}

const RECOMMENDATION_COLORS = {
  Avanzar:    { bg: 'rgba(52,211,153,0.15)',  text: '#34d399' },
  Considerar: { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24' },
  Rechazar:   { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
} as const

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6c63ff, #a78bfa)',
  'linear-gradient(135deg, #0ea5e9, #38bdf8)',
  'linear-gradient(135deg, #10b981, #34d399)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #f43f5e, #fb7185)',
  'linear-gradient(135deg, #d946ef, #e879f9)',
]

function avatarGradient(name: string): string {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length]
}

interface HydratedApplication extends Application {
  candidate?: Candidate
  vacancyTitle?: string
  recommendation?: Recommendation
}

// ─── Source badge colors ──────────────────────────────────────────────────────
const SOURCE_BG: Record<string, string> = {
  LinkedIn: 'rgba(59,130,246,0.15)',
  Portal: 'rgba(108,99,255,0.15)',
  Referido: 'rgba(139,92,246,0.15)',
  Indeed: 'rgba(249,115,22,0.15)',
  Computrabajo: 'rgba(239,68,68,0.15)',
  ZonaJobs: 'rgba(20,184,166,0.15)',
  WhatsApp: 'rgba(34,197,94,0.15)',
  Manual: 'rgba(107,114,128,0.15)',
  Bumeran: 'rgba(14,165,233,0.15)',
}
const SOURCE_TEXT: Record<string, string> = {
  LinkedIn: '#60a5fa',
  Portal: '#a78bfa',
  Referido: '#c084fc',
  Indeed: '#fb923c',
  Computrabajo: '#f87171',
  ZonaJobs: '#2dd4bf',
  WhatsApp: '#4ade80',
  Manual: '#9ca3af',
  Bumeran: '#38bdf8',
}

// ─── Stage pills bar ──────────────────────────────────────────────────────────
function StagePillsBar({
  stages,
  counts,
  activeStage,
  onSelect,
}: {
  stages: VacancyStatus[]
  counts: Record<VacancyStatus, number>
  activeStage: VacancyStatus | 'all'
  onSelect: (s: VacancyStatus | 'all') => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <button
        onClick={() => onSelect('all')}
        style={{
          padding: '5px 12px',
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 600,
          border: '1px solid',
          borderColor: activeStage === 'all' ? 'var(--accent)' : 'var(--border)',
          background: activeStage === 'all' ? 'var(--accent-soft)' : 'transparent',
          color: activeStage === 'all' ? 'var(--accent-2)' : 'var(--muted2)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        Todos
      </button>
      {stages.map(stage => {
        const isActive = activeStage === stage
        const color = STAGE_COLORS[stage]
        return (
          <button
            key={stage}
            onClick={() => onSelect(stage)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid',
              borderColor: isActive ? color : 'var(--border)',
              background: isActive ? `${color}18` : 'transparent',
              color: isActive ? color : 'var(--muted2)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {stage}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 18,
                height: 18,
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 900,
                fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
                background: isActive ? color : 'var(--surface2)',
                color: isActive ? '#fff' : 'var(--muted2)',
                padding: '0 4px',
              }}
            >
              {counts[stage]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Email Modal ───────────────────────────────────────────────────────────────
function EmailModal({
  candidate,
  templates,
  onClose,
}: {
  candidate: Candidate
  templates: MessageTemplate[]
  onClose: () => void
}) {
  const emailTemplates = templates.filter(t => t.channel === 'email')
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>('')
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')
  const [copied, setCopied] = React.useState(false)

  const selectedTemplate = emailTemplates.find(t => t.id === selectedTemplateId)

  React.useEffect(() => {
    if (selectedTemplate) {
      setSubject(selectedTemplate.subject ?? '')
      // Pre-fill nombre_candidato variable if present
      const filledBody = selectedTemplate.body.replace(/\{\{nombre_candidato\}\}/g, candidate.fullName)
      setBody(filledBody)
    }
  }, [selectedTemplate, candidate.fullName])

  function handleCopyEmail() {
    navigator.clipboard.writeText(candidate.email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const mailtoHref = `mailto:${candidate.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}${body ? `${subject ? '&' : '?'}body=${encodeURIComponent(body)}` : ''}`

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    fontSize: 13,
    padding: '8px 12px',
    outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: 4,
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail style={{ width: 15, height: 15, color: '#818cf8' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Enviar email</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{candidate.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Candidate email */}
          <div>
            <label style={labelStyle}>Email del candidato</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ ...inputStyle, flex: 1, color: 'var(--accent-2)', fontWeight: 500 }}>
                {candidate.email}
              </div>
              <button
                onClick={handleCopyEmail}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: copied ? 'rgba(52,211,153,0.15)' : 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: copied ? '#34d399' : 'var(--muted)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap' as const,
                }}
              >
                <Copy style={{ width: 12, height: 12 }} />
                {copied ? 'Copiado' : 'Copiar email'}
              </button>
            </div>
          </div>

          {/* Template selector */}
          {emailTemplates.length > 0 && (
            <div>
              <label style={labelStyle}>Template (opcional)</label>
              <select
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' as const }}
              >
                <option value="">Sin template</option>
                {emailTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Subject */}
          <div>
            <label style={labelStyle}>Asunto</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Asunto del email..."
              style={inputStyle}
            />
          </div>

          {/* Body */}
          <div>
            <label style={labelStyle}>Mensaje</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Escribí tu mensaje..."
              rows={6}
              style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}
          >
            Cancelar
          </button>
          <a
            href={mailtoHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: 'var(--accent)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
            }}
          >
            <Mail style={{ width: 13, height: 13 }} />
            Abrir cliente de email
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── WhatsApp Modal ────────────────────────────────────────────────────────────
function WhatsAppModal({
  candidate,
  templates,
  onClose,
}: {
  candidate: Candidate
  templates: MessageTemplate[]
  onClose: () => void
}) {
  const waTemplates = templates.filter(t => t.channel === 'whatsapp')
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>('')
  const [message, setMessage] = React.useState('')
  const [copied, setCopied] = React.useState(false)

  const selectedTemplate = waTemplates.find(t => t.id === selectedTemplateId)

  React.useEffect(() => {
    if (selectedTemplate) {
      const filled = selectedTemplate.body.replace(/\{\{nombre_candidato\}\}/g, candidate.fullName)
      setMessage(filled)
    } else {
      setMessage(`Hola ${candidate.fullName}!\n\nMe comunico desde el equipo de Talento. ¿Tenés un momento para charlar?`)
    }
  }, [selectedTemplate, candidate.fullName])

  function formatPhone(phone: string): string {
    let digits = phone.replace(/\D/g, '')
    if (digits.startsWith('0')) digits = '54' + digits.slice(1)
    if (!phone.startsWith('+') && !digits.startsWith('54')) digits = '54' + digits
    return digits
  }

  const phone = candidate.phone ? formatPhone(candidate.phone) : null
  // Open WhatsApp WITHOUT text in URL — emojis and formatting are preserved
  // by copying to clipboard first, then pasting in WhatsApp.
  const waUrl = phone ? `https://wa.me/${phone}` : null

  async function handleCopyAndOpen() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => {
        if (waUrl) window.open(waUrl, '_blank', 'noopener,noreferrer')
      }, 400)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Fallback: just open WhatsApp
      if (waUrl) window.open(waUrl, '_blank', 'noopener,noreferrer')
    }
  }

  async function handleCopyOnly() {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    fontSize: 13,
    padding: '8px 12px',
    outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: 4,
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle style={{ width: 15, height: 15, color: '#4ade80' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>WhatsApp</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{candidate.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!candidate.phone && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', fontSize: 12, color: '#fbbf24' }}>
              Este candidato no tiene teléfono registrado. Podés editarlo desde la sección de candidatos.
            </div>
          )}
          {candidate.phone && (
            <div>
              <label style={labelStyle}>Teléfono</label>
              <div style={{ ...inputStyle, color: '#4ade80', fontWeight: 500 }}>{candidate.phone}</div>
            </div>
          )}

          {waTemplates.length > 0 && (
            <div>
              <label style={labelStyle}>Template (opcional)</label>
              <select
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' as const }}
              >
                <option value="">Sin template</option>
                {waTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>Mensaje</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit' }}
            />
          </div>

          {/* Tip */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <Copy style={{ width: 13, height: 13, color: '#4ade80', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
              El botón principal copia el mensaje y abre WhatsApp. Solo pegá con <strong style={{ color: 'var(--text)' }}>Ctrl+V</strong> (o mantené presionado en móvil). Esto garantiza que los emojis y el formato lleguen correctamente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            onClick={handleCopyOnly}
            style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: copied ? '#4ade80' : 'var(--muted)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}
          >
            {copied ? <CheckCircle2 style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
            {copied ? 'Copiado' : 'Solo copiar'}
          </button>
          {waUrl ? (
            <button
              onClick={handleCopyAndOpen}
              style={{ padding: '8px 16px', borderRadius: 8, background: copied ? 'rgba(22,163,74,0.8)' : '#16a34a', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
            >
              <MessageCircle style={{ width: 13, height: 13 }} />
              {copied ? 'Abriendo WhatsApp...' : 'Copiar y abrir WhatsApp'}
            </button>
          ) : (
            <button disabled style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'not-allowed', fontSize: 13 }}>
              Sin teléfono
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Schedule Interview Modal ─────────────────────────────────────────────────
function ScheduleInterviewModal({
  candidate,
  vacancies,
  provider,
  onClose,
  onScheduled,
  applicationId,
  vacancyId: preselectedVacancyId,
}: {
  candidate: Candidate
  vacancies: Vacancy[]
  provider: SupabaseProvider
  onClose: () => void
  onScheduled?: () => void
  applicationId?: string
  vacancyId?: string
}) {
  const { user } = useUser()
  const [form, setForm] = React.useState({
    scheduledAt: '',
    type: 'RRHH' as InterviewType,
    vacancyId: preselectedVacancyId ?? '',
    interviewerName: user?.fullName ?? '',
    interviewerEmail: user?.email ?? '',
    meetingPlatform: 'presencial' as MeetingPlatform,
    meetingLink: '',
    notes: '',
  })
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const result = await provider.createInterview({
      candidateId: candidate.id,
      vacancyId: form.vacancyId || (vacancies[0]?.id ?? ''),
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      type: form.type,
      interviewerName: form.interviewerName,
      interviewerEmail: form.interviewerEmail || undefined,
      status: 'Programada',
      meetingPlatform: form.meetingPlatform,
      meetingLink: form.meetingLink || undefined,
      notes: form.notes || undefined,
    })
    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      // Sync application status to 'Entrevistas' in DB
      if (applicationId && !applicationId.startsWith('virtual-')) {
        await provider.updateApplicationStatus(applicationId, 'Entrevistas')
      }
      setSaved(true)
      onScheduled?.()
      setTimeout(onClose, 1200)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    fontSize: 13,
    padding: '8px 12px',
    outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: 4,
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar style={{ width: 15, height: 15, color: '#a78bfa' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Agendar entrevista</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{candidate.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {saved ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
              <CheckCircle2 style={{ width: 40, height: 40, color: '#34d399' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>¡Entrevista agendada!</p>
            </div>
          ) : (
            <form id="schedule-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Fecha y hora *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Tipo *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as InterviewType }))}
                    style={{ ...inputStyle, appearance: 'none' as const }}
                  >
                    <option value="RRHH">RRHH</option>
                    <option value="Técnica">Técnica</option>
                    <option value="Con Hiring Manager">Con Hiring Manager</option>
                    <option value="Cultural">Cultural</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Modalidad *</label>
                  <select
                    value={form.meetingPlatform}
                    onChange={e => setForm(f => ({ ...f, meetingPlatform: e.target.value as MeetingPlatform }))}
                    style={{ ...inputStyle, appearance: 'none' as const }}
                  >
                    <option value="presencial">Presencial</option>
                    <option value="zoom">Zoom</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="teams">Teams</option>
                  </select>
                </div>
              </div>
              {vacancies.length > 0 && (
                <div>
                  <label style={labelStyle}>Vacante</label>
                  <select
                    value={form.vacancyId}
                    onChange={e => setForm(f => ({ ...f, vacancyId: e.target.value }))}
                    style={{ ...inputStyle, appearance: 'none' as const }}
                  >
                    <option value="">Sin vacante específica</option>
                    {vacancies.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Entrevistador *</label>
                  <input
                    required
                    value={form.interviewerName}
                    onChange={e => setForm(f => ({ ...f, interviewerName: e.target.value }))}
                    placeholder="Nombre"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email entrevistador</label>
                  <input
                    type="email"
                    value={form.interviewerEmail}
                    onChange={e => setForm(f => ({ ...f, interviewerEmail: e.target.value }))}
                    placeholder="email@empresa.com"
                    style={inputStyle}
                  />
                </div>
              </div>
              {(form.meetingPlatform === 'zoom' || form.meetingPlatform === 'google_meet' || form.meetingPlatform === 'teams') && (
                <div>
                  <label style={labelStyle}>Link de la reunión</label>
                  <input
                    value={form.meetingLink}
                    onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))}
                    placeholder="https://..."
                    style={inputStyle}
                  />
                </div>
              )}
              <div>
                <label style={labelStyle}>Notas</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Temas a tratar, preparación necesaria..."
                  style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit' }}
                />
              </div>
              {error && (
                <p style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  {error}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        {!saved && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="schedule-form"
              disabled={saving}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'var(--accent)',
                border: 'none',
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <Calendar style={{ width: 13, height: 13 }} />}
              Agendar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Notes Modal ──────────────────────────────────────────────────────────────
function NotesModal({
  candidate,
  provider,
  onClose,
  onSaved,
}: {
  candidate: Candidate
  provider: SupabaseProvider
  onClose: () => void
  onSaved?: (notes: string) => void
}) {
  const [notes, setNotes] = React.useState(candidate.notes ?? '')
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    const result = await provider.updateCandidateNotes(candidate.id, notes)
    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      onSaved?.(notes)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    fontSize: 13,
    padding: '10px 12px',
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    minHeight: 160,
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 460,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText style={{ width: 15, height: 15, color: '#fbbf24' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Notas</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{candidate.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); setSaved(false) }}
            placeholder="Agregá notas sobre este candidato..."
            style={inputStyle}
          />
          {error && (
            <p style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}
          >
            Cerrar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: saved ? 'rgba(52,211,153,0.2)' : 'var(--accent)',
              border: 'none',
              color: saved ? '#34d399' : '#fff',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.15s',
            }}
          >
            {saving ? (
              <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
            ) : saved ? (
              <CheckCircle2 style={{ width: 13, height: 13 }} />
            ) : (
              <FileText style={{ width: 13, height: 13 }} />
            )}
            {saved ? 'Guardado' : 'Guardar notas'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Action modal state ───────────────────────────────────────────────────────
type ActiveModal =
  | { type: 'email'; candidate: Candidate }
  | { type: 'whatsapp'; candidate: Candidate }
  | { type: 'schedule'; candidate: Candidate; applicationId: string; vacancyId: string }
  | { type: 'notes'; candidate: Candidate }
  | null

// ─── Candidate card ───────────────────────────────────────────────────────────
interface CardProps {
  app: HydratedApplication
  isDragging?: boolean
  onAction: (modal: ActiveModal) => void
  onDecide?: (appId: string, status: 'Oferta Enviada' | 'Descartado') => void
  interviewDate?: string  // ISO string of next scheduled interview
}

function CandidateCard({ app, isDragging, onAction, onDecide, interviewDate }: CardProps) {
  const c = app.candidate
  if (!c) return null
  const [hovered, setHovered] = React.useState(false)

  const stageColor = STAGE_COLORS[app.status]
  const score = c.atsScore ?? 0
  const scoreColor =
    score >= 85 ? '#34d399' :
    score >= 70 ? 'var(--accent-2)' :
    '#fbbf24'

  const daysSince = Math.floor(
    (Date.now() - new Date(app.appliedAt).getTime()) / 86400000
  )

  const skills = c.skills ?? []
  const visibleSkills = skills.slice(0, 3)
  const extraSkills = skills.length - 3

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn('select-none cursor-grab', isDragging && 'opacity-50 rotate-1')}
      style={{
        position: 'relative',
        background: 'var(--surface2)',
        border: `1px solid ${hovered && !isDragging ? stageColor : 'var(--border)'}`,
        borderRadius: 12,
        padding: '12px 12px 10px 16px',
        transform: hovered && !isDragging ? 'translateY(-2px)' : 'none',
        boxShadow: hovered && !isDragging
          ? `0 6px 20px rgba(0,0,0,0.3), 0 0 0 1px ${stageColor}30`
          : isDragging
          ? '0 8px 24px rgba(0,0,0,0.4)'
          : '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'all 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 3,
          background: stageColor,
          borderRadius: '12px 0 0 12px',
        }}
      />

      {/* Avatar + name row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Avatar with score badge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 11,
              background: avatarGradient(c.fullName),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
            }}
          >
            {getInitials(c.fullName)}
          </div>
          {score > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                background: 'var(--surface)',
                border: `1.5px solid var(--border)`,
                borderRadius: 6,
                padding: '1px 4px',
                fontSize: 10,
                fontWeight: 900,
                fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
                color: scoreColor,
                lineHeight: 1.3,
              }}
            >
              {score}
            </div>
          )}
        </div>

        {/* Name + vacancy */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
            {c.fullName}
          </p>
          <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.vacancyTitle}
          </p>
        </div>
      </div>

      {/* Skills chips */}
      {visibleSkills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 9 }}>
          {visibleSkills.map(skill => (
            <span
              key={skill}
              style={{
                fontSize: 10,
                padding: '2px 7px',
                borderRadius: 99,
                background: 'var(--accent-soft)',
                color: 'var(--accent-2)',
                border: '1px solid rgba(var(--accent-rgb), 0.18)',
                fontWeight: 500,
              }}
            >
              {skill}
            </span>
          ))}
          {extraSkills > 0 && (
            <span
              style={{
                fontSize: 10,
                padding: '2px 7px',
                borderRadius: 99,
                background: 'var(--surface3, var(--surface2))',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
                fontWeight: 500,
              }}
            >
              +{extraSkills}
            </span>
          )}
        </div>
      )}

      {/* Scorecard recommendation badge (only in Entrevistas stage) */}
      {app.status === 'Entrevistas' && app.recommendation && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <span
            style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 99,
              fontWeight: 600,
              background: RECOMMENDATION_COLORS[app.recommendation].bg,
              color: RECOMMENDATION_COLORS[app.recommendation].text,
            }}
          >
            Scorecard: {app.recommendation}
          </span>
        </div>
      )}

      {/* Interview indicator */}
      {interviewDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <Calendar style={{ width: 10, height: 10, color: '#a78bfa', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 500 }}>
            Entrevista: {new Date(interviewDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* Bottom meta row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 9,
          paddingTop: 8,
          borderTop: '1px solid var(--border)',
        }}
      >
        {/* Source + days */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {c.source && (
            <span
              style={{
                fontSize: 9,
                padding: '1.5px 6px',
                borderRadius: 99,
                fontWeight: 600,
                background: SOURCE_BG[c.source] ?? 'rgba(107,114,128,0.15)',
                color: SOURCE_TEXT[c.source] ?? '#9ca3af',
              }}
            >
              {c.source}
            </span>
          )}
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>
            {daysSince === 0 ? 'Hoy' : `${daysSince}d`}
          </span>
        </div>

        {/* Quick action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
        >
          <button
            onClick={e => { e.stopPropagation(); onAction({ type: 'email', candidate: c }) }}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted2)',
            }}
            title="Enviar email"
          >
            <Mail style={{ width: 11, height: 11 }} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onAction({ type: 'schedule', candidate: c, applicationId: app.id, vacancyId: app.vacancyId }) }}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted2)',
            }}
            title="Agendar entrevista"
          >
            <Calendar style={{ width: 11, height: 11 }} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onAction({ type: 'whatsapp', candidate: c }) }}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted2)',
            }}
            title="WhatsApp"
          >
            <MessageCircle style={{ width: 11, height: 11 }} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onAction({ type: 'notes', candidate: c }) }}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted2)',
            }}
            title="Notas"
          >
            <FileText style={{ width: 11, height: 11 }} />
          </button>
        </div>
      </div>

      {/* Avanzar / Descartar — only visible on hover for Entrevistas stage */}
      {app.status === 'Entrevistas' && onDecide && hovered && !isDragging && (
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          <button
            onClick={e => { e.stopPropagation(); onDecide(app.id, 'Oferta Enviada') }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '4px 0',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              background: 'rgba(52,211,153,0.15)',
              border: '1px solid rgba(52,211,153,0.3)',
              color: '#34d399',
              cursor: 'pointer',
            }}
            title="Avanzar a Oferta Enviada"
          >
            <CheckCircle2 style={{ width: 10, height: 10 }} /> Avanzar
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDecide(app.id, 'Descartado') }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '4px 0',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              background: 'rgba(248,113,113,0.15)',
              border: '1px solid rgba(248,113,113,0.3)',
              color: '#f87171',
              cursor: 'pointer',
            }}
            title="Descartar candidato"
          >
            <XCircle style={{ width: 10, height: 10 }} /> Descartar
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sortable card ────────────────────────────────────────────────────────────
function SortableCard({ app, onAction, onDecide, interviewDate }: { app: HydratedApplication; onAction: (modal: ActiveModal) => void; onDecide?: (appId: string, status: 'Oferta Enviada' | 'Descartado') => void; interviewDate?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: app.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CandidateCard app={app} isDragging={isDragging} onAction={onAction} onDecide={onDecide} interviewDate={interviewDate} />
    </div>
  )
}

// ─── Lane ─────────────────────────────────────────────────────────────────────
function Lane({
  stage,
  apps,
  onAction,
  onDecide,
  interviewsByCandidate,
}: {
  stage: VacancyStatus
  apps: HydratedApplication[]
  onAction: (modal: ActiveModal) => void
  onDecide: (appId: string, status: 'Oferta Enviada' | 'Descartado') => void
  interviewsByCandidate: Map<string, string>
}) {
  const stageColor = STAGE_COLORS[stage]
  return (
    <div
      className="flex flex-col rounded-xl min-w-[270px] w-[270px] flex-shrink-0"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        '--lane-color': stageColor,
        overflow: 'hidden',
        height: '100%',
      } as React.CSSProperties}
    >
      {/* Lane header — 3px top bar + title row */}
      <div
        style={{
          position: 'relative',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* 3px top color bar */}
        <div style={{ height: 3, background: stageColor }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px' }}>
          {/* Stage dot */}
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: stageColor, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{stage}</span>
          {/* Count badge */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 900,
              fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
              padding: '1px 8px',
              borderRadius: 99,
              background: `${stageColor}22`,
              color: stageColor,
            }}
          >
            {apps.length}
          </span>
          {/* Add button */}
          <button
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted)',
              flexShrink: 0,
            }}
          >
            <Plus style={{ width: 11, height: 11 }} />
          </button>
        </div>
      </div>

      <SortableContext items={apps.map(a => a.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, flex: 1, minHeight: 120, overflowY: 'auto' }}>
          {apps.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '28px 0', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus style={{ width: 14, height: 14, color: 'var(--muted)' }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>Sin candidatos</p>
            </div>
          )}
          {apps.map(app => (
            <SortableCard key={app.id} app={app} onAction={onAction} onDecide={onDecide} interviewDate={interviewsByCandidate.get(app.candidateId)} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
      {STAGES.map(s => (
        <div
          key={s}
          style={{
            minWidth: 270,
            width: 270,
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            overflow: 'hidden',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          <div style={{ height: 3, background: `${STAGE_COLORS[s]}55` }} />
          <div style={{ height: 40, background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }} />
          <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ height: 90, borderRadius: 10, background: 'var(--surface2)' }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Hire dialog ─────────────────────────────────────────────────────────────
function HireDialog({
  app,
  provider,
  onClose,
  onVacancyClosed,
}: {
  app: HydratedApplication
  provider: SupabaseProvider
  onClose: () => void
  onVacancyClosed: (vacancyId: string) => void
}) {
  const [closing, setClosing] = React.useState(false)
  const candidateName = app.candidate?.fullName ?? 'el candidato'
  const vacancyTitle = app.vacancyTitle

  async function handleCloseVacancy() {
    setClosing(true)
    await provider.closeVacancy(app.vacancyId)
    onVacancyClosed(app.vacancyId)
    setClosing(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 style={{ width: 18, height: 18, color: '#34d399' }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>¡{candidateName} contratado/a!</p>
              {vacancyTitle && <p style={{ fontSize: 12, color: 'var(--muted)' }}>{vacancyTitle}</p>}
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 16 }}>
            ¿Querés cerrar la vacante <strong style={{ color: 'var(--text)' }}>{vacancyTitle}</strong>? Esto la marcará como cubierta y no aparecerá en el pipeline.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px 20px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}
          >
            Mantener abierta
          </button>
          <button
            onClick={handleCloseVacancy}
            disabled={closing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#34d399', border: 'none', color: '#fff', cursor: closing ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: closing ? 0.7 : 1 }}
          >
            {closing && <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />}
            Cerrar vacante
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PipelinePage() {
  const [applications, setApplications] = React.useState<HydratedApplication[]>([])
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [templates, setTemplates] = React.useState<MessageTemplate[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeApp, setActiveApp] = React.useState<HydratedApplication | null>(null)
  const [filterVacancy, setFilterVacancy] = React.useState<string>('all')
  const [filterScore, setFilterScore] = React.useState<string>('all')
  const [searchText, setSearchText] = React.useState('')
  const [activeStage, setActiveStage] = React.useState<VacancyStatus | 'all'>('all')
  const [activeModal, setActiveModal] = React.useState<ActiveModal>(null)
  const [interviewsByCandidate, setInterviewsByCandidate] = React.useState<Map<string, string>>(new Map())
  const [hireDialog, setHireDialog] = React.useState<{ app: HydratedApplication } | null>(null)

  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const load = React.useCallback(async () => {
    if (!user) return

    const tenantId = user.tenantId
    setLoading(true)
    const [appsResult, vacResult, candResult, intResult, tplResult] = await Promise.all([
      provider.getApplications(),
      provider.getVacancies(tenantId),
      provider.getCandidates(tenantId),
      provider.getInterviews(),
      provider.getTemplates(tenantId),
    ])
    const vacs = vacResult.data ?? []
    const vacMap = new Map(vacs.map(v => [v.id, v.title]))

    // Build set of candidate IDs that already have a real application
    const realApps = appsResult.data ?? []
    const candidateIdsWithApp = new Set(realApps.map(a => a.candidateId))

    // Build set of candidate IDs that have at least one interview scheduled
    const interviews = intResult.data ?? []
    const candidateIdsWithInterview = new Set(interviews.map(i => i.candidateId))

    // Build map of candidateId → earliest upcoming interview date
    const intMap = new Map<string, string>()
    interviews.forEach(i => {
      if (i.status === 'Programada') {
        const existing = intMap.get(i.candidateId)
        if (!existing || i.scheduledAt < existing) {
          intMap.set(i.candidateId, i.scheduledAt)
        }
      }
    })
    setInterviewsByCandidate(intMap)

    // Hydrate real applications
    const hydrated: HydratedApplication[] = realApps.map(a => {
      const effectiveStatus: VacancyStatus =
        candidateIdsWithInterview.has(a.candidateId) &&
        (a.status === 'Nuevas Vacantes' || a.status === 'En Proceso')
          ? 'Entrevistas'
          : a.status
      return {
        ...a,
        status: effectiveStatus,
        vacancyTitle: vacMap.get(a.vacancyId) ?? '',
      }
    })

    // Create virtual applications for candidates that have no real application
    const allCandidates = candResult.data ?? []
    const now = new Date().toISOString()
    const virtualApps: HydratedApplication[] = allCandidates
      .filter(c => !candidateIdsWithApp.has(c.id))
      .map(c => {
        const stage: VacancyStatus = candidateIdsWithInterview.has(c.id)
          ? 'Entrevistas'
          : 'Nuevas Vacantes'
        return {
          id: `virtual-${c.id}`,
          vacancyId: '',
          candidateId: c.id,
          candidate: c,
          status: stage,
          positionInStage: 0,
          appliedAt: c.appliedAt ?? c.createdAt ?? now,
          updatedAt: c.createdAt ?? now,
          vacancyTitle: '',
        }
      })

    setApplications([...hydrated, ...virtualApps])
    setVacancies(vacs)
    setTemplates(tplResult.data ?? [])
    const vacancyParam = searchParams.get('vacancy')
    if (vacancyParam && vacs.some(v => v.id === vacancyParam)) {
      setFilterVacancy(vacancyParam)
    }
    setLoading(false)
  }, [provider, user, searchParams])

  React.useEffect(() => {
    if (pathname === '/pipeline') {
      load()
    }
  }, [load, pathname])

  React.useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        load()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [load])

  React.useEffect(() => {
    function handleChange() { load() }
    window.addEventListener('vacancy:created', handleChange)
    window.addEventListener('vacancy:updated', handleChange)
    window.addEventListener('application:stage-changed', handleChange)
    return () => {
      window.removeEventListener('vacancy:created', handleChange)
      window.removeEventListener('vacancy:updated', handleChange)
      window.removeEventListener('application:stage-changed', handleChange)
    }
  }, [load])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const filtered = React.useMemo(() => {
    return applications.filter(a => {
      const c = a.candidate
      if (!c) return false
      if (activeStage !== 'all' && a.status !== activeStage) return false
      if (filterVacancy !== 'all' && a.vacancyId !== filterVacancy) return false
      if (filterScore === '80+' && (c.atsScore ?? 0) < 80) return false
      if (filterScore === '60-79' && ((c.atsScore ?? 0) < 60 || (c.atsScore ?? 0) >= 80)) return false
      if (filterScore === '<60' && (c.atsScore ?? 0) >= 60) return false
      if (searchText && !c.fullName.toLowerCase().includes(searchText.toLowerCase())) return false
      return true
    })
  }, [applications, activeStage, filterVacancy, filterScore, searchText])

  const stageCounts = React.useMemo(() => {
    const map: Record<VacancyStatus, number> = {
      'Nuevas Vacantes': 0,
      'En Proceso': 0,
      'Entrevistas': 0,
      'Oferta Enviada': 0,
      'Contratado': 0,
      'Descartado': 0,
    }
    applications.forEach(a => {
      if (map[a.status] !== undefined) map[a.status]++
    })
    return map
  }, [applications])

  const byStage = React.useMemo(() => {
    const map: Record<VacancyStatus, HydratedApplication[]> = {
      'Nuevas Vacantes': [],
      'En Proceso': [],
      'Entrevistas': [],
      'Oferta Enviada': [],
      'Contratado': [],
      'Descartado': [],
    }
    filtered.forEach(a => {
      if (map[a.status]) map[a.status].push(a)
    })
    return map
  }, [filtered])

  function handleDragStart(event: DragStartEvent) {
    const app = applications.find(a => a.id === event.active.id)
    setActiveApp(app ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveApp(null)
    if (!over) return
    const draggedApp = applications.find(a => a.id === active.id)
    if (!draggedApp) return

    let newStage: VacancyStatus | null = null
    for (const stage of STAGES) {
      if (over.id === stage || byStage[stage].some(a => a.id === over.id)) {
        newStage = stage
        break
      }
    }
    if (!newStage || newStage === draggedApp.status) return

    setApplications(prev =>
      prev.map(a => a.id === draggedApp.id ? { ...a, status: newStage! } : a)
    )

    const isVirtual = draggedApp.id.startsWith('virtual-')
    if (!isVirtual) {
      await provider.updateApplicationStatus(draggedApp.id, newStage)
      // If hired and has a real vacancy, offer to close the vacancy
      if (newStage === 'Contratado' && draggedApp.vacancyId) {
        setHireDialog({ app: draggedApp })
      }
    }
  }

  // When an interview is scheduled, promote the candidate's status to Entrevistas and reload data
  function handleInterviewScheduled(candidateId: string) {
    setApplications(prev =>
      prev.map(a => {
        if (
          a.candidateId === candidateId &&
          (a.status === 'Nuevas Vacantes' || a.status === 'En Proceso')
        ) {
          return { ...a, status: 'Entrevistas' as VacancyStatus }
        }
        return a
      })
    )
    // Reload all data to get updated interview dates
    load()
  }

  async function handleDecide(appId: string, newStatus: 'Oferta Enviada' | 'Descartado') {
    const isVirtual = appId.startsWith('virtual-')
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
    if (!isVirtual) {
      await provider.updateApplicationStatus(appId, newStatus)
      window.dispatchEvent(new CustomEvent('application:stage-changed'))
    }
  }

  // When a vacancy is closed after hiring, remove it from the list
  function handleVacancyClosed(vacancyId: string) {
    setVacancies(prev => prev.filter(v => v.id !== vacancyId))
    setHireDialog(null)
  }

  // Update notes on the in-memory candidate object
  function handleNotesSaved(candidateId: string, notes: string) {
    setApplications(prev =>
      prev.map(a => {
        if (a.candidate && a.candidate.id === candidateId) {
          return { ...a, candidate: { ...a.candidate, notes } }
        }
        return a
      })
    )
  }

  if (loading) return (
    <div style={{ padding: 24 }}>
      <div style={{ height: 36, width: 280, borderRadius: 8, background: 'var(--surface2)', marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <Skeleton />
    </div>
  )

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    fontSize: 13,
    padding: '6px 12px',
    outline: 'none',
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stage pills bar */}
      <div
        style={{
          padding: '10px 24px',
          borderBottom: '1px solid var(--border)',
          marginBottom: 0,
        }}
      >
        <StagePillsBar
          stages={STAGES}
          counts={stageCounts}
          activeStage={activeStage}
          onSelect={setActiveStage}
        />
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-3 py-3 flex-wrap shrink-0 px-6"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
            style={{ color: 'var(--muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar candidato..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
            className="w-44"
          />
        </div>
        <div className="relative">
          <select
            value={filterVacancy}
            onChange={e => setFilterVacancy(e.target.value)}
            style={{ ...inputStyle, paddingRight: 28, appearance: 'none' as const }}
          >
            <option value="all">Todas las vacantes</option>
            {vacancies.map(v => (
              <option key={v.id} value={v.id}>{v.title}</option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color: 'var(--muted)' }}
          />
        </div>
        <div className="relative">
          <select
            value={filterScore}
            onChange={e => setFilterScore(e.target.value)}
            style={{ ...inputStyle, paddingRight: 28, appearance: 'none' as const }}
          >
            <option value="all">Todos los scores</option>
            <option value="80+">Excelente (80+)</option>
            <option value="60-79">Bueno (60-79)</option>
            <option value="<60">Regular (&lt;60)</option>
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color: 'var(--muted)' }}
          />
        </div>
        {(filterVacancy !== 'all' || filterScore !== 'all' || searchText || activeStage !== 'all') && (
          <button
            onClick={() => { setFilterVacancy('all'); setFilterScore('all'); setSearchText(''); setActiveStage('all') }}
            className="text-xs flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: 'var(--muted)' }}
          >
            <Filter className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
        <div className="ml-auto">
          <Link href="/vacancies">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nueva Vacante
            </Button>
          </Link>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4" style={{ minHeight: '100%' }}>
            {STAGES.map(stage => (
              <Lane key={stage} stage={stage} apps={byStage[stage]} onAction={setActiveModal} onDecide={handleDecide} interviewsByCandidate={interviewsByCandidate} />
            ))}
          </div>
          <DragOverlay>
            {activeApp && <CandidateCard app={activeApp} isDragging onAction={() => {}} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      {activeModal?.type === 'email' && (
        <EmailModal
          candidate={activeModal.candidate}
          templates={templates}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === 'whatsapp' && (
        <WhatsAppModal
          candidate={activeModal.candidate}
          templates={templates}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === 'schedule' && (
        <ScheduleInterviewModal
          candidate={activeModal.candidate}
          vacancies={vacancies}
          provider={provider}
          onClose={() => setActiveModal(null)}
          onScheduled={() => handleInterviewScheduled(activeModal.candidate.id)}
          applicationId={activeModal.applicationId}
          vacancyId={activeModal.vacancyId}
        />
      )}
      {activeModal?.type === 'notes' && (
        <NotesModal
          candidate={activeModal.candidate}
          provider={provider}
          onClose={() => setActiveModal(null)}
          onSaved={(notes) => handleNotesSaved(activeModal.candidate.id, notes)}
        />
      )}
      {hireDialog && (
        <HireDialog
          app={hireDialog.app}
          provider={provider}
          onClose={() => setHireDialog(null)}
          onVacancyClosed={handleVacancyClosed}
        />
      )}
    </div>
  )
}
