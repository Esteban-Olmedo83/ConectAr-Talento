'use client'

import * as React from 'react'
import Link from 'next/link'
import { getPlanLimits } from '@/lib/plan-limits'
import type { MonitoringData } from '@/app/api/admin/monitoring/route'

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

const STATUS_COLORS: Record<string, string> = {
  active: '#34d399',
  trialing: '#60a5fa',
  past_due: '#fb923c',
  canceled: '#f87171',
  unpaid: '#f87171',
  incomplete: '#fbbf24',
  incomplete_expired: '#9ca3af',
}

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit === Infinity ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const color = pct >= 90 ? 'var(--coral)' : pct >= 70 ? 'var(--gold)' : 'var(--emerald)'

  if (limit === Infinity) {
    return (
      <span style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>Ilimitado</span>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--surface2)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap', width: 28, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: number | string
  sub?: string
  color?: string
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '14px 18px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: color ?? 'var(--accent)',
        }}
      />
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-nunito)', lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{sub}</p>
      )}
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminMonitoringPage() {
  const [tenants, setTenants] = React.useState<TenantRow[]>([])
  const [monitoring, setMonitoring] = React.useState<MonitoringData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = React.useState(new Date())

  async function load() {
    try {
      setLoading(true)
      const [tenantsRes, monitoringRes] = await Promise.all([
        fetch('/api/admin/tenants'),
        fetch('/api/admin/monitoring'),
      ])
      if (!tenantsRes.ok) throw new Error('Failed to load tenants')
      if (!monitoringRes.ok) throw new Error('Failed to load monitoring')

      const tenantsData = await tenantsRes.json() as { tenants: TenantRow[] }
      const monitoringData = await monitoringRes.json() as MonitoringData
      setTenants(tenantsData.tenants ?? [])
      setMonitoring(monitoringData)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Build lookup: userId → monitoring stats
  const tenantMonitoring = React.useMemo(() => {
    const map = new Map<string, MonitoringData['tenantStats'][0]>()
    for (const s of (monitoring?.tenantStats ?? [])) {
      map.set(s.userId, s)
    }
    return map
  }, [monitoring])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, height: 80 }} />
          ))}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
        <p style={{ color: 'var(--coral)', fontSize: 13 }}>Error: {error}</p>
      </div>
    )
  }

  const s = monitoring?.summary

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="IA hoy"
          value={s?.totalAiCallsToday ?? 0}
          sub="llamadas totales"
          color="var(--accent)"
        />
        <SummaryCard
          label="IA esta semana"
          value={s?.totalAiCallsWeek ?? 0}
          sub="últimos 7 días"
          color="var(--accent-2)"
        />
        <SummaryCard
          label="Suscripciones activas"
          value={s?.activeSubscriptions ?? 0}
          sub="Stripe activo/trialing"
          color="#34d399"
        />
        <SummaryCard
          label="Cancelando"
          value={s?.cancelingSubscriptions ?? 0}
          sub="al fin del período"
          color={s?.cancelingSubscriptions ? 'var(--coral)' : 'var(--muted)'}
        />
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--muted2)' }}>
          {tenants.length} tenants &mdash; actualizado {lastRefresh.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <button
          onClick={() => load()}
          style={{
            fontSize: 11,
            color: 'var(--accent-2)',
            background: 'var(--accent-soft)',
            border: 'none',
            borderRadius: 7,
            padding: '4px 10px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Actualizar
        </button>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 80px 90px 80px 1fr 1fr 1fr 120px',
            gap: 12,
            padding: '10px 16px',
            background: 'var(--surface2)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {['Tenant', 'Plan', 'Stripe', 'IA hoy', 'Candidatos', 'Vacantes', 'Clientes', 'Registro'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {h}
            </span>
          ))}
        </div>

        {tenants.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin tenants</p>
          </div>
        ) : (
          tenants.map(t => {
            const limits = getPlanLimits(t.plan)
            const planColor = PLAN_COLORS[t.plan] ?? '#9ca3af'
            const mon = tenantMonitoring.get(t.id)
            const stripeStatus = mon?.stripeStatus ?? null
            const statusColor = stripeStatus ? (STATUS_COLORS[stripeStatus] ?? '#9ca3af') : 'var(--muted)'
            return (
              <div
                key={t.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 80px 90px 80px 1fr 1fr 1fr 120px',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Tenant */}
                <Link href={`/admin/tenants/${t.id}`} style={{ textDecoration: 'none', minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.companyName || t.fullName || '—'}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.email}
                  </p>
                </Link>

                {/* Plan */}
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 99, background: `${planColor}22`, color: planColor, whiteSpace: 'nowrap', justifySelf: 'start' }}>
                  {PLAN_LABELS[t.plan] ?? t.plan}
                </span>

                {/* Stripe status */}
                <div>
                  {stripeStatus ? (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 7px', borderRadius: 99, background: `${statusColor}22`, color: statusColor, whiteSpace: 'nowrap' }}>
                      {stripeStatus}
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, color: 'var(--muted)', fontStyle: 'italic' }}>—</span>
                  )}
                  {mon?.cancelAtPeriodEnd && (
                    <p style={{ fontSize: 9, color: 'var(--coral)', marginTop: 2 }}>cancela pronto</p>
                  )}
                </div>

                {/* AI calls today */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: (mon?.aiCallsToday ?? 0) > 0 ? 'var(--accent-2)' : 'var(--muted)',
                    fontFamily: 'var(--font-nunito)',
                  }}>
                    {mon?.aiCallsToday ?? 0}
                  </span>
                </div>

                {/* Candidates */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                    {t.candidateCount}{limits.candidates !== Infinity ? ` / ${limits.candidates}` : ''}
                  </p>
                  <UsageBar used={t.candidateCount} limit={limits.candidates} />
                </div>

                {/* Vacancies */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                    {t.vacancyCount}{limits.vacancies !== Infinity ? ` / ${limits.vacancies}` : ''}
                  </p>
                  <UsageBar used={t.vacancyCount} limit={limits.vacancies} />
                </div>

                {/* Clients */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                    {t.clientCount}{limits.clients !== Infinity ? ` / ${limits.clients}` : ''}
                  </p>
                  <UsageBar used={t.clientCount} limit={limits.clients} />
                </div>

                {/* Date */}
                <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(t.createdAt)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
