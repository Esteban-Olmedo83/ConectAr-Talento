'use client'

import * as React from 'react'
import Link from 'next/link'

interface StatsData {
  totalTenants: number
  totalCandidates: number
  totalVacancies: number
  totalClients: number
  totalInterviews: number
  planCounts: Record<string, number>
}

interface TenantRow {
  id: string
  email: string
  fullName: string
  companyName: string
  plan: string
  tenantId: string
  createdAt: string
  candidateCount: number
  vacancyCount: number
  clientCount: number
}

// ─── Card ─────────────────────────────────────────────────────────────────────
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

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, accentColor }: { label: string; value: number; accentColor?: string }) {
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
      <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-nunito)', lineHeight: 1.1 }}>
        {value}
      </p>
    </Card>
  )
}

const PLAN_COLORS: Record<string, string> = {
  free: '#9ca3af',
  starter: '#60a5fa',
  pro: '#a78bfa',
  business: '#fb923c',
  enterprise: '#fbbf24',
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminOverviewPage() {
  const [stats, setStats] = React.useState<StatsData | null>(null)
  const [tenants, setTenants] = React.useState<TenantRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function load() {
      try {
        const [statsRes, tenantsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/tenants'),
        ])
        if (!statsRes.ok) throw new Error('Failed to load stats')
        if (!tenantsRes.ok) throw new Error('Failed to load tenants')

        const statsData = await statsRes.json() as StatsData
        const tenantsData = await tenantsRes.json() as { tenants: TenantRow[] }

        setStats(statsData)
        setTenants(tenantsData.tenants ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, height: 90 }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
        <p style={{ color: 'var(--coral)', fontSize: 14 }}>Error: {error}</p>
      </div>
    )
  }

  if (!stats) return null

  const planEntries = Object.entries(stats.planCounts).sort((a, b) => b[1] - a[1])
  const maxPlanCount = Math.max(...planEntries.map(([, v]) => v), 1)

  const recentTenants = [...tenants]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const quickLinks = [
    { label: 'Gestionar Cuentas', href: '/admin/tenants', description: 'Ver y editar planes de clientes' },
    { label: 'Monitoreo', href: '/admin/monitoring', description: 'Uso por tenant y límites de plan' },
    { label: 'Changelog', href: '/admin/changelog', description: 'Publicar novedades del sistema' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Cuentas" value={stats.totalTenants} accentColor="var(--accent)" />
        <KpiCard label="Candidatos" value={stats.totalCandidates} accentColor="var(--accent-2)" />
        <KpiCard label="Vacantes" value={stats.totalVacancies} accentColor="var(--emerald)" />
        <KpiCard label="Clientes" value={stats.totalClients} accentColor="var(--gold)" />
        <KpiCard label="Entrevistas" value={stats.totalInterviews} accentColor="#a78bfa" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Plans distribution */}
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Cuentas por plan</p>
          {planEntries.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Sin datos</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {planEntries.map(([plan, count]) => {
                const pct = Math.round((count / maxPlanCount) * 100)
                const color = PLAN_COLORS[plan] ?? '#9ca3af'
                return (
                  <div key={plan} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted2)', width: 80, flexShrink: 0 }}>{PLAN_LABELS[plan] ?? plan}</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--surface2)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: color, transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-nunito)', width: 24, textAlign: 'right', flexShrink: 0 }}>
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Quick links */}
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Accesos rápidos</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quickLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  background: 'var(--surface2)',
                  borderRadius: 10,
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-soft)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface2)')}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{link.label}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{link.description}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent tenants */}
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Últimos registros</p>
          {recentTenants.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Sin cuentas</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentTenants.map(t => (
                <Link
                  key={t.id}
                  href={`/admin/tenants/${t.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {(t.companyName || t.fullName || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.companyName || t.fullName || t.email}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--muted)' }}>{formatDate(t.createdAt)}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: 99,
                      background: `${PLAN_COLORS[t.plan] ?? '#9ca3af'}22`,
                      color: PLAN_COLORS[t.plan] ?? '#9ca3af',
                      flexShrink: 0,
                    }}
                  >
                    {PLAN_LABELS[t.plan] ?? t.plan}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
