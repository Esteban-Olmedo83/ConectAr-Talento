'use client'

import * as React from 'react'
import Link from 'next/link'

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

const PLANS = ['free', 'starter', 'pro', 'business', 'enterprise']

function PlanBadge({ plan }: { plan: string }) {
  const color = PLAN_COLORS[plan] ?? '#9ca3af'
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 99,
        background: `${color}22`,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {PLAN_LABELS[plan] ?? plan}
    </span>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = React.useState<TenantRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [updatingPlan, setUpdatingPlan] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState('')
  const [filterPlan, setFilterPlan] = React.useState('all')

  async function loadTenants() {
    try {
      const res = await fetch('/api/admin/tenants')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json() as { tenants: TenantRow[] }
      setTenants(data.tenants ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadTenants() }, [])

  const filteredTenants = React.useMemo(() => {
    const q = search.toLowerCase().trim()
    return tenants.filter(t => {
      const matchesSearch = !q ||
        (t.companyName ?? '').toLowerCase().includes(q) ||
        (t.fullName ?? '').toLowerCase().includes(q) ||
        (t.email ?? '').toLowerCase().includes(q)
      const matchesPlan = filterPlan === 'all' || t.plan === filterPlan
      return matchesSearch && matchesPlan
    })
  }, [tenants, search, filterPlan])

  async function handlePlanChange(tenantId: string, plan: string) {
    setUpdatingPlan(tenantId)
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, plan }),
      })
      if (!res.ok) throw new Error('Failed to update plan')
      setTenants(prev => prev.map(t => t.tenantId === tenantId ? { ...t, plan } : t))
    } catch {
      // silent
    } finally {
      setUpdatingPlan(null)
    }
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando tenants...</p>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Buscar por empresa, nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 9,
            color: 'var(--text)',
            fontSize: 13,
            padding: '8px 12px',
            outline: 'none',
          }}
        />
        <select
          value={filterPlan}
          onChange={e => setFilterPlan(e.target.value)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 9,
            color: 'var(--text)',
            fontSize: 12,
            fontWeight: 600,
            padding: '8px 12px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">Todos los planes</option>
          {PLANS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
        </select>
        <p style={{ fontSize: 13, color: 'var(--muted2)', whiteSpace: 'nowrap' }}>
          {filteredTenants.length} / {tenants.length} tenants
        </p>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto auto auto auto auto',
            gap: 12,
            padding: '10px 16px',
            background: 'var(--surface2)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {['Empresa', 'Email', 'Plan', 'Cand.', 'Vac.', 'Cli.', 'Registro'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Table rows */}
        {filteredTenants.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              {tenants.length === 0 ? 'Sin tenants registrados' : 'Sin resultados para la búsqueda'}
            </p>
          </div>
        ) : (
          filteredTenants.map(t => (
            <div
              key={t.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto auto auto auto auto',
                gap: 12,
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                alignItems: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Company */}
              <Link
                href={`/admin/tenants/${t.id}`}
                style={{ textDecoration: 'none', minWidth: 0 }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.companyName || t.fullName || '—'}
                </p>
              </Link>

              {/* Email */}
              <p style={{ fontSize: 12, color: 'var(--muted2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.email}
              </p>

              {/* Plan dropdown */}
              <select
                value={t.plan}
                disabled={updatingPlan === t.tenantId}
                onChange={e => handlePlanChange(t.tenantId, e.target.value)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 7,
                  color: 'var(--text)',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  outline: 'none',
                  opacity: updatingPlan === t.tenantId ? 0.5 : 1,
                }}
              >
                {PLANS.map(p => (
                  <option key={p} value={p}>{PLAN_LABELS[p]}</option>
                ))}
              </select>

              {/* Counts */}
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-nunito)', textAlign: 'right' }}>
                {t.candidateCount}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-nunito)', textAlign: 'right' }}>
                {t.vacancyCount}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-nunito)', textAlign: 'right' }}>
                {t.clientCount}
              </span>

              {/* Date */}
              <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                {formatDate(t.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
