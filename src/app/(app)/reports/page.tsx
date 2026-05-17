'use client'

import * as React from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Filter,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import type { Application, Candidate, Interview, Vacancy } from '@/types'

type DateRange = 'month' | 'quarter' | 'year'

type SourceRow = { name: string; value: number }

type FunnelRow = { stage: string; total: number }

type ScoreRow = { name: string; score: number }

type WeekRow = { week: string; entrevistas: number }

type MonthlyRow = { mes: string; abiertas: number; cerradas: number }

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
  if (range === 'quarter') return 'Ultimos 3 meses'
  return 'Este ano'
}

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

function buildExecutiveSummary({
  totalApps,
  hired,
  conversion,
  avgScore,
  avgDays,
}: {
  totalApps: number
  hired: number
  conversion: string
  avgScore: string
  avgDays: number | string
}) {
  const scoreNumber = Number(avgScore.replace('%', '')) || 0
  const scoreStatus = scoreNumber >= 75 ? 'alto' : scoreNumber >= 60 ? 'estable' : 'por mejorar'
  return `Durante el periodo seleccionado se registraron ${totalApps} postulaciones y ${hired} contrataciones. La conversion general fue de ${conversion}, con un score ATS ${scoreStatus} (${avgScore}) y un tiempo promedio de cobertura de ${avgDays} dias.`
}

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

  doc.setFillColor(14, 32, 62)
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

  doc.setTextColor(20, 20, 20)
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
    doc.setFillColor(245, 248, 255)
    doc.rect(x, boxY - 5, 88, 14, 'F')
    doc.setFontSize(8)
    doc.setTextColor(90, 98, 115)
    doc.text(kpi.label, x + 3, boxY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(20, 20, 20)
    doc.text(String(kpi.value), x + 3, boxY + 6)
    doc.setFont('helvetica', 'normal')
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(20, 20, 20)
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
  doc.setFillColor(248, 250, 252)
  doc.rect(0, 0, pageW, 297, 'F')
  doc.setTextColor(20, 20, 20)
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

  doc.setDrawColor(210, 220, 235)
  doc.line(14, 272, pageW - 14, 272)
  doc.setFontSize(8)
  doc.setTextColor(90, 98, 115)
  doc.text('ConectAr Talento - Executive Clean Report', pageW / 2, 278, { align: 'center' })

  doc.save(`informe-ejecutivo-${new Date().toISOString().slice(0, 10)}.pdf`)
}

