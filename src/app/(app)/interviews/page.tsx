'use client'

import * as React from 'react'
import {
  Plus, Calendar, Clock, User2, Video, Users,
  CheckCircle2, XCircle, AlertCircle,
  Star, Loader2, FileDown, Sparkles, LayoutList, Layers, ArrowRight, ChevronDown
} from 'lucide-react'
import { cn, formatDate, generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DraggableModal } from '@/components/ui/draggable-modal'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import { useLanguage } from '@/lib/context/language-context'
import type {
  Interview, Candidate, Vacancy, InterviewType, InterviewStatus,
  MeetingPlatform, Scorecard, Recommendation, Application, VacancyStatus, CandidateDisposition, Client
} from '@/types'

type DecisionAction = 'avanzar' | 'rechazar' | 'a_considerar' | 'descartar_cv'

const DECISION_CONFIG: Record<DecisionAction, { label: string; bg: string; color: string; border: string }> = {
  avanzar:      { label: 'Avanzar',         bg: 'rgba(52,211,153,0.15)',  color: '#34d399', border: 'rgba(52,211,153,0.3)' },
  rechazar:     { label: 'Rechazar',         bg: 'rgba(248,113,113,0.15)', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
  a_considerar: { label: 'A considerar',     bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
  descartar_cv: { label: 'Descartar CV',     bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
}

const TYPE_COLORS: Record<InterviewType, { bg: string; text: string; border: string }> = {
  'RRHH':              { bg: 'rgba(167,114,250,0.15)', text: '#a78bfa', border: 'rgba(167,114,250,0.4)' },
  'Técnica':           { bg: 'rgba(96,165,250,0.15)',  text: '#60a5fa', border: 'rgba(96,165,250,0.4)' },
  'Con Hiring Manager':{ bg: 'rgba(251,146,60,0.15)',  text: '#fb923c', border: 'rgba(251,146,60,0.4)' },
  'Cultural':          { bg: 'rgba(52,211,153,0.15)',  text: '#34d399', border: 'rgba(52,211,153,0.4)' },
}

const STATUS_CONFIG: Record<InterviewStatus, { icon: React.ElementType; bg: string; text: string }> = {
  Programada: { icon: Clock,        bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24' },
  Completada: { icon: CheckCircle2, bg: 'rgba(52,211,153,0.15)',  text: '#34d399' },
  Cancelada:  { icon: XCircle,      bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
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
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [form, setForm] = React.useState({
    candidateId: prefill?.candidateId ?? '',
    vacancyId:   prefill?.vacancyId   ?? '',
    type: 'RRHH' as InterviewType,
    interviewerName: '',
    date: '',
    time: '10:00',
    platform: 'google_meet' as MeetingPlatform,
    meetingLink: '',
    notes: '',
  })
  const [saving, setSaving] = React.useState(false)

  // Full reset every time the modal opens so old data never bleeds through
  React.useEffect(() => {
    if (open) {
      setForm({
        candidateId: prefill?.candidateId ?? '',
        vacancyId:   prefill?.vacancyId   ?? '',
        type: 'RRHH' as InterviewType,
        interviewerName: '',
        date: '',
        time: '10:00',
        platform: 'google_meet' as MeetingPlatform,
        meetingLink: '',
        notes: '',
      })
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

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
      meetingLink:     form.meetingLink || undefined,
      notes:           form.notes || undefined,
    })
    setSaving(false)
    if (result.data) {
      // Promote application status to Entrevistas in DB
      const vacancyId = form.vacancyId || (vacancies[0]?.id ?? '')
      if (form.candidateId && vacancyId) {
        const appRes = await provider.getApplicationsByCandidateId(form.candidateId)
        const app = appRes.data?.find(a => a.vacancyId === vacancyId && a.status === 'Nuevas Vacantes')
        if (app) await provider.updateApplicationStatus(app.id, 'Entrevistas')
      }
      window.dispatchEvent(new CustomEvent('interview:scheduled'))
      onSaved(result.data)
      onClose()
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring'
  const labelCls = 'text-xs font-medium text-muted-foreground mb-1 block'

  return (
    <DraggableModal open={open} onClose={onClose} title={t.pipeline.scheduleInterview} maxWidth="32rem">
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div>
            <label className={labelCls}>{t.interviews.form.candidate} *</label>
            <select required value={form.candidateId} onChange={e => setForm(f => ({...f, candidateId: e.target.value}))} className={inputCls}>
              <option value="">Seleccioná un candidato</option>
              {candidates.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t.pipeline.interviewForm.vacancy}</label>
            <select value={form.vacancyId} onChange={e => setForm(f => ({...f, vacancyId: e.target.value}))} className={inputCls}>
              <option value="">Sin vacante asignada</option>
              {vacancies.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.pipeline.interviewForm.type}</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value as InterviewType}))} className={inputCls}>
                <option>RRHH</option><option>Técnica</option><option>Con Hiring Manager</option><option>Cultural</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{t.pipeline.interviewForm.platform}</label>
              <select value={form.platform} onChange={e => setForm(f => ({...f, platform: e.target.value as MeetingPlatform}))} className={inputCls}>
                <option value="google_meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="teams">Teams</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
          </div>
          {form.platform !== 'presencial' && (
            <div>
              <label className={labelCls}>{t.pipeline.interviewForm.meetingLink}</label>
              <input type="url" value={form.meetingLink} onChange={e => setForm(f => ({...f, meetingLink: e.target.value}))} className={inputCls} placeholder="https://meet.google.com/..." />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.pipeline.interviewForm.date} *</label>
              <input required type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className={inputCls} min={new Date().toISOString().slice(0,10)} />
            </div>
            <div>
              <label className={labelCls}>{t.pipeline.interviewForm.time}</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t.pipeline.interviewForm.interviewer}</label>
            <input value={form.interviewerName} onChange={e => setForm(f => ({...f, interviewerName: e.target.value}))} className={inputCls} placeholder="Nombre del entrevistador" />
          </div>
          <div>
            <label className={labelCls}>{t.pipeline.interviewForm.notes}</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} className={cn(inputCls, 'h-16 resize-none')} placeholder="Temas a cubrir, contexto del candidato..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>{t.common.cancel}</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} {t.interviews.schedule}
            </Button>
          </div>
        </form>
    </DraggableModal>
  )
}

// ─── Scorecard Modal ──────────────────────────────────────────────────────────
function ScorecardModal({
  open, onClose, interview, candidateName, vacancyTitle, candidate, onComplete, readOnly, isCompleted,
}: {
  open: boolean
  onClose: () => void
  interview: Interview
  candidateName: string
  vacancyTitle?: string
  candidate?: Candidate
  onComplete: (i: Interview) => void
  readOnly?: boolean
  isCompleted?: boolean
}) {
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const sc = interview.scorecard
  const [scores, setScores] = React.useState({ technicalSkills: sc?.technicalSkills ?? 70, communication: sc?.communication ?? 70, culturalFit: sc?.culturalFit ?? 70, motivation: 70 })
  const [overallRating, setOverallRating] = React.useState<1|2|3|4|5>((sc?.overallRating ?? 3) as 1|2|3|4|5)
  const [strengths, setStrengths] = React.useState(sc?.strengths ?? '')
  const [weaknesses, setWeaknesses] = React.useState(sc?.weaknesses ?? '')
  const [recommendation, setRecommendation] = React.useState<Recommendation>(sc?.recommendation ?? 'Considerar')
  const [aiSummary, setAiSummary] = React.useState(sc?.aiSummary ?? '')
  const [generating, setGenerating] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Re-sync state when opening modal with potentially updated scorecard
  React.useEffect(() => {
    if (open) {
      const s = interview.scorecard
      setScores({ technicalSkills: s?.technicalSkills ?? 70, communication: s?.communication ?? 70, culturalFit: s?.culturalFit ?? 70, motivation: 70 })
      setOverallRating((s?.overallRating ?? 3) as 1|2|3|4|5)
      setStrengths(s?.strengths ?? '')
      setWeaknesses(s?.weaknesses ?? '')
      setRecommendation(s?.recommendation ?? 'Considerar')
      setAiSummary(s?.aiSummary ?? '')
    }
  }, [open, interview.scorecard])

  const scoreLabels: Record<string, string> = {
    technicalSkills: 'Habilidades Técnicas',
    communication: 'Comunicación',
    culturalFit: 'Fit Cultural',
    motivation: 'Motivación',
  }

  async function generateAiReport() {
    setGenerating(true)
    try {
      const aiHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
      try {
        const raw = localStorage.getItem('ct_ai_config')
        if (raw) {
          const cfg = JSON.parse(raw) as { apiKey?: string }
          if (cfg.apiKey) aiHeaders['x-ai-api-key'] = cfg.apiKey
        }
      } catch { /* noop */ }
      const res = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: aiHeaders,
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

    // Load logo with transparent background
    let logoDataUrl = ''
    try {
      const res = await fetch('/logo-transparent.png')
      const blob = await res.blob()
      logoDataUrl = await new Promise<string>(resolve => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
    } catch { /* logo optional */ }

    const W = 210, H = 297
    const ML = 16, MR = 16           // margins left/right
    const CW = W - ML - MR           // content width
    const LH_BODY = 4.8              // body line height mm

    // ── Palette ──────────────────────────────────────────────────────────────
    const BG       = [11, 22, 35]    as [number,number,number]
    const SURFACE  = [20, 36, 54]    as [number,number,number]
    const SURFACE2 = [28, 48, 70]    as [number,number,number]
    const TEAL     = [20, 184, 166]  as [number,number,number]
    const PURPLE   = [139, 92, 246]  as [number,number,number]
    const AMBER    = [245, 158, 11]  as [number,number,number]
    const GREEN    = [16, 185, 129]  as [number,number,number]
    const RED      = [239, 68, 68]   as [number,number,number]
    const YELLOW   = [251, 191, 36]  as [number,number,number]
    const TEXT     = [232, 240, 248] as [number,number,number]
    const MUTED    = [140, 158, 178] as [number,number,number]
    const BORDER   = [36, 58, 84]    as [number,number,number]
    const WHITE    = [255, 255, 255] as [number,number,number]

    // ── Shorthand setters ─────────────────────────────────────────────────────
    const sc  = (c: [number,number,number]) => doc.setTextColor(...c)
    const sf  = (c: [number,number,number]) => doc.setFillColor(...c)
    const sd  = (c: [number,number,number]) => doc.setDrawColor(...c)
    const setBg = () => { sf(BG); doc.rect(0, 0, W, H, 'F') }

    // ── Rounded rect helper ───────────────────────────────────────────────────
    const rr = (x: number, y: number, w: number, h: number, r: number,
                fill?: [number,number,number], stroke?: [number,number,number], lw = 0.3) => {
      if (fill)   sf(fill)
      if (stroke) { sd(stroke); doc.setLineWidth(lw) }
      doc.roundedRect(x, y, w, h, r, r, fill && stroke ? 'FD' : fill ? 'F' : 'S')
    }

    // ── Draw logo ─────────────────────────────────────────────────────────────
    const drawLogo = (x: number, y: number, size: number) => {
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', x, y, size, size)
      } else {
        sf(PURPLE); doc.roundedRect(x, y, size, size, size * 0.28, size * 0.28, 'F')
        sf(TEAL);   doc.roundedRect(x, y + size * 0.5, size, size * 0.55, 2, size * 0.28, 'F')
        sc(WHITE); doc.setFontSize(size * 0.38); doc.setFont('helvetica', 'bold')
        doc.text('CT', x + size / 2, y + size * 0.63, { align: 'center' })
      }
    }

    // ── Bounded text block: renders text inside [x,y,maxW] and returns next Y ──
    const textBlock = (text: string, x: number, y: number, maxW: number,
                       maxLines: number, fontSize = 8.5, color = TEXT): number => {
      doc.setFontSize(fontSize); doc.setFont('helvetica', 'normal'); sc(color)
      const lines = (doc.splitTextToSize(text, maxW) as string[]).slice(0, maxLines)
      doc.text(lines, x, y)
      return y + lines.length * LH_BODY
    }

    // ── Draw a score bar ──────────────────────────────────────────────────────
    const scoreBar = (label: string, value: number, x: number, y: number, bw: number) => {
      doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); sc(MUTED)
      doc.text(label, x, y)
      doc.text(`${value}%`, x + bw, y, { align: 'right' })
      sf(SURFACE2); doc.roundedRect(x, y + 1.5, bw, 3, 1.5, 1.5, 'F')
      sf(TEAL);     doc.roundedRect(x, y + 1.5, Math.max(2, (value / 100) * bw), 3, 1.5, 1.5, 'F')
    }

    // ── Rating dots ────────────────────────────────────────────────────────────
    const ratingDots = (rating: number, x: number, cy: number, r = 3) => {
      for (let i = 0; i < 5; i++) {
        if (i < rating) { sf(AMBER) } else { sf(SURFACE2) }
        doc.circle(x + i * (r * 2 + 2), cy, r, 'F')
      }
    }

    // ── Page footer ───────────────────────────────────────────────────────────
    const footer = (page: number, total: number) => {
      sf(BORDER); doc.rect(ML, H - 14, CW, 0.3, 'F')
      sc(MUTED); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
      doc.text(`ConectAr Talento  ·  Documento confidencial`, ML, H - 9)
      doc.text(`${page} / ${total}`, W - MR, H - 9, { align: 'right' })
    }

    // ── Derived values ────────────────────────────────────────────────────────
    const dateStr   = new Date(interview.scheduledAt).toLocaleDateString('es-AR',
                      { day: 'numeric', month: 'long', year: 'numeric' })
    const monthYear = new Date(interview.scheduledAt).toLocaleDateString('es-AR',
                      { month: 'long', year: 'numeric' })
    const recColor  = recommendation === 'Avanzar' ? GREEN
                    : recommendation === 'Rechazar' ? RED : YELLOW
    const recLabel  = recommendation === 'Avanzar' ? 'AVANZAR EN EL PROCESO'
                    : recommendation === 'Rechazar' ? 'NO AVANZAR / RECHAZAR'
                    : 'CONSIDERAR CON RESERVAS'

    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const TOTAL = 2

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER
    // ══════════════════════════════════════════════════════════════════════════
    setBg()

    // Top accent bar
    sf(PURPLE); doc.rect(0, 0, W / 2, 2, 'F')
    sf(TEAL);   doc.rect(W / 2, 0, W / 2, 2, 'F')

    // Logo + brand header
    drawLogo(ML, 10, 30)
    sc(TEXT); doc.setFontSize(14); doc.setFont('helvetica', 'bold')
    doc.text('ConectAr', ML + 34, 22)
    sc(MUTED); doc.setFontSize(8); doc.setFont('helvetica', 'normal')
    doc.text('T A L E N T O', ML + 34, 29)
    sc(MUTED); doc.setFontSize(7.5)
    doc.text('CONFIDENCIAL', W - MR, 22, { align: 'right' })

    // Divider
    sf(BORDER); doc.rect(ML, 46, CW, 0.4, 'F')

    // Hero title
    sc(TEAL); doc.setFontSize(8); doc.setFont('helvetica', 'bold')
    doc.text('INFORME DE EVALUACIÓN', ML, 68)
    sc(TEXT); doc.setFontSize(36); doc.setFont('helvetica', 'bold')
    doc.text('ENTREVISTA', ML, 84)
    sc([160, 175, 195] as [number,number,number]); doc.setFontSize(20); doc.setFont('helvetica', 'normal')
    doc.text('PROFESIONAL', ML, 96)

    // Candidate card
    const cCardY = 110, cCardH = 34
    rr(ML, cCardY, CW, cCardH, 4, SURFACE)
    sf(TEAL); doc.rect(ML, cCardY, 3, cCardH, 'F')
    sc(MUTED); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal')
    doc.text('CANDIDATO / A', ML + 8, cCardY + 8)
    sc(TEXT); doc.setFontSize(20); doc.setFont('helvetica', 'bold')
    doc.text(candidateName, ML + 8, cCardY + 20)
    sc(MUTED); doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.text(vacancyTitle ? `Proceso: ${vacancyTitle}` : 'Proceso de Selección', ML + 8, cCardY + 29)

    // Info pills
    const pillItems = [interview.type, dateStr, PLATFORM_LABELS[interview.meetingPlatform]]
    let px = ML
    const pillY = cCardY + cCardH + 8
    pillItems.forEach(lbl => {
      doc.setFontSize(7.5); doc.setFont('helvetica', 'normal')
      const tw = (doc.getStringUnitWidth(lbl) * 7.5) / doc.internal.scaleFactor + 8
      rr(px, pillY, tw, 7, 2, SURFACE2)
      sc(MUTED); doc.text(lbl, px + tw / 2, pillY + 5, { align: 'center' })
      px += tw + 3
    })

    // Rating + Recommendation row
    const rRowY = pillY + 16
    const halfW = (CW - 4) / 2
    // Rating card
    rr(ML, rRowY, halfW, 28, 3, SURFACE)
    sc(MUTED); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.text('CALIFICACIÓN GENERAL', ML + halfW / 2, rRowY + 6, { align: 'center' })
    sc(AMBER); doc.setFontSize(22); doc.setFont('helvetica', 'bold')
    doc.text(`${overallRating}`, ML + 12, rRowY + 21)
    sc(MUTED); doc.setFontSize(11); doc.setFont('helvetica', 'normal')
    doc.text('/ 5', ML + 21, rRowY + 21)
    ratingDots(overallRating, ML + 38, rRowY + 18, 2.5)
    // Rec card
    const rx = ML + halfW + 4
    rr(rx, rRowY, halfW, 28, 3, recColor.map(v => Math.round(v * 0.13)) as [number,number,number], recColor, 0.4)
    sc(MUTED); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.text('RECOMENDACIÓN', rx + halfW / 2, rRowY + 6, { align: 'center' })
    sc(recColor); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold')
    const rLines = doc.splitTextToSize(recLabel, halfW - 8) as string[]
    doc.text(rLines, rx + halfW / 2, rRowY + 16, { align: 'center' })

    // Interviewer row
    if (interview.interviewerName) {
      const irY = rRowY + 36
      sc(MUTED); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal')
      doc.text('Entrevistador/a:', ML, irY)
      sc(TEXT); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold')
      doc.text(interview.interviewerName, ML + 28, irY)
    }

    // Bottom brand footer
    sf(BORDER); doc.rect(ML, H - 22, CW, 0.3, 'F')
    sc(MUTED); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal')
    const cap = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)
    doc.text(`${cap}  ·  Confidencial`, W / 2, H - 16, { align: 'center' })
    footer(1, TOTAL)

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 2 — INFORME COMPLETO
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage(); setBg()
    sf(PURPLE); doc.rect(0, 0, W / 2, 2, 'F')
    sf(TEAL);   doc.rect(W / 2, 0, W / 2, 2, 'F')

    // Mini header
    drawLogo(ML, 6, 14)
    sc(TEXT); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold')
    doc.text('ConectAr Talento', ML + 17, 11)
    sc(MUTED); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.text(`Informe de entrevista — ${candidateName}`, ML + 17, 16)
    sf(BORDER); doc.rect(ML, 23, CW, 0.3, 'F')

    let y = 28

    // ── Section: Puntuaciones ─────────────────────────────────────────────────
    sc(TEXT); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
    doc.text('PUNTUACIONES', ML, y)
    sf(TEAL); doc.rect(ML, y + 1.5, 24, 0.7, 'F')
    y += 7

    // 2-column bar layout (more compact)
    const col1x = ML, col2x = ML + CW / 2 + 2
    const barW = CW / 2 - 4
    const barData = [
      { label: 'Habilidades Técnicas', value: scores.technicalSkills },
      { label: 'Comunicación',         value: scores.communication },
      { label: 'Fit Cultural',         value: scores.culturalFit },
      { label: 'Motivación',           value: scores.motivation },
    ]
    scoreBar(barData[0].label, barData[0].value, col1x, y, barW)
    scoreBar(barData[1].label, barData[1].value, col2x, y, barW)
    y += 10
    scoreBar(barData[2].label, barData[2].value, col1x, y, barW)
    scoreBar(barData[3].label, barData[3].value, col2x, y, barW)
    y += 14

    // ── Section: Resumen de la entrevista ─────────────────────────────────────
    if (aiSummary) {
      sc(TEXT); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
      doc.text('RESUMEN DE LA ENTREVISTA', ML, y)
      sf(TEAL); doc.rect(ML, y + 1.5, 42, 0.7, 'F')
      y += 7

      // Calculate how many lines fit with a max cap
      const MAX_SUMMARY_LINES = 14
      const summaryLines = (doc.splitTextToSize(aiSummary, CW - 10) as string[]).slice(0, MAX_SUMMARY_LINES)
      const summaryCardH = summaryLines.length * LH_BODY + 12
      rr(ML, y, CW, summaryCardH, 3, SURFACE)
      sc(TEXT); doc.setFontSize(8.2); doc.setFont('helvetica', 'normal')
      doc.text(summaryLines, ML + 5, y + 7)
      y += summaryCardH + 8
    }

    // ── Section: Fortalezas & Áreas de mejora (2-col if both) ────────────────
    const hasStre = strengths.trim().length > 0
    const hasWeak = weaknesses.trim().length > 0

    if (hasStre || hasWeak) {
      if (hasStre && hasWeak) {
        // Two columns
        const colW = (CW - 4) / 2
        const sLines = (doc.splitTextToSize(strengths,  colW - 10) as string[]).slice(0, 8)
        const wLines = (doc.splitTextToSize(weaknesses, colW - 10) as string[]).slice(0, 8)
        const blockH = Math.max(sLines.length, wLines.length) * LH_BODY + 20

        // Fortalezas
        sc(GREEN); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold')
        doc.text('FORTALEZAS', ML, y)
        sf(GREEN); doc.rect(ML, y + 1.5, 18, 0.7, 'F')
        y += 6
        rr(ML, y, colW, blockH, 3, SURFACE)
        sf(GREEN); doc.rect(ML, y, 2.5, blockH, 'F')
        sc(TEXT); doc.setFontSize(8); doc.setFont('helvetica', 'normal')
        doc.text(sLines, ML + 6, y + 7)

        // Áreas de mejora
        const wx = ML + colW + 4
        sc(AMBER); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold')
        doc.text('ÁREAS DE MEJORA', wx, y - 6)
        sf(AMBER); doc.rect(wx, y - 4.5, 22, 0.7, 'F')
        rr(wx, y, colW, blockH, 3, SURFACE)
        sf(AMBER); doc.rect(wx, y, 2.5, blockH, 'F')
        sc(TEXT); doc.setFontSize(8); doc.setFont('helvetica', 'normal')
        doc.text(wLines, wx + 6, y + 7)

        y += blockH + 8
      } else {
        // Single column
        const src = hasStre ? strengths : weaknesses
        const color = hasStre ? GREEN : AMBER
        const label = hasStre ? 'FORTALEZAS' : 'ÁREAS DE MEJORA'
        const srcLines = (doc.splitTextToSize(src, CW - 10) as string[]).slice(0, 10)
        const bH = srcLines.length * LH_BODY + 12

        sc(color); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold')
        doc.text(label, ML, y)
        sf(color); doc.rect(ML, y + 1.5, label.length * 1.2, 0.7, 'F')
        y += 6
        rr(ML, y, CW, bH, 3, SURFACE)
        sf(color); doc.rect(ML, y, 2.5, bH, 'F')
        sc(TEXT); doc.setFontSize(8); doc.setFont('helvetica', 'normal')
        doc.text(srcLines, ML + 6, y + 7)
        y += bH + 8
      }
    }

    // ── Section: Conclusión ────────────────────────────────────────────────────
    const concH = 22
    rr(ML, y, CW, concH, 4, recColor.map(v => Math.round(v * 0.12)) as [number,number,number], recColor, 0.4)
    sc(MUTED); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.text('CONCLUSIÓN Y RECOMENDACIÓN', ML + CW / 2, y + 6, { align: 'center' })
    sc(recColor); doc.setFontSize(11); doc.setFont('helvetica', 'bold')
    doc.text(recLabel, ML + CW / 2, y + 15, { align: 'center' })
    y += concH

    // Bottom logo watermark
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', W / 2 - 8, H - 30, 16, 16)
    }

    footer(2, TOTAL)

    doc.save(`informe-${candidateName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  async function handleSubmit() {
    setSaving(true)
    const scResult = await provider.createScorecard({
      interviewId: interview.id,
      overallRating,
      technicalSkills: scores.technicalSkills,
      communication: scores.communication,
      culturalFit: scores.culturalFit,
      strengths, weaknesses, recommendation,
      aiSummary: aiSummary || undefined,
    })
    if (!isCompleted) {
      const updated = await provider.updateInterview(interview.id, { status: 'Completada' })
      setSaving(false)
      if (updated.data) onComplete(updated.data)
    } else {
      setSaving(false)
      if (scResult.data) {
        onComplete({ ...interview, scorecard: scResult.data })
      }
    }
    onClose()
  }

  return (
    <DraggableModal open={open} onClose={onClose} title={`Scorecard — ${candidateName}`} maxWidth="42rem">
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
                  className="w-full h-2 rounded-full appearance-none bg-muted accent-indigo-600 cursor-pointer" disabled={readOnly} />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Calificación general</label>
            <div className="flex gap-2">
              {([1,2,3,4,5] as const).map(n => (
                <button key={n} onClick={() => !readOnly && setOverallRating(n)} disabled={readOnly}
                  className={cn('p-1 rounded transition-colors', n <= overallRating ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-300')}>
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Fortalezas</label>
              <textarea value={strengths} onChange={e => setStrengths(e.target.value)} readOnly={readOnly}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"
                placeholder="Puntos destacados del candidato..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Áreas de mejora</label>
              <textarea value={weaknesses} onChange={e => setWeaknesses(e.target.value)} readOnly={readOnly}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"
                placeholder="Aspectos a desarrollar..." />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Recomendación</label>
            <div className="flex gap-2">
              {(['Avanzar', 'Considerar', 'Rechazar'] as Recommendation[]).map(r => (
                <button key={r} onClick={() => !readOnly && setRecommendation(r)} disabled={readOnly}
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
              {!readOnly && (
                <Button type="button" variant="outline" size="sm" onClick={generateAiReport} disabled={generating}
                  className="text-xs gap-1 h-6 px-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                  {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  {generating ? 'Generando...' : '✨ Generar con IA'}
                </Button>
              )}
            </div>
            <textarea value={aiSummary} onChange={e => setAiSummary(e.target.value)} readOnly={readOnly}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"
              placeholder="El resumen se generará automáticamente o podés escribir uno..." />
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" className="gap-1.5" onClick={exportPdf}>
              <FileDown className="h-4 w-4" /> Exportar PDF
            </Button>
            {readOnly ? (
              <Button variant="outline" onClick={onClose} className="ml-auto">
                Cerrar
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={saving} className="ml-auto gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {isCompleted ? 'Guardar cambios' : 'Completar entrevista'}
              </Button>
            )}
          </div>
        </div>
    </DraggableModal>
  )
}

// ─── Interview Detail Modal ───────────────────────────────────────────────────
function InterviewDetailModal({
  open, onClose, interview, candidateName, vacancyTitle, onUpdated, onOpenScorecard,
}: {
  open: boolean
  onClose: () => void
  interview: Interview
  candidateName: string
  vacancyTitle: string
  onUpdated: (i: Interview) => void
  onOpenScorecard?: () => void
}) {
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [editing, setEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const d = new Date(interview.scheduledAt)
  const initialDate = d.toISOString().slice(0, 10)
  const initialTime = d.toTimeString().slice(0, 5)

  const [date, setDate] = React.useState(initialDate)
  const [time, setTime] = React.useState(initialTime)
  const [type, setType] = React.useState<InterviewType>(interview.type)
  const [platform, setPlatform] = React.useState<MeetingPlatform>(interview.meetingPlatform)
  const [meetingLink, setMeetingLink] = React.useState(interview.meetingLink ?? '')
  const [interviewerName, setInterviewerName] = React.useState(interview.interviewerName ?? '')
  const [notes, setNotes] = React.useState(interview.notes ?? '')

  // Re-sync when interview changes or modal opens
  React.useEffect(() => {
    if (open) {
      const dd = new Date(interview.scheduledAt)
      setDate(dd.toISOString().slice(0, 10))
      setTime(dd.toTimeString().slice(0, 5))
      setType(interview.type)
      setPlatform(interview.meetingPlatform)
      setMeetingLink(interview.meetingLink ?? '')
      setInterviewerName(interview.interviewerName ?? '')
      setNotes(interview.notes ?? '')
      setEditing(false)
    }
  }, [open, interview])

  async function handleSave() {
    setSaving(true)
    const result = await provider.updateInterview(interview.id, {
      scheduledAt: new Date(`${date}T${time}`).toISOString(),
      type,
      meetingPlatform: platform,
      meetingLink: meetingLink || undefined,
      interviewerName,
      notes: notes || undefined,
    })
    setSaving(false)
    if (result.data) {
      onUpdated(result.data)
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring'
  const labelCls = 'text-xs font-medium text-muted-foreground mb-1 block'

  const formattedDate = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const formattedTime = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <DraggableModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full">
          <span>{t.pipeline.editInterview}</span>
          <Button
            type="button"
            variant={editing ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setEditing(e => !e)}
          >
            {editing ? t.common.cancel : t.common.edit}
          </Button>
        </div>
      }
      maxWidth="32rem"
    >
        <div className="space-y-4 mt-2">
          {/* Read-only info block */}
          {!editing ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Candidato</span>
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>{candidateName}</p>
                </div>
                <div>
                  <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Vacante</span>
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>{vacancyTitle}</p>
                </div>
                <div>
                  <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Fecha y hora</span>
                  <p style={{ color: 'var(--text)' }}>{formattedDate} · {formattedTime} hs</p>
                </div>
                <div>
                  <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Tipo</span>
                  <p style={{ color: 'var(--text)' }}>{interview.type}</p>
                </div>
                <div>
                  <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Plataforma</span>
                  <p style={{ color: 'var(--text)' }}>{PLATFORM_LABELS[interview.meetingPlatform]}</p>
                </div>
                {interview.meetingLink && (
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Link de reunión</span>
                    <p>
                      <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="text-blue-500 underline underline-offset-2 break-all hover:opacity-80">
                        {interview.meetingLink}
                      </a>
                    </p>
                  </div>
                )}
                {interview.interviewerName && (
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Entrevistador</span>
                    <p style={{ color: 'var(--text)' }}>{interview.interviewerName}</p>
                  </div>
                )}
              </div>
              {interview.notes && (
                <div>
                  <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Notas</span>
                  <p className="mt-0.5 text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{interview.notes}</p>
                </div>
              )}
            </div>
          ) : (
            /* Edit form */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t.pipeline.interviewForm.date}</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t.pipeline.interviewForm.time}</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t.pipeline.interviewForm.type}</label>
                  <select value={type} onChange={e => setType(e.target.value as InterviewType)} className={inputCls}>
                    <option>RRHH</option>
                    <option>Técnica</option>
                    <option>Con Hiring Manager</option>
                    <option>Cultural</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t.pipeline.interviewForm.platform}</label>
                  <select value={platform} onChange={e => setPlatform(e.target.value as MeetingPlatform)} className={inputCls}>
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Teams</option>
                    <option value="presencial">Presencial</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>{t.pipeline.interviewForm.meetingLink}</label>
                <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className={inputCls} placeholder="https://meet.google.com/..." />
              </div>
              <div>
                <label className={labelCls}>{t.pipeline.interviewForm.interviewer}</label>
                <input type="text" value={interviewerName} onChange={e => setInterviewerName(e.target.value)} className={inputCls} placeholder="Nombre del entrevistador" />
              </div>
              <div>
                <label className={labelCls}>{t.pipeline.interviewForm.notes}</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className={cn(inputCls, 'h-20 resize-none')} placeholder="Notas sobre la entrevista..." />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            {onOpenScorecard && (
              <Button type="button" variant="outline" size="sm" onClick={onOpenScorecard} className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> {interview.status === 'Completada' ? 'Editar scorecard' : 'Completar'}
              </Button>
            )}
            {editing && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t.common.save}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>{t.common.close}</Button>
          </div>
        </div>
    </DraggableModal>
  )
}

// ─── Agenda: Interview card ───────────────────────────────────────────────────
function InterviewCard({
  interview, candidateMap, vacancyMap, onComplete, onCancel, onDecide, onReactivate, appStatus,
}: {
  interview: Interview
  candidateMap: Map<string, Candidate>
  vacancyMap:   Map<string, Vacancy>
  onComplete: (i: Interview) => void
  onCancel:   (id: string)   => void | Promise<void>
  onDecide: (candidateId: string, vacancyId: string, action: DecisionAction) => void
  onReactivate: (id: string) => void | Promise<void>
  appStatus?: string
  appDisposition?: CandidateDisposition | null
}) {
  const { t } = useLanguage()
  const [showScorecard, setShowScorecard] = React.useState(false)
  const [scorecardReadOnly, setScorecardReadOnly] = React.useState(false)
  const [showDetail, setShowDetail] = React.useState(false)
  const candidate = candidateMap.get(interview.candidateId)
  const vacancy   = vacancyMap.get(interview.vacancyId)
  const StatusIcon = STATUS_CONFIG[interview.status].icon
  const statusLabel = interview.status === 'Programada' ? t.interviews.statuses.scheduled
    : interview.status === 'Completada' ? t.interviews.statuses.completed
    : t.interviews.statuses.cancelled
  const d = new Date(interview.scheduledAt)
  const isUpcoming = d.getTime() - Date.now() < 48 * 3600000 && interview.status === 'Programada' && d > new Date()
  const tc = TYPE_COLORS[interview.type]

  return (
    <>
      <div
        className={cn('rounded-xl border p-4 transition-shadow hover:shadow-md cursor-pointer', isUpcoming && 'border-amber-300')}
        style={{ background: 'var(--surface)', borderColor: isUpcoming ? undefined : 'var(--border)' }}
        onClick={() => setShowDetail(true)}
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
                  <StatusIcon className="h-2.5 w-2.5" />{statusLabel}
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
              <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                <Button size="sm" className="h-7 text-xs gap-1" onClick={() => { setScorecardReadOnly(false); setShowScorecard(true) }}>
                  <CheckCircle2 className="h-3 w-3" /> {t.interviews.markComplete}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onCancel(interview.id)}>
                  {t.common.cancel}
                </Button>
              </div>
            )}
            {interview.status === 'Cancelada' && (
              <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onReactivate(interview.id)}>
                  <CheckCircle2 className="h-3 w-3" /> Reactivar
                </Button>
              </div>
            )}
            {interview.status === 'Completada' && interview.scorecard && (
              <div className="mt-3" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => { setScorecardReadOnly(false); setShowScorecard(true) }}
                  className="text-xs font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
                  style={{ color: 'var(--accent-2)' }}
                >
                  Ver scorecard
                </button>
              </div>
            )}
            {interview.status === 'Completada' && appStatus === 'Entrevistas' && (
              <div
                className="mt-3 pt-3 space-y-2"
                style={{ borderTop: '1px solid var(--border)' }}
                onClick={e => e.stopPropagation()}
              >
                <span className="text-xs font-medium block" style={{ color: 'var(--muted2)' }}>
                  Decisión sobre el candidato:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['avanzar', 'a_considerar', 'rechazar', 'descartar_cv'] as DecisionAction[]).map(action => {
                    const cfg = DECISION_CONFIG[action]
                    return (
                      <button
                        key={action}
                        onClick={() => onDecide(interview.candidateId, interview.vacancyId, action)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
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
          vacancyTitle={vacancy?.title}
          candidate={candidate}
          onComplete={onComplete}
          readOnly={scorecardReadOnly}
          isCompleted={interview.status === 'Completada'}
        />
      )}

      <InterviewDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        interview={interview}
        candidateName={candidate?.fullName ?? 'Candidato'}
        vacancyTitle={vacancy?.title ?? 'Sin vacante'}
        onUpdated={i => { onComplete(i); setShowDetail(false) }}
        onOpenScorecard={candidate ? () => { setShowDetail(false); setScorecardReadOnly(false); setShowScorecard(true) } : undefined}
      />
    </>
  )
}

// ─── Por Vacante: Round chip ──────────────────────────────────────────────────
function RoundChip({
  interview, round, candidate, vacancyTitle, onComplete, onCancel, onUpdated,
}: {
  interview: Interview
  round: number
  candidate?: Candidate
  vacancyTitle: string
  onComplete: (i: Interview) => void
  onCancel:   (id: string)   => void | Promise<void>
  onUpdated:  (i: Interview) => void
}) {
  const { t } = useLanguage()
  const [showDetail, setShowDetail] = React.useState(false)
  const [showScorecard, setShowScorecard] = React.useState(false)
  const tc = TYPE_COLORS[interview.type]
  const sc = STATUS_CONFIG[interview.status]
  const StatusIcon = sc.icon
  const statusLabel = interview.status === 'Programada' ? t.interviews.statuses.scheduled
    : interview.status === 'Completada' ? t.interviews.statuses.completed
    : t.interviews.statuses.cancelled
  const d = new Date(interview.scheduledAt)
  const dateStr = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

  return (
    <>
      <div className="flex flex-col items-center">
        <button
          onClick={() => setShowDetail(true)}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all hover:opacity-90"
          style={{
            background: 'var(--surface2)',
            borderColor: 'var(--border)',
            minWidth: 80,
          }}
        >
          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            {ORDINALS[round] ?? `${round + 1}ª`}
          </span>
          <span className="text-[10px] font-semibold leading-tight text-center" style={{ color: 'var(--text)' }}>
            {interview.type === 'Con Hiring Manager' ? 'Hiring Mgr' : interview.type}
          </span>
          <span className="flex items-center gap-0.5 text-[9px] font-medium" style={{ color: sc.text }}>
            <StatusIcon className="h-2.5 w-2.5" />{statusLabel}
          </span>
          <span className="text-[9px]" style={{ color: 'var(--muted)' }}>{dateStr}</span>
        </button>
      </div>

      {candidate && (
        <ScorecardModal
          open={showScorecard}
          onClose={() => setShowScorecard(false)}
          interview={interview}
          candidateName={candidate.fullName}
          vacancyTitle={vacancyTitle}
          candidate={candidate}
          onComplete={onComplete}
          isCompleted={interview.status === 'Completada'}
        />
      )}

      <InterviewDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        interview={interview}
        candidateName={candidate?.fullName ?? 'Candidato'}
        vacancyTitle={vacancyTitle}
        onUpdated={i => { onUpdated(i); setShowDetail(false) }}
        onOpenScorecard={candidate ? () => { setShowDetail(false); setShowScorecard(true) } : undefined}
      />
    </>
  )
}

// ─── Por Vacante: Candidate row ───────────────────────────────────────────────
function CandidateRoundRow({
  candidateId, rounds, candidateMap, vacancyTitle, onComplete, onCancel, onScheduleNext, onDecide, appStatus,
}: {
  candidateId: string
  rounds: Interview[]
  candidateMap: Map<string, Candidate>
  vacancyTitle: string
  onComplete: (i: Interview) => void
  onCancel:   (id: string)   => void | Promise<void>
  onScheduleNext: (candidateId: string, vacancyId: string) => void
  onDecide: (candidateId: string, vacancyId: string, action: DecisionAction) => void
  appStatus?: string
}) {
  const candidate = candidateMap.get(candidateId)
  const lastRound = rounds[rounds.length - 1]
  const canAddNext = lastRound?.status === 'Completada'

  return (
    <div className="py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-start gap-3">
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
              vacancyTitle={vacancyTitle}
              onComplete={onComplete}
              onCancel={onCancel}
              onUpdated={onComplete}
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

      {canAddNext && appStatus === 'Entrevistas' && (
        <div
          className="mt-2 pt-2 space-y-1.5"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs font-medium block" style={{ color: 'var(--muted2)' }}>
            Decisión sobre el candidato:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(['avanzar', 'a_considerar', 'rechazar', 'descartar_cv'] as DecisionAction[]).map(action => {
              const cfg = DECISION_CONFIG[action]
              return (
                <button
                  key={action}
                  onClick={() => onDecide(candidateId, rounds[0]?.vacancyId ?? '', action)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                >
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Por Vacante: Vacancy group ───────────────────────────────────────────────
function VacancyInterviewGroup({
  vacancy, candidateGroups, candidateMap, onComplete, onCancel, onScheduleNext, onDecide, appByCandidateVacancy,
}: {
  vacancy?: Vacancy
  candidateGroups: Map<string, Interview[]>
  candidateMap: Map<string, Candidate>
  onComplete: (i: Interview) => void
  onCancel:   (id: string)   => void | Promise<void>
  onScheduleNext: (candidateId: string, vacancyId: string) => void
  onDecide: (candidateId: string, vacancyId: string, action: DecisionAction) => void
  appByCandidateVacancy: Map<string, Application>
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
            vacancyTitle={vacancy?.title ?? ''}
            onComplete={onComplete}
            onCancel={onCancel}
            onScheduleNext={onScheduleNext}
            onDecide={onDecide}
            appStatus={appByCandidateVacancy.get(`${candId}_${vacancy?.id ?? ''}`)?.status}
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
  const [applications, setApplications] = React.useState<Application[]>([])
  const [loading, setLoading]         = React.useState(true)
  const [showScheduler, setShowScheduler] = React.useState(false)
  const [schedulePrefill, setSchedulePrefill] = React.useState<{ candidateId?: string; vacancyId?: string } | undefined>()
  const [activeTab, setActiveTab]     = React.useState('proximas')
  const [viewMode, setViewMode]       = React.useState<'agenda' | 'vacancy'>('agenda')
  const [clients, setClients]         = React.useState<Client[]>([])
  const [filterClient, setFilterClient] = React.useState('all')

  const { user } = useUser()
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  const load = React.useCallback(async () => {
    const tid = user?.tenantId ?? ''
    const [iRes, cRes, vRes, aRes, clRes] = await Promise.all([
      provider.getInterviews(undefined, tid),
      provider.getCandidates(tid),
      provider.getVacancies(tid),
      provider.getApplications(undefined, tid),
      provider.getClients(tid),
    ])
    setInterviews(iRes.data ?? [])
    setCandidates(cRes.data ?? [])
    setVacancies(vRes.data ?? [])
    setApplications(aRes.data ?? [])
    setClients(clRes.data ?? [])
    setLoading(false)
  }, [provider, user])

  React.useEffect(() => { load() }, [load])

  React.useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [load])

  const candidateMap = React.useMemo(() => new Map(candidates.map(c => [c.id, c])), [candidates])
  const vacancyMap   = React.useMemo(() => new Map(vacancies.map(v => [v.id, v])), [vacancies])

  const filteredInterviews = React.useMemo(() => {
    if (filterClient === 'all') return interviews
    return interviews.filter(i => {
      const v = vacancyMap.get(i.vacancyId ?? '')
      return v?.clientId === filterClient
    })
  }, [interviews, filterClient, vacancyMap])

  const appByCandidateVacancy = React.useMemo(() => {
    const map = new Map<string, Application>()
    for (const a of applications) {
      map.set(`${a.candidateId}_${a.vacancyId}`, a)
    }
    return map
  }, [applications])

  // ── Agenda grouping ──
  const now   = new Date()
  const in48h = new Date(now.getTime() + 48 * 3600000)

  const tabs = React.useMemo(() => ({
    proximas:   filteredInterviews.filter(i => i.status === 'Programada' && new Date(i.scheduledAt) >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    semana:     filteredInterviews.filter(i => {
      const d = new Date(i.scheduledAt); const end = new Date(now); end.setDate(now.getDate() + 7)
      return d >= now && d <= end
    }),
    completadas: filteredInterviews.filter(i => i.status === 'Completada'),
    canceladas:  filteredInterviews.filter(i => i.status === 'Cancelada'),
  }), [filteredInterviews, now])

  const urgentes = tabs.proximas.filter(i => new Date(i.scheduledAt) <= in48h)

  // ── Por Vacante grouping ──
  const vacancyGroups = React.useMemo(() => {
    const groups = new Map<string, Map<string, Interview[]>>()
    for (const iv of filteredInterviews) {
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
  }, [filteredInterviews])

  // ── Actions ──
  async function handleCancel(id: string) {
    if (!confirm('¿Cancelar esta entrevista?')) return
    await provider.updateInterview(id, { status: 'Cancelada' })
    setInterviews(prev => prev.map(i => i.id === id ? { ...i, status: 'Cancelada' } : i))
  }

  async function handleReactivate(id: string) {
    await provider.updateInterview(id, { status: 'Programada' })
    setInterviews(prev => prev.map(i => i.id === id ? { ...i, status: 'Programada' } : i))
  }

  function handleComplete(updated: Interview) {
    setInterviews(prev => prev.map(i => i.id === updated.id ? updated : i))
  }

  async function handleDecide(candidateId: string, vacancyId: string, action: DecisionAction) {
    const key = `${candidateId}_${vacancyId}`
    const app = appByCandidateVacancy.get(key)
    if (!app) return
    if (action === 'avanzar') {
      await provider.updateApplicationStatus(app.id, 'Oferta Enviada')
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'Oferta Enviada' as const, disposition: null } : a))
    } else if (action === 'rechazar') {
      await provider.updateApplicationStatus(app.id, 'Descartado')
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'Descartado' as const, disposition: null } : a))
    } else if (action === 'a_considerar') {
      await provider.updateApplicationDisposition(app.id, 'a_considerar')
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, disposition: 'a_considerar' as const } : a))
    } else if (action === 'descartar_cv') {
      await provider.updateApplicationDisposition(app.id, 'descartar_cv')
      await provider.updateApplicationStatus(app.id, 'Descartado')
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'Descartado' as const, disposition: 'descartar_cv' as const } : a))
    }
    window.dispatchEvent(new CustomEvent('application:stage-changed'))
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
            {tabs.proximas.length} programada{tabs.proximas.length !== 1 ? 's' : ''} · {filteredInterviews.length} en total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {clients.length > 0 && (
            <div className="relative">
              <select
                value={filterClient}
                onChange={e => setFilterClient(e.target.value)}
                className="pl-3 pr-8 py-2 text-sm rounded-md border border-input bg-background focus:outline-none appearance-none"
              >
                <option value="all">Todos los clientes</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          )}
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
            <span className="hidden sm:inline">{t.interviews.schedule}</span>
            <span className="sm:hidden">{t.interviews.schedule}</span>
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
              <p className="font-medium" style={{ color: 'var(--text)' }}>{t.interviews.noInterviews}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{t.interviews.noInterviewsSub}</p>
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
                  onDecide={handleDecide}
                  onReactivate={handleReactivate}
                  appStatus={appByCandidateVacancy.get(`${i.candidateId}_${i.vacancyId}`)?.status}
                  appDisposition={appByCandidateVacancy.get(`${i.candidateId}_${i.vacancyId}`)?.disposition}
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
              <p className="font-medium" style={{ color: 'var(--text)' }}>{t.interviews.noInterviews}</p>
              <p className="text-sm mt-1 mb-4" style={{ color: 'var(--muted)' }}>
                {t.interviews.noInterviewsSub}
              </p>
              <Button onClick={() => { setSchedulePrefill(undefined); setShowScheduler(true) }} className="gap-1.5">
                <Plus className="h-4 w-4" /> {t.interviews.schedule}
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
                  onDecide={handleDecide}
                  appByCandidateVacancy={appByCandidateVacancy}
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
