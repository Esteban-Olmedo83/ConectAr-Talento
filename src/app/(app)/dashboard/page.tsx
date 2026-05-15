'use client'

import * as React from 'react'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import type { Candidate, Application, VacancyStatus } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

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

const FUNNEL_STAGES: VacancyStatus[] = [
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
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 18,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  accentColor,
}: {
  label: string
  value: string | number
  sub?: string
  accentColor?: string
}) {
  return (
    <Card>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: accentColor ?? 'var(--accent)',
        }}
      />
      <p style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
        {label}
      </p>
      <p
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: 'var(--text)',
          fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{sub}</p>
      )}
    </Card>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function SkeletonBlock({ h, w }: { h: number; w?: string }) {
  return (
    <div
      style={{
        height: h,
        width: w ?? '100%',
        background: 'var(--surface2)',
        borderRadius: 8,
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  )
}

function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18 }}>
            <SkeletonBlock h={10} w="60%" />
            <div style={{ marginTop: 8 }}><SkeletonBlock h={28} w="40%" /></div>
          </div>
        ))}
      </div>
      <SkeletonBlock h={80} />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <SkeletonBlock h={200} />
        <SkeletonBlock h={200} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SkeletonBlock h={260} />
        <SkeletonBlock h={260} />
      </div>
    </div>
  )
}

// ─── SVG Donut ────────────────────────────────────────────────────────────────
interface DonutSlice {
  label: string
  count: number
  color: string
}

