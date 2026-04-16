'use client'

import * as React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from 'recharts'
import {
  Users,
  Clock,
  TrendingUp,
  Target,
  Download,
  ChevronDown,
  FileText,
} from 'lucide-react'
import { LocalStorageProvider } from '@/lib/providers/data-provider'
import type { Vacancy, Candidate, Application, Interview } from '@/types'

/* ─── helpers ────────────────────────────────────────────────── */
function getTenantId(): string {
  if (typeof window === 'undefined') return 'default'
  try {
    const raw = localStorage.getItem('ct_user')
    if (!raw) return 'default'
    return JSON.parse(raw).tenantId ?? 'default'
  } catch {
    return 'default'
  }
}

const STAGE_ORDER = ['Nuevas Vacantes', 'En Proceso', 'Entrevistas', 'Oferta Enviada', 'Contratado']

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: '#0A66C2',
  Portal: '#6366f1',
  Referido: '#10b981',
  Indeed: '#2164F3',
  Computrabajo: '#E8003D',
  ZonaJobs: '#FF6B00',
  Bumeran: '#0066CC',
  Manual: '#6b7280',
  WhatsApp: '#25D366',
}

type DateRange = 'month' | 'quarter' | 'year'

function getDateFrom(range: DateRange): Date {
  const now = new Date()
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  if (range === 'quarter') return new Date(now.getFullYear(), now.getMonth() - 2, 1)
  return new Date(now.getFullYear(), 0, 1)
}

/* ─── KpiCard ────────────────────────────────────────────────── */
function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ─── ChartCard ──────────────────────────────────────────────── */
function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  )
}

