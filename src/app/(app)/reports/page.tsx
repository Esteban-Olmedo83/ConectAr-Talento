'use client'

import * as React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileText,
  Filter,
  Printer,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import { useLanguage } from '@/lib/context/language-context'
import type { Application, Candidate, Interview, Vacancy } from '@/types'
import { FeatureGate } from '@/components/ui/feature-gate'
import { getPlanFeatures } from '@/lib/plan-features'

// ─── Types ───────────────────────────────────────────────────────────────────

type DateRange = 'month' | 'quarter' | 'year'
type SourceRow = { name: string; value: number }
type FunnelRow = { stage: string; total: number }
type ScoreRow = { name: string; score: number }
type WeekRow = { week: string; entrevistas: number }
type MonthlyRow = { mes: string; abiertas: number; cerradas: number }

// ─── Constants ───────────────────────────────────────────────────────────────

const STAGE_ORDER = ['Nuevas Vacantes', 'En Proceso', 'Entrevistas', 'Oferta Enviada', 'Contratado']

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: '#2563eb',
  Portal: '#1f4a8b',
  'Portal web': '#1f4a8b',
  Referido: '#0f766e',
  Indeed: '#0ea5e9',
  Computrabajo: '#f59e0b',
  ZonaJobs: '#14b8a6',
  Bumeran: '#4f46e5',
  Manual: '#6b7280',
  WhatsApp: '#22c55e',
}

// V2 palette — purple gradient for print charts
const V2 = ['#5D50D6', '#7C6FE8', '#9D91FF', '#BDB5FF', '#DDD9FF'] as const

// V2 color tokens for print layout
const P = {
  accent:      '#5D50D6',
  accent2:     '#8B7EFF',
  accentLight: '#EDE9FF',
  bg:          '#F4F4F8',
  white:       '#ffffff',
  text:        '#1a1a2e',
  muted:       '#6b7280',
  border:      '#e5e7eb',
  green:       '#16a34a',
  greenBg:     '#dcfce7',
  blue:        '#2563eb',
  blueBg:      '#dbeafe',
  amber:       '#d97706',
  amberBg:     '#fef3c7',
  gray:        '#6b7280',
  grayBg:      '#f3f4f6',
  red:         '#dc2626',
} as const

// ─── Print CSS ────────────────────────────────────────────────────────────────

const PRINT_CSS = `
  @page {
    size: A4 portrait;
    margin: 14mm 18mm 14mm 18mm;
  }

  @media screen {
    .rpt-print { display: none !important; }
  }

  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }

    body {
      background: #fff !important;
      color: #1a1a2e !important;
      font-family: system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Toggle layouts */
    .rpt-screen { display: none !important; }
    .rpt-print  { display: block !important; }

    /* Cards: avoid breaking across pages */
    .rpt-card {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      background: #fff !important;
      box-shadow: none !important;
      margin-bottom: 10px !important;
    }

    /* Explicit page break before page 2 */
    .rpt-page2 {
      break-before: page !important;
      page-break-before: always !important;
    }

    /* Tables: prevent row splits */
    tbody tr {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    /* Recommendation items */
    .rpt-rec { break-inside: avoid !important; page-break-inside: avoid !important; }

    /* Section headings should stay with content */
    h1, h2, h3 { break-after: avoid !important; page-break-after: avoid !important; }

    /* Justified body text */
    .rpt-body { text-align: justify !important; hyphens: auto !important; }

    /* Table compact padding in print */
    .rpt-th { padding: 7px 12px !important; font-size: 11px !important; }
    .rpt-td { padding: 7px 12px !important; font-size: 12px !important; }
  }
`

// ─── Utility functions ────────────────────────────────────────────────────────

function getDateFrom(range: DateRange): Date {
  const now = new Date()
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  if (range === 'quarter') return new Date(now.getFullYear(), now.getMonth() - 2, 1)
  return new Date(now.getFullYear(), 0, 1)
}

function normalizeStage(stage: string): string {
  return stage.replace('Nuevas ', '').replace('Enviada', '').trim()
}

function rangeLabel(range: DateRange): string {
  if (range === 'month') return 'Este mes'
  if (range === 'quarter') return 'Últimos 3 meses'
  return 'Este año'
}

function rangePeriodText(range: DateRange): string {
  const now = new Date()
  const fmt = (d: Date) => d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  const from = getDateFrom(range)
  return `${fmt(from)} – ${fmt(now)}`
}

