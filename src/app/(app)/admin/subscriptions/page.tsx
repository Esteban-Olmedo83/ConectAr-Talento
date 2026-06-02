'use client'

import * as React from 'react'
import Link from 'next/link'

interface Subscription {
  id: string
  tenant_id: string
  plan: string
  status: string
  stripe_status: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  cancel_at_period_end: boolean
  stripe_current_period_end: string | null
  trial_ends_at: string | null
  canceled_at: string | null
  created_at: string
  tenantName: string
  discount_pct: number
  payment_provider: string | null
}

interface Summary {
  total: number
  active: number
  trialing: number
  pastDue: number
  canceled: number
  cancelingAtPeriodEnd: number
}

const PLAN_COLORS: Record<string, string> = {
  free: '#9ca3af', starter: '#60a5fa', pro: '#a78bfa', business: '#fb923c', enterprise: '#fbbf24',
}
const PLAN_LABELS: Record<string, string> = {
  free: 'Free', starter: 'Starter', pro: 'Pro', business: 'Business', enterprise: 'Enterprise',
}
const STATUS_COLORS: Record<string, string> = {
  active: 'var(--emerald)', trialing: 'var(--accent-2)', past_due: 'var(--coral)',
  canceled: '#9ca3af', paused: 'var(--gold)',
}
const PLANS = ['free', 'starter', 'pro', 'business', 'enterprise']