/* ─── PDF Export ─────────────────────────────────────────────── */
async function exportPDF(kpis: Record<string, string | number>, range: string) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageW = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(99, 102, 241)
  doc.rect(0, 0, pageW, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('ConectAr Talento', 15, 15)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Informe Ejecutivo de Reclutamiento', 15, 24)
  doc.setFontSize(9)
  doc.text(`Período: ${range} · Generado: ${new Date().toLocaleDateString('es-AR')}`, 15, 31)

  // KPIs
  doc.setTextColor(50, 50, 50)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Métricas Principales', 15, 50)

  const kpiList = Object.entries(kpis)
  let y = 60
  kpiList.forEach(([k, v], i) => {
    if (i > 0 && i % 2 === 0) y += 20
    const x = i % 2 === 0 ? 15 : pageW / 2 + 5
    doc.setFillColor(245, 247, 255)
    doc.rect(x, y - 6, 85, 16, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(k, x + 3, y)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(50, 50, 50)
    doc.text(String(v), x + 3, y + 8)
  })

  // Conclusion
  y += 40
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(50, 50, 50)
  doc.text('Análisis del Período', 15, y)
  y += 8
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  const text = `Este informe resume las métricas de reclutamiento del período seleccionado. Con ${kpis['Total Postulaciones']} postulaciones registradas y un score ATS promedio de ${kpis['Score ATS Promedio']}, el proceso de selección muestra un desempeño ${Number(String(kpis['Score ATS Promedio']).replace('%','')) > 70 ? 'excelente' : 'en desarrollo'}. La tasa de conversión del ${kpis['Tasa de Conversión']} indica oportunidades de mejora en las etapas intermedias del pipeline.`
  const lines = doc.splitTextToSize(text, pageW - 30)
  doc.text(lines, 15, y)

  // Footer
  doc.setFillColor(245, 245, 250)
  doc.rect(0, 280, pageW, 17, 'F')
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('ConectAr Talento · "El talento que buscás, conectado en un solo lugar."', pageW / 2, 290, { align: 'center' })

  doc.save(`informe-reclutamiento-${new Date().toISOString().slice(0, 10)}.pdf`)
}

/* ─── main page ──────────────────────────────────────────────── */
export default function ReportsPage() {
  const [range, setRange] = React.useState<DateRange>('month')
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [candidates, setCandidates] = React.useState<Candidate[]>([])
  const [applications, setApplications] = React.useState<Application[]>([])
  const [interviews, setInterviews] = React.useState<Interview[]>([])
  const [exporting, setExporting] = React.useState(false)
  const provider = React.useMemo(() => new LocalStorageProvider(), [])

  React.useEffect(() => {
    const tenantId = getTenantId()
    const vs = provider.getVacanciesSync().filter((v: Vacancy) => v.tenantId === tenantId)
    const cs = provider.getCandidatesSync().filter((c: Candidate) => c.tenantId === tenantId)
    const apps = provider.getApplicationsSync()
    const ivs = provider.getInterviewsSync()
    setVacancies(vs)
    setCandidates(cs)
    setApplications(apps)
    setInterviews(ivs)
  }, [provider])

  const dateFrom = getDateFrom(range)

  /* filter by range */
  const filteredApps = applications.filter((a) => new Date(a.appliedAt) >= dateFrom)
  const filteredIvs = interviews.filter((i) => new Date(i.scheduledAt) >= dateFrom)

  /* funnel */
  const funnelData = STAGE_ORDER.map((stage) => ({
    name: stage.replace('Nuevas ', '').replace('Con ', ''),
    candidatos: filteredApps.filter((a) => a.status === stage).length,
  }))

  /* sources */
  const sourceCounts: Record<string, number> = {}
  candidates.forEach((c) => {
    sourceCounts[c.source] = (sourceCounts[c.source] ?? 0) + 1
  })
  const sourceData = Object.entries(sourceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  /* ATS score by vacancy */
  const scoreByVacancy = vacancies.slice(0, 8).map((v) => {
    const vApps = filteredApps.filter((a) => a.vacancyId === v.id)
    const withScore = vApps.filter((a) => {
      const cand = candidates.find((c) => c.id === a.candidateId)
      return cand?.atsScore !== undefined
    })
    const avg =
      withScore.length > 0
        ? Math.round(
            withScore.reduce((sum, a) => {
              const cand = candidates.find((c) => c.id === a.candidateId)
              return sum + (cand?.atsScore ?? 0)
            }, 0) / withScore.length
          )
        : 0
    return { name: v.title.slice(0, 20), score: avg }
  })

  /* interviews per week (last 8 weeks) */
  const weeks: { week: string; entrevistas: number }[] = []
  for (let w = 7; w >= 0; w--) {
    const from = new Date()
    from.setDate(from.getDate() - w * 7)
    from.setHours(0, 0, 0, 0)
    const to = new Date(from)
    to.setDate(to.getDate() + 7)
    const count = filteredIvs.filter((i) => {
      const d = new Date(i.scheduledAt)
      return d >= from && d < to
    }).length
    weeks.push({
      week: `S${8 - w}`,
      entrevistas: count,
    })
  }

  /* vacancies open vs closed per month */
  const now = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = month.toLocaleDateString('es-AR', { month: 'short' })
    const open = vacancies.filter((v) => {
      const created = new Date(v.createdAt)
      return created <= month && (v.status !== 'Contratado')
    }).length
    const closed = vacancies.filter((v) => {
      const created = new Date(v.createdAt)
      return created <= month && v.status === 'Contratado'
    }).length
    return { mes: label, abiertas: open, cerradas: closed }
  })

  /* KPIs */
  const totalApps = filteredApps.length
  const hired = filteredApps.filter((a) => a.status === 'Contratado').length
  const conversionRate = totalApps > 0 ? `${Math.round((hired / totalApps) * 100)}%` : '0%'
  const scoresArr = candidates.map((c) => c.atsScore).filter((s): s is number => s !== undefined)
  const avgScore = scoresArr.length > 0 ? `${Math.round(scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length)}` : 'N/A'
  const avgDays =
    vacancies.filter((v) => v.status === 'Contratado').length > 0
      ? Math.round(
          vacancies
            .filter((v) => v.status === 'Contratado')
            .reduce((sum, v) => {
              const days = Math.floor((Date.now() - new Date(v.createdAt).getTime()) / 86400000)
              return sum + Math.min(days, 60)
            }, 0) / vacancies.filter((v) => v.status === 'Contratado').length
        )
      : 0

  const kpis = {
    'Total Postulaciones': totalApps,
    'Tiempo Promedio (días)': avgDays || 'N/D',
    'Score ATS Promedio': avgScore !== 'N/A' ? `${avgScore}%` : 'N/A',
    'Tasa de Conversión': conversionRate,
  }

  const rangeLabels: Record<DateRange, string> = {
    month: 'Este mes',
    quarter: 'Últimos 3 meses',
    year: 'Este año',
  }

  async function handleExport() {
    setExporting(true)
    try {
      await exportPDF(kpis, rangeLabels[range])
    } finally {
      setExporting(false)
    }
  }

  const isEmpty = totalApps === 0 && candidates.length === 0 && vacancies.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Informes de Reclutamiento</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Métricas y analytics del proceso de selección</p>
        </div>
        <div className="flex items-center gap-2">
          {/* date range */}
          <div className="relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as DateRange)}
              className="appearance-none bg-muted border border-border rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="month">Este mes</option>
              <option value="quarter">Últimos 3 meses</option>
              <option value="year">Este año</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Generando…' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {isEmpty && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm">
            <FileText className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Sin datos para este período</p>
              <p className="text-amber-700 mt-0.5">Agregá vacantes y candidatos para ver métricas reales. Los gráficos mostrarán datos de demostración.</p>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Users className="h-5 w-5 text-indigo-600" />}
            label="Total Postulaciones"
            value={totalApps || 142}
            sub={`${rangeLabels[range]}`}
            color="bg-indigo-100"
          />
          <KpiCard
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            label="Tiempo Promedio (días)"
            value={avgDays || 24}
            sub="hasta contratación"
            color="bg-amber-100"
          />
          <KpiCard
            icon={<Target className="h-5 w-5 text-purple-600" />}
            label="Score ATS Promedio"
            value={avgScore !== 'N/A' ? `${avgScore}%` : '74%'}
            sub="de todos los candidatos"
            color="bg-purple-100"
          />
          <KpiCard
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            label="Tasa de Conversión"
            value={conversionRate !== '0%' ? conversionRate : '8%'}
            sub="postulación → contratado"
            color="bg-green-100"
          />
        </div>

        {/* Row 1: Funnel + Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Embudo de Contratación">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData.some((d) => d.candidatos > 0) ? funnelData : [
                { name: 'Nuevas', candidatos: 45 },
                { name: 'En Proceso', candidatos: 28 },
                { name: 'Entrevistas', candidatos: 14 },
                { name: 'Oferta', candidatos: 6 },
                { name: 'Contratado', candidatos: 3 },
              ]} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="candidatos" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Fuentes de Candidatos">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sourceData.length > 0 ? sourceData : [
                    { name: 'LinkedIn', value: 42 },
                    { name: 'Portal', value: 28 },
                    { name: 'Referido', value: 18 },
                    { name: 'Indeed', value: 12 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(sourceData.length > 0 ? sourceData : [{ name: 'LinkedIn' }, { name: 'Portal' }, { name: 'Referido' }, { name: 'Indeed' }]).map(
                    (entry, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[entry.name] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                    )
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                />
                <Legend iconSize={10} iconType="circle" formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 2: Score by vacancy + Interviews per week */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Score ATS por Vacante">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={scoreByVacancy.some((d) => d.score > 0) ? scoreByVacancy : [
                  { name: 'Frontend Dev', score: 82 },
                  { name: 'Product Mgr', score: 76 },
                  { name: 'Data Analyst', score: 68 },
                  { name: 'DevOps', score: 88 },
                  { name: 'UX Designer', score: 71 },
                ]}
                margin={{ bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} angle={-30} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v ?? 0}%`, 'Score ATS']}
                />
                <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Entrevistas por Semana">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={weeks.some((w) => w.entrevistas > 0) ? weeks : weeks.map((w, i) => ({ ...w, entrevistas: [2, 4, 3, 6, 5, 7, 4, 8][i] }))}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="entrevistas" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 3: Open vs Closed */}
        <ChartCard title="Vacantes Abiertas vs Cerradas – Evolución mensual">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorAbiertas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCerradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              />
              <Legend iconSize={10} iconType="circle" formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
              <Area type="monotone" dataKey="abiertas" name="Abiertas" stroke="#6366f1" strokeWidth={2} fill="url(#colorAbiertas)" />
              <Area type="monotone" dataKey="cerradas" name="Cerradas" stroke="#10b981" strokeWidth={2} fill="url(#colorCerradas)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
