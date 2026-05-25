'use client'
import * as React from 'react'
import Link from 'next/link'
import { Users2, Search, X, ChevronRight, ExternalLink, Star, Filter, Pencil, CheckCircle2, Loader2, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DraggableModal } from '@/components/ui/draggable-modal'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import { getInitials, formatRelativeDate } from '@/lib/utils'
import type { Candidate, Application, Vacancy, Client, VacancyStatus, Interview } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Classification = 'activo' | 'reserva' | 'descartado'

interface TalentEntry {
  candidate: Candidate
  applications: Application[]
  bestStage: VacancyStatus
  lastVacancyTitle: string
  lastClientName: string
  lastUpdated: string
  classification: Classification
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_ORDER: VacancyStatus[] = [
  'Nuevas Vacantes',
  'En Proceso',
  'Entrevistas',
  'Oferta Enviada',
  'Contratado',
  'Descartado',
]

const STAGE_COLORS: Record<VacancyStatus, string> = {
  'Nuevas Vacantes': '#94a3b8',
  'En Proceso': '#38bdf8',
  'Entrevistas': '#a78bfa',
  'Oferta Enviada': '#fbbf24',
  'Contratado': '#34d399',
  'Descartado': '#6b7280',
}

// ─── Helper: build TalentEntry from raw data ──────────────────────────────────

function buildTalentEntries(
  candidates: Candidate[],
  applications: Application[],
  vacancies: Vacancy[],
  clients: Client[]
): TalentEntry[] {
  const vacancyMap = new Map(vacancies.map(v => [v.id, v]))
  const clientMap = new Map(clients.map(c => [c.id, c]))

  return candidates.map(candidate => {
    const apps = applications.filter(a => a.candidateId === candidate.id)

    // Best stage: highest index excluding Descartado
    let bestStageIdx = 0
    for (const app of apps) {
      const idx = STAGE_ORDER.indexOf(app.status)
      if (app.status !== 'Descartado' && idx > bestStageIdx) {
        bestStageIdx = idx
      }
    }
    const bestStage: VacancyStatus = STAGE_ORDER[bestStageIdx]

    // Last updated across all apps
    let lastUpdated = candidate.createdAt
    for (const app of apps) {
      if (app.updatedAt > lastUpdated) lastUpdated = app.updatedAt
    }

    // Most recent app for vacancy / client title
    const sortedApps = [...apps].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    const lastApp = sortedApps[0]
    const lastVacancy = lastApp ? vacancyMap.get(lastApp.vacancyId) : undefined
    const lastVacancyTitle = lastVacancy?.title ?? '—'
    const lastClient = lastVacancy?.clientId ? clientMap.get(lastVacancy.clientId) : undefined
    const lastClientName = lastClient?.name ?? clientMap.get(candidate.clientId ?? '')?.name ?? '—'

    // Classification
    const hasActive = apps.some(
      a => a.status !== 'Descartado' && a.status !== 'Contratado'
    )
    const allEnded = apps.every(
      a => a.status === 'Descartado' || a.status === 'Contratado'
    )
    const reachedHighStage = apps.some(a =>
      a.status === 'Entrevistas' ||
      a.status === 'Oferta Enviada' ||
      a.status === 'Contratado'
    )
    const allDiscarded = apps.length > 0 && apps.every(a => a.status === 'Descartado')
    const nonePassedEnProceso = !apps.some(a =>
      a.status === 'Entrevistas' ||
      a.status === 'Oferta Enviada' ||
      a.status === 'Contratado'
    )

    let classification: Classification
    if (apps.length === 0 || hasActive) {
      classification = 'activo'
    } else if (allEnded && reachedHighStage) {
      classification = 'reserva'
    } else if (allDiscarded && nonePassedEnProceso) {
      classification = 'descartado'
    } else {
      classification = 'reserva'
    }

    return {
      candidate,
      applications: apps,
      bestStage,
      lastVacancyTitle,
      lastClientName,
      lastUpdated,
      classification,
    }
  })
}

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
    const interviewsHtml = interviews.length === 0
      ? '<p style="color:#9ca3af;font-size:13px">Sin entrevistas registradas.</p>'
      : `<table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead><tr style="background:#f3f4f6;">
            <th style="padding:6px 10px;text-align:left;border:1px solid #e5e7eb;">Tipo</th>
            <th style="padding:6px 10px;text-align:left;border:1px solid #e5e7eb;">Plataforma</th>
            <th style="padding:6px 10px;text-align:left;border:1px solid #e5e7eb;">Fecha</th>
            <th style="padding:6px 10px;text-align:left;border:1px solid #e5e7eb;">Entrevistador</th>
            <th style="padding:6px 10px;text-align:left;border:1px solid #e5e7eb;">Notas</th>
          </tr></thead>
          <tbody>${interviews.map(i => `<tr>
            <td style="padding:6px 10px;border:1px solid #e5e7eb;">${i.type}</td>
            <td style="padding:6px 10px;border:1px solid #e5e7eb;">${i.meetingPlatform}</td>
            <td style="padding:6px 10px;border:1px solid #e5e7eb;">${new Date(i.scheduledAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            <td style="padding:6px 10px;border:1px solid #e5e7eb;">${i.interviewerName}</td>
            <td style="padding:6px 10px;border:1px solid #e5e7eb;">${i.notes ?? '—'}</td>
          </tr>`).join('')}</tbody>
        </table>`

    const appsHtml = apps.length === 0
      ? '<p style="color:#9ca3af;font-size:13px">Sin postulaciones registradas.</p>'
      : `<table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead><tr style="background:#f3f4f6;">
            <th style="padding:6px 10px;text-align:left;border:1px solid #e5e7eb;">Vacante</th>
            <th style="padding:6px 10px;text-align:left;border:1px solid #e5e7eb;">Etapa</th>
            <th style="padding:6px 10px;text-align:left;border:1px solid #e5e7eb;">Ingreso</th>
            <th style="padding:6px 10px;text-align:left;border:1px solid #e5e7eb;">Última actualización</th>
          </tr></thead>
          <tbody>${apps.map(a => {
            const vac = vacancies.find(v => v.id === a.vacancyId)
            return `<tr>
              <td style="padding:6px 10px;border:1px solid #e5e7eb;">${vac?.title ?? '—'}${vac?.client?.name ? ` · ${vac.client.name}` : ''}</td>
              <td style="padding:6px 10px;border:1px solid #e5e7eb;color:${STAGE_COLORS[a.status] ?? '#6b7280'}">${a.status}</td>
              <td style="padding:6px 10px;border:1px solid #e5e7eb;">${new Date(a.appliedAt).toLocaleDateString('es-AR')}</td>
              <td style="padding:6px 10px;border:1px solid #e5e7eb;">${new Date(a.updatedAt).toLocaleDateString('es-AR')}</td>
            </tr>`
          }).join('')}</tbody>
        </table>`

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/>
      <title>Historial de proceso — ${candidate.fullName}</title>
      <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #fff; padding: 32px; } h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; } h2 { font-size: 15px; font-weight: 700; margin: 24px 0 10px; color: #374151; } .meta { font-size: 13px; color: #6b7280; margin-bottom: 6px; } @media print { body { padding: 20px; } }</style>
      </head><body>
      <h1>${candidate.fullName}</h1>
      <p class="meta">${candidate.email}${candidate.phone ? ' · ' + candidate.phone : ''}</p>
      <h2>Historial de postulaciones</h2>${appsHtml}
      <h2>Entrevistas</h2>${interviewsHtml}
      <script>window.onload = function(){ window.print(); }</script>
      </body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close() }
  }