function todayFormatted(): string {
  return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ─── Print-only subcomponents ─────────────────────────────────────────────────

function PrintBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{ background: bg, color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

function PrintStatusBadge({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Abierta':        { bg: P.greenBg, color: P.green  },
    'En Proceso':     { bg: P.blueBg,  color: P.blue   },
    'Entrevistas':    { bg: P.blueBg,  color: P.blue   },
    'Oferta Enviada': { bg: P.amberBg, color: P.amber  },
    'Contratado':     { bg: P.greenBg, color: P.green  },
    'Cerrada':        { bg: P.grayBg,  color: P.gray   },
  }
  const s = map[estado] ?? { bg: P.grayBg, color: P.gray }
  return <PrintBadge label={estado} bg={s.bg} color={s.color} />
}

function PrintScorePill({ score }: { score: number }) {
  const color = score >= 80 ? P.green : score >= 70 ? P.accent : P.red
  return (
    <span style={{ background: color + '18', color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
      {score}%
    </span>
  )
}

function PrintSectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: P.text, letterSpacing: '-0.3px' }}>
        {children}
      </h2>
    </div>
  )
}

// ─── Screen-only subcomponents ────────────────────────────────────────────────

function KpiCard({
  icon,
  title,
  value,
  detail,
}: {
  icon: React.ReactNode
  title: string
  value: string | number
  detail: string
}) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-accent/12 text-accent">
        {icon}
      </div>
      <p className="type-caption text-text-secondary">{title}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{detail}</p>
    </article>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="mt-1 text-xs text-text-secondary">{subtitle}</p>
      </div>
      {children}
    </article>
  )
}

// ─── jsPDF export (kept for programmatic export) ──────────────────────────────

