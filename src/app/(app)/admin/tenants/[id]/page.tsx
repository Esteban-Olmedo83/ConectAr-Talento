'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// These interfaces match the actual admin_get_tenant_detail RPC output exactly
interface TenantProfile {
  id: string
  tenantId: string
  email: string
  fullName: string
  companyName: string
  plan: string
  createdAt: string
}

interface ClientRow {
  id: string
  name: string
  industry?: string
  contact_email?: string
  created_at: string
}

interface VacancyRow {
  id: string
  title: string
  status: string
  createdAt: string
  applicationCount: number
}

interface CandidateStats {
  total: number
  unassigned: number
}

interface BillingRow {
  id: string
  tenant_id: string
  plan: string
  status: string
  billing_email?: string
  billing_name?: string
  notes?: string
  trial_ends_at?: string
  current_period_ends_at?: string
}

// RPC returns: { profile, clients, vacancies, candidateStats, billing }
interface TenantDetail {
  profile: TenantProfile
  clients: ClientRow[]
  vacancies: VacancyRow[]
  candidateStats: CandidateStats
  billing: BillingRow | null
}

const PLAN_COLORS: Record<string, string> = {
  free: '#9ca3af',
  starter: '#60a5fa',
  pro: '#a78bfa',
  business: '#fb923c',
  enterprise: '#fbbf24',
}
const PLAN_LABELS: Record<string, string> = {
  free: 'Free', starter: 'Starter', pro: 'Pro', business: 'Business', enterprise: 'Enterprise',
}
const PLANS = ['free', 'starter', 'pro', 'business', 'enterprise']
const BILLING_STATUSES = ['active', 'trial', 'suspended', 'cancelled']

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, ...style }}>
      {children}
    </div>
  )
}