export default function ReportsPage() {
  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [range, setRange] = React.useState<DateRange>('month')
  const [selectedSource, setSelectedSource] = React.useState('all')
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [candidates, setCandidates] = React.useState<Candidate[]>([])
  const [applications, setApplications] = React.useState<Application[]>([])
  const [interviews, setInterviews] = React.useState<Interview[]>([])
  const [loading, setLoading] = React.useState(true)
  const [exporting, setExporting] = React.useState(false)

  React.useEffect(() => {
    // Wait for user to be resolved before loading data
    if (user === null) return

    async function load() {
      const tenantId = user!.tenantId ?? user!.id
      const [vResult, cResult, appResult, intResult] = await Promise.all([
        provider.getVacancies(tenantId),
        provider.getCandidates(tenantId),
        provider.getApplications(undefined, tenantId),
        provider.getInterviews(undefined, tenantId),
      ])
      setVacancies(vResult.data ?? [])
      setCandidates(cResult.data ?? [])
      setApplications(appResult.data ?? [])
      setInterviews(intResult.data ?? [])
      setLoading(false)
    }
    load()
  }, [provider, user])

  const dateFrom = getDateFrom(range)
  const sourceOptions = React.useMemo(
    () => ['all', ...Array.from(new Set(candidates.map((c) => c.source))).sort()],
    [candidates]
  )

  const filteredCandidates = React.useMemo(
    () =>
      selectedSource === 'all'
        ? candidates
        : candidates.filter((candidate) => candidate.source === selectedSource),
    [candidates, selectedSource]
  )

  const candidateIdSet = React.useMemo(
    () => new Set(filteredCandidates.map((candidate) => candidate.id)),
    [filteredCandidates]
  )

  const filteredApplications = React.useMemo(
    () =>
      applications.filter(
        (application) =>
          candidateIdSet.has(application.candidateId) && new Date(application.appliedAt) >= dateFrom
      ),
    [applications, candidateIdSet, dateFrom]
  )

  const filteredInterviews = React.useMemo(
    () => interviews.filter((interview) => new Date(interview.scheduledAt) >= dateFrom),
    [interviews, dateFrom]
  )

  const funnelData = React.useMemo<FunnelRow[]>(
    () =>
      STAGE_ORDER.map((stage) => ({
        stage: normalizeStage(stage),
        total: filteredApplications.filter((application) => application.status === stage).length,
      })),
    [filteredApplications]
  )

  const sourceData = React.useMemo<SourceRow[]>(() => {
    const counts: Record<string, number> = {}
    filteredCandidates.forEach((candidate) => {
      counts[candidate.source] = (counts[candidate.source] ?? 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredCandidates])

  const scoreByVacancy = React.useMemo<ScoreRow[]>(() => {
    return vacancies.slice(0, 8).map((vacancy) => {
      const vacancyApps = filteredApplications.filter((application) => application.vacancyId === vacancy.id)
      const scores = vacancyApps
        .map((application) =>
          filteredCandidates.find((candidate) => candidate.id === application.candidateId)?.atsScore
        )
        .filter((score): score is number => typeof score === 'number')
      const avg = scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0
      return { name: vacancy.title.slice(0, 22), score: avg }
    })
  }, [filteredApplications, filteredCandidates, vacancies])

  const interviewsPerWeek = React.useMemo<WeekRow[]>(() => {
    const rows: WeekRow[] = []
    for (let weekOffset = 7; weekOffset >= 0; weekOffset -= 1) {
      const from = new Date()
      from.setDate(from.getDate() - weekOffset * 7)
      from.setHours(0, 0, 0, 0)
      const to = new Date(from)
      to.setDate(to.getDate() + 7)
      const count = filteredInterviews.filter((item) => {
        const date = new Date(item.scheduledAt)
        return date >= from && date < to
      }).length
      rows.push({ week: `S${8 - weekOffset}`, entrevistas: count })
    }
    return rows
  }, [filteredInterviews])

  const monthlyData = React.useMemo<MonthlyRow[]>(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, idx) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1)
      const label = month.toLocaleDateString('es-AR', { month: 'short' })
      const abiertas = vacancies.filter(
        (vacancy) => new Date(vacancy.createdAt) <= month && vacancy.status !== 'Contratado'
      ).length
      const cerradas = vacancies.filter(
        (vacancy) => new Date(vacancy.createdAt) <= month && vacancy.status === 'Contratado'
      ).length
      return { mes: label, abiertas, cerradas }
    })
  }, [vacancies])

  const totalApps = filteredApplications.length
  const hired = filteredApplications.filter((application) => application.status === 'Contratado').length
  const conversion = totalApps > 0 ? `${Math.round((hired / totalApps) * 100)}%` : '0%'
  const scoreArray = filteredCandidates
    .map((candidate) => candidate.atsScore)
    .filter((score): score is number => typeof score === 'number')
  const avgScore =
    scoreArray.length > 0
      ? `${Math.round(scoreArray.reduce((acc, score) => acc + score, 0) / scoreArray.length)}%`
      : 'N/A'

  const avgDays = React.useMemo(() => {
    const closedVacancies = vacancies.filter((vacancy) => vacancy.status === 'Contratado')
    if (!closedVacancies.length) return 'N/D'
    const sum = closedVacancies.reduce((acc, vacancy) => {
      const days = Math.floor((Date.now() - new Date(vacancy.createdAt).getTime()) / 86400000)
      return acc + Math.min(days, 90)
    }, 0)
    return Math.round(sum / closedVacancies.length)
  }, [vacancies])

  const summary = buildExecutiveSummary({
    totalApps,
    hired,
    conversion,
    avgScore: avgScore === 'N/A' ? '0%' : avgScore,
    avgDays,
  })

  const recommendations = React.useMemo(() => {
    const list: string[] = []
    const conversionNumber = Number(conversion.replace('%', '')) || 0
    const scoreNumber = Number(avgScore.replace('%', '')) || 0

    if (conversionNumber < 10) list.push('Reforzar screening inicial para mejorar conversion en etapas intermedias.')
    if (scoreNumber < 70) list.push('Ajustar criterios ATS por vacante y redefinir skills obligatorias.')
    if (typeof avgDays === 'number' && avgDays > 30) {
      list.push('Reducir el tiempo de cobertura acelerando entrevistas tecnicas.')
    }
    if (!list.length) list.push('Mantener el ritmo actual y escalar fuentes que ya muestran mejor calidad.')
    list.push('Revisar semanalmente el funnel por recruiter y detectar cuellos de botella.')
    return list.slice(0, 3)
  }, [avgDays, avgScore, conversion])

  const isEmpty = !loading && totalApps === 0 && filteredCandidates.length === 0 && vacancies.length === 0

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
        summary,
        funnel: funnelData,
        topSources: sourceData,
        topVacancies: scoreByVacancy.filter((item) => item.score > 0),
        recommendations,
      })
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex h-full w-full max-w-[1680px] flex-col gap-5 px-4 py-4 md:px-6 md:py-6">
        <div className="flex items-center justify-center h-64 text-text-secondary text-sm">
          Cargando datos...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1680px] flex-col gap-5 px-4 py-4 md:px-6 md:py-6">
      <header className="rounded-[var(--radius-xl)] border border-border bg-[linear-gradient(135deg,hsl(var(--surface))_0%,hsl(var(--surface-muted))_100%)] p-6 shadow-[var(--shadow-md)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Executive Clean
            </span>
            <div>
              <h1 className="type-h2 text-text-primary">Informes de Reclutamiento</h1>
              <p className="mt-1 type-body text-text-secondary">
                Resumen ejecutivo, rendimiento del pipeline y acciones recomendadas.
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto">
            <label className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-sm text-text-secondary">
              <Filter className="h-4 w-4 text-text-secondary" />
              <select
                value={range}
                onChange={(event) => setRange(event.target.value as DateRange)}
                className="w-full bg-transparent text-sm text-text-primary outline-none"
              >
                <option value="month">Este mes</option>
                <option value="quarter">Ultimos 3 meses</option>
                <option value="year">Este ano</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-sm text-text-secondary">
              <Users className="h-4 w-4 text-text-secondary" />
              <select
                value={selectedSource}
                onChange={(event) => setSelectedSource(event.target.value)}
                className="w-full bg-transparent text-sm text-text-primary outline-none"
              >
                {sourceOptions.map((source) => (
                  <option key={source} value={source}>
                    {source === 'all' ? 'Todas las fuentes' : source}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={onExportPdf}
              disabled={exporting}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-70"
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Generando PDF...' : 'Exportar PDF'}
            </button>
          </div>
        </div>
      </header>

      {isEmpty ? (
        <section className="rounded-[var(--radius-lg)] border border-warning/35 bg-warning/10 p-4">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Sin datos en el periodo seleccionado</p>
              <p className="mt-1 text-sm text-text-secondary">
                Crea vacantes y candidatos para activar los reportes.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          title="Total Postulaciones"
          value={totalApps}
          detail={rangeLabel(range)}
        />
        <KpiCard
          icon={<Clock3 className="h-5 w-5" />}
          title="Tiempo Promedio (dias)"
          value={avgDays}
          detail="Tiempo de cobertura"
        />
        <KpiCard
          icon={<Target className="h-5 w-5" />}
          title="Score ATS Promedio"
          value={avgScore}
          detail="Calidad promedio de perfil"
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          title="Tasa de Conversion"
          value={conversion}
          detail="Postulacion a contratado"
        />
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Embudo de Contratacion" subtitle="Conversion por etapa">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
              <YAxis
                dataKey="stage"
                type="category"
                width={88}
                tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 10,
                }}
              />
              <Bar dataKey="total" fill="#1f4a8b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fuentes de Candidatos" subtitle="Distribucion por canal">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={sourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={88}
                paddingAngle={2}
              >
                {sourceData.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={SOURCE_COLORS[entry.name] ?? '#6b7280'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 10,
                }}
              />
              <Legend iconSize={10} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Score ATS por Vacante" subtitle="Promedio por posicion activa">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={scoreByVacancy}
              margin={{ bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--text-secondary))' }} angle={-28} textAnchor="end" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Score ATS']}
                contentStyle={{
                  background: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 10,
                }}
              />
              <Bar dataKey="score" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Entrevistas por Semana" subtitle="Ultimas 8 semanas">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={interviewsPerWeek}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 10,
                }}
              />
              <Line type="monotone" dataKey="entrevistas" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
        <ChartCard title="Vacantes Abiertas vs Cerradas" subtitle="Evolucion mensual">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="openGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1f4a8b" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#1f4a8b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="closedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--text-secondary))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 10,
                }}
              />
              <Legend iconSize={10} iconType="circle" />
              <Area type="monotone" dataKey="abiertas" stroke="#1f4a8b" fill="url(#openGradient)" name="Abiertas" />
              <Area type="monotone" dataKey="cerradas" stroke="#0f766e" fill="url(#closedGradient)" name="Cerradas" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <article className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
          <h3 className="text-sm font-semibold text-text-primary">Recomendaciones Ejecutivas</h3>
          <p className="mt-1 text-xs text-text-secondary">Acciones sugeridas para el proximo ciclo</p>
          <ul className="mt-4 space-y-3 text-sm text-text-primary">
            {recommendations.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-[var(--radius)] border border-warning/35 bg-warning/10 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="text-xs text-text-secondary">
                Sugerencia: generar este informe semanalmente para seguimiento de SLA de cobertura.
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-text-secondary">{summary}</p>
        </article>
      </section>
    </div>
  )
}
