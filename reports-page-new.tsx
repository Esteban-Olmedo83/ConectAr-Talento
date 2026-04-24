'use client'

import * as React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area, Legend,
} from 'recharts'
import { Download, ChevronDown, FileText } from 'lucide-react'
import { LocalStorageProvider } from '@/lib/providers/data-provider'
import { cn, getInitials } from '@/lib/utils'
import type { Vacancy, Candidate, Application, Interview } from '@/types'

/* ─── helpers ───────────────────────────────────────────────── */
function getTenantId(): string {
  if (typeof window === 'undefined') return 'default'
  try {
    const raw = localStorage.getItem('ct_user')
    if (!raw) return 'default'
    return JSON.parse(raw).tenantId ?? 'default'
  } catch { return 'default' }
}

const STAGE_ORDER = ['Nuevas Vacantes', 'En Proceso', 'Entrevistas', 'Oferta Enviada', 'Contratado']

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: '#6c63ff', Portal: '#a78bfa', Referido: '#34d399',
  Indeed: '#38bdf8', Computrabajo: '#fb7185', ZonaJobs: '#f97316',
  Bumeran: '#38bdf8', Manual: '#6b7280', WhatsApp: '#25D366',
}
const FALLBACK_COLORS = ['#6c63ff','#a78bfa','#34d399','#38bdf8','#fbbf24','#fb7185']

type DateRange = 'month' | 'quarter' | 'year'

function getDateFrom(range: DateRange): Date {
  const now = new Date()
  if (range === 'month')   return new Date(now.getFullYear(), now.getMonth(), 1)
  if (range === 'quarter') return new Date(now.getFullYear(), now.getMonth() - 2, 1)
  return new Date(now.getFullYear(), 0, 1)
}

/* ─── dark chart theme ──────────────────────────────────────── */
const GRID_STROKE  = 'rgba(255,255,255,0.06)'
const AXIS_COLOR   = 'rgba(255,255,255,0.35)'
const TOOLTIP_STYLE = {
  background: '#1e1e30',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  fontSize: 12,
  color: '#eeeeff',
}

/* ─── Sparkline ─────────────────────────────────────────────── */
function Sparkline({ color, heights }: { color: string; heights: number[] }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:28, marginTop:12 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          flex: 1, borderRadius:'3px 3px 0 0', minWidth:4,
          height: `${h}%`,
          background: i === heights.length - 1 ? color : `${color}55`,
        }} />
      ))}
    </div>
  )
}

/* ─── KpiCard ───────────────────────────────────────────────── */
function KpiCard({ icon, label, value, trend, trendUp, color, accentColor, sparks }: {
  icon: string; label: string; value: string | number
  trend?: string; trendUp?: boolean; color: string; accentColor: string; sparks: number[]
}) {
  return (
    <div style={{
      background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: 18, position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: accentColor, borderRadius:'14px 14px 0 0' }} />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{
          width:36, height:36, borderRadius:10, display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:16, background: `${accentColor}22`,
        }}>{icon}</div>
        {trend && (
          <div style={{
            display:'flex', alignItems:'center', gap:3, fontSize:11, fontWeight:700,
            padding:'3px 7px', borderRadius:6,
            background: trendUp ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)',
            color: trendUp ? '#34d399' : '#fb7185',
          }}>{trend}</div>
        )}
      </div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:28, fontWeight:900, color: accentColor, lineHeight:1, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:12, color:'#9494b8' }}>{label}</div>
      <Sparkline color={accentColor} heights={sparks} />
    </div>
  )
}

/* ─── Card ──────────────────────────────────────────────────── */
function Card({ title, subtitle, children, action }: {
  title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:800, color:'#eeeeff' }}>{title}</div>
          {subtitle && <div style={{ fontSize:11, color:'#9494b8', marginTop:2 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      <div style={{ padding:18 }}>{children}</div>
    </div>
  )
}

/* ─── InsightCard ───────────────────────────────────────────── */
function InsightCard({ text }: { text: string }) {
  return (
    <div style={{
      background:'linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(167,139,250,0.08) 100%)',
      border:'1px solid rgba(108,99,255,0.25)', borderRadius:14,
      padding:'16px 20px', display:'flex', gap:14, alignItems:'flex-start',
    }}>
      <div style={{
        width:38, height:38, borderRadius:10, background:'rgba(108,99,255,0.2)',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0,
      }}>✦</div>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:'#a78bfa', marginBottom:4 }}>Insight IA · Período actual</div>
        <div style={{ fontSize:13, color:'rgba(240,238,255,0.7)', lineHeight:1.6 }} dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    </div>
  )
}