function formatDate(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, ...style }}>
      {children}
    </div>
  )
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = React.useState<Subscription[]>([])
  const [summary, setSummary] = React.useState<Summary | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)
  const [actionMsg, setActionMsg] = React.useState<{ id: string; msg: string; ok: boolean } | null>(null)

  const [planFilter, setPlanFilter] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [editingPlan, setEditingPlan] = React.useState<string | null>(null)
  const [editPlanValue, setEditPlanValue] = React.useState('')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/subscriptions')
      if (!res.ok) throw new Error('Error al cargar suscripciones')
      const data = await res.json() as { subscriptions: Subscription[]; summary: Summary }
      setSubs(data.subscriptions ?? [])
      setSummary(data.summary ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [])

  async function doAction(tenantId: string, action: 'suspend' | 'reactivate' | 'cancel') {
    setActionLoading(tenantId + action)
    setActionMsg(null)
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, action }),
      })
      if (!res.ok) throw new Error('Error al ejecutar acción')
      setActionMsg({ id: tenantId, msg: action === 'suspend' ? 'Suspendido' : action === 'reactivate' ? 'Reactivado' : 'Cancelado', ok: true })
      await load()
    } catch (e) {
      setActionMsg({ id: tenantId, msg: e instanceof Error ? e.message : 'Error', ok: false })
    } finally {
      setActionLoading(null)
    }
  }

  async function savePlan(tenantId: string) {
    setActionLoading(tenantId + 'plan')
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, plan: editPlanValue }),
      })
      if (!res.ok) throw new Error('Error')
      setEditingPlan(null)
      setActionMsg({ id: tenantId, msg: 'Plan actualizado', ok: true })
      await load()
    } catch {
      setActionMsg({ id: tenantId, msg: 'Error al actualizar plan', ok: false })
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = subs.filter(s => {
    if (planFilter && s.plan !== planFilter) return false
    if (statusFilter && (s.stripe_status ?? s.status) !== statusFilter) return false
    if (search && !s.tenantName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: summary?.total ?? 0, color: '#9ca3af' },
          { label: 'Activas', value: summary?.active ?? 0, color: 'var(--emerald)' },
          { label: 'Trial', value: summary?.trialing ?? 0, color: 'var(--accent-2)' },
          { label: 'Vencidas', value: summary?.pastDue ?? 0, color: 'var(--coral)' },
          { label: 'Canceladas', value: summary?.canceled ?? 0, color: '#9ca3af' },
          { label: 'Cancelando', value: summary?.cancelingAtPeriodEnd ?? 0, color: 'var(--gold)' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: card.color }} />
            <p style={{ fontSize: 10, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 4 }}>{card.label}</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-nunito)', lineHeight: 1.1 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Table */}
      <Card>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>
            Suscripciones ({filtered.length})
          </p>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar tenant..."
            style={{ flex: 1, minWidth: 160, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, padding: '6px 10px', outline: 'none' }}
          />
          <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, padding: '6px 10px', outline: 'none' }}>
            <option value="">Todos los planes</option>
            {PLANS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, padding: '6px 10px', outline: 'none' }}>
            <option value="">Todos los estados</option>
            <option value="active">Activa</option>
            <option value="trialing">Trial</option>
            <option value="past_due">Vencida</option>
            <option value="canceled">Cancelada</option>
          </select>
          <button onClick={load}
            style={{ padding: '6px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, cursor: 'pointer' }}>
            Actualizar
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando...</p>
        ) : error ? (
          <p style={{ color: 'var(--coral)', fontSize: 13 }}>{error}</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin suscripciones</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Tenant', 'Plan', 'Estado Stripe', 'Fin período', 'Trial hasta', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const stripeStatus = s.stripe_status ?? s.status
                  const statusColor = STATUS_COLORS[stripeStatus] ?? '#9ca3af'
                  const planColor = PLAN_COLORS[s.plan] ?? '#9ca3af'
                  const isBusy = (key: string) => actionLoading === s.tenant_id + key
                  return (
                    <tr
                      key={s.id}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      <td style={{ padding: '8px 10px' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text)' }}>{s.tenantName}</p>
                          {s.cancel_at_period_end && (
                            <span style={{ fontSize: 10, color: 'var(--gold)' }}>⚠ cancela al vencer</span>
                          )}
                          {actionMsg?.id === s.tenant_id && (
                            <span style={{ fontSize: 10, color: actionMsg.ok ? 'var(--emerald)' : 'var(--coral)', marginLeft: 6 }}>
                              {actionMsg.msg}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '8px 10px' }}>
                        {editingPlan === s.tenant_id ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <select
                              value={editPlanValue}
                              onChange={e => setEditPlanValue(e.target.value)}
                              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 11, padding: '3px 6px', outline: 'none' }}
                            >
                              {PLANS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
                            </select>
                            <button
                              onClick={() => savePlan(s.tenant_id)}
                              disabled={isBusy('plan')}
                              style={{ fontSize: 10, padding: '3px 8px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                            >
                              {isBusy('plan') ? '...' : 'OK'}
                            </button>
                            <button
                              onClick={() => setEditingPlan(null)}
                              style={{ fontSize: 10, padding: '3px 8px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() => { setEditingPlan(s.tenant_id); setEditPlanValue(s.plan) }}
                            style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: `${planColor}22`, color: planColor, cursor: 'pointer' }}
                            title="Click para cambiar plan"
                          >
                            {PLAN_LABELS[s.plan] ?? s.plan}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: `${statusColor}22`, color: statusColor }}>
                          {stripeStatus ?? '—'}
                        </span>
                      </td>

                      <td style={{ padding: '8px 10px', color: 'var(--muted2)', whiteSpace: 'nowrap' }}>
                        {formatDate(s.stripe_current_period_end)}
                      </td>
                      <td style={{ padding: '8px 10px', color: 'var(--muted2)', whiteSpace: 'nowrap' }}>
                        {formatDate(s.trial_ends_at)}
                      </td>

                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <Link
                            href={`/admin/tenants/${s.tenant_id}`}
                            style={{ fontSize: 10, padding: '3px 8px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--accent-2)', textDecoration: 'none' }}
                          >
                            Ver
                          </Link>
                          {stripeStatus !== 'paused' && stripeStatus !== 'canceled' && (
                            <button
                              onClick={() => doAction(s.tenant_id, 'suspend')}
                              disabled={isBusy('suspend')}
                              style={{ fontSize: 10, padding: '3px 8px', background: 'rgba(248,113,113,0.1)', border: '1px solid var(--coral)', borderRadius: 6, color: 'var(--coral)', cursor: 'pointer' }}
                            >
                              {isBusy('suspend') ? '...' : 'Suspender'}
                            </button>
                          )}
                          {stripeStatus === 'paused' && (
                            <button
                              onClick={() => doAction(s.tenant_id, 'reactivate')}
                              disabled={isBusy('reactivate')}
                              style={{ fontSize: 10, padding: '3px 8px', background: 'rgba(52,211,153,0.1)', border: '1px solid var(--emerald)', borderRadius: 6, color: 'var(--emerald)', cursor: 'pointer' }}
                            >
                              {isBusy('reactivate') ? '...' : 'Reactivar'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
