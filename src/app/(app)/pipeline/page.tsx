'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronRight,
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
import { useDraggable } from '@/hooks/useDraggable'
import { useUser } from '@/lib/context/user-context'
import { isAutoNotifyEnabled } from '@/lib/auto-notify'
import { useLanguage } from '@/lib/context/language-context'
import type {
  Application,
  Candidate,
  Client,
  Vacancy,
  VacancyStatus,
  CandidateDisposition,
  MessageTemplate,
  Interview,
  InterviewType,
  MeetingPlatform,
  Recommendation,
  RejectionReason,
} from '@/types'

type DecisionAction = 'avanzar' | 'rechazar' | 'a_considerar' | 'descartar_cv' | 'avanzar_etapa'
const DECISION_CONFIG: Record<DecisionAction, { label: string; bg: string; color: string; border: string }> = {
  avanzar:       { label: 'Avanzar',         bg: 'rgba(52,211,153,0.15)',  color: '#34d399', border: 'rgba(52,211,153,0.3)' },
  rechazar:      { label: 'Rechazar',         bg: 'rgba(248,113,113,0.15)', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
  a_considerar:  { label: 'A considerar',     bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
  descartar_cv:  { label: 'Descartar CV',     bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
  avanzar_etapa: { label: 'Avanzar etapa',    bg: 'rgba(52,211,153,0.15)',  color: '#34d399', border: 'rgba(52,211,153,0.3)' },
}

export const REJECTION_REASONS: { value: RejectionReason; label: string; desc: string }[] = [
  { value: 'no_apto_perfil',        label: 'No cumple el perfil',        desc: 'El candidato no cumple los requisitos de la vacante' },
  { value: 'mejor_candidato',       label: 'Mejor candidato seleccionado', desc: 'Se eligió un candidato con perfil más adecuado para el puesto' },
  { value: 'candidato_declino',     label: 'Candidato declinó',           desc: 'El candidato rechazó la oferta o se retiró del proceso' },
  { value: 'fuera_rango_salarial',  label: 'Fuera de rango salarial',     desc: 'Las expectativas salariales no coincidieron' },
  { value: 'decision_empresa',      label: 'Decisión empresarial',        desc: 'La empresa decidió no continuar sin causa específica' },
  { value: 'otro',                  label: 'Otro motivo',                 desc: 'Otro motivo (completar en la nota)' },
]

// ─── Types ────────────────────────────────────────────────────────────────────
const STAGES: VacancyStatus[] = [
  'Nuevas Vacantes',
  'En Proceso',
  'Entrevistas',
  'A considerar',
  'Oferta Enviada',
  'Contratado',
]

const STAGE_COLORS: Record<VacancyStatus, string> = {
  'Nuevas Vacantes': '#94a3b8',
  'En Proceso': '#38bdf8',
  'Entrevistas': '#a78bfa',
  'A considerar': '#fb923c',
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
  const { t } = useLanguage()
  const stageLabels: Record<string, string> = {
    'Nuevas Vacantes': t.stages.newVacancies,
    'En Proceso': t.stages.inProcess,
    'Entrevistas': t.stages.interviews,
    'Oferta Enviada': t.stages.offerSent,
    'Contratado': t.stages.hired,
    'Descartado': t.stages.discarded,
  }
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
        {t.pipeline.tabAll}
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
            {stageLabels[stage] ?? stage}
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
const VARIABLE_LABELS: Record<string, string> = {
  vacante: 'Vacante', empresa: 'Empresa', nombre_candidato: 'Nombre del Candidato',
  salario: 'Salario', modalidad: 'Modalidad', fecha_inicio: 'Fecha de Inicio',
  fecha_entrevista: 'Fecha de Entrevista', hora_entrevista: 'Hora de Entrevista',
  modalidad_entrevista: 'Modalidad Entrevista', link_reunion: 'Link de Reunión',
  reclutador: 'Reclutador', fecha_vencimiento_oferta: 'Fecha Vencimiento Oferta',
  dias_revision: 'Días Hábiles', email_contacto: 'Email de Contacto',
  resultado_mensaje: 'Resultado', mensaje_adicional: 'Mensaje Adicional',
  ubicacion: 'Ubicación', empresa_cliente: 'Empresa Cliente',
  direccion_entrevista: 'Dirección de Entrevista',
  instrucciones_llegada: 'Instrucciones al Llegar',
}

function extractUnfilledVars(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) ?? []
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))]
}

