'use client'

import * as React from 'react'
import {
  Plus, Calendar, Clock, User2, Video, Users,
  CheckCircle2, XCircle, AlertCircle,
  Star, Loader2, FileDown, Sparkles, LayoutList, Layers, ArrowRight
} from 'lucide-react'
import { cn, formatDate, generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import type {
  Interview, Candidate, Vacancy, InterviewType, InterviewStatus,
  MeetingPlatform, Scorecard, Recommendation, Application, VacancyStatus
} from '@/types'

const TYPE_COLORS: Record<InterviewType, { bg: string; text: string; border: string }> = {
  'RRHH':              { bg: 'rgba(167,114,250,0.15)', text: '#a78bfa', border: 'rgba(167,114,250,0.4)' },
  'Técnica':           { bg: 'rgba(96,165,250,0.15)',  text: '#60a5fa', border: 'rgba(96,165,250,0.4)' },
  'Con Hiring Manager':{ bg: 'rgba(251,146,60,0.15)',  text: '#fb923c', border: 'rgba(251,146,60,0.4)' },
  'Cultural':          { bg: 'rgba(52,211,153,0.15)',  text: '#34d399', border: 'rgba(52,211,153,0.4)' },
}

const STATUS_CONFIG: Record<InterviewStatus, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  Programada: { icon: Clock,        bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24', label: 'Programada' },
  Completada: { icon: CheckCircle2, bg: 'rgba(52,211,153,0.15)',  text: '#34d399', label: 'Completada' },
  Cancelada:  { icon: XCircle,      bg: 'rgba(248,113,113,0.15)', text: '#f87171', label: 'Cancelada'  },
}

const PLATFORM_LABELS: Record<MeetingPlatform, string> = {
  zoom: 'Zoom', google_meet: 'Google Meet', teams: 'Teams', presencial: 'Presencial'
}

const ORDINALS = ['1ª', '2ª', '3ª', '4ª', '5ª', '6ª']

// ─── Avatar helper ────────────────────────────────────────────────────────────
const GRADIENTS = [
  'linear-gradient(135deg,#6c63ff,#a78bfa)',
  'linear-gradient(135deg,#0ea5e9,#38bdf8)',
  'linear-gradient(135deg,#10b981,#34d399)',
  'linear-gradient(135deg,#f59e0b,#fbbf24)',
  'linear-gradient(135deg,#f43f5e,#fb7185)',
  'linear-gradient(135deg,#d946ef,#e879f9)',
]
function avatarGradient(name: string) {
  let s = 0; for (const c of name) s += c.charCodeAt(0)
  return GRADIENTS[s % GRADIENTS.length]
}
function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase()
}