async function exportExecutivePdf({
  periodLabel,
  kpis,
  summary,
  funnel,
  topSources,
  topVacancies,
  recommendations,
}: {
  periodLabel: string
  kpis: Array<{ label: string; value: string | number }>
  summary: string
  funnel: FunnelRow[]
  topSources: SourceRow[]
  topVacancies: ScoreRow[]
  recommendations: string[]
}) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageW = doc.internal.pageSize.getWidth()

  doc.setFillColor(93, 80, 214)
  doc.rect(0, 0, pageW, 34, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('ConectAr Talento', 14, 14)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Informe Ejecutivo de Reclutamiento', 14, 22)
  doc.setFontSize(9)
  doc.text(`Periodo: ${periodLabel}  |  Fecha: ${new Date().toLocaleDateString('es-AR')}`, 14, 29)

  doc.setTextColor(26, 26, 46)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Resumen Ejecutivo', 14, 45)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(doc.splitTextToSize(summary, 180), 14, 51)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('KPIs Principales', 14, 70)
  let y = 78
  kpis.forEach((kpi, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = col === 0 ? 14 : 108
    const boxY = y + row * 18
    doc.setFillColor(237, 233, 255)
    doc.rect(x, boxY - 5, 88, 14, 'F')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(kpi.label, x + 3, boxY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(26, 26, 46)
    doc.text(String(kpi.value), x + 3, boxY + 6)
    doc.setFont('helvetica', 'normal')
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(26, 26, 46)
  doc.text('Embudo de Contratacion', 14, 120)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  funnel.slice(0, 5).forEach((row, i) => {
    doc.text(`${row.stage}: ${row.total}`, 18, 127 + i * 6)
  })

  doc.text('Top Fuentes', 108, 120)
  topSources.slice(0, 5).forEach((row, i) => {
    doc.text(`${row.name}: ${row.value}`, 112, 127 + i * 6)
  })

  doc.addPage()
  doc.setFillColor(244, 244, 248)
  doc.rect(0, 0, pageW, 297, 'F')
  doc.setTextColor(26, 26, 46)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Detalle Operativo', 14, 20)

  doc.setFontSize(10)
  doc.text('Vacantes con mejor score ATS', 14, 30)
  doc.setFont('helvetica', 'normal')
  topVacancies.slice(0, 8).forEach((row, i) => {
    doc.text(`${i + 1}. ${row.name} - ${row.score}%`, 18, 37 + i * 6)
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Acciones recomendadas', 14, 95)
  doc.setFont('helvetica', 'normal')
  recommendations.forEach((line, i) => {
    doc.text(`- ${line}`, 18, 102 + i * 8)
  })

  doc.setDrawColor(229, 231, 235)
  doc.line(14, 272, pageW - 14, 272)
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('ConectAr Talento — Sistema ATS', pageW / 2, 278, { align: 'center' })

  doc.save(`informe-${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { user } = useUser()
  const { t } = useLanguage()
  const features = getPlanFeatures(user?.plan ?? 'free')
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  const [range, setRange] = React.useState<DateRange>('month')
  const [selectedSource, setSelectedSource] = React.useState('all')
  const [clients, setClients] = React.useState<import('@/types').Client[]>([])
  const [filterClient, setFilterClient] = React.useState('all')
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [candidates, setCandidates] = React.useState<Candidate[]>([])
  const [applications, setApplications] = React.useState<Application[]>([])
  const [interviews, setInterviews] = React.useState<Interview[]>([])
  const [loading, setLoading] = React.useState(true)
  const [exporting, setExporting] = React.useState(false)

  const load = React.useCallback(async () => {
    if (user === null) return
    const tenantId = user.tenantId ?? user.id
    const [vResult, cResult, appResult, intResult, clResult] = await Promise.all([
      provider.getVacancies(tenantId),
      provider.getCandidates(tenantId),
      provider.getApplications(undefined, tenantId),
      provider.getInterviews(undefined, tenantId),
      provider.getClients(tenantId),
    ])
    setVacancies(vResult.data ?? [])
    setCandidates(cResult.data ?? [])
    setApplications(appResult.data ?? [])
    setInterviews(intResult.data ?? [])
    setClients(clResult.data ?? [])
    setLoading(false)
  }, [provider, user])

  React.useEffect(() => {
    if (user === null) return
    load()
  }, [load, user])

  React.useEffect(() => {
    const EVENTS = [
      'application:stage-changed', 'vacancy:created', 'vacancy:updated', 'vacancy:deleted',
      'interview:scheduled', 'candidate:created', 'candidate:updated', 'candidate:deleted',
      'client:created', 'client:updated', 'client:deleted',
    ]
    function handleReload() { load() }
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') load()
    }
    EVENTS.forEach(ev => window.addEventListener(ev, handleReload))
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      EVENTS.forEach(ev => window.removeEventListener(ev, handleReload))
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [load])

  // ── Derived data ──────────────────────────────────────────────────────────

  const dateFrom = getDateFrom(range)

  const sourceOptions = React.useMemo(
    () => ['all', ...Array.from(new Set(candidates.map(c => c.source))).sort()],
    [candidates]
  )

  const vacancyMap = React.useMemo(() => new Map(vacancies.map(v => [v.id, v])), [vacancies])

  const clientFilteredApplications = React.useMemo(() => {
    if (filterClient === 'all') return applications
    return applications.filter(a => {
      const v = a.vacancyId ? vacancyMap.get(a.vacancyId) : undefined
      return v?.clientId === filterClient
    })
  }, [applications, filterClient, vacancyMap])

  const clientFilteredCandidates = React.useMemo(() => {
    if (filterClient === 'all') return candidates
    const ids = new Set(clientFilteredApplications.map(a => a.candidateId))
    return candidates.filter(c => ids.has(c.id) || c.clientId === filterClient)
  }, [candidates, filterClient, clientFilteredApplications])

  const filteredCandidates = React.useMemo(
    () => selectedSource === 'all'
      ? clientFilteredCandidates
      : clientFilteredCandidates.filter(c => c.source === selectedSource),
    [clientFilteredCandidates, selectedSource]
  )

  const candidateIdSet = React.useMemo(
    () => new Set(filteredCandidates.map(c => c.id)),
    [filteredCandidates]
  )

  const filteredApplications = React.useMemo(
    () => clientFilteredApplications.filter(
      a => candidateIdSet.has(a.candidateId) && new Date(a.appliedAt) >= dateFrom
    ),
    [clientFilteredApplications, candidateIdSet, dateFrom]
  )

  const filteredInterviews = React.useMemo(
    () => interviews.filter(i => {
      if (filterClient !== 'all') {
        const v = vacancyMap.get(i.vacancyId ?? '')
        if (v?.clientId !== filterClient) return false
      }
      return new Date(i.scheduledAt) >= dateFrom
    }),
    [interviews, filterClient, vacancyMap, dateFrom]
  )

  const funnelData = React.useMemo<FunnelRow[]>(
    () => STAGE_ORDER.map(stage => ({
      stage: normalizeStage(stage),
      total: filteredApplications.filter(a => a.status === stage).length,
    })),
    [filteredApplications]
  )

  const sourceData = React.useMemo<SourceRow[]>(() => {
    const counts: Record<string, number> = {}
    filteredCandidates.forEach(c => { counts[c.source] = (counts[c.source] ?? 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [filteredCandidates])

  const scoreByVacancy = React.useMemo<ScoreRow[]>(() => {
    return vacancies.slice(0, 8).map(v => {
      const vacApps = filteredApplications.filter(a => a.vacancyId === v.id)
      const scores = vacApps
        .map(a => filteredCandidates.find(c => c.id === a.candidateId)?.atsScore)
        .filter((s): s is number => typeof s === 'number')
      const avg = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : 0
      return { name: v.title.slice(0, 22), score: avg }
    })
  }, [filteredApplications, filteredCandidates, vacancies])

  const interviewsPerWeek = React.useMemo<WeekRow[]>(() => {
    const rows: WeekRow[] = []
    for (let offset = 7; offset >= 0; offset--) {
      const from = new Date()
      from.setDate(from.getDate() - offset * 7)
      from.setHours(0, 0, 0, 0)
      const to = new Date(from)
      to.setDate(to.getDate() + 7)
      const count = filteredInterviews.filter(i => {
        const d = new Date(i.scheduledAt)
        return d >= from && d < to
      }).length
      rows.push({ week: `S${8 - offset}`, entrevistas: count })
    }
    return rows
  }, [filteredInterviews])

  const monthlyData = React.useMemo<MonthlyRow[]>(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, idx) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1)
      const label = month.toLocaleDateString('es-AR', { month: 'short' })
      const abiertas = vacancies.filter(v => new Date(v.createdAt) <= month && v.status !== 'Contratado').length
      const cerradas = vacancies.filter(v => new Date(v.createdAt) <= month && v.status === 'Contratado').length
      return { mes: label, abiertas, cerradas }
    })
  }, [vacancies])

  const totalApps = filteredApplications.length
  const hired = filteredApplications.filter(a => a.status === 'Contratado').length
  const conversion = totalApps > 0 ? `${Math.round((hired / totalApps) * 100)}%` : '0%'

  const scoreArray = filteredCandidates
    .map(c => c.atsScore)
    .filter((s): s is number => typeof s === 'number')
  const avgScore = scoreArray.length > 0
    ? `${Math.round(scoreArray.reduce((a, s) => a + s, 0) / scoreArray.length)}%`
    : 'N/A'

  const avgDays = React.useMemo(() => {
    const closed = vacancies.filter(v => v.status === 'Contratado')
    if (!closed.length) return 'N/D'
    const sum = closed.reduce((a, v) => {
      const days = Math.floor((Date.now() - new Date(v.createdAt).getTime()) / 86400000)
      return a + Math.min(days, 90)
    }, 0)
    return Math.round(sum / closed.length)
  }, [vacancies])

  const recommendations = React.useMemo(() => {
    const list: string[] = []
    const convNum = Number(conversion.replace('%', '')) || 0
    const scoreNum = Number(avgScore.replace('%', '')) || 0
    if (convNum < 10) list.push('Reforzar screening inicial para mejorar la conversión en etapas intermedias del proceso.')
    if (scoreNum < 70) list.push('Ajustar criterios ATS por vacante y redefinir las habilidades obligatorias del perfil.')
    if (typeof avgDays === 'number' && avgDays > 30) {
      list.push('Reducir el tiempo de cobertura acelerando las entrevistas técnicas y la toma de decisiones.')
    }
    if (!list.length) list.push('Mantener el ritmo actual y escalar las fuentes que ya muestran mejor calidad de candidatos.')
    list.push('Revisar semanalmente el funnel por reclutador y detectar cuellos de botella por etapa.')
    return list.slice(0, 3)
  }, [avgDays, avgScore, conversion])

  // ── Print-specific computed values ────────────────────────────────────────

  const selectedClient = clients.find(c => c.id === filterClient)
  const clientName = selectedClient?.name ?? (filterClient === 'all' ? 'Todos los clientes' : '—')
  const clientIndustry = selectedClient?.industry ?? '—'

  const userDisplayName = user?.fullName || user?.email?.split('@')[0]?.replace(/[._]/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Reclutador'
  const userEmail = user?.email ?? ''
  const userInitials = initials(userDisplayName)

  const executiveSummary = React.useMemo(() => {
    const scoreNum = Number((avgScore === 'N/A' ? '0%' : avgScore).replace('%', '')) || 0
    const scoreStatus = scoreNum >= 75 ? 'alto' : scoreNum >= 60 ? 'estable' : 'por mejorar'
    return `Durante el período analizado, ${clientName} registró ${totalApps} postulaciones y ${hired} contrataciones. La tasa de conversión fue del ${conversion}, con un score ATS ${scoreStatus} (${avgScore === 'N/A' ? '—' : avgScore}) y un tiempo promedio de cobertura de ${avgDays} días.`
  }, [clientName, totalApps, hired, conversion, avgScore, avgDays])

  const funnelTotal = funnelData[0]?.total || 1
  const funnelWithPct = funnelData.map(r => ({
    ...r,
    pct: Math.round((r.total / funnelTotal) * 100),
  }))

  const sourceTotal = sourceData.reduce((s, r) => s + r.value, 0) || 1
  const sourceWithPct = sourceData.slice(0, 5).map((r, i) => ({
    ...r,
    pct: Math.round((r.value / sourceTotal) * 100),
    color: V2[i] ?? V2[V2.length - 1],
  }))

  const printVacantes = React.useMemo(() => {
    const vs = filterClient === 'all' ? vacancies : vacancies.filter(v => v.clientId === filterClient)
    return vs.slice(0, 10).map(v => {
      const apps = filteredApplications.filter(a => a.vacancyId === v.id)
      const scores = apps
        .map(a => filteredCandidates.find(c => c.id === a.candidateId)?.atsScore)
        .filter((x): x is number => typeof x === 'number')
      const avgAts = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : 0
      const days = Math.floor((Date.now() - new Date(v.createdAt).getTime()) / 86400000)
      return { posicion: v.title, estado: v.status, candidatos: apps.length, ats: avgAts, dias: Math.min(days, 999) }
    })
  }, [vacancies, filteredApplications, filteredCandidates, filterClient])

  const topCandidatos = React.useMemo(() => {
    return filteredCandidates
      .filter(c => c.atsScore != null)
      .sort((a, b) => (b.atsScore ?? 0) - (a.atsScore ?? 0))
      .slice(0, 8)
      .map(c => {
        const app = filteredApplications.find(a => a.candidateId === c.id)
        return {
          nombre: c.fullName,
          vacante: app?.vacancyId ? (vacancyMap.get(app.vacancyId)?.title ?? '—') : '—',
          etapa: app?.status ?? '—',
          score: c.atsScore ?? 0,
          fuente: c.source,
        }
      })
  }, [filteredCandidates, filteredApplications, vacancyMap])

  const isEmpty = !loading && totalApps === 0 && filteredCandidates.length === 0 && vacancies.length === 0

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function onExportPdf() {
    setExporting(true)
    try {
      await exportExecutivePdf({
        periodLabel: rangeLabel(range),
        kpis: [
          { label: 'Total Postulaciones', value: totalApps },
          { label: 'Tiempo Promedio (dias)', value: avgDays },
          { label: 'Score ATS Promedio', value: avgScore },
          { label: 'Tasa de Conversion', value: conversion },
        ],
        summary: executiveSummary,
        funnel: funnelData,
        topSources: sourceData,
        topVacancies: scoreByVacancy.filter(x => x.score > 0),
        recommendations,
      })
    } finally {
      setExporting(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto flex h-full w-full max-w-[1680px] flex-col gap-5 px-4 py-4 md:px-6 md:py-6">
        <div className="flex h-64 items-center justify-center text-sm text-text-secondary">
          Cargando datos...
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <FeatureGate feature="reports" hasAccess={features.reports} variant="blur">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {/* ════════════════════════════════════════════════════════════════
          SCREEN LAYOUT — dark app theme
      ════════════════════════════════════════════════════════════════ */}
      <div className="rpt-screen mx-auto flex h-full w-full max-w-[1680px] flex-col gap-5 px-4 py-4 md:px-6 md:py-6">

        {/* Header */}
        <header className="rounded-[var(--radius-xl)] border border-border bg-[linear-gradient(135deg,hsl(var(--surface))_0%,hsl(var(--surface-muted))_100%)] p-6 shadow-[var(--shadow-md)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h1 className="type-h2 text-text-primary">Informes de Reclutamiento</h1>
              <p className="type-body text-text-secondary">
                Resumen ejecutivo, rendimiento del pipeline y acciones recomendadas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Period */}
              <label className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-sm text-text-secondary">
                <Filter className="h-4 w-4" />
                <select
                  value={range}
                  onChange={e => setRange(e.target.value as DateRange)}
                  className="bg-transparent text-sm text-text-primary outline-none"
                >
                  <option value="month">Este mes</option>
                  <option value="quarter">Últimos 3 meses</option>
                  <option value="year">Este año</option>
                </select>
              </label>

              {/* Source */}
              <label className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-sm text-text-secondary">
                <Users className="h-4 w-4" />
                <select
                  value={selectedSource}
                  onChange={e => setSelectedSource(e.target.value)}
                  className="bg-transparent text-sm text-text-primary outline-none"
                >
                  {sourceOptions.map(s => (
                    <option key={s} value={s}>{s === 'all' ? 'Todas las fuentes' : s}</option>
                  ))}
                </select>
              </label>

              {/* Client */}
              {clients.length > 0 && (
                <div className="relative">
                  <select
                    value={filterClient}
                    onChange={e => setFilterClient(e.target.value)}
                    className="w-full appearance-none rounded-[var(--radius)] border border-border bg-surface py-2 pl-3 pr-8 text-sm text-text-primary outline-none"
                  >
                    <option value="all">Todos los clientes</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
                </div>
              )}

              {/* Print button */}
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted"
              >
                <Printer className="h-4 w-4" />
                Imprimir / PDF
              </button>

              {/* jsPDF export */}
              <button
                type="button"
                onClick={onExportPdf}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-70"
              >
                <Download className="h-4 w-4" />
                {exporting ? 'Generando...' : t.reports.export}
              </button>
            </div>
          </div>
        </header>

        {isEmpty && (
          <section className="rounded-[var(--radius-lg)] border border-warning/35 bg-warning/10 p-4">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-semibold text-text-primary">{t.reports.noData}</p>
                <p className="mt-1 text-sm text-text-secondary">Crea vacantes y candidatos para activar los reportes.</p>
              </div>
            </div>
          </section>
        )}

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={<Users className="h-5 w-5" />} title="Total Postulaciones" value={totalApps} detail={rangeLabel(range)} />
          <KpiCard icon={<Clock3 className="h-5 w-5" />} title="Tiempo Promedio" value={avgDays} detail="Días hasta cobertura" />
          <KpiCard icon={<Target className="h-5 w-5" />} title="Score ATS Promedio" value={avgScore} detail="Calidad promedio de perfil" />
          <KpiCard icon={<TrendingUp className="h-5 w-5" />} title="Tasa de Conversión" value={conversion} detail="Postulación a contratado" />
        </section>

        {/* Charts row 1 */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartCard title={t.reports.sections.funnel} subtitle="Conversión por etapa">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
                <YAxis dataKey="stage" type="category" width={88} tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10 }} />
                <Bar dataKey="total" fill="#5D50D6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t.reports.sections.sources} subtitle="Distribución por canal">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={54} outerRadius={88} paddingAngle={2}>
                  {sourceData.map((entry, i) => (
                    <Cell key={`${entry.name}-${i}`} fill={SOURCE_COLORS[entry.name] ?? '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10 }} />
                <Legend iconSize={10} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* Charts row 2 */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartCard title={t.reports.sections.performance} subtitle="Score promedio por posición activa">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={scoreByVacancy} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--text-secondary))' }} angle={-28} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
                <Tooltip formatter={v => [`${v}%`, 'Score ATS']} contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10 }} />
                <Bar dataKey="score" fill="#8B7EFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Entrevistas por Semana" subtitle="Últimas 8 semanas">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={interviewsPerWeek}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10 }} />
                <Line type="monotone" dataKey="entrevistas" stroke="#5D50D6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* Charts row 3 */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
          <ChartCard title="Vacantes Abiertas vs Cerradas" subtitle="Evolución mensual">
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="openG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5D50D6" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#5D50D6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="closedG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B7EFF" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#8B7EFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 10 }} />
                <Legend iconSize={10} iconType="circle" />
                <Area type="monotone" dataKey="abiertas" stroke="#5D50D6" fill="url(#openG)" name="Abiertas" />
                <Area type="monotone" dataKey="cerradas" stroke="#8B7EFF" fill="url(#closedG)" name="Cerradas" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <article className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            <h3 className="text-sm font-semibold text-text-primary">Recomendaciones Ejecutivas</h3>
            <p className="mt-1 text-xs text-text-secondary">Acciones sugeridas para el próximo ciclo</p>
            <ul className="mt-4 space-y-3 text-sm text-text-primary">
              {recommendations.map(item => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-[var(--radius)] border border-warning/35 bg-warning/10 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <p className="text-xs text-text-secondary">{executiveSummary}</p>
              </div>
            </div>
          </article>
        </section>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          PRINT LAYOUT — V2 white A4 (hidden on screen, shown on print)
      ════════════════════════════════════════════════════════════════ */}
      <div
        className="rpt-print"
        style={{
          display: 'none',
          background: P.bg,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
          color: P.text,
        }}
      >
        {/* Print header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: `2px solid ${P.accent}`, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: P.accent, borderRadius: 7, color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>CT</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: P.accent }}>ConectAr Talento</div>
              <div style={{ fontSize: 10, color: P.muted }}>Sistema ATS · Informes</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: P.text }}>{clientName}</div>
            <div style={{ fontSize: 10, color: P.muted }}>{rangeLabel(range)} · {todayFormatted()}</div>
          </div>
        </div>

        {/* ── PÁGINA 1 ──────────────────────────────────────────────── */}

        {/* Cover */}
        <div className="rpt-card" style={{ background: P.white, borderRadius: 7, border: `1px solid ${P.border}`, borderLeft: `4px solid ${P.accent}`, padding: '20px 24px', marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: P.muted, textTransform: 'uppercase', marginBottom: 6 }}>
            ConectAr Talento · Sistema ATS
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: P.accent, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            INFORME DE RECLUTAMIENTO
          </h1>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: P.muted }}>
            {clientName} · {rangePeriodText(range)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                ['Cliente',   clientName],
                ['Industria', clientIndustry],
                ['Período',   rangeLabel(range)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                  <span style={{ color: P.muted, minWidth: 72 }}>{k}:</span>
                  <span style={{ fontWeight: 600, color: P.text }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                ['Preparado por', userDisplayName],
                ['Fecha',         todayFormatted()],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                  <span style={{ color: P.muted, minWidth: 88 }}>{k}:</span>
                  <span style={{ fontWeight: 600, color: P.text }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: `1px solid ${P.border}`, margin: 0 }} />
        </div>

        {/* Resumen ejecutivo */}
        <div className="rpt-card" style={{ background: P.white, borderRadius: 7, border: `1px solid ${P.border}`, padding: '16px 22px', marginBottom: 10 }}>
          <PrintSectionTitle icon="🔖">Resumen Ejecutivo</PrintSectionTitle>
          <p className="rpt-body" style={{ margin: '0 0 14px', fontSize: 12, lineHeight: 1.75, color: P.text, borderLeft: `3px solid ${P.accentLight}`, paddingLeft: 10 }}>
            {executiveSummary}
          </p>
          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: P.border, borderRadius: 5, overflow: 'hidden' }}>
            {[
              { val: String(totalApps), label: 'Postulaciones', icon: '👥', hl: true  },
              { val: String(avgDays),   label: 'Días promedio',  icon: '⏱', hl: false },
              { val: avgScore === 'N/A' ? '—' : avgScore, label: 'Score ATS', icon: '🎯', hl: false },
              { val: conversion,        label: 'Conversión',     icon: '📈', hl: false },
            ].map((k, i) => (
              <div key={i} style={{ background: k.hl ? P.accent : P.white, color: k.hl ? '#fff' : P.text, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, marginBottom: 3 }}>{k.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: 9, marginTop: 3, color: k.hl ? 'rgba(255,255,255,0.8)' : P.muted, fontWeight: 500 }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Embudo + Canales */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          {/* Embudo */}
          <div className="rpt-card" style={{ background: P.white, borderRadius: 7, border: `1px solid ${P.border}`, padding: '14px 18px' }}>
            <PrintSectionTitle icon="📊">Embudo del proceso</PrintSectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {funnelWithPct.map((f, i) => (
                <div key={i} style={{
                  width: `${Math.max(f.pct, 16)}%`,
                  minWidth: 110,
                  background: V2[i] ?? V2[V2.length - 1],
                  borderRadius: i === 0 ? '4px 4px 0 0' : i === funnelWithPct.length - 1 ? '0 0 4px 4px' : 0,
                  padding: '6px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: i < 3 ? '#fff' : P.accent, whiteSpace: 'nowrap' }}>{f.stage}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: i < 3 ? '#fff' : P.accent, background: 'rgba(255,255,255,0.22)', borderRadius: 8, padding: '0 5px' }}>{f.total}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: P.muted, textAlign: 'center' }}>
              Tasa de paso promedio: <strong style={{ color: P.accent }}>{conversion}</strong>
            </div>
          </div>

          {/* Canales */}
          <div className="rpt-card" style={{ background: P.white, borderRadius: 7, border: `1px solid ${P.border}`, padding: '14px 18px' }}>
            <PrintSectionTitle icon="📡">Canales de sourcing</PrintSectionTitle>
            {sourceWithPct.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sourceWithPct.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 11 }}>
                      <span style={{ fontWeight: 500, color: P.text }}>{s.name}</span>
                      <span style={{ fontWeight: 700, color: P.accent }}>{s.pct}%</span>
                    </div>
                    <div style={{ background: P.grayBg, borderRadius: 3, height: 7, overflow: 'hidden' }}>
                      <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 2, fontSize: 10, color: P.muted }}>
                  Total: {filteredCandidates.length} candidatos · {rangePeriodText(range)}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 11, color: P.muted }}>Sin datos de sourcing para el período seleccionado.</p>
            )}
          </div>
        </div>

        {/* Vacantes table */}
        {printVacantes.length > 0 && (
          <div className="rpt-card" style={{ background: P.white, borderRadius: 7, border: `1px solid ${P.border}`, marginBottom: 10, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px 8px' }}>
              <PrintSectionTitle icon="📋">Estado de Vacantes</PrintSectionTitle>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: P.accent }}>
                  {['Posición', 'Estado', 'Candidatos', 'ATS Prom.', 'Días abierta'].map(h => (
                    <th key={h} className="rpt-th" style={{ padding: '7px 14px', textAlign: 'left', color: '#fff', fontWeight: 600, fontSize: 11, letterSpacing: 0.2, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {printVacantes.map((v, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${P.border}`, background: i % 2 === 1 ? '#FAFAFA' : P.white }}>
                    <td className="rpt-td" style={{ padding: '7px 14px', fontWeight: 600, color: P.text }}>{v.posicion}</td>
                    <td className="rpt-td" style={{ padding: '7px 14px' }}><PrintStatusBadge estado={v.estado} /></td>
                    <td className="rpt-td" style={{ padding: '7px 14px', color: P.text, textAlign: 'center' }}>{v.candidatos}</td>
                    <td className="rpt-td" style={{ padding: '7px 14px', textAlign: 'center' }}><PrintScorePill score={v.ats} /></td>
                    <td className="rpt-td" style={{ padding: '7px 14px', color: P.muted, textAlign: 'center' }}>{v.dias}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PÁGINA 2 ──────────────────────────────────────────────── */}
        <div className="rpt-page2">

          {/* Candidatos table */}
          {topCandidatos.length > 0 && (
            <div className="rpt-card" style={{ background: P.white, borderRadius: 7, border: `1px solid ${P.border}`, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px 8px' }}>
                <PrintSectionTitle icon="👤">Candidatos en Proceso</PrintSectionTitle>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: P.accentLight }}>
                    {['Nombre', 'Vacante', 'Etapa', 'Score ATS', 'Fuente'].map(h => (
                      <th key={h} className="rpt-th" style={{ padding: '7px 14px', textAlign: 'left', color: P.accent, fontWeight: 700, fontSize: 11, borderBottom: `2px solid ${P.accent}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topCandidatos.map((c, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${P.border}`, background: i % 2 === 1 ? '#FAFAFA' : P.white }}>
                      <td className="rpt-td" style={{ padding: '7px 14px', fontWeight: 600, color: P.text }}>{c.nombre}</td>
                      <td className="rpt-td" style={{ padding: '7px 14px', color: P.muted }}>{c.vacante}</td>
                      <td className="rpt-td" style={{ padding: '7px 14px' }}>
                        <PrintBadge label={c.etapa} bg={P.blueBg} color={P.blue} />
                      </td>
                      <td className="rpt-td" style={{ padding: '7px 14px', textAlign: 'center' }}><PrintScorePill score={c.score} /></td>
                      <td className="rpt-td" style={{ padding: '7px 14px', color: P.muted }}>{c.fuente}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recommendations */}
          <div className="rpt-card" style={{ background: P.white, borderRadius: 7, border: `1px solid ${P.border}`, padding: '14px 18px', marginBottom: 10 }}>
            <PrintSectionTitle icon="💡">Recomendaciones Ejecutivas</PrintSectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recommendations.map((rec, i) => (
                <div key={i} className="rpt-rec" style={{ display: 'flex', gap: 12, padding: '10px 12px', background: P.accentLight, borderRadius: 6, border: `1px solid ${P.accent2}33` }}>
                  <div style={{ width: 26, height: 26, minWidth: 26, background: P.accent, borderRadius: '50%', color: '#fff', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    {i + 1}
                  </div>
                  <p className="rpt-body" style={{ margin: 0, fontSize: 12, color: P.text, lineHeight: 1.65 }}>{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer — inline at end of content, no separate page */}
          <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: P.muted }}>
            <div>
              <span style={{ fontWeight: 600, color: P.accent }}>ConectAr Talento</span>
              {' '}© {new Date().getFullYear()} — Sistema ATS · Informe confidencial de uso interno
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={userDisplayName} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 28, height: 28, background: P.accent, borderRadius: '50%', color: '#fff', fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {userInitials}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, color: P.text, fontSize: 12 }}>{userDisplayName}</div>
                <div style={{ color: P.muted, fontSize: 10 }}>{userEmail}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </FeatureGate>
  )
}