function EmailModal({
  candidate,
  templates,
  vacancies,
  initialVacancy,
  interview,
  onClose,
  onStagePrompt,
}: {
  candidate: Candidate
  templates: MessageTemplate[]
  vacancies: Vacancy[]
  initialVacancy?: Vacancy
  interview?: Interview
  onClose: () => void
  onStagePrompt?: () => void
}) {
  const { style: dragStyle, headerStyle, onMouseDown } = useDraggable()
  const emailTemplates = templates.filter(t => t.channel === 'email')
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>(
    emailTemplates.length > 0 ? emailTemplates[0].id : ''
  )
  const [selectedVacancyId, setSelectedVacancyId] = React.useState<string>(
    initialVacancy?.id ?? ''
  )
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')
  const [copied, setCopied] = React.useState(false)
  const [tab, setTab] = React.useState<'fill' | 'preview'>('fill')
  const [extraVars, setExtraVars] = React.useState<Record<string, string>>({})
  const [diasRevisionEnabled, setDiasRevisionEnabled] = React.useState(false)
  const [diasRevisionValue, setDiasRevisionValue] = React.useState('')

  const selectedTemplate = emailTemplates.find(t => t.id === selectedTemplateId)
  const vacancy = vacancies.find(v => v.id === selectedVacancyId) ?? initialVacancy

  function autoFill(text: string): string {
    const salario = vacancy?.salaryMin
      ? `${vacancy.currency ?? 'ARS'} ${vacancy.salaryMin.toLocaleString()}`
      : null
    const intDate = interview ? new Date(interview.scheduledAt) : null
    const dateStr = intDate
      ? intDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : ''
    const timeStr = intDate
      ? intDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs'
      : ''
    let out = text
      .replace(/\{\{nombre_candidato\}\}/g, candidate.fullName)
      .replace(/\{\{fecha_entrevista\}\}/g, dateStr)
      .replace(/\{\{hora_entrevista\}\}/g, timeStr)
      .replace(/\{\{modalidad_entrevista\}\}/g, interview?.meetingPlatform ?? '')
      .replace(/\{\{link_reunion\}\}/g, interview?.meetingLink ?? '')
      .replace(/\{\{reclutador\}\}/g, interview?.interviewerName ?? '')
    if (vacancy?.title) out = out.replace(/\{\{vacante\}\}/g, vacancy.title)
    if (vacancy?.client?.name) out = out.replace(/\{\{empresa\}\}/g, vacancy.client.name)
    if (vacancy?.modality) out = out.replace(/\{\{modalidad\}\}/g, vacancy.modality)
    if (vacancy?.location) out = out.replace(/\{\{ubicacion\}\}/g, vacancy.location)
    if (vacancy?.client?.interviewAddress) out = out.replace(/\{\{direccion_entrevista\}\}/g, vacancy.client.interviewAddress)
    if (vacancy?.client?.interviewArrivalDetails) out = out.replace(/\{\{instrucciones_llegada\}\}/g, vacancy.client.interviewArrivalDetails)
    // Only replace salario/fecha_inicio if we have a real value; otherwise leave {{var}} intact
    if (salario) out = out.replace(/\{\{salario\}\}/g, salario)
    return out
  }

  React.useEffect(() => {
    if (selectedTemplate) {
      const filledSubj = autoFill(selectedTemplate.subject ?? '')
      const filledBody = autoFill(selectedTemplate.body)
      setSubject(filledSubj)
      setBody(filledBody)
      // Detect remaining unfilled vars
      const remaining = extractUnfilledVars(filledBody + ' ' + filledSubj)
      // dias_revision handled separately via toggle
      const withoutDias = remaining.filter(v => v !== 'dias_revision')
      setExtraVars(Object.fromEntries(withoutDias.map(v => [v, ''])))
    } else {
      setSubject('')
      setBody(`Hola ${candidate.fullName},\n\n`)
      setExtraVars({})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId, candidate.fullName, selectedVacancyId])

  function applyExtraVars(text: string): string {
    let out = text
    for (const [k, v] of Object.entries(extraVars)) {
      out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v || `{{${k}}}`)
    }
    // Apply dias_revision: replace with value if enabled, otherwise strip placeholder
    if (diasRevisionEnabled && diasRevisionValue) {
      out = out.replace(/\{\{dias_revision\}\}/g, diasRevisionValue)
    } else {
      out = out.replace(/\{\{dias_revision\}\}/g, '')
    }
    // Remove lines with emoji+unfilled vars
    out = out.replace(/^[^\S\n]*[\u{1F4C5}\u{1F550}\u{1F4CD}\u{1F517}\u{1F4B0}\u{1F4CC}]\s*[^:\n]*:\s*\{\{[^}]+\}\}\n?/gmu, '')
    // Remove emoji lines where the value is empty (e.g. link presencial)
    out = out.replace(/^[^\S\n]*[\u{1F4C5}\u{1F550}\u{1F4CD}\u{1F517}\u{1F4B0}\u{1F4CC}]\s*[^:\n]*:\s*$\n?/gmu, '')
    // Clean up double spaces (e.g. from removed inline {{var}})
    out = out.replace(/  +/g, ' ')
    out = out.replace(/\n{3,}/g, '\n\n').trim()
    return out
  }

  const previewSubject = applyExtraVars(subject)
  const previewBody = applyExtraVars(body)

  // Abrir directamente en Gmail con datos pre-llenados
  // Sin modal del navegador
  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(candidate.email)}${previewSubject || previewBody ? '&' : ''}${previewSubject ? `subject=${encodeURIComponent(previewSubject)}` : ''}${previewSubject && previewBody ? '&' : ''}${previewBody ? `body=${encodeURIComponent(previewBody)}` : ''}`

  function handleCopyEmail() {
    navigator.clipboard.writeText(candidate.email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
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
      
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 'min(520px, 95vw)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          ...dragStyle,
        }}
      >
        {/* Header */}
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', ...headerStyle }}
          onMouseDown={onMouseDown}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail style={{ width: 15, height: 15, color: '#818cf8' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Enviar email</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{candidate.fullName} · {selectedTemplate?.name ?? 'Sin template'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Template selector */}
        <div style={{ padding: '12px 20px 0', borderBottom: '1px solid var(--border)' }}>
          {emailTemplates.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Template</label>
              <select
                value={selectedTemplateId}
                onChange={e => { setSelectedTemplateId(e.target.value); setTab('fill') }}
                style={{ ...inputStyle, appearance: 'none' as const }}
              >
                <option value="">Sin template</option>
                {emailTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
          {/* Vacancy selector */}
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Vacante</label>
            <select
              value={selectedVacancyId}
              onChange={e => { setSelectedVacancyId(e.target.value); setTab('fill') }}
              style={{ ...inputStyle, appearance: 'none' as const }}
            >
              <option value="">Sin vacante</option>
              {vacancies.map(v => (
                <option key={v.id} value={v.id}>{v.title}{v.client?.name ? ` · ${v.client.name}` : ''}</option>
              ))}
            </select>
            {vacancy?.client?.name && (
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                Cliente: <span style={{ color: 'var(--accent-2)', fontWeight: 500 }}>{vacancy.client.name}</span>
              </p>
            )}
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0 }}>
            {(['fill', 'preview'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: tab === t ? 'var(--accent-2)' : 'var(--muted)',
                  borderBottom: `2px solid ${tab === t ? 'var(--accent-2)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                {t === 'fill' ? 'Completar variables' : 'Vista previa'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'fill' ? (
            <>
              {/* Email address */}
              <div>
                <label style={labelStyle}>Email del candidato</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ ...inputStyle, flex: 1, color: 'var(--accent-2)', fontWeight: 500 }}>
                    {candidate.email}
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    style={{ padding: '8px 12px', borderRadius: 8, background: copied ? 'rgba(52,211,153,0.15)' : 'var(--surface2)', border: '1px solid var(--border)', color: copied ? '#34d399' : 'var(--muted)', cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', whiteSpace: 'nowrap' as const }}
                  >
                    <Copy style={{ width: 12, height: 12 }} />
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Manual variable inputs for unfilled vars */}
              {(Object.keys(extraVars).length > 0 || (body + subject).includes('{{dias_revision}}')) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={labelStyle}>Variables a completar</label>
                  {Object.entries(extraVars).map(([k, v]) => (
                    <div key={k}>
                      <label style={{ ...labelStyle, textTransform: 'none', fontSize: 12 }}>
                        {VARIABLE_LABELS[k] ?? k}
                      </label>
                      <input
                        type="text"
                        value={v}
                        onChange={e => setExtraVars(prev => ({ ...prev, [k]: e.target.value }))}
                        placeholder={VARIABLE_LABELS[k] ?? k}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                  {/* dias_revision toggle */}
                  {(body + subject).includes('{{dias_revision}}') && (
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={diasRevisionEnabled}
                          onChange={e => {
                            setDiasRevisionEnabled(e.target.checked)
                            if (!e.target.checked) setDiasRevisionValue('')
                          }}
                          style={{ width: 15, height: 15, accentColor: 'var(--accent-2)', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                          Especificar días hábiles de revisión
                        </span>
                      </label>
                      {diasRevisionEnabled && (
                        <input
                          type="number"
                          min={1}
                          value={diasRevisionValue}
                          onChange={e => setDiasRevisionValue(e.target.value)}
                          placeholder="Ej: 5"
                          style={{ ...inputStyle, marginTop: 8, width: 120 }}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Subject editable */}
              <div>
                <label style={labelStyle}>Asunto</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Asunto del email..." style={inputStyle} />
              </div>

              {/* Body editable */}
              <div>
                <label style={labelStyle}>Mensaje</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Escribí tu mensaje..." rows={6} style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit' }} />
              </div>
            </>
          ) : (
            <>
              {/* Vista previa */}
              {previewSubject && (
                <div>
                  <label style={labelStyle}>Asunto</label>
                  <div style={{ ...inputStyle, color: 'var(--text)', fontWeight: 500 }}>{previewSubject}</div>
                </div>
              )}
              <div>
                <label style={labelStyle}>Mensaje</label>
                <div style={{ ...inputStyle, whiteSpace: 'pre-wrap' as const, lineHeight: 1.6, minHeight: 120, color: 'var(--text)' }}>
                  {previewBody || <span style={{ color: 'var(--muted)' }}>Sin contenido</span>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              window.open(gmailHref, '_blank')
              onClose()
              onStagePrompt?.()
            }}
            style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Mail style={{ width: 13, height: 13 }} />
            Enviar email
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── WhatsApp Modal ────────────────────────────────────────────────────────────
function WhatsAppModal({
  candidate,
  templates,
  vacancies,
  initialVacancy,
  interview,
  onClose,
  onStagePrompt,
}: {
  candidate: Candidate
  templates: MessageTemplate[]
  vacancies: Vacancy[]
  initialVacancy?: Vacancy
  interview?: Interview
  onClose: () => void
  onStagePrompt?: () => void
}) {
  const { style: dragStyle, headerStyle, onMouseDown } = useDraggable()
  const waTemplates = templates.filter(t => t.channel === 'whatsapp')
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>(
    waTemplates.length > 0 ? waTemplates[0].id : ''
  )
  const [selectedVacancyId, setSelectedVacancyId] = React.useState<string>(
    initialVacancy?.id ?? ''
  )
  const [message, setMessage] = React.useState('')

  const selectedTemplate = waTemplates.find(t => t.id === selectedTemplateId)
  const vacancy = vacancies.find(v => v.id === selectedVacancyId) ?? initialVacancy

  function fillVars(text: string): string {
    const intDate = interview ? new Date(interview.scheduledAt) : null
    const dateStr = intDate
      ? intDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : ''
    const timeStr = intDate
      ? intDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs'
      : ''
    const salario = vacancy?.salaryMin
      ? `${vacancy.currency ?? 'ARS'} ${vacancy.salaryMin.toLocaleString()}`
      : null
    let out = text
      .replace(/\{\{nombre_candidato\}\}/g, candidate.fullName)
      .replace(/\{\{fecha_entrevista\}\}/g, dateStr)
      .replace(/\{\{hora_entrevista\}\}/g, timeStr)
      .replace(/\{\{modalidad_entrevista\}\}/g, interview?.meetingPlatform ?? '')
      .replace(/\{\{link_reunion\}\}/g, interview?.meetingLink ?? '')
      .replace(/\{\{reclutador\}\}/g, interview?.interviewerName ?? '')
    if (vacancy?.title) out = out.replace(/\{\{vacante\}\}/g, vacancy.title)
    if (vacancy?.client?.name) out = out.replace(/\{\{empresa\}\}/g, vacancy.client.name)
    if (vacancy?.modality) out = out.replace(/\{\{modalidad\}\}/g, vacancy.modality)
    if (vacancy?.location) out = out.replace(/\{\{ubicacion\}\}/g, vacancy.location)
    if (vacancy?.client?.interviewAddress) out = out.replace(/\{\{direccion_entrevista\}\}/g, vacancy.client.interviewAddress)
    if (vacancy?.client?.interviewArrivalDetails) out = out.replace(/\{\{instrucciones_llegada\}\}/g, vacancy.client.interviewArrivalDetails)
    if (salario) out = out.replace(/\{\{salario\}\}/g, salario)
    // Remove emoji lines with unfilled vars
    out = out.replace(/^[^\S\n]*[\u{1F4C5}\u{1F550}\u{1F4CD}\u{1F517}\u{1F4B0}\u{1F4CC}]\s*[^:\n]*:\s*\{\{[^}]+\}\}\n?/gmu, '')
    // Remove emoji lines with empty values (e.g. link when presencial)
    out = out.replace(/^[^\S\n]*[\u{1F4C5}\u{1F550}\u{1F4CD}\u{1F517}\u{1F4B0}\u{1F4CC}]\s*[^:\n]*:\s*$\n?/gmu, '')
    out = out.replace(/\n{3,}/g, '\n\n').trim()
    return out
  }

  React.useEffect(() => {
    if (selectedTemplate) {
      setMessage(fillVars(selectedTemplate.body))
    } else {
      setMessage(`Hola ${candidate.fullName}!\n\nMe comunico desde el equipo de Talento. ¿Tenés un momento para charlar?`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId, candidate.fullName, selectedVacancyId])

  function formatPhone(phone: string): string {
    let digits = phone.replace(/\D/g, '')
    if (digits.startsWith('0')) digits = '54' + digits.slice(1)
    if (!phone.startsWith('+') && !digits.startsWith('54')) digits = '54' + digits
    return digits
  }

  const phone = candidate.phone ? formatPhone(candidate.phone) : null

  function handleSend() {
    if (!phone) return
    const a = document.createElement('a')
    a.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    a.rel = 'noopener noreferrer'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    onClose()
    onStagePrompt?.()
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
      
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 'min(480px, 95vw)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          ...dragStyle,
        }}
      >
        {/* Header */}
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', ...headerStyle }}
          onMouseDown={onMouseDown}
        >
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
              <label style={labelStyle}>Template</label>
              <select
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' as const }}
              >
                {waTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>Vacante</label>
            <select
              value={selectedVacancyId}
              onChange={e => setSelectedVacancyId(e.target.value)}
              style={{ ...inputStyle, appearance: 'none' as const }}
            >
              <option value="">Sin vacante</option>
              {vacancies.map(v => (
                <option key={v.id} value={v.id}>{v.title}{v.client?.name ? ` · ${v.client.name}` : ''}</option>
              ))}
            </select>
            {vacancy?.client?.name && (
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                Cliente: <span style={{ color: '#4ade80', fontWeight: 500 }}>{vacancy.client.name}</span>
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Mensaje</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit' }}
            />
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}
          >
            Cancelar
          </button>
          {phone ? (
            <button
              onClick={handleSend}
              style={{ padding: '8px 16px', borderRadius: 8, background: '#16a34a', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <MessageCircle style={{ width: 13, height: 13 }} />
              Enviar por WhatsApp
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
  const { style: dragStyle, headerStyle, onMouseDown } = useDraggable()
  const { user } = useUser()
  const { t } = useLanguage()
  const [form, setForm] = React.useState({
    date: '',
    time: '',
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
      scheduledAt: new Date(`${form.date}T${form.time}`).toISOString(),
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
      // Notify candidate via email (only if user opted in)
      const selectedVacancy = vacancies.find((v) => v.id === (form.vacancyId || vacancies[0]?.id))
      if (isAutoNotifyEnabled(user?.id)) {
        fetch('/api/emails/interview-scheduled', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: candidate.id,
            clientId: selectedVacancy?.clientId ?? undefined,
            vacancyTitle: selectedVacancy?.title ?? '',
            scheduledAt: new Date(`${form.date}T${form.time}`).toISOString(),
            interviewerName: form.interviewerName,
            interviewType: form.type,
            meetingPlatform: form.meetingPlatform || undefined,
            meetingLink: form.meetingLink || undefined,
          }),
        }).catch(() => {})
      }
      window.dispatchEvent(new CustomEvent('interview:scheduled'))
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
      
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 'min(480px, 95vw)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          ...dragStyle,
        }}
      >
        {/* Header */}
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', ...headerStyle }}
          onMouseDown={onMouseDown}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar style={{ width: 15, height: 15, color: '#a78bfa' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{t.pipeline.scheduleInterview}</p>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>{t.pipeline.interviewForm.date} *</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t.pipeline.interviewForm.time} *</label>
                  <input
                    required
                    type="time"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>{t.pipeline.interviewForm.type} *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as InterviewType }))}
                    style={{ ...inputStyle, appearance: 'none' as const }}
                  >
                    <option value="RRHH">{t.pipeline.interviewTypes.rrhh}</option>
                    <option value="Técnica">{t.pipeline.interviewTypes.technical}</option>
                    <option value="Con Hiring Manager">{t.pipeline.interviewTypes.hiring}</option>
                    <option value="Cultural">{t.pipeline.interviewTypes.cultural}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t.pipeline.interviewForm.platform} *</label>
                  <select
                    value={form.meetingPlatform}
                    onChange={e => setForm(f => ({ ...f, meetingPlatform: e.target.value as MeetingPlatform }))}
                    style={{ ...inputStyle, appearance: 'none' as const }}
                  >
                    <option value="presencial">{t.pipeline.platforms.presencial}</option>
                    <option value="zoom">{t.pipeline.platforms.zoom}</option>
                    <option value="google_meet">{t.pipeline.platforms.meet}</option>
                    <option value="teams">{t.pipeline.platforms.teams}</option>
                  </select>
                </div>
              </div>
              {vacancies.length > 0 && (
                <div>
                  <label style={labelStyle}>{t.pipeline.interviewForm.vacancy}</label>
                  <select
                    value={form.vacancyId}
                    onChange={e => setForm(f => ({ ...f, vacancyId: e.target.value }))}
                    style={{ ...inputStyle, appearance: 'none' as const }}
                  >
                    <option value="">{t.pipeline.interviewForm.noVacancy}</option>
                    {vacancies.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>{t.pipeline.interviewForm.interviewer} *</label>
                  <input
                    required
                    value={form.interviewerName}
                    onChange={e => setForm(f => ({ ...f, interviewerName: e.target.value }))}
                    placeholder="Nombre"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t.pipeline.interviewForm.interviewerEmail}</label>
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
                  <label style={labelStyle}>{t.pipeline.interviewForm.meetingLink}</label>
                  <input
                    value={form.meetingLink}
                    onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))}
                    placeholder="https://..."
                    style={inputStyle}
                  />
                </div>
              )}
              <div>
                <label style={labelStyle}>{t.pipeline.interviewForm.notes}</label>
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
              {t.common.cancel}
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
              {t.common.save}
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
  const { t } = useLanguage()
  const { style: dragStyle, headerStyle, onMouseDown } = useDraggable()
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
      
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 'min(460px, 95vw)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          ...dragStyle,
        }}
      >
        {/* Header */}
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', ...headerStyle }}
          onMouseDown={onMouseDown}
        >
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            {saved ? t.pipeline.notesSaved : t.pipeline.saveNotes}
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
  | { type: 'process'; candidate: Candidate; vacancyId: string; app: HydratedApplication }
  | { type: 'history'; candidate: Candidate }
  | null

// ─── Process History Modal ────────────────────────────────────────────────────
function ProcessHistoryModal({
  candidate,
  provider,
  vacancies,
  onClose,
}: {
  candidate: Candidate
  provider: SupabaseProvider
  vacancies: Vacancy[]
  onClose: () => void
}) {
  const { t } = useLanguage()
  const stageLabels: Record<string, string> = {
    'Nuevas Vacantes': t.stages.newVacancies,
    'En Proceso': t.stages.inProcess,
    'Entrevistas': t.stages.interviews,
    'Oferta Enviada': t.stages.offerSent,
    'Contratado': t.stages.hired,
    'Descartado': t.stages.discarded,
  }
  const { style: dragStyle, headerStyle, onMouseDown } = useDraggable()
  const [apps, setApps] = React.useState<Application[]>([])
  const [interviews, setInterviews] = React.useState<Interview[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function fetchData() {
      const [appsRes, intsRes] = await Promise.all([
        provider.getApplicationsByCandidateId(candidate.id),
        provider.getInterviews(candidate.id),
      ])
      if (!cancelled) {
        setApps(appsRes.data ?? [])
        setInterviews(intsRes.data ?? [])
        setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [candidate.id, provider])

  function handleDownloadPDF() {
    const today = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    const scoreColor = (s: number) => s >= 85 ? '#16a34a' : s >= 70 ? '#7c3aed' : s >= 50 ? '#d97706' : '#6b7280'

    const appsHtml = sortedApps.length === 0
      ? '<p style="color:#9ca3af;font-size:13px;">Sin postulaciones registradas.</p>'
      : sortedApps.map(a => {
          const vac = vacancies.find(v => v.id === a.vacancyId)
          const stageColor = STAGE_COLORS[a.status] ?? '#6b7280'
          const appInterviews = interviews.filter(i => i.candidateId === candidate.id && i.vacancyId === a.vacancyId)
          return `
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:14px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;">
                <div>
                  <p style="font-size:15px;font-weight:700;color:#111827;margin:0;">${vac?.title ?? '—'}</p>
                  ${vac?.client?.name ? `<p style="font-size:12px;color:#6b7280;margin:2px 0 0;">${vac.client.name}</p>` : ''}
                </div>
                <span style="font-size:12px;font-weight:700;padding:3px 10px;border-radius:99px;background:${stageColor}22;color:${stageColor};white-space:nowrap;flex-shrink:0;border:1px solid ${stageColor}44;">${a.status}</span>
              </div>
              <p style="font-size:11px;color:#9ca3af;margin:0 0 12px;">
                Ingreso: ${new Date(a.appliedAt).toLocaleDateString('es-AR')} · Última actualización: ${new Date(a.updatedAt).toLocaleDateString('es-AR')}
              </p>
              ${appInterviews.length > 0 ? `
                <div style="padding-top:10px;border-top:1px solid #e5e7eb;">
                  <p style="font-size:11px;font-weight:700;color:#a78bfa;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Entrevistas</p>
                  ${appInterviews.map(i => `
                    <div style="display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;font-size:12px;color:#374151;margin-bottom:6px;padding:8px 10px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;">
                      <span style="color:#7c3aed;font-weight:600;">${i.type}</span>
                      <span style="color:#9ca3af;">|</span>
                      <span>${i.meetingPlatform}</span>
                      <span style="color:#9ca3af;">|</span>
                      <span>${new Date(i.scheduledAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      ${i.interviewerName ? `<span style="color:#9ca3af;">|</span><span>${i.interviewerName}</span>` : ''}
                      ${i.notes ? `<br/><span style="color:#9ca3af;font-size:11px;font-style:italic;">Nota: "${i.notes}"</span>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `
        }).join('')

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Informe de Proceso — ${candidate.fullName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #fff; padding: 32px; max-width: 800px; margin: 0 auto; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <!-- Header card -->
  <div style="background:linear-gradient(135deg,#5D50D6,#8B7EFF);padding:28px 32px;border-radius:14px;margin-bottom:28px;color:#fff;">
    <p style="font-size:11px;font-weight:600;opacity:0.65;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Informe de Proceso de Selección</p>
    <h1 style="font-size:26px;font-weight:800;margin-bottom:6px;">${candidate.fullName}</h1>
    <p style="font-size:14px;opacity:0.8;margin-bottom:2px;">${candidate.email}${candidate.phone ? ' · ' + candidate.phone : ''}</p>
    <div style="display:flex;gap:16px;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.2);flex-wrap:wrap;">
      ${candidate.atsScore ? `<div><p style="font-size:20px;font-weight:800;color:${scoreColor(candidate.atsScore)};">${candidate.atsScore}</p><p style="font-size:11px;opacity:0.65;">ATS Score</p></div>` : ''}
      <div><p style="font-size:20px;font-weight:800;">${sortedApps.length}</p><p style="font-size:11px;opacity:0.65;">Proceso${sortedApps.length !== 1 ? 's' : ''}</p></div>
      <div><p style="font-size:20px;font-weight:800;">${interviews.length}</p><p style="font-size:11px;opacity:0.65;">Entrevista${interviews.length !== 1 ? 's' : ''}</p></div>
    </div>
    <p style="font-size:11px;opacity:0.45;margin-top:10px;">Generado: ${today}</p>
  </div>

  ${candidate.skills?.length ? `
  <div style="margin-bottom:24px;">
    <p style="font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Skills</p>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      ${candidate.skills.map(s => `<span style="font-size:12px;padding:3px 10px;border-radius:99px;background:#f3f4f6;border:1px solid #e5e7eb;color:#374151;">${s}</span>`).join('')}
    </div>
  </div>` : ''}

  <div>
    <p style="font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;">Historial de Procesos</p>
    ${appsHtml}
  </div>

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="font-size:11px;color:#9ca3af;">ConectAr Talento · Informe generado el ${today}</p>
  </div>
  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }

  const sortedApps = [...apps].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 'min(600px, 95vw)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          ...dragStyle,
        }}
      >
        {/* Header */}
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', ...headerStyle }}
          onMouseDown={onMouseDown}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 style={{ width: 15, height: 15, color: '#34d399' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Proceso completo</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{candidate.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
              <Loader2 style={{ width: 24, height: 24, color: 'var(--muted)' }} className="animate-spin" />
            </div>
          ) : (
            <>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Historial de postulaciones</p>
                {sortedApps.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin postulaciones registradas.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sortedApps.map(app => {
                      const vac = vacancies.find(v => v.id === app.vacancyId)
                      const stageColor = STAGE_COLORS[app.status] ?? '#6b7280'
                      const appInterviews = interviews.filter(i => i.candidateId === candidate.id)
                      return (
                        <div
                          key={app.id}
                          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {vac?.title ?? '—'}
                                {vac?.client?.name ? <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 6 }}>· {vac.client.name}</span> : null}
                              </p>
                              <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, marginTop: 2 }}>
                                Ingreso: {new Date(app.appliedAt).toLocaleDateString('es-AR')} · Actualizado: {new Date(app.updatedAt).toLocaleDateString('es-AR')}
                              </p>
                            </div>
                            <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: `${stageColor}22`, color: stageColor, border: `1px solid ${stageColor}44` }}>
                              {stageLabels[app.status] ?? app.status}
                            </span>
                          </div>
                          {appInterviews.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                              {appInterviews.map(i => (
                                <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
                                  <Calendar style={{ width: 11, height: 11, color: '#a78bfa', flexShrink: 0 }} />
                                  <span style={{ color: '#a78bfa', fontWeight: 500 }}>{i.type}</span>
                                  <span>·</span>
                                  <span>{i.meetingPlatform}</span>
                                  <span>·</span>
                                  <span>{new Date(i.scheduledAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                  {i.interviewerName && <><span>·</span><span>{i.interviewerName}</span></>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
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
            onClick={handleDownloadPDF}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            <FileText style={{ width: 13, height: 13 }} />
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Stage Prompt Dialog ──────────────────────────────────────────────────────
function StagePromptDialog({
  candidateName,
  currentStage,
  appId,
  onDecide,
  onClose,
}: {
  candidateName: string
  currentStage: VacancyStatus
  appId: string
  onDecide: (appId: string, action: DecisionAction) => void
  onClose: () => void
}) {
  const STAGE_ORDER_FULL: VacancyStatus[] = ['Nuevas Vacantes', 'En Proceso', 'Entrevistas', 'A considerar', 'Oferta Enviada', 'Contratado']
  const currentIdx = STAGE_ORDER_FULL.indexOf(currentStage)
  const nextStages = STAGE_ORDER_FULL.slice(currentIdx + 1)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 60,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '16px 18px',
        maxWidth: 320,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, flex: 1 }}>
          ¿Querés mover a <span style={{ color: 'var(--accent-2)' }}>{candidateName}</span> a una nueva etapa?
        </p>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2, flexShrink: 0 }}>
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {nextStages.map(stage => {
          const color = STAGE_COLORS[stage]
          return (
            <button
              key={stage}
              onClick={() => { onDecide(appId, 'avanzar_etapa'); onClose() }}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background: `${color}18`,
                border: `1px solid ${color}44`,
                color,
                cursor: 'pointer',
                textAlign: 'left' as const,
              }}
            >
              Mover a: {stage}
            </button>
          )
        })}
        <button
          onClick={onClose}
          style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', textAlign: 'left' as const }}
        >
          Mantener etapa actual
        </button>
      </div>
    </div>
  )
}

// ─── Candidate card ───────────────────────────────────────────────────────────
interface CardProps {
  app: HydratedApplication
  isDragging?: boolean
  onAction: (modal: ActiveModal) => void
  onDecide?: (appId: string, action: DecisionAction) => void
  interviewDate?: string  // ISO string of next scheduled interview
}

function CandidateCard({ app, isDragging, onAction, onDecide, interviewDate }: CardProps) {
  const c = app.candidate
  if (!c) return null
  const { t } = useLanguage()
  const stageLabels: Record<string, string> = {
    'Nuevas Vacantes': t.stages.newVacancies,
    'En Proceso': t.stages.inProcess,
    'Entrevistas': t.stages.interviews,
    'Oferta Enviada': t.stages.offerSent,
    'Contratado': t.stages.hired,
    'Descartado': t.stages.discarded,
  }
  const [hovered, setHovered] = React.useState(false)
  const pointerStart = React.useRef<{ x: number; y: number } | null>(null)
  const pointerMoved = React.useRef(false)
  const isTouchDevice = React.useRef(typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0))

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
      onPointerDown={(e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY }
        pointerMoved.current = false
      }}
      onPointerMove={(e) => {
        if (pointerStart.current) {
          const dx = e.clientX - pointerStart.current.x
          const dy = e.clientY - pointerStart.current.y
          const threshold = isTouchDevice.current ? 900 : 64 // 30px touch, 8px mouse
          if (dx * dx + dy * dy > threshold) {
            pointerMoved.current = true
          }
        }
      }}
      onClick={() => {
        if (!pointerMoved.current && !isDragging) {
          onAction({ type: 'process', candidate: c, vacancyId: app.vacancyId ?? '', app })
        }
      }}
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
              overflow: 'hidden',
            }}
          >
            {c.avatarUrl ? <img src={c.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(c.fullName)}
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

        {/* Quick action buttons — always visible on touch, hover-only on desktop */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            opacity: (hovered || isTouchDevice.current) ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
        >
          {app.status === 'Contratado' ? (
            <button
              onClick={e => { e.stopPropagation(); onAction({ type: 'history', candidate: c }) }}
              style={{
                padding: '2px 8px',
                borderRadius: 6,
                background: 'rgba(52,211,153,0.15)',
                border: '1px solid rgba(52,211,153,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                cursor: 'pointer',
                color: '#34d399',
                fontSize: 10,
                fontWeight: 600,
                whiteSpace: 'nowrap' as const,
              }}
              title="Ver proceso completo"
            >
              <CheckCircle2 style={{ width: 11, height: 11 }} />
              Ver proceso
            </button>
          ) : (
            <>
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
                onClick={e => { e.stopPropagation(); onAction({ type: 'schedule', candidate: c, applicationId: app.id, vacancyId: app.vacancyId ?? '' }) }}
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
            </>
          )}
        </div>
      </div>

      {/* Decision buttons — only visible on hover for Entrevistas stage */}
      {app.status === 'Entrevistas' && onDecide && (hovered || isTouchDevice.current) && !isDragging && (
        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
          {(Object.entries(DECISION_CONFIG).filter(([a]) => a !== 'avanzar_etapa') as [DecisionAction, typeof DECISION_CONFIG[DecisionAction]][]).map(([action, cfg]) => (
            <button
              key={action}
              onClick={e => { e.stopPropagation(); onDecide(app.id, action) }}
              style={{
                flex: '1 1 calc(50% - 2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '4px 0',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
                cursor: 'pointer',
              }}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      )}

      {/* Avanzar / Rechazar — always visible on all cards except Entrevistas (which has its own 4-button panel) */}
      {onDecide && app.status !== 'Contratado' && app.status !== 'Descartado' && app.status !== 'Entrevistas' && !isDragging && (
        <div
          style={{ display: 'flex', gap: 5, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={e => { e.stopPropagation(); onDecide(app.id, 'avanzar_etapa') }}
            style={{
              flex: 1, fontSize: 11, fontWeight: 600, padding: '5px 6px', borderRadius: 6,
              background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)', color: '#34d399',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
            }}
          >
            <ChevronRight size={11} /> {t.pipeline.actions.moveStage}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDecide(app.id, 'rechazar') }}
            style={{
              flex: 1, fontSize: 11, fontWeight: 600, padding: '5px 6px', borderRadius: 6,
              background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.28)', color: '#f87171',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
            }}
          >
            <X size={11} /> {t.pipeline.actions.reject}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Process Detail Modal ──────────────────────────────────────────────────────
function ProcessDetailModal({
  app,
  vacancy,
  interviewDate,
  onClose,
  onAction,
  onDecide,
}: {
  app: HydratedApplication
  vacancy?: Vacancy
  interviewDate?: string
  onClose: () => void
  onAction: (modal: ActiveModal) => void
  onDecide?: (appId: string, action: DecisionAction) => void
}) {
  const { t } = useLanguage()
  const stageLabels: Record<string, string> = {
    'Nuevas Vacantes': t.stages.newVacancies,
    'En Proceso': t.stages.inProcess,
    'Entrevistas': t.stages.interviews,
    'Oferta Enviada': t.stages.offerSent,
    'Contratado': t.stages.hired,
    'Descartado': t.stages.discarded,
  }
  const { style: dragStyle, headerStyle, onMouseDown } = useDraggable()
  const c = app.candidate
  if (!c) return null

  const stageColor = STAGE_COLORS[app.status]
  const score = c.atsScore ?? 0
  const scoreColor = score >= 85 ? '#34d399' : score >= 70 ? 'var(--accent-2)' : '#fbbf24'
  const daysSince = Math.floor((Date.now() - new Date(app.appliedAt).getTime()) / 86400000)
  const currentStageIdx = STAGES.indexOf(app.status as VacancyStatus)
  const skills = c.skills ?? []

  const interviewFormatted = interviewDate
    ? new Date(interviewDate).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) +
      ' ' + new Date(interviewDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 'min(520px, 95vw)',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          ...dragStyle,
        }}
      >
        {/* Header */}
        <div
          style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', ...headerStyle }}
          onMouseDown={onMouseDown}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: avatarGradient(c.fullName),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
                fontWeight: 700,
                fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {c.avatarUrl ? <img src={c.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(c.fullName)}
            </div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)', margin: 0 }}>{c.fullName}</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 0' }}>{c.email}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span
                  style={{
                    background: `${scoreColor}22`,
                    color: scoreColor,
                    border: `1px solid ${scoreColor}44`,
                    borderRadius: 6,
                    padding: '1px 7px',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ATS {score}
                </span>
                {c.source && (
                  <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '1px 7px' }}>
                    {c.source}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--muted)', borderRadius: 8 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stage progress */}
        <div style={{ padding: '16px 20px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Etapa del proceso</p>
          <div style={{ display: 'flex', gap: 4 }}>
            {STAGES.map((stage, idx) => {
              const color = STAGE_COLORS[stage]
              const isActive = idx === currentStageIdx
              const isPast = idx < currentStageIdx
              return (
                <div key={stage} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div
                    style={{
                      height: 4,
                      width: '100%',
                      borderRadius: 4,
                      background: isActive || isPast ? color : 'var(--border)',
                      opacity: isPast ? 0.5 : 1,
                    }}
                  />
                  <span style={{ fontSize: 9, color: isActive ? color : 'var(--muted)', fontWeight: isActive ? 700 : 400, textAlign: 'center', lineHeight: 1.2 }}>
                    {stage}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 0' }}>
          {/* Current stage badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: `${stageColor}22`,
                color: stageColor,
                border: `1px solid ${stageColor}44`,
                borderRadius: 8,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: stageColor, display: 'inline-block' }} />
              {stageLabels[app.status] ?? app.status}
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {daysSince === 0 ? 'Ingresó hoy' : `Hace ${daysSince} día${daysSince !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Vacancy */}
          {vacancy && (
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Vacante</p>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', margin: 0 }}>{vacancy.title}</p>
              {vacancy.client?.name && (
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 0' }}>{vacancy.client.name}</p>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                {vacancy.modality && <span style={{ fontSize: 11, color: 'var(--muted)' }}>📍 {vacancy.modality}</span>}
                {(vacancy.salaryMin || vacancy.salaryMax) && <span style={{ fontSize: 11, color: 'var(--muted)' }}>💰 {vacancy.salaryMin}{vacancy.salaryMax ? `–${vacancy.salaryMax}` : ''} {vacancy.currency ?? ''}</span>}
              </div>
            </div>
          )}

          {/* Interview */}
          {interviewFormatted && (
            <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: '#a78bfa', marginBottom: 3 }}>Próxima entrevista</p>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', margin: 0 }}>📅 {interviewFormatted}</p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {skills.map((sk, i) => (
                  <span key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: 'var(--muted)' }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact info */}
          {(c.email || c.phone) && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Contacto</p>
              {c.email && <p style={{ fontSize: 13, color: 'var(--text)', margin: '0 0 2px' }}>{c.email}</p>}
              {c.phone && <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>{c.phone}</p>}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {app.status === 'Contratado' ? (
            <button
              onClick={() => { onClose(); onAction({ type: 'history', candidate: c }) }}
              style={{ flex: 1, minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#34d399', cursor: 'pointer', fontWeight: 600 }}
            >
              <CheckCircle2 size={14} /> Ver proceso completo
            </button>
          ) : (
            <>
              <button
                onClick={() => { onClose(); onAction({ type: 'email', candidate: c }) }}
                style={{ flex: 1, minWidth: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'var(--text)', cursor: 'pointer', fontWeight: 500 }}
              >
                <Mail size={13} /> Email
              </button>
              <button
                onClick={() => { onClose(); onAction({ type: 'whatsapp', candidate: c }) }}
                style={{ flex: 1, minWidth: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'var(--text)', cursor: 'pointer', fontWeight: 500 }}
              >
                <MessageCircle size={13} /> WhatsApp
              </button>
              <button
                onClick={() => { onClose(); onAction({ type: 'schedule', candidate: c, applicationId: app.id, vacancyId: app.vacancyId ?? '' }) }}
                style={{ flex: 1, minWidth: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'var(--text)', cursor: 'pointer', fontWeight: 500 }}
              >
                <Calendar size={13} /> Entrevista
              </button>
              <button
                onClick={() => { onClose(); onAction({ type: 'notes', candidate: c }) }}
                style={{ flex: 1, minWidth: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'var(--text)', cursor: 'pointer', fontWeight: 500 }}
              >
                <FileText size={13} /> Notas
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Candidate row (list view) ────────────────────────────────────────────────
function CandidateRow({ app, onAction, onDecide, interviewDate }: CardProps) {
  const c = app.candidate
  if (!c) return null
  const { t } = useLanguage()
  const stageLabels: Record<string, string> = {
    'Nuevas Vacantes': t.stages.newVacancies,
    'En Proceso': t.stages.inProcess,
    'Entrevistas': t.stages.interviews,
    'Oferta Enviada': t.stages.offerSent,
    'Contratado': t.stages.hired,
    'Descartado': t.stages.discarded,
  }
  const [hovered, setHovered] = React.useState(false)

  const stageColor = STAGE_COLORS[app.status]
  const score = c.atsScore ?? 0
  const scoreColor = score >= 85 ? '#34d399' : score >= 70 ? 'var(--accent-2)' : '#fbbf24'
  const daysSince = Math.floor((Date.now() - new Date(app.appliedAt).getTime()) / 86400000)
  const skills = (c.skills ?? []).slice(0, 2)

  const iconBtn: React.CSSProperties = {
    width: 26, height: 26, borderRadius: 7, background: 'var(--surface)',
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', color: 'var(--muted2)',
  }
  const decisionBtn = (bg: string, border: string, color: string): React.CSSProperties => ({
    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
    background: bg, border: `1px solid ${border}`, color, cursor: 'pointer', whiteSpace: 'nowrap' as const,
  })

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onAction({ type: 'process', candidate: c, vacancyId: app.vacancyId ?? '', app })}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
        borderBottom: '1px solid var(--border)', cursor: 'pointer',
        background: hovered ? 'var(--surface2)' : 'transparent',
        transition: 'background 0.12s',
      }}
    >
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: avatarGradient(c.fullName), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-nunito, Nunito, sans-serif)', overflow: 'hidden' }}>
          {c.avatarUrl ? <img src={c.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(c.fullName)}
        </div>
        {score > 0 && (
          <div style={{ position: 'absolute', bottom: -3, right: -4, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 5, padding: '0 3px', fontSize: 9, fontWeight: 900, color: scoreColor, lineHeight: 1.4 }}>
            {score}
          </div>
        )}
      </div>

      {/* Name + vacancy */}
      <div style={{ flex: '0 0 190px', minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{c.fullName}</p>
        {app.vacancyTitle && (
          <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{app.vacancyTitle}</p>
        )}
      </div>

      {/* Skills */}
      <div style={{ flex: 1, display: 'flex', gap: 4, minWidth: 0, overflow: 'hidden' }}>
        {skills.map(sk => (
          <span key={sk} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'var(--accent-soft)', color: 'var(--accent-2)', border: '1px solid rgba(108,99,255,0.18)', fontWeight: 500, whiteSpace: 'nowrap' }}>{sk}</span>
        ))}
      </div>

      {/* Stage pill */}
      <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: `${stageColor}18`, color: stageColor, border: `1px solid ${stageColor}30`, whiteSpace: 'nowrap' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: stageColor, display: 'inline-block' }} />
        {stageLabels[app.status] ?? app.status}
      </span>

      {/* Interview date */}
      {interviewDate && (
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar style={{ width: 11, height: 11, color: '#a78bfa' }} />
          <span style={{ fontSize: 11, color: '#a78bfa', whiteSpace: 'nowrap' }}>
            {new Date(interviewDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      )}

      {/* Source + days */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
        {c.source && (
          <span style={{ fontSize: 9, padding: '1.5px 6px', borderRadius: 99, fontWeight: 600, background: SOURCE_BG[c.source] ?? 'rgba(107,114,128,0.15)', color: SOURCE_TEXT[c.source] ?? '#9ca3af', whiteSpace: 'nowrap' }}>
            {c.source}
          </span>
        )}
        <span style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          {daysSince === 0 ? 'Hoy' : `${daysSince}d`}
        </span>
      </div>

      {/* Communication buttons — visible on hover */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 3, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }} onClick={e => e.stopPropagation()}>
        {app.status === 'Contratado' ? (
          <button
            onClick={e => { e.stopPropagation(); onAction({ type: 'history', candidate: c }) }}
            style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#34d399', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' as const }}
            title="Ver proceso completo"
          >
            <CheckCircle2 style={{ width: 12, height: 12 }} />
            Ver proceso
          </button>
        ) : (
          <>
            <button onClick={e => { e.stopPropagation(); onAction({ type: 'email', candidate: c }) }} style={iconBtn} title="Email"><Mail style={{ width: 12, height: 12 }} /></button>
            <button onClick={e => { e.stopPropagation(); onAction({ type: 'schedule', candidate: c, applicationId: app.id, vacancyId: app.vacancyId ?? '' }) }} style={iconBtn} title="Entrevista"><Calendar style={{ width: 12, height: 12 }} /></button>
            <button onClick={e => { e.stopPropagation(); onAction({ type: 'whatsapp', candidate: c }) }} style={iconBtn} title="WhatsApp"><MessageCircle style={{ width: 12, height: 12 }} /></button>
          </>
        )}
      </div>

      {/* Decision buttons — always visible for actionable stages */}
      {onDecide && app.status !== 'Contratado' && app.status !== 'Descartado' && (
        <div style={{ flexShrink: 0, display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
          {app.status === 'Entrevistas' ? (
            <>
              <button onClick={e => { e.stopPropagation(); onDecide(app.id, 'avanzar') }} style={decisionBtn('rgba(52,211,153,0.12)', 'rgba(52,211,153,0.3)', '#34d399')}>{t.pipeline.actions.hire}</button>
              <button onClick={e => { e.stopPropagation(); onDecide(app.id, 'a_considerar') }} style={decisionBtn('rgba(251,191,36,0.12)', 'rgba(251,191,36,0.3)', '#fbbf24')}>{t.pipeline.actions.consider}</button>
              <button onClick={e => { e.stopPropagation(); onDecide(app.id, 'rechazar') }} style={decisionBtn('rgba(248,113,113,0.12)', 'rgba(248,113,113,0.3)', '#f87171')}>{t.pipeline.actions.reject}</button>
            </>
          ) : (
            <>
              <button onClick={e => { e.stopPropagation(); onDecide(app.id, 'avanzar_etapa') }} style={decisionBtn('rgba(52,211,153,0.12)', 'rgba(52,211,153,0.3)', '#34d399')}><ChevronRight size={10} style={{ display: 'inline', marginRight: 2 }} />{t.pipeline.actions.moveStage}</button>
              <button onClick={e => { e.stopPropagation(); onDecide(app.id, 'rechazar') }} style={decisionBtn('rgba(248,113,113,0.12)', 'rgba(248,113,113,0.3)', '#f87171')}>{t.pipeline.actions.reject}</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Client section ───────────────────────────────────────────────────────────
function ClientSection({
  clientName,
  apps,
  onAction,
  onDecide,
  interviewsByCandidate,
}: {
  clientId: string
  clientName: string
  apps: HydratedApplication[]
  onAction: (modal: ActiveModal) => void
  onDecide: (appId: string, action: DecisionAction) => void
  interviewsByCandidate: Map<string, string>
}) {
  const { t } = useLanguage()
  const [collapsed, setCollapsed] = React.useState(false)

  const counts = React.useMemo(() => {
    const c: Partial<Record<VacancyStatus, number>> = {}
    apps.forEach(a => { c[a.status] = (c[a.status] ?? 0) + 1 })
    return c
  }, [apps])

  const STAGE_SHORT: Record<VacancyStatus, string> = {
    'Nuevas Vacantes': t.stages.newVacancies,
    'En Proceso': t.stages.inProcess,
    'Entrevistas': t.stages.interviews,
    'A considerar': 'A considerar',
    'Oferta Enviada': t.stages.offerSent,
    'Contratado': t.stages.hired,
    'Descartado': t.stages.discarded,
  }

  return (
    <div style={{ marginBottom: 10, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
      {/* Header */}
      <div
        role="button"
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          background: 'var(--surface2)', cursor: 'pointer', userSelect: 'none' as const,
          borderBottom: collapsed ? 'none' : '1px solid var(--border)',
        }}
      >
        {/* Client initials */}
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent-soft)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-2)', fontFamily: 'var(--font-nunito, Nunito, sans-serif)' }}>{clientName.slice(0, 2).toUpperCase()}</span>
        </div>
        {/* Name */}
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{clientName}</span>
        {/* Stage pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {STAGES.filter(s => counts[s]).map(stage => (
            <span key={stage} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${STAGE_COLORS[stage]}18`, color: STAGE_COLORS[stage], border: `1px solid ${STAGE_COLORS[stage]}30`, whiteSpace: 'nowrap' as const }}>
              {STAGE_SHORT[stage]} · {counts[stage]}
            </span>
          ))}
        </div>
        {/* Count */}
        <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{apps.length} candidato{apps.length !== 1 ? 's' : ''}</span>
        {collapsed
          ? <ChevronRight style={{ width: 15, height: 15, color: 'var(--muted)', flexShrink: 0 }} />
          : <ChevronDown style={{ width: 15, height: 15, color: 'var(--muted)', flexShrink: 0 }} />
        }
      </div>
      {/* Rows */}
      {!collapsed && apps.map(app => (
        <CandidateRow
          key={app.id}
          app={app}
          onAction={onAction}
          onDecide={onDecide}
          interviewDate={interviewsByCandidate.get(app.candidateId)}
        />
      ))}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[0, 1, 2].map(g => (
        <div key={g} style={{ borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', animation: 'pulse 1.5s ease-in-out infinite' }}>
          <div style={{ height: 50, background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }} />
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)', opacity: 1 - i * 0.2 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Single-candidate reject reason dialog ────────────────────────────────────
function RejectReasonDialog({
  candidateName,
  appId,
  provider,
  onClose,
  onDone,
}: {
  candidateName: string
  appId: string
  provider: SupabaseProvider
  onClose: () => void
  onDone: () => void
}) {
  const { t } = useLanguage()
  const [reason, setReason] = React.useState<RejectionReason | ''>('')
  const [note, setNote] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  async function handleConfirm() {
    if (!reason) return
    setSaving(true)
    await provider.updateApplicationRejection(appId, reason as RejectionReason, note || undefined)
    window.dispatchEvent(new CustomEvent('application:stage-changed'))
    setSaving(false)
    onDone()
  }

  async function handleSkip() {
    // Status already set to Descartado optimistically; just save without reason
    await provider.updateApplicationStatus(appId, 'Descartado')
    window.dispatchEvent(new CustomEvent('application:stage-changed'))
    onClose()
  }

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  }
  const modal: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
    width: '100%', maxWidth: 440, padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
  }
  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)',
    borderRadius: 8, padding: '8px 12px', fontSize: 13, width: '100%', outline: 'none',
  }

  const rejectionLabels: Record<string, string> = {
    no_apto_perfil: t.pipeline.rejectionReasons.doesntMeetProfile,
    mejor_candidato: t.pipeline.rejectionReasons.betterCandidateSelected,
    candidato_declino: t.pipeline.rejectionReasons.candidateDeclined,
    fuera_rango_salarial: t.pipeline.rejectionReasons.salaryMismatch,
    decision_empresa: t.pipeline.rejectionReasons.companyDecision,
    otro: t.pipeline.rejectionReasons.other,
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{t.pipeline.rejectModal.title}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{candidateName}</p>
          </div>
          <button onClick={handleSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {REJECTION_REASONS.map(r => (
            <label
              key={r.value}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                borderRadius: 10, border: `1px solid ${reason === r.value ? 'var(--accent)' : 'var(--border)'}`,
                background: reason === r.value ? 'rgba(108,99,255,0.08)' : 'var(--surface2)',
                cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <input
                type="radio"
                name="reject-reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                style={{ marginTop: 2, accentColor: 'var(--accent)', flexShrink: 0 }}
              />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{rejectionLabels[r.value] ?? r.label}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>{r.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{t.pipeline.rejectModal.notesLabel}</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Agrega detalles adicionales..."
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleSkip}
            style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}
          >
            {t.pipeline.rejectModal.skip}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason || saving}
            style={{
              flex: 2, padding: '10px 0', borderRadius: 8, border: 'none',
              background: reason ? '#f87171' : 'rgba(248,113,113,0.3)',
              color: reason ? '#fff' : 'rgba(255,255,255,0.5)',
              fontSize: 13, fontWeight: 600, cursor: reason ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? t.common.loading : t.pipeline.rejectModal.send}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Close vacancy remaining dialog ──────────────────────────────────────────
function CloseVacancyRemainingDialog({
  vacancyId,
  vacancyTitle,
  remainingApps,
  provider,
  onClose,
  onDone,
}: {
  vacancyId: string
  vacancyTitle: string
  remainingApps: HydratedApplication[]
  provider: SupabaseProvider
  onClose: () => void
  onDone: () => void
}) {
  const { t } = useLanguage()
  const stageLabels: Record<string, string> = {
    'Nuevas Vacantes': t.stages.newVacancies,
    'En Proceso': t.stages.inProcess,
    'Entrevistas': t.stages.interviews,
    'Oferta Enviada': t.stages.offerSent,
    'Contratado': t.stages.hired,
    'Descartado': t.stages.discarded,
  }
  const rejectionLabels: Record<string, string> = {
    no_apto_perfil: t.pipeline.rejectionReasons.doesntMeetProfile,
    mejor_candidato: t.pipeline.rejectionReasons.betterCandidateSelected,
    candidato_declino: t.pipeline.rejectionReasons.candidateDeclined,
    fuera_rango_salarial: t.pipeline.rejectionReasons.salaryMismatch,
    decision_empresa: t.pipeline.rejectionReasons.companyDecision,
    otro: t.pipeline.rejectionReasons.other,
  }
  type AppState = { reason: RejectionReason | ''; note: string }
  const [appStates, setAppStates] = React.useState<Record<string, AppState>>(() =>
    Object.fromEntries(remainingApps.map(a => [a.id, { reason: '', note: '' }]))
  )
  const [bulkReason, setBulkReason] = React.useState<RejectionReason | ''>('')
  const [bulkNote, setBulkNote] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  function applyBulk() {
    if (!bulkReason) return
    setAppStates(prev => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        next[key] = { reason: bulkReason, note: bulkNote }
      }
      return next
    })
  }

  async function handleSave() {
    const toUpdate = remainingApps.filter(a => appStates[a.id]?.reason)
    if (toUpdate.length === 0) { onDone(); return }
    setSaving(true)
    await Promise.all(
      toUpdate.map(a =>
        provider.updateApplicationRejection(
          a.id,
          appStates[a.id].reason as RejectionReason,
          appStates[a.id].note || undefined
        )
      )
    )
    window.dispatchEvent(new CustomEvent('application:stage-changed'))
    setSaving(false)
    onDone()
  }

  const stageColor = (s: string) => STAGE_COLORS[s as VacancyStatus] ?? '#6b7280'
  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    fontSize: 12,
    padding: '5px 8px',
    outline: 'none',
    width: '100%',
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 'min(580px, 95vw)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Candidatos del proceso</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0' }}>{vacancyTitle} · Definí el motivo de descarte de cada candidato</p>
            </div>
            <button onClick={onClose} style={{ padding: 5, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0 }}>
              <X style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>

        {/* Bulk action */}
        {remainingApps.length > 1 && (
          <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', margin: 0, flexShrink: 0 }}>Aplicar a todos:</p>
            <select
              value={bulkReason}
              onChange={e => setBulkReason(e.target.value as RejectionReason | '')}
              style={{ ...inputStyle, width: 'auto', flex: 1, minWidth: 180 }}
            >
              <option value="">Seleccioná motivo...</option>
              {REJECTION_REASONS.map(r => <option key={r.value} value={r.value}>{rejectionLabels[r.value] ?? r.label}</option>)}
            </select>
            <input
              placeholder="Nota (opcional)"
              value={bulkNote}
              onChange={e => setBulkNote(e.target.value)}
              style={{ ...inputStyle, width: 'auto', flex: 1, minWidth: 120 }}
            />
            <button
              onClick={applyBulk}
              disabled={!bulkReason}
              style={{ padding: '5px 12px', borderRadius: 8, background: bulkReason ? 'var(--accent)' : 'var(--surface)', border: '1px solid var(--border)', color: bulkReason ? '#fff' : 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: bulkReason ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
            >
              Aplicar
            </button>
          </div>
        )}

        {/* Candidate list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {remainingApps.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>{t.pipeline.noOtherCandidates}</p>
          ) : (
            remainingApps.map(app => {
              const c = app.candidate
              const state = appStates[app.id] ?? { reason: '', note: '' }
              const sc = stageColor(app.status)
              return (
                <div key={app.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {(c?.fullName ?? '?').trim().split(/\s+/).map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c?.fullName ?? '—'}</p>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 99, background: `${sc}22`, color: sc, border: `1px solid ${sc}44` }}>{stageLabels[app.status] ?? app.status}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <select
                      value={state.reason}
                      onChange={e => setAppStates(prev => ({ ...prev, [app.id]: { ...prev[app.id], reason: e.target.value as RejectionReason | '' } }))}
                      style={{ ...inputStyle, flex: 1, minWidth: 160 }}
                    >
                      <option value="">Sin cambio de estado</option>
                      {REJECTION_REASONS.map(r => <option key={r.value} value={r.value}>{rejectionLabels[r.value] ?? r.label}</option>)}
                    </select>
                    <input
                      placeholder="Nota (opcional)"
                      value={state.note}
                      onChange={e => setAppStates(prev => ({ ...prev, [app.id]: { ...prev[app.id], note: e.target.value } }))}
                      style={{ ...inputStyle, flex: 1, minWidth: 140 }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>
            Omitir
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}
          >
            {saving && <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />}
            Guardar y finalizar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Hire dialog ─────────────────────────────────────────────────────────────
function HireDialog({
  app,
  provider,
  onClose,
  onVacancyClosed,
  allAppsForVacancy,
}: {
  app: HydratedApplication
  provider: SupabaseProvider
  onClose: () => void
  onVacancyClosed: (vacancyId: string) => void
  allAppsForVacancy: HydratedApplication[]
}) {
  const { style: dragStyle, headerStyle, onMouseDown } = useDraggable()
  const [closing, setClosing] = React.useState(false)
  const [showRemaining, setShowRemaining] = React.useState(false)
  const candidateName = app.candidate?.fullName ?? 'el candidato'
  const vacancyTitle = app.vacancyTitle

  const remainingApps = React.useMemo(
    () => allAppsForVacancy.filter(a => a.id !== app.id && a.status !== 'Contratado' && a.status !== 'Descartado'),
    [allAppsForVacancy, app.id]
  )

  async function handleCloseVacancy() {
    setClosing(true)
    await provider.closeVacancy(app.vacancyId ?? '')
    setClosing(false)
    if (remainingApps.length > 0) {
      setShowRemaining(true)
    } else {
      onVacancyClosed(app.vacancyId ?? '')
      onClose()
    }
  }

  if (showRemaining) {
    return (
      <CloseVacancyRemainingDialog
        vacancyId={app.vacancyId ?? ''}
        vacancyTitle={vacancyTitle ?? ''}
        remainingApps={remainingApps}
        provider={provider}
        onClose={() => { onVacancyClosed(app.vacancyId ?? ''); onClose() }}
        onDone={() => { onVacancyClosed(app.vacancyId ?? ''); onClose() }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 'min(420px, 95vw)', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', ...dragStyle }}>
        <div style={{ padding: '20px 20px 0', ...headerStyle }} onMouseDown={onMouseDown}>
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
            {remainingApps.length > 0 && (
              <span style={{ display: 'block', marginTop: 8, color: '#fbbf24' }}>
                Hay {remainingApps.length} candidato{remainingApps.length !== 1 ? 's' : ''} sin estado final — podrás definirlo en el siguiente paso.
              </span>
            )}
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
  const [clients, setClients] = React.useState<Client[]>([])
  const [templates, setTemplates] = React.useState<MessageTemplate[]>([])
  const [loading, setLoading] = React.useState(true)
  const searchParams = useSearchParams()
  const [filterVacancy, setFilterVacancy] = React.useState<string>(() => {
    const param = searchParams.get('vacancy')
    return param ?? 'all'
  })
  const [filterClient, setFilterClient] = React.useState<string>(() => {
    const param = searchParams.get('client')
    return param ?? 'all'
  })
  const [filterScore, setFilterScore] = React.useState<string>('all')
  const [filterProcess, setFilterProcess] = React.useState<'activos' | 'concluidos' | 'cancelados'>('activos')
  const [searchText, setSearchText] = React.useState('')
  const [activeStage, setActiveStage] = React.useState<VacancyStatus | 'all'>('all')
  const [activeModal, setActiveModal] = React.useState<ActiveModal>(null)
  const [interviewsByCandidate, setInterviewsByCandidate] = React.useState<Map<string, string>>(new Map())
  const [allInterviews, setAllInterviews] = React.useState<Interview[]>([])
  const [hireDialog, setHireDialog] = React.useState<{ app: HydratedApplication } | null>(null)
  const [rejectDialog, setRejectDialog] = React.useState<{ appId: string; candidateName: string } | null>(null)
  const [stagePrompt, setStagePrompt] = React.useState<{ candidateName: string; currentStage: VacancyStatus; appId: string } | null>(null)
  const [autoNotifyBanner, setAutoNotifyBanner] = React.useState(false)

  const { user } = useUser()
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const pathname = usePathname()

  const load = React.useCallback(async () => {
    if (!user) return

    const tenantId = user.tenantId
    setLoading(true)
    const [appsResult, vacResult, candResult, intResult, tplResult, clientsResult] = await Promise.all([
      provider.getApplications(),
      provider.getVacancies(tenantId),
      provider.getCandidates(tenantId),
      provider.getInterviews(undefined, tenantId),
      provider.getTemplates(tenantId),
      provider.getClients(tenantId),
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
    setAllInterviews(interviews)

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
        vacancyTitle: (a.vacancyId ? vacMap.get(a.vacancyId) : undefined) ?? a.vacancyTitle ?? '',
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
    setClients(clientsResult.data ?? [])
    setTemplates(tplResult.data ?? [])
    setLoading(false)
  }, [provider, user])

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
    const events = ['vacancy:created', 'vacancy:updated', 'application:stage-changed', 'client:deleted', 'client:updated', 'candidate:updated', 'interview:scheduled', 'candidate:created']
    events.forEach(e => window.addEventListener(e, handleChange))
    return () => events.forEach(e => window.removeEventListener(e, handleChange))
  }, [load])

  const filtered = React.useMemo(() => {
    const validVacancyIds = new Set(vacancies.map(v => v.id))
    const activeClientIds = new Set(clients.filter(cl => cl.active !== false).map(cl => cl.id))
    return applications.filter(a => {
      const c = a.candidate
      if (!c) return false
      // Hide applications whose vacancy was deleted (e.g. when client was deleted)
      if (!a.vacancyId || !validVacancyIds.has(a.vacancyId)) return false
      const vac = vacancies.find(v => v.id === a.vacancyId)
      // Hide applications for vacancies belonging to a deleted or inactive client
      if (vac?.clientId && !activeClientIds.has(vac.clientId)) return false
      // Filter by process status (based on vacancy status)
      if (filterProcess === 'activos' && vac && (vac.status === 'Contratado' || vac.status === 'Descartado')) return false
      if (filterProcess === 'concluidos' && (!vac || vac.status !== 'Contratado')) return false
      if (filterProcess === 'cancelados' && (!vac || vac.status !== 'Descartado')) return false
      if (activeStage !== 'all' && a.status !== activeStage) return false
      if (filterClient !== 'all') {
        if (!vac || vac.clientId !== filterClient) return false
      }
      if (filterVacancy !== 'all' && a.vacancyId !== filterVacancy) return false
      if (filterScore === '80+' && (c.atsScore ?? 0) < 80) return false
      if (filterScore === '60-79' && ((c.atsScore ?? 0) < 60 || (c.atsScore ?? 0) >= 80)) return false
      if (filterScore === '<60' && (c.atsScore ?? 0) >= 60) return false
      if (searchText && !c.fullName.toLowerCase().includes(searchText.toLowerCase())) return false
      return true
    })
  }, [applications, activeStage, filterClient, filterVacancy, filterScore, filterProcess, searchText, vacancies, clients])

  const stageCounts = React.useMemo(() => {
    const map: Record<VacancyStatus, number> = {
      'Nuevas Vacantes': 0,
      'En Proceso': 0,
      'Entrevistas': 0,
      'A considerar': 0,
      'Oferta Enviada': 0,
      'Contratado': 0,
      'Descartado': 0,
    }
    filtered.forEach(a => {
      if (map[a.status] !== undefined) map[a.status]++
    })
    return map
  }, [filtered])

  const processStatusCounts = React.useMemo(() => {
    const count = (predicate: (vac: Vacancy | undefined) => boolean) =>
      applications.filter(a => {
        const vac = vacancies.find(v => v.id === a.vacancyId)
        return !!a.candidate && !!a.vacancyId && predicate(vac)
      }).length
    return {
      activos: count(vac => !!vac && vac.status !== 'Contratado' && vac.status !== 'Descartado'),
      concluidos: count(vac => vac?.status === 'Contratado'),
      cancelados: count(vac => vac?.status === 'Descartado'),
    }
  }, [applications, vacancies])

  const clientGroups = React.useMemo(() => {
    const groups = new Map<string, { clientId: string; clientName: string; apps: HydratedApplication[] }>()
    filtered.forEach(app => {
      const vac = vacancies.find(v => v.id === app.vacancyId)
      const clientId = vac?.clientId ?? '__no_client'
      const clientName = vac?.client?.name ?? clients.find(c => c.id === clientId)?.name ?? 'Sin cliente'
      if (!groups.has(clientId)) groups.set(clientId, { clientId, clientName, apps: [] })
      groups.get(clientId)!.apps.push(app)
    })
    return Array.from(groups.values()).sort((a, b) => {
      if (a.clientId === '__no_client') return 1
      if (b.clientId === '__no_client') return -1
      return a.clientName.localeCompare(b.clientName)
    })
  }, [filtered, vacancies, clients])

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

  function notifyStageChanged(app: HydratedApplication, newStage: string) {
    if (!app.candidate?.email) return
    if (!isAutoNotifyEnabled(user?.id)) {
      // Show the "enable auto-notify?" banner if not dismissed recently
      setAutoNotifyBanner(true)
      return
    }
    const vac = vacancies.find(v => v.id === app.vacancyId)
    fetch('/api/emails/stage-changed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId: app.candidateId,
        clientId: vac?.clientId ?? undefined,
        vacancyTitle: vac?.title ?? '',
        newStage,
      }),
    }).catch(() => {})
  }

  async function handleDecide(appId: string, action: DecisionAction) {
    const isVirtual = appId.startsWith('virtual-')
    if (action === 'avanzar') {
      const app = applications.find(a => a.id === appId)
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'Oferta Enviada' as VacancyStatus, disposition: null } : a))
      if (!isVirtual) {
        await provider.updateApplicationStatus(appId, 'Oferta Enviada')
        window.dispatchEvent(new CustomEvent('application:stage-changed'))
        if (app) notifyStageChanged(app, 'Oferta Enviada')
      }
    } else if (action === 'rechazar') {
      const app = applications.find(a => a.id === appId)
      const candidateName = app?.candidate?.fullName ?? ''
      // Optimistically mark as Descartado then let dialog refine the reason
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'Descartado' as VacancyStatus, disposition: null } : a))
      if (!isVirtual) setRejectDialog({ appId, candidateName })
    } else if (action === 'a_considerar') {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'A considerar' as VacancyStatus, disposition: null } : a))
      if (!isVirtual) {
        await provider.updateApplicationStatus(appId, 'A considerar')
        window.dispatchEvent(new CustomEvent('application:stage-changed'))
      }
    } else if (action === 'descartar_cv') {
      const app = applications.find(a => a.id === appId)
      const candidateName = app?.candidate?.fullName ?? ''
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'Descartado' as VacancyStatus, disposition: 'descartar_cv' as CandidateDisposition } : a))
      if (!isVirtual) setRejectDialog({ appId, candidateName })
    } else if (action === 'avanzar_etapa') {
      const STAGE_ORDER: VacancyStatus[] = ['Nuevas Vacantes', 'En Proceso', 'Entrevistas', 'A considerar', 'Oferta Enviada', 'Contratado']
      const app = applications.find(a => a.id === appId)
      if (!app) return
      const idx = STAGE_ORDER.indexOf(app.status)
      const nextStage = idx >= 0 && idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null
      if (!nextStage) return
      const updatedApps = applications.map(a => a.id === appId ? { ...a, status: nextStage, disposition: null } : a)
      setApplications(updatedApps)
      if (!isVirtual) {
        await provider.updateApplicationStatus(appId, nextStage)
        window.dispatchEvent(new CustomEvent('application:stage-changed'))
        // Notify candidate on meaningful stage advances
        const NOTIFY_STAGES: VacancyStatus[] = ['Entrevistas', 'Oferta Enviada', 'Contratado']
        if (NOTIFY_STAGES.includes(nextStage)) notifyStageChanged(app, nextStage)
      }
      // When a candidate is hired, check if all others for this vacancy are in terminal state
      if (nextStage === 'Contratado' && app.vacancyId) {
        const TERMINAL: VacancyStatus[] = ['Contratado', 'Descartado']
        const othersForVacancy = updatedApps.filter(a => a.vacancyId === app.vacancyId && a.id !== appId)
        const allTerminal = othersForVacancy.every(a => TERMINAL.includes(a.status))
        if (allTerminal && !isVirtual) {
          // Auto-close: all candidates resolved, close vacancy without dialog
          await provider.closeVacancy(app.vacancyId)
          handleVacancyClosed(app.vacancyId)
        } else if (!isVirtual) {
          // Show dialog to let user decide on remaining candidates
          setHireDialog({ app: { ...app, status: 'Contratado' } })
        }
      }
    }
  }

  // When a vacancy is closed after hiring, mark it as Contratado so it moves to Concluidos
  function handleVacancyClosed(vacancyId: string) {
    setVacancies(prev => prev.map(v => v.id === vacancyId ? { ...v, status: 'Contratado' as VacancyStatus } : v))
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[180, 120, 100, 90, 90, 80].map((w, i) => (
          <div key={i} style={{ height: 32, width: w, borderRadius: 99, background: 'var(--surface2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
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
      {/* Process status filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 24px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginRight: 4, flexShrink: 0 }}>
          Ver:
        </span>
        {([
          { key: 'activos',    label: 'Activos',    color: '#34d399' },
          { key: 'concluidos', label: 'Concluidos', color: '#60a5fa' },
          { key: 'cancelados', label: 'Cancelados', color: '#9ca3af' },
        ] as const).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => { setFilterProcess(key); setActiveStage('all') }}
            style={{
              padding: '4px 12px',
              borderRadius: 99,
              border: `1px solid ${filterProcess === key ? color : 'var(--border)'}`,
              background: filterProcess === key ? `${color}22` : 'transparent',
              color: filterProcess === key ? color : 'var(--muted2)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {label}
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              background: filterProcess === key ? `${color}33` : 'var(--surface2)',
              color: filterProcess === key ? color : 'var(--muted)',
              padding: '1px 5px',
              borderRadius: 99,
            }}>
              {processStatusCounts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Stage tabs */}
      <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--border)' }}>
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
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder={t.pipeline.searchPlaceholder}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
            className="w-44"
          />
        </div>
        <div className="relative">
          <select
            value={filterClient}
            onChange={e => { setFilterClient(e.target.value); setFilterVacancy('all') }}
            style={{ ...inputStyle, paddingRight: 28, appearance: 'none' as const }}
          >
            <option value="all">{t.pipeline.allClients}</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: 'var(--muted)' }} />
        </div>
        <div className="relative">
          <select
            value={filterVacancy}
            onChange={e => setFilterVacancy(e.target.value)}
            style={{ ...inputStyle, paddingRight: 28, appearance: 'none' as const }}
          >
            <option value="all">{t.pipeline.allVacancies}</option>
            {(filterClient === 'all' ? vacancies : vacancies.filter(v => v.clientId === filterClient))
              .filter(v =>
                filterProcess === 'activos'    ? v.status !== 'Contratado' && v.status !== 'Descartado' :
                filterProcess === 'concluidos' ? v.status === 'Contratado' :
                v.status === 'Descartado'
              )
              .map(v => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: 'var(--muted)' }} />
        </div>
        <div className="relative">
          <select
            value={filterScore}
            onChange={e => setFilterScore(e.target.value)}
            style={{ ...inputStyle, paddingRight: 28, appearance: 'none' as const }}
          >
            <option value="all">{t.pipeline.allScores}</option>
            <option value="80+">Excelente (80+)</option>
            <option value="60-79">Bueno (60-79)</option>
            <option value="<60">Regular (&lt;60)</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: 'var(--muted)' }} />
        </div>
        {(filterClient !== 'all' || filterVacancy !== 'all' || filterScore !== 'all' || searchText || activeStage !== 'all') && (
          <button
            onClick={() => { setFilterClient('all'); setFilterVacancy('all'); setFilterScore('all'); setSearchText(''); setActiveStage('all'); }}
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
              {t.pipeline.newVacancy}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 24px', borderBottom: '1px solid var(--border)', overflowX: 'auto', flexShrink: 0, WebkitOverflowScrolling: 'touch' as const }}>
        {[
          { label: t.pipeline.kpiTotal, value: filtered.length, color: 'var(--text)' },
          { label: t.pipeline.kpiNew, value: stageCounts['Nuevas Vacantes'], color: STAGE_COLORS['Nuevas Vacantes'] },
          { label: t.pipeline.kpiInProcess, value: stageCounts['En Proceso'], color: STAGE_COLORS['En Proceso'] },
          { label: t.pipeline.kpiInterviews, value: stageCounts['Entrevistas'], color: STAGE_COLORS['Entrevistas'] },
          { label: t.pipeline.kpiOffer, value: stageCounts['Oferta Enviada'], color: STAGE_COLORS['Oferta Enviada'] },
          { label: t.pipeline.kpiHired, value: stageCounts['Contratado'], color: STAGE_COLORS['Contratado'] },
        ].map(kpi => (
          <div key={kpi.label} style={{ flex: '0 0 auto', minWidth: 70, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: kpi.color, fontFamily: 'var(--font-nunito, Nunito, sans-serif)', lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginTop: 3 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Client-grouped list */}
      <div className="flex-1 overflow-auto" style={{ padding: '16px 24px' }}>
        {clientGroups.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '64px 0', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search style={{ width: 22, height: 22, color: 'var(--muted)' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
              {filterProcess === 'concluidos' ? 'Sin procesos concluidos' :
               filterProcess === 'cancelados' ? 'Sin procesos cancelados' :
               'Sin candidatos'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
              {filterProcess === 'concluidos' ? 'Los procesos donde se contrató un candidato aparecerán aquí' :
               filterProcess === 'cancelados' ? 'Los procesos sin contratación aparecerán aquí' :
               'Probá ajustando los filtros o creando una nueva vacante'}
            </p>
          </div>
        ) : (
          clientGroups.map(group => (
            <ClientSection
              key={group.clientId}
              clientId={group.clientId}
              clientName={group.clientName}
              apps={group.apps}
              onAction={setActiveModal}
              onDecide={handleDecide}
              interviewsByCandidate={interviewsByCandidate}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {activeModal?.type === 'email' && (() => {
        const cid = activeModal.candidate.id
        const vac = vacancies.find(v => applications.some(a => a.candidateId === cid && a.vacancyId === v.id))
        const interview = allInterviews
          .filter(i => i.candidateId === cid && i.status === 'Programada')
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]
        const activeApp = applications.find(a => a.candidateId === cid && a.status !== 'Contratado' && a.status !== 'Descartado')
        return (
          <EmailModal
            candidate={activeModal.candidate}
            templates={templates}
            vacancies={vacancies}
            initialVacancy={vac}
            interview={interview}
            onClose={() => setActiveModal(null)}
            onStagePrompt={activeApp ? () => {
              setActiveModal(null)
              setStagePrompt({ candidateName: activeModal.candidate.fullName, currentStage: activeApp.status, appId: activeApp.id })
            } : undefined}
          />
        )
      })()}
      {activeModal?.type === 'whatsapp' && (() => {
        const cid = activeModal.candidate.id
        const vac = vacancies.find(v => applications.some(a => a.candidateId === cid && a.vacancyId === v.id))
        const interview = allInterviews
          .filter(i => i.candidateId === cid && i.status === 'Programada')
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]
        const activeApp = applications.find(a => a.candidateId === cid && a.status !== 'Contratado' && a.status !== 'Descartado')
        return (
          <WhatsAppModal
            candidate={activeModal.candidate}
            templates={templates}
            vacancies={vacancies}
            initialVacancy={vac}
            interview={interview}
            onClose={() => setActiveModal(null)}
            onStagePrompt={activeApp ? () => {
              setActiveModal(null)
              setStagePrompt({ candidateName: activeModal.candidate.fullName, currentStage: activeApp.status, appId: activeApp.id })
            } : undefined}
          />
        )
      })()}
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
      {activeModal?.type === 'process' && (() => {
        const vac = vacancies.find(v => v.id === activeModal.vacancyId)
        return (
          <ProcessDetailModal
            app={activeModal.app}
            vacancy={vac}
            interviewDate={interviewsByCandidate.get(activeModal.candidate.id)}
            onClose={() => setActiveModal(null)}
            onAction={(newModal) => {
              setActiveModal(null)
              setTimeout(() => setActiveModal(newModal), 50)
            }}
            onDecide={handleDecide}
          />
        )
      })()}
      {activeModal?.type === 'history' && (
        <ProcessHistoryModal
          candidate={activeModal.candidate}
          provider={provider}
          vacancies={vacancies}
          onClose={() => setActiveModal(null)}
        />
      )}
      {hireDialog && (
        <HireDialog
          app={hireDialog.app}
          provider={provider}
          allAppsForVacancy={applications.filter(a => a.vacancyId === hireDialog.app.vacancyId)}
          onClose={() => setHireDialog(null)}
          onVacancyClosed={handleVacancyClosed}
        />
      )}
      {rejectDialog && (
        <RejectReasonDialog
          appId={rejectDialog.appId}
          candidateName={rejectDialog.candidateName}
          provider={provider}
          onClose={() => setRejectDialog(null)}
          onDone={() => setRejectDialog(null)}
        />
      )}
      {stagePrompt && (
        <StagePromptDialog
          candidateName={stagePrompt.candidateName}
          currentStage={stagePrompt.currentStage}
          appId={stagePrompt.appId}
          onDecide={handleDecide}
          onClose={() => setStagePrompt(null)}
        />
      )}
      {autoNotifyBanner && (
        <AutoNotifyBanner onClose={() => setAutoNotifyBanner(false)} />
      )}
    </div>
  )
}

// ─── Auto-notify hint banner ──────────────────────────────────────────────────
function AutoNotifyBanner({ onClose }: { onClose: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 8000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1200,
        maxWidth: 360,
        background: 'linear-gradient(135deg, rgba(93,80,214,0.95), rgba(139,126,255,0.95))',
        backdropFilter: 'blur(12px)',
        borderRadius: 14,
        padding: '14px 18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        animation: 'banner-slide-in 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes banner-slide-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
          ¿Sabías que podés notificar candidatos automáticamente?
        </p>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 0, lineHeight: 1 }}
        >
          <X size={14} />
        </button>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: 0, lineHeight: 1.4 }}>
        Activá los emails automáticos a candidatos en Configuración y se enviarán con el branding de tu cliente.
      </p>
      <Link
        href="/settings?tab=notificaciones&highlight=auto_notify_candidates"
        onClick={onClose}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.2)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          padding: '6px 12px',
          borderRadius: 8,
          textDecoration: 'none',
          alignSelf: 'flex-start',
          transition: 'background 0.15s',
        }}
      >
        Activar en Configuración →
      </Link>
    </div>
  )
}