// ─── Scheduler Modal ──────────────────────────────────────────────────────────
function SchedulerModal({
  open, onClose, candidates, vacancies, onSaved, prefill,
}: {
  open: boolean
  onClose: () => void
  candidates: Candidate[]
  vacancies: Vacancy[]
  onSaved: (i: Interview) => void
  prefill?: { candidateId?: string; vacancyId?: string }
}) {
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [form, setForm] = React.useState({
    candidateId: prefill?.candidateId ?? '',
    vacancyId:   prefill?.vacancyId   ?? '',
    type: 'RRHH' as InterviewType,
    interviewerName: '',
    date: '',
    time: '10:00',
    platform: 'google_meet' as MeetingPlatform,
    notes: '',
  })
  const [saving, setSaving] = React.useState(false)

  // Sync prefill when it changes (e.g. opening for different candidates)
  React.useEffect(() => {
    if (open) {
      setForm(f => ({
        ...f,
        candidateId: prefill?.candidateId ?? f.candidateId,
        vacancyId:   prefill?.vacancyId   ?? f.vacancyId,
      }))
    }
  }, [open, prefill?.candidateId, prefill?.vacancyId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.candidateId || !form.date) return
    setSaving(true)
    const scheduledAt = new Date(`${form.date}T${form.time}:00`).toISOString()
    const result = await provider.createInterview({
      candidateId:     form.candidateId,
      vacancyId:       (form.vacancyId || vacancies[0]?.id) ?? '',
      scheduledAt,
      type:            form.type,
      interviewerName: form.interviewerName,
      status:          'Programada',
      meetingPlatform: form.platform,
      notes:           form.notes || undefined,
    })
    setSaving(false)
    if (result.data) { onSaved(result.data); onClose() }
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring'
  const labelCls = 'text-xs font-medium text-muted-foreground mb-1 block'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Agendar entrevista</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div>
            <label className={labelCls}>Candidato *</label>
            <select required value={form.candidateId} onChange={e => setForm(f => ({...f, candidateId: e.target.value}))} className={inputCls}>
              <option value="">Seleccioná un candidato</option>
              {candidates.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Vacante</label>
            <select value={form.vacancyId} onChange={e => setForm(f => ({...f, vacancyId: e.target.value}))} className={inputCls}>
              <option value="">Sin vacante asignada</option>
              {vacancies.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tipo de entrevista</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value as InterviewType}))} className={inputCls}>
                <option>RRHH</option><option>Técnica</option><option>Con Hiring Manager</option><option>Cultural</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Plataforma</label>
              <select value={form.platform} onChange={e => setForm(f => ({...f, platform: e.target.value as MeetingPlatform}))} className={inputCls}>
                <option value="google_meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="teams">Teams</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha *</label>
              <input required type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className={inputCls} min={new Date().toISOString().slice(0,10)} />
            </div>
            <div>
              <label className={labelCls}>Hora</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Entrevistador</label>
            <input value={form.interviewerName} onChange={e => setForm(f => ({...f, interviewerName: e.target.value}))} className={inputCls} placeholder="Nombre del entrevistador" />
          </div>
          <div>
            <label className={labelCls}>Notas previas</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} className={cn(inputCls, 'h-16 resize-none')} placeholder="Temas a cubrir, contexto del candidato..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Agendar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Scorecard Modal ──────────────────────────────────────────────────────────