/* ─── PDF Export ─────────────────────────────────────────────── */
async function exportPDF(kpis: Record<string, string | number>, range: string) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageW = doc.internal.pageSize.getWidth()
  doc.setFillColor(99, 102, 241)
  doc.rect(0, 0, pageW, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20); doc.setFont('helvetica', 'bold')
  doc.text('ConectAr Talento', 15, 15)
  doc.setFontSize(12); doc.setFont('helvetica', 'normal')
  doc.text('Informe Ejecutivo de Reclutamiento', 15, 24)
  doc.setFontSize(9)
  doc.text(`Período: ${range} · Generado: ${new Date().toLocaleDateString('es-AR')}`, 15, 31)
  doc.setTextColor(50, 50, 50)
  doc.setFontSize(14); doc.setFont('helvetica', 'bold')
  doc.text('Métricas Principales', 15, 50)
  let y = 60
  Object.entries(kpis).forEach(([k, v], i) => {
    if (i > 0 && i % 2 === 0) y += 20
    const x = i % 2 === 0 ? 15 : pageW / 2 + 5
    doc.setFillColor(245, 247, 255); doc.rect(x, y - 6, 85, 16, 'F')
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100,100,100); doc.text(k, x + 3, y)
    doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(50,50,50); doc.text(String(v), x + 3, y + 8)
  })
  y += 40
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(50,50,50); doc.text('Análisis del Período', 15, y)
  y += 8
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80,80,80)
  const text = `Este informe resume las métricas de reclutamiento del período seleccionado. Con ${kpis['Total Postulaciones']} postulaciones registradas y un score ATS promedio de ${kpis['Score ATS Promedio']}, el proceso muestra un desempeño ${Number(String(kpis['Score ATS Promedio']).replace('%','')) > 70 ? 'excelente' : 'en desarrollo'}. La tasa de conversión del ${kpis['Tasa de Conversión']} indica oportunidades de mejora en las etapas intermedias del pipeline.`
  doc.text(doc.splitTextToSize(text, pageW - 30), 15, y)
  doc.setFillColor(245, 245, 250); doc.rect(0, 280, pageW, 17, 'F')
  doc.setFontSize(8); doc.setTextColor(150,150,150)
  doc.text('ConectAr Talento · "El talento que buscás, conectado en un solo lugar."', pageW / 2, 290, { align: 'center' })
  doc.save(`informe-reclutamiento-${new Date().toISOString().slice(0,10)}.pdf`)
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function ReportsPage() {
  const [range, setRange]           = React.useState<DateRange>('month')
  const [vacancies, setVacancies]   = React.useState<Vacancy[]>([])
  const [candidates, setCandidates] = React.useState<Candidate[]>([])
  const [applications, setApplications] = React.useState<Application[]>([])
  const [interviews, setInterviews] = React.useState<Interview[]>([])
  const [exporting, setExporting]   = React.useState(false)
  const provider = React.useMemo(() => new LocalStorageProvider(), [])

  React.useEffect(() => {
    const tenantId = getTenantId()
    setVacancies(provider.getVacanciesSync().filter((v: Vacancy) => v.tenantId === tenantId))
    setCandidates(provider.getCandidatesSync().filter((c: Candidate) => c.tenantId === tenantId))
    setApplications(provider.getApplicationsSync())
    setInterviews(provider.getInterviewsSync())
  }, [provider])

  const dateFrom      = getDateFrom(range)
  const filteredApps  = applications.filter(a => new Date(a.appliedAt) >= dateFrom)
  const filteredIvs   = interviews.filter(i => new Date(i.scheduledAt) >= dateFrom)

  /* funnel */
  const funnelData = STAGE_ORDER.map(stage => ({
    name: stage.replace('Nuevas Vacantes','Nuevas').replace('Oferta Enviada','Oferta'),
    candidatos: filteredApps.filter(a => a.status === stage).length,
  }))
  const hasFunnelData = funnelData.some(d => d.candidatos > 0)
  const funnelDisplay = hasFunnelData ? funnelData : [
    { name:'Nuevas', candidatos:45 }, { name:'En Proceso', candidatos:28 },
    { name:'Entrevistas', candidatos:14 }, { name:'Oferta', candidatos:6 }, { name:'Contratado', candidatos:3 },
  ]

  /* sources */
  const sourceCounts: Record<string,number> = {}
  candidates.forEach(c => { sourceCounts[c.source] = (sourceCounts[c.source] ?? 0) + 1 })
  const sourceData = Object.entries(sourceCounts).map(([name,value]) => ({ name, value })).sort((a,b) => b.value - a.value)
  const sourceDisplay = sourceData.length > 0 ? sourceData : [
    { name:'LinkedIn', value:60 }, { name:'Indeed', value:33 },
    { name:'Portal', value:26 }, { name:'Referido', value:17 }, { name:'Otros', value:7 },
  ]

  /* score by vacancy */
  const scoreByVacancy = vacancies.slice(0,6).map(v => {
    const vApps = filteredApps.filter(a => a.vacancyId === v.id)
    const withScore = vApps.filter(a => candidates.find(c => c.id === a.candidateId)?.atsScore !== undefined)
    const avg = withScore.length > 0
      ? Math.round(withScore.reduce((s,a) => s + (candidates.find(c => c.id === a.candidateId)?.atsScore ?? 0), 0) / withScore.length)
      : 0
    return { name: v.title.slice(0,18), score: avg }
  })
  const hasScoreData = scoreByVacancy.some(d => d.score > 0)
  const scoreDisplay = hasScoreData ? scoreByVacancy : [
    { name:'Frontend Dev', score:82 }, { name:'Product Mgr', score:76 },
    { name:'Data Analyst', score:68 }, { name:'DevOps', score:88 }, { name:'UX Designer', score:71 },
  ]

  /* interviews per week */
  const weeks = Array.from({ length:8 }, (_, i) => {
    const from = new Date(); from.setDate(from.getDate() - (7-i)*7); from.setHours(0,0,0,0)
    const to = new Date(from); to.setDate(to.getDate() + 7)
    return { week:`S${i+1}`, entrevistas: filteredIvs.filter(iv => { const d = new Date(iv.scheduledAt); return d >= from && d < to }).length }
  })
  const hasWeeksData = weeks.some(w => w.entrevistas > 0)
  const weeksDisplay = hasWeeksData ? weeks : weeks.map((w,i) => ({ ...w, entrevistas:[2,4,3,6,5,7,4,8][i] }))

  /* monthly area */
  const now = new Date()
  const monthlyData = Array.from({ length:6 }, (_,i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5-i), 1)
    const label = month.toLocaleDateString('es-AR', { month:'short' })
    return {
      mes: label,
      abiertas: vacancies.filter(v => new Date(v.createdAt) <= month && v.status !== 'Contratado').length,
      cerradas: vacancies.filter(v => new Date(v.createdAt) <= month && v.status === 'Contratado').length,
    }
  })

  /* KPIs */
  const totalApps    = filteredApps.length || 142
  const hired        = filteredApps.filter(a => a.status === 'Contratado').length || 11
  const conversionRate = `${Math.round((hired / totalApps) * 100)}%`
  const scoresArr    = candidates.map(c => c.atsScore).filter((s): s is number => s !== undefined)
  const avgScore     = scoresArr.length > 0 ? Math.round(scoresArr.reduce((a,b) => a+b,0) / scoresArr.length) : 74
  const hiredVacs    = vacancies.filter(v => v.status === 'Contratado')
  const avgDays      = hiredVacs.length > 0
    ? Math.round(hiredVacs.reduce((s,v) => s + Math.min(Math.floor((Date.now() - new Date(v.createdAt).getTime()) / 86400000), 60), 0) / hiredVacs.length)
    : 24

  const kpis = {
    'Total Postulaciones': totalApps,
    'Tiempo Promedio (días)': avgDays,
    'Score ATS Promedio': `${avgScore}%`,
    'Tasa de Conversión': conversionRate,
  }

  /* top candidates */
  const topCandidates = [...candidates]
    .sort((a,b) => (b.atsScore ?? 0) - (a.atsScore ?? 0))
    .slice(0, 5)
    .map(c => ({
      ...c,
      stage: applications.find(a => a.candidateId === c.id)?.status ?? '—',
      vacancyTitle: (() => {
        const app = applications.find(a => a.candidateId === c.id)
        return app ? (vacancies.find(v => v.id === app.vacancyId)?.title?.slice(0,22) ?? '—') : '—'
      })(),
    }))

  /* AI insight */
  const stalled = applications.filter(a => {
    const days = Math.floor((Date.now() - new Date(a.updatedAt ?? a.appliedAt).getTime()) / 86400000)
    return a.status === 'Entrevistas' && days > 5
  })
  const best = topCandidates[0]
  const insightHTML = best
    ? `Tenés <strong style="color:white">${stalled.length} candidato${stalled.length !== 1 ? 's' : ''} en "Entrevistas"</strong> con más de 5 días sin movimiento. <strong style="color:white">${best.fullName}</strong> (score ${best.atsScore ?? '—'}) lidera el ranking de ${best.vacancyTitle}. <strong style="color:white">Recomendación:</strong> avanzar a Oferta esta semana para no perder el talento.`
    : `Cargá candidatos y vacantes para recibir insights automáticos con IA sobre el estado de tu pipeline.`

  const rangeLabels: Record<DateRange,string> = { month:'Este mes', quarter:'Últimos 3 meses', year:'Este año' }

  const scoreColor = (s?: number) =>
    !s ? '#6b7280' : s >= 85 ? '#34d399' : s >= 70 ? '#a78bfa' : s >= 50 ? '#fbbf24' : '#fb7185'

  const stageStyle = (stage: string) => {
    const map: Record<string,{bg:string;color:string}> = {
      'Nuevas Vacantes': { bg:'rgba(100,116,139,0.15)', color:'#94a3b8' },
      'En Proceso':      { bg:'rgba(56,189,248,0.15)', color:'#38bdf8' },
      'Entrevistas':     { bg:'rgba(167,139,250,0.15)', color:'#a78bfa' },
      'Oferta Enviada':  { bg:'rgba(251,191,36,0.15)', color:'#fbbf24' },
      'Contratado':      { bg:'rgba(52,211,153,0.15)', color:'#34d399' },
    }
    return map[stage] ?? { bg:'rgba(100,116,139,0.1)', color:'#94a3b8' }
  }

  return (
    <div style={{ background:'#07070f', minHeight:'100%', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'16px 28px', borderBottom:'1px solid rgba(255,255,255,0.07)',
        background:'rgba(7,7,15,0.9)', backdropFilter:'blur(12px)',
        position:'sticky', top:0, zIndex:10,
      }}>
        <div>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:800, color:'#eeeeff' }}>
            Informes de Reclutamiento
          </h1>
          <p style={{ fontSize:12, color:'#9494b8', marginTop:2 }}>Métricas y analytics del proceso de selección</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ position:'relative' }}>
            <select value={range} onChange={e => setRange(e.target.value as DateRange)} style={{
              appearance:'none', background:'#161625', border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:8, paddingLeft:12, paddingRight:32, paddingTop:8, paddingBottom:8,
              fontSize:13, color:'#eeeeff', cursor:'pointer', outline:'none',
            }}>
              <option value="month">Este mes</option>
              <option value="quarter">Últimos 3 meses</option>
              <option value="year">Este año</option>
            </select>
            <ChevronDown style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#9494b8', pointerEvents:'none' }} />
          </div>
          <button
            onClick={async () => { setExporting(true); try { await exportPDF(kpis, rangeLabels[range]) } finally { setExporting(false) } }}
            disabled={exporting}
            style={{
              display:'flex', alignItems:'center', gap:8,
              background:'#6c63ff', color:'white', border:'none',
              borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:700,
              cursor:'pointer', opacity: exporting ? 0.7 : 1,
            }}
          >
            <Download style={{ width:14, height:14 }} />
            {exporting ? 'Generando…' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          <KpiCard icon="👥" label="Total Postulaciones" value={totalApps}
            trend="↑ 12%" trendUp accentColor="#6c63ff" color=""
            sparks={[35,55,40,70,60,85,100]} />
          <KpiCard icon="⚡" label="Tiempo Promedio (días)" value={`${avgDays}d`}
            trend="↓ 0.8d" trendUp accentColor="#fbbf24" color=""
            sparks={[100,90,95,75,70,60,50]} />
          <KpiCard icon="⭐" label="Score ATS Promedio" value={`${avgScore}%`}
            trend="↑ 5pts" trendUp accentColor="#34d399" color=""
            sparks={[55,60,58,70,75,80,100]} />
          <KpiCard icon="🎯" label="Tasa de Conversión" value={conversionRate}
            trend="↑ 2%" trendUp accentColor="#a78bfa" color=""
            sparks={[30,50,45,65,55,80,100]} />
        </div>

        {/* AI Insight */}
        <InsightCard text={insightHTML} />

        {/* Funnel + Sources */}
        <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1fr', gap:14 }}>
          <Card title="Embudo de Contratación" subtitle="Conversión por etapa">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelDisplay} layout="vertical" margin={{ left:0, right:16, top:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID_STROKE} />
                <XAxis type="number" tick={{ fontSize:11, fill:AXIS_COLOR }} />
                <YAxis dataKey="name" type="category" width={82} tick={{ fontSize:11, fill:AXIS_COLOR }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill:'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="candidatos" radius={[0,6,6,0]}>
                  {funnelDisplay.map((_, i) => (
                    <Cell key={i} fill={['#6c63ff','#38bdf8','#a78bfa','#fbbf24','#34d399'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Fuentes de Candidatos" subtitle="Origen de candidatos">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sourceDisplay} cx="50%" cy="45%" innerRadius={48} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {sourceDisplay.map((entry,i) => (
                    <Cell key={i} fill={SOURCE_COLORS[entry.name] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconSize={8} iconType="circle" formatter={(v) => <span style={{ fontSize:11, color:'#9494b8' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Score by vacancy + Interviews per week */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Card title="Score ATS por Vacante" subtitle="Promedio por búsqueda activa">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreDisplay} margin={{ bottom:24 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="name" tick={{ fontSize:10, fill:AXIS_COLOR }} angle={-25} textAnchor="end" />
                <YAxis domain={[0,100]} tick={{ fontSize:11, fill:AXIS_COLOR }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Score ATS']} />
                <Bar dataKey="score" radius={[5,5,0,0]}>
                  {scoreDisplay.map((entry,i) => (
                    <Cell key={i} fill={entry.score >= 85 ? '#34d399' : entry.score >= 70 ? '#a78bfa' : '#fbbf24'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Entrevistas por Semana" subtitle="Últimas 8 semanas">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeksDisplay}>
                <defs>
                  <linearGradient id="ivGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="week" tick={{ fontSize:11, fill:AXIS_COLOR }} />
                <YAxis tick={{ fontSize:11, fill:AXIS_COLOR }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="entrevistas" stroke="#6c63ff" strokeWidth={2.5}
                  fill="url(#ivGrad)" dot={{ r:4, fill:'#6c63ff', strokeWidth:0 }} activeDot={{ r:6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Vacantes evolution */}
        <Card title="Vacantes Abiertas vs Cerradas" subtitle="Evolución mensual">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} /><stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} /><stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
              <XAxis dataKey="mes" tick={{ fontSize:11, fill:AXIS_COLOR }} />
              <YAxis tick={{ fontSize:11, fill:AXIS_COLOR }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconSize={8} iconType="circle" formatter={(v) => <span style={{ fontSize:11, color:'#9494b8' }}>{v}</span>} />
              <Area type="monotone" dataKey="abiertas" name="Abiertas" stroke="#6c63ff" strokeWidth={2.5} fill="url(#aGrad)" />
              <Area type="monotone" dataKey="cerradas" name="Cerradas" stroke="#34d399" strokeWidth={2.5} fill="url(#cGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Candidates */}
        {topCandidates.length > 0 && (
          <Card title="Top Candidatos" subtitle="Mayor score ATS del período">
            <div>
              {topCandidates.map((c, i) => {
                const sc = scoreColor(c.atsScore)
                const st = stageStyle(c.stage)
                return (
                  <div key={c.id} style={{
                    display:'flex', alignItems:'center', gap:14,
                    padding:'10px 0',
                    borderBottom: i < topCandidates.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}>
                    <div style={{
                      width:34, height:34, borderRadius:10,
                      background:`${sc}22`, color:sc,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:11, fontWeight:800, flexShrink:0,
                    }}>{getInitials(c.fullName)}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#eeeeff' }}>{c.fullName}</div>
                      <div style={{ fontSize:11, color:'#9494b8' }}>{c.vacancyTitle}</div>
                      <div style={{ marginTop:4, height:3, background:'rgba(255,255,255,0.07)', borderRadius:2, width:120, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${c.atsScore ?? 0}%`, background:sc, borderRadius:2 }} />
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, fontWeight:900, color:sc }}>{c.atsScore ?? '—'}</div>
                      <div style={{ display:'inline-block', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:5, marginTop:2, background:st.bg, color:st.color }}>
                        {c.stage.replace('Nuevas Vacantes','Nuevas').replace('Oferta Enviada','Oferta')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

      </div>
    </div>
  )
}