  const sortedApps = [...apps].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())

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
          maxWidth: 'min(600px, 95vw)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
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
                              {app.status}
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function AtsBadge({ score }: { score?: number }) {
  if (score === undefined) {
    return <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(107,114,128,0.12)', color: '#9ca3af' }}>—</span>
  }
  const bg = score >= 80 ? 'rgba(52,211,153,0.15)' : score >= 60 ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)'
  const color = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#ef4444'
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: bg, color }}
    >
      {score}
    </span>
  )
}

function ClassBadge({ cls }: { cls: Classification }) {
  const styles: Record<Classification, { bg: string; color: string; label: string }> = {
    activo: { bg: 'rgba(52,211,153,0.15)', color: '#34d399', label: 'Activo' },
    reserva: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', label: '⭐ Reserva' },
    descartado: { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af', label: 'Descartado' },
  }
  const s = styles[cls]
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

function StageBadge({ stage }: { stage: VacancyStatus }) {
  const color = STAGE_COLORS[stage]
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: `${color}22`, color }}
    >
      {stage}
    </span>
  )
}

// ─── Profile Drawer ───────────────────────────────────────────────────────────

function ProfileDrawer({
  entry,
  vacancies,
  clients,
  onClose,
  onIncorporar,
  onUpdate,
  onVerProceso,
}: {
  entry: TalentEntry | null
  vacancies: Vacancy[]
  clients: Client[]
  onClose: () => void
  onIncorporar: (entry: TalentEntry) => void
  onUpdate?: (updated: Candidate) => void
  onVerProceso?: (entry: TalentEntry) => void
}) {
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [editMode, setEditMode] = React.useState(false)
  const [editName, setEditName] = React.useState('')
  const [editPhone, setEditPhone] = React.useState('')
  const [editExperience, setEditExperience] = React.useState('')
  const [editEducation, setEditEducation] = React.useState('')
  const [editSkills, setEditSkills] = React.useState('')
  const [editClientId, setEditClientId] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState('')

  React.useEffect(() => {
    if (entry) {
      document.body.style.overflow = 'hidden'
      const c = entry.candidate
      setEditName(c.fullName)
      setEditPhone(c.phone ?? '')
      setEditExperience(c.experienceYears != null ? String(c.experienceYears) : '')
      setEditEducation(c.education ?? '')
      setEditSkills(c.skills.join(', '))
      setEditClientId(c.clientId ?? '')
      setEditMode(false)
      setSaveError('')
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [entry])

  async function handleSave() {
    if (!entry) return
    setSaving(true)
    setSaveError('')
    const result = await provider.updateCandidate(entry.candidate.id, {
      fullName: editName,
      phone: editPhone || undefined,
      experienceYears: editExperience ? Number(editExperience) : undefined,
      education: editEducation || undefined,
      skills: editSkills.split(',').map(s => s.trim()).filter(Boolean),
      clientId: editClientId || undefined,
    })
    setSaving(false)
    if (result.error) {
      setSaveError(result.error)
    } else if (result.data) {
      onUpdate?.(result.data)
      window.dispatchEvent(new CustomEvent('candidate:updated'))
      setEditMode(false)
    }
  }

  if (!entry) return null

  const { candidate, applications, bestStage, lastVacancyTitle, lastClientName, lastUpdated } = entry

  const inputCls = 'w-full px-2.5 py-1.5 text-sm rounded-md border text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]'
  const inputStyle = { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden shadow-2xl"
        style={{ width: '400px', maxWidth: '100vw', background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="font-semibold text-base" style={{ color: 'var(--text)' }}>Perfil del candidato</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditMode(e => !e); setSaveError('') }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: editMode ? 'var(--surface2)' : 'rgba(var(--accent-rgb,108,99,255),0.1)',
                color: editMode ? 'var(--muted)' : 'var(--accent-2)',
                border: '1px solid var(--border)',
              }}
            >
              <Pencil className="h-3 w-3" />
              {editMode ? 'Cancelar' : 'Editar'}
            </button>
            <button onClick={onClose} className="p-1 rounded-md" style={{ color: 'var(--muted)' }}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
            >
              {getInitials(editMode ? editName : candidate.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              {editMode ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="Nombre completo"
                />
              ) : (
                <>
                  <p className="font-bold text-base truncate" style={{ color: 'var(--text)' }}>{candidate.fullName}</p>
                  <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>{candidate.email}</p>
                  {candidate.phone && <p className="text-xs" style={{ color: 'var(--muted)' }}>{candidate.phone}</p>}
                </>
              )}
            </div>
          </div>

          {/* Badges row */}
          {!editMode && (
            <div className="flex flex-wrap gap-2 items-center">
              <AtsBadge score={candidate.atsScore} />
              <ClassBadge cls={entry.classification} />
              <StageBadge stage={bestStage} />
            </div>
          )}

          {/* Edit form */}
          {editMode ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Teléfono</label>
                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className={inputCls} style={inputStyle} placeholder="+54 11 ..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Experiencia (años)</label>
                  <input type="number" min={0} value={editExperience} onChange={e => setEditExperience(e.target.value)} className={inputCls} style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Cliente</label>
                  <select value={editClientId} onChange={e => setEditClientId(e.target.value)} className={inputCls} style={{ ...inputStyle, appearance: 'none' as const }}>
                    <option value="">Sin cliente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Educación</label>
                <input value={editEducation} onChange={e => setEditEducation(e.target.value)} className={inputCls} style={inputStyle} placeholder="Título o estudios" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Skills (separadas por coma)</label>
                <textarea value={editSkills} onChange={e => setEditSkills(e.target.value)} rows={2} className={inputCls} style={{ ...inputStyle, resize: 'none' as const, fontFamily: 'inherit' }} placeholder="React, Python, ..." />
              </div>
              {saveError && (
                <p className="text-xs px-3 py-2 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{saveError}</p>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-opacity"
                style={{ background: 'var(--accent)', color: '#fff', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          ) : (
            <>
              {/* Info grid */}
              <div className="rounded-xl p-4 space-y-3 text-sm" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                {candidate.education && (
                  <div className="flex justify-between gap-2">
                    <span style={{ color: 'var(--muted)' }}>Educación</span>
                    <span className="text-right font-medium" style={{ color: 'var(--text)' }}>{candidate.education}</span>
                  </div>
                )}
                {candidate.experienceYears !== undefined && (
                  <div className="flex justify-between gap-2">
                    <span style={{ color: 'var(--muted)' }}>Experiencia</span>
                    <span className="font-medium" style={{ color: 'var(--text)' }}>{candidate.experienceYears} año{candidate.experienceYears !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <span style={{ color: 'var(--muted)' }}>Fuente</span>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>{candidate.source}</span>
                </div>
                {lastClientName !== '—' && (
                  <div className="flex justify-between gap-2">
                    <span style={{ color: 'var(--muted)' }}>Cliente</span>
                    <span className="font-medium" style={{ color: 'var(--text)' }}>{lastClientName}</span>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <span style={{ color: 'var(--muted)' }}>Última actualización</span>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>{formatRelativeDate(lastUpdated)}</span>
                </div>
              </div>

              {/* Skills */}
              {candidate.skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--muted)' }}>Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CV link */}
              {candidate.cvUrl && (
                <a
                  href={candidate.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-opacity hover:opacity-80"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent-2)', background: 'rgba(var(--accent-rgb),0.06)' }}
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  {candidate.cvFileName ?? 'Ver CV adjunto'}
                </a>
              )}

              {/* Process history */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--muted)' }}>Historial de procesos</p>
                {applications.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--muted2)' }}>Sin postulaciones registradas.</p>
                ) : (
                  <div className="space-y-2">
                    {applications.map(app => {
                      const stageColor = STAGE_COLORS[app.status]
                      return (
                        <div key={app.id} className="flex items-center gap-3 rounded-lg p-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: stageColor }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                              {lastVacancyTitle !== '—' && app.vacancyId ? lastVacancyTitle : 'Vacante'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>
                              <span style={{ color: stageColor }}>{app.status}</span>
                              {' · '}{formatRelativeDate(app.updatedAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-5 py-4 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border)' }}>
          <Button className="w-full gap-2" onClick={() => onIncorporar(entry)}>
            <ChevronRight className="h-4 w-4" />
            Incorporar a vacante
          </Button>
          {onVerProceso && (
            <Button
              variant="outline"
              className="w-full gap-2"
              style={{ color: '#34d399', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)' }}
              onClick={() => { onClose(); onVerProceso(entry) }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Ver proceso completo
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Incorporar Modal ─────────────────────────────────────────────────────────

function IncorporarModal({
  entry,
  vacancies,
  provider,
  onClose,
}: {
  entry: TalentEntry | null
  vacancies: Vacancy[]
  provider: SupabaseProvider
  onClose: () => void
}) {
  const activeVacancies = React.useMemo(
    () => vacancies.filter(v => v.status !== 'Contratado'),
    [vacancies]
  )

  const [selectedVacancyId, setSelectedVacancyId] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [successVacancyTitle, setSuccessVacancyTitle] = React.useState('')
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (entry) {
      setSelectedVacancyId(activeVacancies[0]?.id ?? '')
      setSaving(false)
      setSuccess(false)
      setError('')
      setSuccessVacancyTitle('')
    }
  }, [entry, activeVacancies])

  const selectedVacancy = activeVacancies.find(v => v.id === selectedVacancyId)

  async function handleConfirm() {
    if (!entry || !selectedVacancyId) return
    setSaving(true)
    setError('')
    const result = await provider.createApplication({
      vacancyId: selectedVacancyId,
      candidateId: entry.candidate.id,
      status: 'Nuevas Vacantes',
      positionInStage: 0,
    })
    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccessVacancyTitle(selectedVacancy?.title ?? 'la vacante')
      setSuccess(true)
      window.dispatchEvent(new CustomEvent('application:stage-changed'))
    }
  }

  if (!entry) return null

  const inputCls = 'w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <DraggableModal
      open={entry !== null}
      onClose={onClose}
      title="Incorporar candidato"
      maxWidth="28rem"
      footer={
        success ? undefined : (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              type="button"
              disabled={saving || !selectedVacancyId}
              onClick={handleConfirm}
              className="gap-1.5"
            >
              {saving ? '...' : <>Incorporar <ChevronRight className="h-4 w-4" /></>}
            </Button>
          </div>
        )
      }
    >
      {success ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
            style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}
          >
            ✓
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text)' }}>
              {entry.candidate.fullName} fue incorporado a {successVacancyTitle}.
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Podés verlo en el pipeline.
            </p>
          </div>
          <Link href="/pipeline">
            <Button variant="outline" className="gap-1.5" onClick={onClose}>
              Ir al Pipeline <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4 mt-1">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Seleccioná una vacante activa para <strong style={{ color: 'var(--text)' }}>{entry.candidate.fullName}</strong>
          </p>
          {activeVacancies.length === 0 ? (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
              No hay vacantes activas disponibles.
            </p>
          ) : (
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Vacante</label>
              <select
                value={selectedVacancyId}
                onChange={e => setSelectedVacancyId(e.target.value)}
                className={inputCls}
                style={{ borderColor: 'var(--border)' }}
              >
                {activeVacancies.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.title}{v.client ? ` — ${v.client.name}` : ''}
                  </option>
                ))}
              </select>
              {selectedVacancy && (
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Vacante: <strong>{selectedVacancy.title}</strong>
                  {selectedVacancy.client && <> · Cliente: <strong>{selectedVacancy.client.name}</strong></>}
                </p>
              )}
            </div>
          )}
          {error && (
            <p className="text-xs px-3 py-2 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              {error}
            </p>
          )}
        </div>
      )}
    </DraggableModal>
  )
}

// ─── Candidate Card ───────────────────────────────────────────────────────────

function CandidateCard({
  entry,
  onVerPerfil,
  onIncorporar,
  onVerProceso,
}: {
  entry: TalentEntry
  onVerPerfil: (e: TalentEntry) => void
  onIncorporar: (e: TalentEntry) => void
  onVerProceso: (e: TalentEntry) => void
}) {
  const { candidate, bestStage, lastVacancyTitle, lastClientName, lastUpdated, classification } = entry
  const visibleSkills = candidate.skills.slice(0, 4)
  const extraSkills = candidate.skills.length - 4

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3 transition-shadow hover:shadow-md"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            {getInitials(candidate.fullName)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{candidate.fullName}</p>
            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{candidate.email}</p>
          </div>
        </div>
        <AtsBadge score={candidate.atsScore} />
      </div>

      {/* Skills */}
      {candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleSkills.map(s => (
            <span
              key={s}
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              {s}
            </span>
          ))}
          {extraSkills > 0 && (
            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>+{extraSkills} más</span>
          )}
        </div>
      )}

      {/* Classification + stage + date */}
      <div className="flex flex-wrap items-center gap-2">
        <ClassBadge cls={classification} />
        <StageBadge stage={bestStage} />
        <span className="text-[11px] ml-auto" style={{ color: 'var(--muted2)' }}>
          {formatRelativeDate(lastUpdated)}
        </span>
      </div>

      {/* Vacancy + Client info */}
      <div className="text-xs space-y-0.5" style={{ color: 'var(--muted)' }}>
        <p>Vacante: <span style={{ color: 'var(--text)' }}>{lastVacancyTitle}</span></p>
        <p>Cliente: <span style={{ color: 'var(--text)' }}>{lastClientName}</span></p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => onVerPerfil(entry)}
        >
          Ver perfil
        </Button>
        {entry.classification === 'activo' && entry.bestStage === 'Contratado' ? (
          <Button
            size="sm"
            className="flex-1 text-xs gap-1"
            style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}
            variant="outline"
            onClick={() => onVerProceso(entry)}
          >
            <CheckCircle2 className="h-3 w-3" /> Ver proceso
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              className="flex-1 text-xs gap-1"
              onClick={() => onIncorporar(entry)}
            >
              Incorporar <ChevronRight className="h-3 w-3" />
            </Button>
            {(entry.classification === 'reserva' || entry.classification === 'descartado') && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1"
                style={{ color: '#34d399', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)' }}
                onClick={() => onVerProceso(entry)}
              >
                <CheckCircle2 className="h-3 w-3" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl h-52 animate-pulse"
          style={{ background: 'var(--surface2)' }}
        />
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type ClassFilter = 'todos' | Classification
type ScoreFilter = 'todos' | '80+' | '60-79' | '<60'

export default function TalentPoolPage() {
  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  // Raw data
  const [candidates, setCandidates] = React.useState<Candidate[]>([])
  const [applications, setApplications] = React.useState<Application[]>([])
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [clients, setClients] = React.useState<Client[]>([])
  const [loading, setLoading] = React.useState(true)

  // Filters
  const [search, setSearch] = React.useState('')
  const [classFilter, setClassFilter] = React.useState<ClassFilter>('todos')
  const [scoreFilter, setScoreFilter] = React.useState<ScoreFilter>('todos')
  const [clientFilter, setClientFilter] = React.useState('todos')

  // UI state
  const [profileEntry, setProfileEntry] = React.useState<TalentEntry | null>(null)
  const [incorporarEntry, setIncorporarEntry] = React.useState<TalentEntry | null>(null)
  const [processHistoryEntry, setProcessHistoryEntry] = React.useState<TalentEntry | null>(null)

  // ── Load ───────────────────────────────────────────────────────────────────

  const load = React.useCallback(async () => {
    const tenantId = user?.tenantId ?? ''
    const [appRes, candRes, vacRes, clRes] = await Promise.all([
      provider.getApplications(undefined, tenantId),
      provider.getCandidates(tenantId),
      provider.getVacancies(tenantId),
      provider.getClients(tenantId),
    ])
    setCandidates(candRes.data ?? [])
    setApplications(appRes.data ?? [])
    setVacancies(vacRes.data ?? [])
    setClients(clRes.data ?? [])
    setLoading(false)
  }, [provider, user])

  React.useEffect(() => { load() }, [load])

  React.useEffect(() => {
    const events = ['application:stage-changed', 'candidate:created', 'candidate:updated', 'interview:scheduled', 'vacancy:created', 'vacancy:updated']
    events.forEach(e => window.addEventListener(e, load))
    return () => events.forEach(e => window.removeEventListener(e, load))
  }, [load])

  React.useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [load])

  // ── Derived data ──────────────────────────────────────────────────────────

  const allEntries = React.useMemo(
    () => buildTalentEntries(candidates, applications, vacancies, clients),
    [candidates, applications, vacancies, clients]
  )

  const filtered = React.useMemo(() => {
    return allEntries.filter(entry => {
      const { candidate, classification } = entry

      // Text search
      if (search) {
        const q = search.toLowerCase()
        const nameMatch = candidate.fullName.toLowerCase().includes(q)
        const emailMatch = candidate.email.toLowerCase().includes(q)
        const skillMatch = candidate.skills.some(s => s.toLowerCase().includes(q))
        if (!nameMatch && !emailMatch && !skillMatch) return false
      }

      // Classification
      if (classFilter !== 'todos' && classification !== classFilter) return false

      // ATS score
      const score = candidate.atsScore
      if (scoreFilter === '80+' && (score === undefined || score < 80)) return false
      if (scoreFilter === '60-79' && (score === undefined || score < 60 || score >= 80)) return false
      if (scoreFilter === '<60' && (score !== undefined && score >= 60)) return false

      // Client filter — match by last vacancy's client
      if (clientFilter !== 'todos') {
        const appVacancyIds = entry.applications.map(a => a.vacancyId)
        const matchesClient = vacancies.some(v => v.clientId === clientFilter && appVacancyIds.includes(v.id))
        if (!matchesClient) return false
      }

      return true
    })
  }, [allEntries, search, classFilter, scoreFilter, clientFilter, vacancies])

  const stats = React.useMemo(() => ({
    activo: allEntries.filter(e => e.classification === 'activo').length,
    reserva: allEntries.filter(e => e.classification === 'reserva').length,
    descartado: allEntries.filter(e => e.classification === 'descartado').length,
  }), [allEntries])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleIncorporar = React.useCallback((entry: TalentEntry) => {
    setProfileEntry(null)
    setIncorporarEntry(entry)
  }, [])

  const handleCandidateUpdate = React.useCallback((updated: import('@/types').Candidate) => {
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c))
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────

  const classFilterOptions: { value: ClassFilter; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'activo', label: 'Activos' },
    { value: 'reserva', label: 'Reserva' },
    { value: 'descartado', label: 'Descartados' },
  ]

  const pillBase = 'text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer'

  return (
    <div className="flex flex-col min-h-0 gap-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Banco de Talento</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Base histórica de candidatos evaluados</p>
        </div>
        {!loading && (
          <div className="flex gap-2 flex-wrap">
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}
            >
              {stats.activo} activos
            </span>
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
            >
              {stats.reserva} reserva
            </span>
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(107,114,128,0.12)', color: '#9ca3af' }}
            >
              {stats.descartado} descartados
            </span>
          </div>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div
        className="sticky top-0 z-10 flex flex-wrap gap-3 items-center py-3 -mx-4 px-4"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Text search */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: 'var(--muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o skill..."
            className="w-full pl-8 pr-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ borderColor: 'var(--border)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted)' }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Classification pills */}
        <div className="flex gap-1.5 flex-wrap">
          {classFilterOptions.map(opt => {
            const active = classFilter === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setClassFilter(opt.value)}
                className={pillBase}
                style={{
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'white' : 'var(--muted)',
                  borderColor: active ? 'var(--accent)' : 'var(--border)',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Score filter */}
        <div className="relative">
          <select
            value={scoreFilter}
            onChange={e => setScoreFilter(e.target.value as ScoreFilter)}
            className="pl-3 pr-7 py-2 text-sm rounded-md border bg-background focus:outline-none appearance-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="todos">Todos los scores</option>
            <option value="80+">ATS 80+</option>
            <option value="60-79">ATS 60-79</option>
            <option value="<60">ATS &lt;60</option>
          </select>
        </div>

        {/* Client filter */}
        {clients.length > 0 && (
          <div className="relative">
            <select
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
              className="pl-3 pr-7 py-2 text-sm rounded-md border bg-background focus:outline-none appearance-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <option value="todos">Todos los clientes</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {/* Count */}
        <span className="text-xs ml-auto shrink-0" style={{ color: 'var(--muted)' }}>
          {filtered.length} candidato{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'var(--surface2)' }}
          >
            <Users2 className="h-8 w-8" style={{ color: 'var(--muted)' }} />
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>
            Sin candidatos en el banco
          </h3>
          <p className="text-sm max-w-sm" style={{ color: 'var(--muted)' }}>
            {search || classFilter !== 'todos' || scoreFilter !== 'todos' || clientFilter !== 'todos'
              ? 'No hay candidatos que coincidan con los filtros activos.'
              : 'Cargá CVs en Candidatos para comenzar a construir tu banco de talento.'}
          </p>
        </div>
      ) : (
        /* Cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
          {filtered.map(entry => (
            <CandidateCard
              key={entry.candidate.id}
              entry={entry}
              onVerPerfil={setProfileEntry}
              onIncorporar={handleIncorporar}
              onVerProceso={setProcessHistoryEntry}
            />
          ))}
        </div>
      )}

      {/* ── Profile Drawer ── */}
      <ProfileDrawer
        entry={profileEntry}
        vacancies={vacancies}
        clients={clients}
        onClose={() => setProfileEntry(null)}
        onIncorporar={handleIncorporar}
        onUpdate={handleCandidateUpdate}
        onVerProceso={setProcessHistoryEntry}
      />

      {/* ── Incorporar Modal ── */}
      <IncorporarModal
        entry={incorporarEntry}
        vacancies={vacancies}
        provider={provider}
        onClose={() => setIncorporarEntry(null)}
      />

      {/* ── Process History Modal ── */}
      {processHistoryEntry && (
        <ProcessHistoryModal
          candidate={processHistoryEntry.candidate}
          provider={provider}
          vacancies={vacancies}
          onClose={() => setProcessHistoryEntry(null)}
        />
      )}
    </div>
  )
}
