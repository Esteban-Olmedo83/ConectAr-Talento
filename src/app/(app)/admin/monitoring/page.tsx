'use client'

import * as React from 'react'
import Link from 'next/link'
import { getPlanLimits } from '@/lib/plan-limits'

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminMonitoringPage() {
  const [tenants, setTenants] = React.useState<TenantRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/tenants')
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json() as { tenants: TenantRow[] }
        setTenants(data.tenants ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando datos...</p>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--muted2)' }}>
        Monitoreo de uso por tenant &mdash; {tenants.length} tenants activos
      </p>

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
            gridTemplateColumns: '1.5fr 80px 1fr 1fr 1fr 120px',
            gap: 12,
            padding: '10px 16px',
            background: 'var(--surface2)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {['Tenant', 'Plan', 'Candidatos', 'Vacantes', 'Clientes', 'Registro'].map(h => (
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
            return (
              <div
                key={t.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 80px 1fr 1fr 1fr 120px',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Tenant name */}
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