function ScorecardModal({
  open, onClose, interview, candidateName, onComplete
}: {
  open: boolean
  onClose: () => void
  interview: Interview
  candidateName: string
  onComplete: (i: Interview) => void
}) {
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [scores, setScores] = React.useState({ technicalSkills: 70, communication: 70, culturalFit: 70, motivation: 70 })
  const [overallRating, setOverallRating] = React.useState<1|2|3|4|5>(3)
  const [strengths, setStrengths] = React.useState('')
  const [weaknesses, setWeaknesses] = React.useState('')
  const [recommendation, setRecommendation] = React.useState<Recommendation>('Considerar')
  const [aiSummary, setAiSummary] = React.useState('')
  const [generating, setGenerating] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const scoreLabels: Record<string, string> = {
    technicalSkills: 'Habilidades Técnicas',
    communication: 'Comunicación',
    culturalFit: 'Fit Cultural',
    motivation: 'Motivación',
  }

  async function generateAiReport() {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: interview.id,
          overallRating,
          technicalSkills: scores.technicalSkills,
          communication: scores.communication,
          culturalFit: scores.culturalFit,
          strengths, weaknesses, recommendation,
          candidateName, interviewType: interview.type,
        }),
      })
      const data = await res.json()
      setAiSummary(data.report ?? '')
    } catch { /* noop */ }
    finally { setGenerating(false) }
  }

  async function exportPdf() {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(18); doc.text('Informe de Entrevista', 20, 20)
    doc.setFontSize(12)
    doc.text(`Candidato: ${candidateName}`, 20, 35)
    doc.text(`Tipo: ${interview.type}`, 20, 45)
    doc.text(`Fecha: ${formatDate(interview.scheduledAt, 'long')}`, 20, 55)
    doc.text(`Calificación General: ${overallRating}/5`, 20, 65)
    doc.text(`Recomendación: ${recommendation}`, 20, 75)
    doc.setFontSize(11); doc.text('Puntuaciones:', 20, 90)
    Object.entries(scores).forEach(([k, v], i) => {
      doc.text(`  ${scoreLabels[k]}: ${v}/100`, 20, 100 + i * 10)
    })
    if (aiSummary) {
      doc.text('Resumen IA:', 20, 145)
      doc.text(doc.splitTextToSize(aiSummary, 170), 20, 155)
    }
    doc.save(`entrevista-${candidateName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  async function handleSubmit() {
    setSaving(true)
    await provider.createScorecard({
      interviewId: interview.id,
      overallRating,
      technicalSkills: scores.technicalSkills,
      communication: scores.communication,
      culturalFit: scores.culturalFit,
      strengths, weaknesses, recommendation,
      aiSummary: aiSummary || undefined,
    })
    const updated = await provider.updateInterview(interview.id, { status: 'Completada' })
    // Auto-advance application if recommendation is 'Avanzar'
    if (recommendation === 'Avanzar') {
      const appsResult = await provider.getApplicationsByCandidateId(interview.candidateId)
      const apps = appsResult.data ?? []
      const activeApp = apps.find(a => a.status === 'Entrevistas' || a.status === 'En Proceso')
      if (activeApp) {
        await provider.updateApplicationStatus(activeApp.id, 'Oferta Enviada')
        window.dispatchEvent(new CustomEvent('application:stage-changed'))
      }
    }
    setSaving(false)
    if (updated.data) onComplete(updated.data)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scorecard — {candidateName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          <div className="space-y-3">
            {Object.entries(scores).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">{scoreLabels[k]}</label>
                  <span className="text-xs font-bold text-foreground">{v}/100</span>
                </div>
                <input type="range" min={0} max={100} value={v}
                  onChange={e => setScores(s => ({...s, [k]: Number(e.target.value)}))}
                  className="w-full h-2 rounded-full appearance-none bg-muted accent-indigo-600 cursor-pointer" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Calificación general</label>
            <div className="flex gap-2">
              {([1,2,3,4,5] as const).map(n => (
                <button key={n} onClick={() => setOverallRating(n)}
                  className={cn('p-1 rounded transition-colors', n <= overallRating ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-300')}>
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Fortalezas</label>
              <textarea value={strengths} onChange={e => setStrengths(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"
                placeholder="Puntos destacados del candidato..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Áreas de mejora</label>
              <textarea value={weaknesses} onChange={e => setWeaknesses(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"
                placeholder="Aspectos a desarrollar..." />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Recomendación</label>
            <div className="flex gap-2">
              {(['Avanzar', 'Considerar', 'Rechazar'] as Recommendation[]).map(r => (
                <button key={r} onClick={() => setRecommendation(r)}
                  className={cn('flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors',
                    recommendation === r
                      ? r === 'Avanzar' ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : r === 'Rechazar' ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-border text-muted-foreground hover:border-muted-foreground')}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Resumen generado por IA</label>
              <Button type="button" variant="outline" size="sm" onClick={generateAiReport} disabled={generating}
                className="text-xs gap-1 h-6 px-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {generating ? 'Generando...' : '✨ Generar con IA'}
              </Button>
            </div>
            <textarea value={aiSummary} onChange={e => setAiSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"
              placeholder="El resumen se generará automáticamente o podés escribir uno..." />
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" className="gap-1.5" onClick={exportPdf}>
              <FileDown className="h-4 w-4" /> Exportar PDF
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="ml-auto gap-1.5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Completar entrevista
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Agenda: Interview card ───────────────────────────────────────────────────
function InterviewCard({
  interview, candidateMap, vacancyMap, onComplete, onCancel
}: {
  interview: Interview
  candidateMap: Map<string, Candidate>
  vacancyMap:   Map<string, Vacancy>
  onComplete: (i: Interview) => void
  onCancel:   (id: string)   => void | Promise<void>
}) {
  const [showScorecard, setShowScorecard] = React.useState(false)
  const candidate = candidateMap.get(interview.candidateId)
  const vacancy   = vacancyMap.get(interview.vacancyId)
  const StatusIcon = STATUS_CONFIG[interview.status].icon
  const d = new Date(interview.scheduledAt)
  const isUpcoming = d.getTime() - Date.now() < 48 * 3600000 && interview.status === 'Programada' && d > new Date()
  const tc = TYPE_COLORS[interview.type]

  return (
    <>
      <div
        className={cn('rounded-xl border p-4 transition-shadow hover:shadow-md', isUpcoming && 'border-amber-300')}
        style={{ background: 'var(--surface)', borderColor: isUpcoming ? undefined : 'var(--border)' }}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: candidate ? avatarGradient(candidate.fullName) : 'var(--surface2)' }}
          >
            {candidate ? initials(candidate.fullName) : '??'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{candidate?.fullName ?? 'Candidato'}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{vacancy?.title ?? 'Sin vacante'}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium border"
                  style={{ background: tc.bg, color: tc.text, borderColor: tc.border }}>
                  {interview.type}
                </span>
                <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: STATUS_CONFIG[interview.status].bg, color: STATUS_CONFIG[interview.status].text }}>
                  <StatusIcon className="h-2.5 w-2.5" />{interview.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs flex-wrap" style={{ color: 'var(--muted)' }}>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                &nbsp;{d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
              </span>
              {interview.interviewerName && (
                <span className="flex items-center gap-1"><User2 className="h-3 w-3" />{interview.interviewerName}</span>
              )}
              <span className="flex items-center gap-1"><Video className="h-3 w-3" />{PLATFORM_LABELS[interview.meetingPlatform]}</span>
            </div>

            {interview.status === 'Programada' && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setShowScorecard(true)}>
                  <CheckCircle2 className="h-3 w-3" /> Completar
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onCancel(interview.id)}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {candidate && (
        <ScorecardModal
          open={showScorecard}
          onClose={() => setShowScorecard(false)}
          interview={interview}
          candidateName={candidate.fullName}
          onComplete={onComplete}
        />
      )}
    </>
  )
}

// ─── Por Vacante: Round chip ──────────────────────────────────────────────────
function RoundChip({
  interview, round, candidate, onComplete, onCancel,
}: {
  interview: Interview
  round: number
  candidate?: Candidate
  onComplete: (i: Interview) => void
  onCancel:   (id: string)   => void | Promise<void>
}) {
  const [expanded, setExpanded] = React.useState(false)
  const [showScorecard, setShowScorecard] = React.useState(false)
  const tc = TYPE_COLORS[interview.type]
  const sc = STATUS_CONFIG[interview.status]
  const StatusIcon = sc.icon
  const d = new Date(interview.scheduledAt)
  const dateStr = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

  return (
    <>
      <div className="flex flex-col items-center">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all hover:opacity-90"
          style={{
            background: expanded ? tc.bg : 'var(--surface2)',
            borderColor: expanded ? tc.border : 'var(--border)',
            minWidth: 80,
          }}
        >
          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            {ORDINALS[round] ?? `${round + 1}ª`}
          </span>
          <span className="text-[10px] font-semibold leading-tight text-center" style={{ color: expanded ? tc.text : 'var(--text)' }}>
            {interview.type === 'Con Hiring Manager' ? 'Hiring Mgr' : interview.type}
          </span>
          <span className="flex items-center gap-0.5 text-[9px] font-medium" style={{ color: sc.text }}>
            <StatusIcon className="h-2.5 w-2.5" />{sc.label}
          </span>
          <span className="text-[9px]" style={{ color: 'var(--muted)' }}>{dateStr}</span>
        </button>

        {/* Expanded actions */}
        {expanded && (
          <div className="mt-2 flex flex-col gap-1.5 w-full">
            {interview.status === 'Programada' && (
              <>
                <button
                  onClick={() => { setExpanded(false); setShowScorecard(true) }}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg text-center transition-colors"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Completar
                </button>
                <button
                  onClick={() => { setExpanded(false); onCancel(interview.id) }}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg text-center transition-colors border"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  Cancelar
                </button>
              </>
            )}
            {interview.status === 'Completada' && (
              <span className="text-[9px] text-center" style={{ color: 'var(--muted)' }}>
                {interview.interviewerName ? `Por: ${interview.interviewerName}` : 'Completada'}
              </span>
            )}
            {interview.notes && (
              <p className="text-[9px] italic text-center px-1 leading-snug" style={{ color: 'var(--muted)' }}>
                {interview.notes.slice(0, 60)}{interview.notes.length > 60 ? '…' : ''}
              </p>
            )}
          </div>
        )}
      </div>

      {candidate && (
        <ScorecardModal
          open={showScorecard}
          onClose={() => setShowScorecard(false)}
          interview={interview}
          candidateName={candidate.fullName}
          onComplete={onComplete}
        />
      )}
    </>
  )
}

// ─── Por Vacante: Candidate row ───────────────────────────────────────────────
function CandidateRoundRow({
  candidateId, rounds, candidateMap, onComplete, onCancel, onScheduleNext,
}: {
  candidateId: string
  rounds: Interview[]
  candidateMap: Map<string, Candidate>
  onComplete: (i: Interview) => void
  onCancel:   (id: string)   => void | Promise<void>
  onScheduleNext: (candidateId: string, vacancyId: string) => void
}) {
  const candidate = candidateMap.get(candidateId)
  const lastRound = rounds[rounds.length - 1]
  const canAddNext = lastRound?.status === 'Completada'

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      {/* Candidate avatar + name */}
      <div className="flex items-center gap-2 shrink-0" style={{ minWidth: 140 }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: candidate ? avatarGradient(candidate.fullName) : 'var(--surface2)' }}
        >
          {candidate ? initials(candidate.fullName) : '??'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
            {candidate?.fullName ?? 'Candidato'}
          </p>
          {candidate?.email && (
            <p className="text-[10px] truncate" style={{ color: 'var(--muted)' }}>{candidate.email}</p>
          )}
        </div>
      </div>

      {/* Rounds timeline */}
      <div className="flex-1 flex items-start gap-2 overflow-x-auto pb-1">
        {rounds.map((iv, idx) => (
          <React.Fragment key={iv.id}>
            <RoundChip
              interview={iv}
              round={idx}
              candidate={candidate}
              onComplete={onComplete}
              onCancel={onCancel}
            />
            {idx < rounds.length - 1 && (
              <ArrowRight className="h-4 w-4 shrink-0 mt-4" style={{ color: 'var(--muted)' }} />
            )}
          </React.Fragment>
        ))}

        {/* Next round button */}
        {canAddNext && (
          <>
            <ArrowRight className="h-4 w-4 shrink-0 mt-4" style={{ color: 'var(--muted)' }} />
            <button
              onClick={() => onScheduleNext(candidateId, lastRound.vacancyId)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 border-dashed transition-all hover:opacity-80 shrink-0"
              style={{ borderColor: 'var(--accent)', minWidth: 80 }}
            >
              <Plus className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
              <span className="text-[9px] font-semibold" style={{ color: 'var(--accent)' }}>Nueva ronda</span>
            </button>
          </>
        )}

        {/* Schedule first interview if none */}
        {rounds.length === 0 && (
          <button
            onClick={() => onScheduleNext(candidateId, '')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-dashed text-xs font-medium transition-all hover:opacity-80"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            <Plus className="h-3 w-3" /> Agendar 1ª entrevista
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Por Vacante: Vacancy group ───────────────────────────────────────────────
function VacancyInterviewGroup({
  vacancy, candidateGroups, candidateMap, onComplete, onCancel, onScheduleNext,
}: {
  vacancy?: Vacancy
  candidateGroups: Map<string, Interview[]>
  candidateMap: Map<string, Candidate>
  onComplete: (i: Interview) => void
  onCancel:   (id: string)   => void | Promise<void>
  onScheduleNext: (candidateId: string, vacancyId: string) => void
}) {
  const totalInterviews = Array.from(candidateGroups.values()).reduce((s, a) => s + a.length, 0)
  const pending = Array.from(candidateGroups.values()).flat().filter(i => i.status === 'Programada').length

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Vacancy header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(var(--accent-rgb),0.15)' }}>
            <Users className="h-4 w-4" style={{ color: 'var(--accent-2)' }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{vacancy?.title ?? 'Sin vacante'}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {candidateGroups.size} candidato{candidateGroups.size !== 1 ? 's' : ''}
              {' · '}{totalInterviews} entrevista{totalInterviews !== 1 ? 's' : ''}
              {pending > 0 && ` · `}
              {pending > 0 && <span style={{ color: '#fbbf24' }}>{pending} pendiente{pending !== 1 ? 's' : ''}</span>}
            </p>
          </div>
        </div>
        {vacancy?.department && (
          <span className="text-[10px] px-2 py-0.5 rounded-full hidden sm:inline"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent-2)' }}>
            {vacancy.department}
          </span>
        )}
      </div>

      {/* Candidate rows */}
      <div className="px-4">
        {Array.from(candidateGroups.entries()).map(([candId, rounds]) => (
          <CandidateRoundRow
            key={candId}
            candidateId={candId}
            rounds={rounds}
            candidateMap={candidateMap}
            onComplete={onComplete}
            onCancel={onCancel}
            onScheduleNext={onScheduleNext}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InterviewsPage() {
  const [interviews, setInterviews]   = React.useState<Interview[]>([])
  const [candidates, setCandidates]   = React.useState<Candidate[]>([])
  const [vacancies, setVacancies]     = React.useState<Vacancy[]>([])
  const [loading, setLoading]         = React.useState(true)
  const [showScheduler, setShowScheduler] = React.useState(false)
  const [schedulePrefill, setSchedulePrefill] = React.useState<{ candidateId?: string; vacancyId?: string } | undefined>()
  const [activeTab, setActiveTab]     = React.useState('proximas')
  const [viewMode, setViewMode]       = React.useState<'agenda' | 'vacancy'>('agenda')

  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  const load = React.useCallback(async () => {
    const tid = user?.tenantId ?? ''
    const [iRes, cRes, vRes] = await Promise.all([
      provider.getInterviews(undefined, tid),
      provider.getCandidates(tid),
      provider.getVacancies(tid),
    ])
    setInterviews(iRes.data ?? [])
    setCandidates(cRes.data ?? [])
    setVacancies(vRes.data ?? [])
    setLoading(false)
  }, [provider, user])

  React.useEffect(() => { load() }, [load])

  const candidateMap = React.useMemo(() => new Map(candidates.map(c => [c.id, c])), [candidates])
  const vacancyMap   = React.useMemo(() => new Map(vacancies.map(v => [v.id, v])), [vacancies])

  // ── Agenda grouping ──
  const now   = new Date()
  const in48h = new Date(now.getTime() + 48 * 3600000)

  const tabs = React.useMemo(() => ({
    proximas:   interviews.filter(i => i.status === 'Programada' && new Date(i.scheduledAt) >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    semana:     interviews.filter(i => {
      const d = new Date(i.scheduledAt); const end = new Date(now); end.setDate(now.getDate() + 7)
      return d >= now && d <= end
    }),
    completadas: interviews.filter(i => i.status === 'Completada'),
    canceladas:  interviews.filter(i => i.status === 'Cancelada'),
  }), [interviews, now])

  const urgentes = tabs.proximas.filter(i => new Date(i.scheduledAt) <= in48h)

  // ── Por Vacante grouping ──
  const vacancyGroups = React.useMemo(() => {
    const groups = new Map<string, Map<string, Interview[]>>()
    for (const iv of interviews) {
      const vid = iv.vacancyId || '__none__'
      if (!groups.has(vid)) groups.set(vid, new Map())
      const candMap = groups.get(vid)!
      if (!candMap.has(iv.candidateId)) candMap.set(iv.candidateId, [])
      candMap.get(iv.candidateId)!.push(iv)
    }
    // Sort each candidate's rounds chronologically
    groups.forEach(candMap => candMap.forEach((rounds, cid) =>
      candMap.set(cid, rounds.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()))
    ))
    return groups
  }, [interviews])

  // ── Actions ──
  async function handleCancel(id: string) {
    if (!confirm('¿Cancelar esta entrevista?')) return
    await provider.updateInterview(id, { status: 'Cancelada' })
    setInterviews(prev => prev.map(i => i.id === id ? { ...i, status: 'Cancelada' } : i))
  }

  function handleComplete(updated: Interview) {
    setInterviews(prev => prev.map(i => i.id === updated.id ? updated : i))
  }

  function openScheduleNext(candidateId: string, vacancyId: string) {
    setSchedulePrefill({ candidateId, vacancyId: vacancyId || undefined })
    setShowScheduler(true)
  }

  const tabList = [
    { id: 'proximas',   label: 'Próximas',    count: tabs.proximas.length },
    { id: 'semana',     label: 'Esta semana', count: tabs.semana.length },
    { id: 'completadas',label: 'Completadas', count: tabs.completadas.length },
    { id: 'canceladas', label: 'Canceladas',  count: tabs.canceladas.length },
  ]
  const activeList = tabs[activeTab as keyof typeof tabs] ?? []

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      {[0,1,2].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Entrevistas</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {tabs.proximas.length} programada{tabs.proximas.length !== 1 ? 's' : ''} · {interviews.length} en total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setViewMode('agenda')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: viewMode === 'agenda' ? 'var(--accent)' : 'var(--surface)',
                color: viewMode === 'agenda' ? '#fff' : 'var(--muted)',
              }}
            >
              <LayoutList className="h-3.5 w-3.5" /> Agenda
            </button>
            <button
              onClick={() => setViewMode('vacancy')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: viewMode === 'vacancy' ? 'var(--accent)' : 'var(--surface)',
                color: viewMode === 'vacancy' ? '#fff' : 'var(--muted)',
              }}
            >
              <Layers className="h-3.5 w-3.5" /> Por Vacante
            </button>
          </div>

          <Button onClick={() => { setSchedulePrefill(undefined); setShowScheduler(true) }} className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Agendar entrevista</span>
            <span className="sm:hidden">Agendar</span>
          </Button>
        </div>
      </div>

      {/* Urgent banner */}
      {urgentes.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <AlertCircle className="h-5 w-5 shrink-0" style={{ color: '#fbbf24' }} />
          <p className="text-sm font-medium" style={{ color: '#fbbf24' }}>
            ⏰ {urgentes.length} entrevista{urgentes.length > 1 ? 's' : ''} en las próximas 48 hs
          </p>
        </div>
      )}

      {/* ── AGENDA VIEW ── */}
      {viewMode === 'agenda' && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
            {tabList.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn('px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap')}
                style={{
                  borderBottomColor: activeTab === t.id ? 'var(--accent)' : 'transparent',
                  color: activeTab === t.id ? 'var(--accent-2)' : 'var(--muted)',
                }}
              >
                {t.label}
                {t.count > 0 && (
                  <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: activeTab === t.id ? 'rgba(var(--accent-rgb),0.15)' : 'var(--surface2)',
                      color: activeTab === t.id ? 'var(--accent-2)' : 'var(--muted)',
                    }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeList.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--surface2)' }}>
                <Calendar className="h-7 w-7" style={{ color: 'var(--muted)' }} />
              </div>
              <p className="font-medium" style={{ color: 'var(--text)' }}>Sin entrevistas</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>No hay entrevistas en esta sección.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeList.map(i => (
                <InterviewCard
                  key={i.id}
                  interview={i}
                  candidateMap={candidateMap}
                  vacancyMap={vacancyMap}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── POR VACANTE VIEW ── */}
      {viewMode === 'vacancy' && (
        <>
          {vacancyGroups.size === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--surface2)' }}>
                <Layers className="h-7 w-7" style={{ color: 'var(--muted)' }} />
              </div>
              <p className="font-medium" style={{ color: 'var(--text)' }}>Sin entrevistas registradas</p>
              <p className="text-sm mt-1 mb-4" style={{ color: 'var(--muted)' }}>
                Agendá entrevistas y aparecerán agrupadas por vacante.
              </p>
              <Button onClick={() => { setSchedulePrefill(undefined); setShowScheduler(true) }} className="gap-1.5">
                <Plus className="h-4 w-4" /> Agendar primera entrevista
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from(vacancyGroups.entries()).map(([vacancyId, candMap]) => (
                <VacancyInterviewGroup
                  key={vacancyId}
                  vacancy={vacancyMap.get(vacancyId)}
                  candidateGroups={candMap}
                  candidateMap={candidateMap}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                  onScheduleNext={openScheduleNext}
                />
              ))}
            </div>
          )}
        </>
      )}

      <SchedulerModal
        open={showScheduler}
        onClose={() => { setShowScheduler(false); setSchedulePrefill(undefined) }}
        candidates={candidates}
        vacancies={vacancies}
        prefill={schedulePrefill}
        onSaved={i => setInterviews(prev => [i, ...prev])}
      />
    </div>
  )
}