export default function TenantDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [data, setData] = React.useState<TenantDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<'clientes' | 'vacantes' | 'candidatos' | 'facturacion'>('clientes')

  // Billing form state
  const [billingPlan, setBillingPlan] = React.useState('')
  const [billingStatus, setBillingStatus] = React.useState('active')
  const [billingEmail, setBillingEmail] = React.useState('')
  const [billingName, setBillingName] = React.useState('')
  const [billingNotes, setBillingNotes] = React.useState('')
  const [trialEndsAt, setTrialEndsAt] = React.useState('')
  const [periodEndsAt, setPeriodEndsAt] = React.useState('')
  const [savingBilling, setSavingBilling] = React.useState(false)
  const [billingMsg, setBillingMsg] = React.useState('')

  React.useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const res = await fetch(`/api/admin/tenants/${id}`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string }
          throw new Error(err.error ?? 'Error al cargar el tenant')
        }
        const d = await res.json() as TenantDetail
        if (!d.profile) throw new Error('Datos del tenant incompletos')
        setData(d)
        // Initialize billing form from loaded data
        const b = d.billing
        setBillingPlan(d.profile.plan)
        setBillingStatus(b?.status ?? 'active')
        setBillingEmail(b?.billing_email ?? '')
        setBillingName(b?.billing_name ?? '')
        setBillingNotes(b?.notes ?? '')
        setTrialEndsAt(b?.trial_ends_at ? b.trial_ends_at.split('T')[0] : '')
        setPeriodEndsAt(b?.current_period_ends_at ? b.current_period_ends_at.split('T')[0] : '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function saveBilling() {
    if (!data) return
    setSavingBilling(true)
    setBillingMsg('')
    try {
      const res = await fetch(`/api/admin/tenants/${data.profile.tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: billingPlan,
          status: billingStatus,
          billingEmail,
          billingName,
          notes: billingNotes,
          trialEndsAt,
          periodEndsAt,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? 'Failed to update')
      }
      setBillingMsg('Guardado correctamente')
    } catch (e) {
      setBillingMsg(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSavingBilling(false)
    }
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando...</p>
      </div>
    )
  }

  if (error || !data || !data.profile) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
        <p style={{ color: 'var(--coral)', fontSize: 13 }}>Error: {error ?? 'No encontrado'}</p>
        <Link href="/admin/tenants" style={{ fontSize: 13, color: 'var(--accent-2)', marginTop: 8, display: 'block' }}>
          &larr; Volver a Tenants
        </Link>
      </div>
    )
  }

  const { profile, clients, vacancies, candidateStats } = data
  const planColor = PLAN_COLORS[profile.plan] ?? '#9ca3af'

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'clientes', label: `Clientes (${clients.length})` },
    { key: 'vacantes', label: `Vacantes (${vacancies.length})` },
    { key: 'candidatos', label: `Candidatos (${candidateStats.total})` },
    { key: 'facturacion', label: 'Facturación' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Back link */}
      <Link href="/admin/tenants" style={{ fontSize: 12, color: 'var(--muted2)', textDecoration: 'none' }}>
        &larr; Volver a Tenants
      </Link>

      {/* Tenant header */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {(profile.companyName || profile.fullName || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-nunito)', margin: 0 }}>
                {profile.companyName || profile.fullName || '—'}
              </h2>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: `${planColor}22`, color: planColor }}>
                {PLAN_LABELS[profile.plan] ?? profile.plan}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 4 }}>{profile.email}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              Tenant ID: {profile.tenantId} &middot; Registrado: {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 9,
              border: '1px solid var(--border)',
              background: activeTab === tab.key ? 'var(--accent-soft)' : 'var(--surface)',
              color: activeTab === tab.key ? 'var(--accent-2)' : 'var(--muted2)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'clientes' && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Clientes del tenant</p>
          {clients.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin clientes</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {clients.map(c => (
                <div key={c.id} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.name}</p>
                    {c.industry && <p style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{c.industry}</p>}
                    {c.contact_email && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{c.contact_email}</p>}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{formatDate(c.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'vacantes' && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Vacantes del tenant</p>
          {vacancies.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin vacantes</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {vacancies.map(v => (
                <div key={v.id} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{v.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{v.status}</p>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted2)', flexShrink: 0 }}>
                    {v.applicationCount} aplicación{v.applicationCount !== 1 ? 'es' : ''}
                  </span>
                  <p style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{formatDate(v.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'candidatos' && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Candidatos del tenant</p>
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 16 }}>
            <div style={{ padding: '16px 20px', background: 'var(--surface2)', borderRadius: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-nunito)', lineHeight: 1 }}>
                {candidateStats.total}
              </p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Total candidatos</p>
            </div>
            <div style={{ padding: '16px 20px', background: 'var(--surface2)', borderRadius: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-nunito)', lineHeight: 1 }}>
                {candidateStats.unassigned}
              </p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Sin cliente asignado</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted2)' }}>
            {candidateStats.total - candidateStats.unassigned} candidatos asignados a clientes
          </p>
        </Card>
      )}

      {activeTab === 'facturacion' && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Información de facturación</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: 6 }}>Plan</label>
              <select
                value={billingPlan}
                onChange={e => setBillingPlan(e.target.value)}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
              >
                {PLANS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: 6 }}>Estado</label>
              <select
                value={billingStatus}
                onChange={e => setBillingStatus(e.target.value)}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
              >
                {BILLING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: 6 }}>Email de facturación</label>
              <input
                value={billingEmail}
                onChange={e => setBillingEmail(e.target.value)}
                placeholder="billing@empresa.com"
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: 6 }}>Nombre de facturación</label>
              <input
                value={billingName}
                onChange={e => setBillingName(e.target.value)}
                placeholder="Empresa S.A."
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: 6 }}>Fin del período de prueba</label>
              <input
                type="date"
                value={trialEndsAt}
                onChange={e => setTrialEndsAt(e.target.value)}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: 6 }}>Fin del período actual</label>
              <input
                type="date"
                value={periodEndsAt}
                onChange={e => setPeriodEndsAt(e.target.value)}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: 6 }}>Notas</label>
              <textarea
                value={billingNotes}
                onChange={e => setBillingNotes(e.target.value)}
                rows={3}
                placeholder="Notas internas..."
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={saveBilling}
                disabled={savingBilling}
                style={{
                  padding: '9px 20px',
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: savingBilling ? 'not-allowed' : 'pointer',
                  opacity: savingBilling ? 0.7 : 1,
                }}
              >
                {savingBilling ? 'Guardando...' : 'Guardar'}
              </button>
              {billingMsg && (
                <p style={{ fontSize: 12, color: billingMsg.includes('Error') ? 'var(--coral)' : 'var(--emerald)' }}>
                  {billingMsg}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