function DonutChart({ slices }: { slices: DonutSlice[] }) {
  const total = slices.reduce((s, sl) => s + sl.count, 0)
  if (total === 0) {
    return (
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={60} cy={60} r={44} fill="none" stroke="var(--border)" strokeWidth={16} />
      </svg>
    )
  }

  const r = 44
  const cx = 60
  const cy = 60
  const circ = 2 * Math.PI * r
  let offset = 0

  const circles = slices.map((sl, i) => {
    const pct = sl.count / total
    const dash = pct * circ
    const gap = circ - dash
    const circle = (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={sl.color}
        strokeWidth={16}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset * circ / total * r * 2 * Math.PI / circ + circ / 4}
        style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px` }}
      />
    )
    offset += sl.count
    return circle
  })

  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={16} />
      {circles}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={18} fontWeight={900} fill="var(--text)" fontFamily="var(--font-nunito, Nunito, sans-serif)">
        {total}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize={9} fill="var(--muted)">total</text>
    </svg>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
interface DashboardData {
  candidates: Candidate[]
  applications: Application[]
}

export default function DashboardPage() {
  const { user } = useUser()
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)

  const provider = React.useMemo(() => new SupabaseProvider(), [])

  React.useEffect(() => {
    // Wait for user to be resolved — if null, the user context hasn't loaded yet
    if (user === null) return

    async function load() {
      // Prefer tenantId from profile; fall back to user.id (matches seed route behaviour)
      const tenantId = user!.tenantId ?? user!.id
      const [candResult, appResult] = await Promise.all([
        provider.getCandidates(tenantId),
        provider.getApplications(),
      ])
      setData({
        candidates: candResult.data ?? [],
        applications: appResult.data ?? [],
      })
      setLoading(false)
    }
    load()
  }, [provider, user])

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <DashboardSkeleton />
      </div>
    )
  }

  const candidates = data?.candidates ?? []
  const applications = data?.applications ?? []

  // KPI computations
  const totalCandidates = candidates.length
  const aiAnalyzed = candidates.filter(c => (c.atsScore ?? 0) > 0).length
  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((s, c) => s + (c.atsScore ?? 0), 0) / candidates.length)
    : 0

  // Average days per stage
  const STAGE_INDEX: Record<VacancyStatus, number> = {
    'Nuevas Vacantes': 1,
    'En Proceso': 2,
    'Entrevistas': 3,
    'Oferta Enviada': 4,
    'Contratado': 5,
  }
  const avgDaysPerStage = (() => {
    const valid = applications.filter(a => {
      const stageIdx = STAGE_INDEX[a.status]
      if (stageIdx <= 1) return false
      const appliedAt = a.candidate?.appliedAt ?? a.appliedAt
      return !!appliedAt
    })
    if (valid.length === 0) return null
    const total = valid.reduce((sum, a) => {
      const appliedAt = a.candidate?.appliedAt ?? a.appliedAt
      const days = (Date.now() - new Date(appliedAt).getTime()) / 86400000
      return sum + days / STAGE_INDEX[a.status]
    }, 0)
    return total / valid.length
  })()

  // Stuck in Entrevistas for 5+ days
  const stuckCount = applications.filter(a => {
    if (a.status !== 'Entrevistas') return false
    const days = (Date.now() - new Date(a.updatedAt).getTime()) / 86400000
    return days >= 5
  }).length

  // Funnel by stage
  const funnelCounts: Record<VacancyStatus, number> = {
    'Nuevas Vacantes': 0,
    'En Proceso': 0,
    'Entrevistas': 0,
    'Oferta Enviada': 0,
    'Contratado': 0,
  }
  applications.forEach(a => {
    if (funnelCounts[a.status] !== undefined) funnelCounts[a.status]++
  })
  const maxFunnel = Math.max(...Object.values(funnelCounts), 1)

  // Source counts
  const sourceCounts: Record<string, number> = {}
  candidates.forEach(c => {
    sourceCounts[c.source] = (sourceCounts[c.source] ?? 0) + 1
  })
  const SOURCE_COLORS: Record<string, string> = {
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
  const donutSlices: DonutSlice[] = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      count,
      color: SOURCE_COLORS[label] ?? '#6b7280',
    }))

  // Top candidates by atsScore
  const topCandidates = [...candidates]
    .filter(c => (c.atsScore ?? 0) > 0)
    .sort((a, b) => (b.atsScore ?? 0) - (a.atsScore ?? 0))
    .slice(0, 5)

  // Stage for each top candidate: look up from applications
  const candidateStageMap = new Map<string, VacancyStatus>()
  applications.forEach(a => {
    if (!candidateStageMap.has(a.candidateId)) {
      candidateStageMap.set(a.candidateId, a.status)
    }
  })

  // Recent activity: last 5 applications (with candidate data)
  const recentApps = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5)

  const scoreColor = (s: number) =>
    s >= 85 ? 'var(--emerald)' : s >= 70 ? 'var(--accent-2)' : 'var(--gold)'

  const stageBadgeStyle = (stage: VacancyStatus): React.CSSProperties => ({
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: 99,
    background: `${STAGE_COLORS[stage]}22`,
    color: STAGE_COLORS[stage],
  })

  const relDays = (dateStr: string) => {
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (d === 0) return 'Hoy'
    if (d === 1) return 'Ayer'
    return `Hace ${d}d`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24 }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard
          label="Candidatos activos"
          value={totalCandidates}
          sub="en base de datos"
          accentColor="var(--accent)"
        />
        <KpiCard
          label="CVs analizados con IA"
          value={aiAnalyzed}
          sub={`${totalCandidates > 0 ? Math.round(aiAnalyzed / totalCandidates * 100) : 0}% del total`}
          accentColor="var(--accent-2)"
        />
        <KpiCard
          label="Score ATS promedio"
          value={avgScore > 0 ? `${avgScore}` : '—'}
          sub="sobre 100 puntos"
          accentColor="var(--emerald)"
        />
        <KpiCard
          label="Tiempo prom. por etapa"
          value={avgDaysPerStage !== null ? `${avgDaysPerStage.toFixed(1)}d` : '—'}
          sub="promedio histórico"
          accentColor="var(--gold)"
        />
      </div>

      {/* AI Insight */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--accent-soft) 0%, rgba(var(--accent-2-rgb),0.08) 100%)',
          border: '1px solid rgba(var(--accent-rgb),0.25)',
          borderRadius: 14,
          padding: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 18,
          }}
        >
          ✦
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Insight de IA</p>
          <p style={{ fontSize: 13, color: 'var(--muted2)' }}>
            {stuckCount > 0
              ? `${stuckCount} candidato${stuckCount > 1 ? 's' : ''} llevan 5+ días en etapa "Entrevistas" sin avance. Revisá su estado para acelerar el proceso.`
              : 'Todo al día — sin candidatos paralizados en ninguna etapa del pipeline.'}
          </p>
        </div>
      </div>

      {/* Funnel + Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

        {/* Funnel */}
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
            Funnel de reclutamiento
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FUNNEL_STAGES.map(stage => {
              const count = funnelCounts[stage]
              const pct = Math.round((count / maxFunnel) * 100)
              return (
                <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--muted2)', width: 120, flexShrink: 0 }}>{stage}</span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      background: 'var(--surface2)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: 4,
                        background: STAGE_COLORS[stage],
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: 'var(--text)',
                      fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
                      width: 24,
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Donut */}
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
            Fuentes de candidatos
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <DonutChart slices={donutSlices} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {donutSlices.slice(0, 5).map(sl => (
                <div key={sl.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: sl.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--muted2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sl.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-nunito, Nunito, sans-serif)' }}>{sl.count}</span>
                </div>
              ))}
              {donutSlices.length === 0 && (
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>Sin datos</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Top candidates + Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Top candidates */}
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
            Top candidatos por score ATS
          </p>
          {topCandidates.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Sin candidatos con score IA.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topCandidates.map(c => {
              const score = c.atsScore ?? 0
              const stage = candidateStageMap.get(c.id)
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: avatarGradient(c.fullName),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(c.fullName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.fullName}
                      </span>
                      {stage && <span style={stageBadgeStyle(stage)}>{stage}</span>}
                    </div>
                    {/* Score bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--surface2)', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${score}%`,
                            height: '100%',
                            borderRadius: 2,
                            background: scoreColor(score),
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 900,
                          color: scoreColor(score),
                          fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
                          width: 28,
                          textAlign: 'right',
                        }}
                      >
                        {score}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Recent activity */}
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
            Actividad reciente
          </p>
          {recentApps.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Sin actividad reciente.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentApps.map(a => {
              const cand = a.candidate
              const icon =
                a.status === 'Entrevistas' ? '📅' :
                a.status === 'Contratado' ? '✓' : '✦'
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: 'var(--surface2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cand?.fullName ?? 'Candidato'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={stageBadgeStyle(a.status)}>{a.status}</span>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{relDays(a.appliedAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
