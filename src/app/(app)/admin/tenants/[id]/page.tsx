'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface TenantProfile {
  id: string; tenantId: string; email: string; fullName: string
  companyName: string; plan: string; createdAt: string
}
interface ClientRow {
  id: string; name: string; industry?: string; contact_email?: string
  created_at: string; active?: boolean
}
interface VacancyRow {
  id: string; title: string; status: string; createdAt: string
  department?: string; applicationCount: number
}
interface CandidateStats { total: number; unassigned: number; archived: number }
interface BillingRow {
  id?: string; tenant_id?: string; plan: string; status: string
  billing_email?: string; billing_name?: string; notes?: string
  trial_ends_at?: string; current_period_ends_at?: string
}
interface SubscriptionRow {
  id?: string; plan: string; status: string; stripe_status?: string
  stripe_customer_id?: string; stripe_subscription_id?: string
  cancel_at_period_end?: boolean; current_period_end?: string; trial_ends_at?: string
}
interface TenantDetail {
  profile: TenantProfile; clients: ClientRow[]; vacancies: VacancyRow[]
  candidateStats: CandidateStats; billing: BillingRow | null
  subscription: SubscriptionRow | null
}
interface AiLog {
  id: string; route: string; model: string; prompt_tokens: number | null
  completion_tokens: number | null; latency_ms: number | null
  success: boolean; error_code: string | null; created_at: string
}
interface ActivityLog {
  id: string; action: string; entity_type: string; entity_label: string | null; created_at: string
}

const PLAN_COLORS: Record<string, string> = {
  free: '#9ca3af', starter: '#60a5fa', pro: '#a78bfa', business: '#fb923c', enterprise: '#fbbf24',
}
const PLAN_LABELS: Record<string, string> = {
  free: 'Free', starter: 'Starter', pro: 'Pro', business: 'Business', enterprise: 'Enterprise',
}
const PLANS = ['free', 'starter', 'pro', 'business', 'enterprise']
const BILLING_STATUSES = ['active', 'trial', 'suspended', 'cancelled']
const ROUTE_LABELS: Record<string, string> = {
  '/api/ai/analyze-cv': 'Análisis CV',
  '/api/ai/generate-jd': 'Generar JD',
  '/api/ai/generate-message': 'Generar Mensaje',
  '/api/ai/generate-report': 'Generar Reporte',
}
const ACTION_COLORS: Record<string, string> = {
  create: 'var(--emerald)', update: 'var(--accent-2)', delete: 'var(--coral)',
  archive: 'var(--gold)', restore: 'var(--accent)',
}
const ACTION_LABELS: Record<string, string> = {
  create: 'Creó', update: 'Actualizó', delete: 'Eliminó', archive: 'Archivó', restore: 'Restauró',
}
const ENTITY_LABELS: Record<string, string> = {
  candidate: 'Candidato', vacancy: 'Vacante', client: 'Cliente',
  application: 'Aplicación', interview: 'Entrevista',
}
const STATUS_COLORS: Record<string, string> = {
  active: 'var(--emerald)', trialing: 'var(--accent-2)', past_due: 'var(--coral)',
  canceled: '#9ca3af', paused: 'var(--gold)',
}

function formatDate(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatDateTime(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, ...style }}>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none',
}

type TabKey = 'clientes' | 'vacantes' | 'candidatos' | 'facturacion' | 'suscripcion' | 'ia' | 'actividad'

export default function TenantDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [data, setData] = React.useState<TenantDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<TabKey>('clientes')

  // Billing form
  const [billingPlan, setBillingPlan] = React.useState('')
  const [billingStatus, setBillingStatus] = React.useState('active')
  const [billingEmail, setBillingEmail] = React.useState('')
  const [billingName, setBillingName] = React.useState('')
  const [billingNotes, setBillingNotes] = React.useState('')
  const [trialEndsAt, setTrialEndsAt] = React.useState('')
  const [periodEndsAt, setPeriodEndsAt] = React.useState('')
  const [savingBilling, setSavingBilling] = React.useState(false)
  const [billingMsg, setBillingMsg] = React.useState('')

  // IA logs
  const [aiLogs, setAiLogs] = React.useState<AiLog[]>([])
  const [aiLoading, setAiLoading] = React.useState(false)

  // Activity
  const [actLogs, setActLogs] = React.useState<ActivityLog[]>([])
  const [actLoading, setActLoading] = React.useState(false)

  React.useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const res = await fetch(`/api/admin/tenants/${id}`)
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Error al cargar')
        const d = await res.json() as TenantDetail
        if (!d.profile) throw new Error('Datos incompletos')
        setData(d)
        const b = d.billing
        setBillingPlan(d.profile.plan)
        setBillingStatus(b?.status ?? 'active')
        setBillingEmail(b?.billing_email ?? '')
        setBillingName(b?.billing_name ?? '')
        setBillingNotes(b?.notes ?? '')
        setTrialEndsAt(b?.trial_ends_at ? b.trial_ends_at.split('T')[0] : '')
        setPeriodEndsAt(b?.current_period_ends_at ? b.current_period_ends_at.split('T')[0] : '')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // Load AI logs when tab is activated
  React.useEffect(() => {
    if (activeTab !== 'ia' || !data) return
    if (aiLogs.length > 0) return
    setAiLoading(true)
    fetch(`/api/admin/ai-logs?tenantId=${data.profile.tenantId}&days=30`)
      .then(r => r.json())
      .then((d: { logs?: AiLog[] }) => setAiLogs(d.logs ?? []))
      .catch(() => {})
      .finally(() => setAiLoading(false))
  }, [activeTab, data])

  // Load activity when tab activated
  React.useEffect(() => {
    if (activeTab !== 'actividad' || !data) return
    if (actLogs.length > 0) return
    setActLoading(true)
    fetch(`/api/admin/activity?tenantId=${data.profile.tenantId}&days=30`)
      .then(r => r.json())
      .then((d: { logs?: ActivityLog[] }) => setActLogs(d.logs ?? []))
      .catch(() => {})
      .finally(() => setActLoading(false))
  }, [activeTab, data])

  async function saveBilling() {
    if (!data) return
    setSavingBilling(true)
    setBillingMsg('')
    try {
      const res = await fetch(`/api/admin/tenants/${data.profile.tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: billingPlan, status: billingStatus, billingEmail, billingName, notes: billingNotes, trialEndsAt, periodEndsAt }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Error')
      setBillingMsg('Guardado correctamente')
    } catch (e) {
      setBillingMsg(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSavingBilling(false)
    }
  }

  if (loading) return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando...</p>
    </div>
  )

  if (error || !data?.profile) return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
      <p style={{ color: 'var(--coral)', fontSize: 13 }}>Error: {error ?? 'No encontrado'}</p>
      <Link href="/admin/tenants" style={{ fontSize: 13, color: 'var(--accent-2)', marginTop: 8, display: 'block' }}>&larr; Volver</Link>
    </div>
  )

  const { profile, clients, vacancies, candidateStats, subscription } = data
  const planColor = PLAN_COLORS[profile.plan] ?? '#9ca3af'

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'clientes', label: `Clientes (${clients.length})` },
    { key: 'vacantes', label: `Vacantes (${vacancies.length})` },
    { key: 'candidatos', label: `Candidatos (${candidateStats.total})` },
    { key: 'facturacion', label: 'Facturación' },
    { key: 'suscripcion', label: 'Suscripción' },
    { key: 'ia', label: 'Uso IA' },
    { key: 'actividad', label: 'Actividad' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Link href="/admin/tenants" style={{ fontSize: 12, color: 'var(--muted2)', textDecoration: 'none' }}>&larr; Volver a Tenants</Link>

      {/* Header */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
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
              {subscription && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: `${STATUS_COLORS[subscription.stripe_status ?? subscription.status] ?? '#9ca3af'}22`, color: STATUS_COLORS[subscription.stripe_status ?? subscription.status] ?? '#9ca3af' }}>
                  {subscription.stripe_status ?? subscription.status}
                </span>
              )}
              {subscription?.cancel_at_period_end && (
                <span style={{ fontSize: 10, color: 'var(--gold)' }}>⚠ cancela al vencer</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 4 }}>{profile.email}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              Tenant ID: <code style={{ background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4 }}>{profile.tenantId}</code>
              &nbsp;·&nbsp;Registrado: {formatDate(profile.createdAt)}
            </p>
            {/* Quick stats row */}
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'Clientes', value: clients.length },
                { label: 'Vacantes', value: vacancies.length },
                { label: 'Candidatos', value: candidateStats.total },
                { label: 'Archivados', value: candidateStats.archived },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-nunito)', lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid var(--border)', background: activeTab === tab.key ? 'var(--accent-soft)' : 'var(--surface)', color: activeTab === tab.key ? 'var(--accent-2)' : 'var(--muted2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Clientes ── */}
      {activeTab === 'clientes' && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Clientes del tenant</p>
          {clients.length === 0 ? <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin clientes</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {clients.map(c => (
                <div key={c.id} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.name}
                      {c.active === false && <span style={{ fontSize: 10, color: 'var(--coral)', marginLeft: 6 }}>inactivo</span>}
                    </p>
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

      {/* ── Tab: Vacantes ── */}
      {activeTab === 'vacantes' && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Vacantes del tenant</p>
          {vacancies.length === 0 ? <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin vacantes</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {vacancies.map(v => (
                <div key={v.id} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{v.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{v.status}{v.department ? ` · ${v.department}` : ''}</p>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted2)', flexShrink: 0 }}>{v.applicationCount} aplicación{v.applicationCount !== 1 ? 'es' : ''}</span>
                  <p style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{formatDate(v.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Tab: Candidatos ── */}
      {activeTab === 'candidatos' && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Candidatos del tenant</p>
          <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 16 }}>
            {[
              { label: 'Total', value: candidateStats.total, color: 'var(--text)' },
              { label: 'Sin cliente', value: candidateStats.unassigned, color: 'var(--gold)' },
              { label: 'Archivados', value: candidateStats.archived, color: 'var(--muted2)' },
            ].map(s => (
              <div key={s.label} style={{ padding: '16px 20px', background: 'var(--surface2)', borderRadius: 12, textAlign: 'center' }}>
                <p style={{ fontSize: 26, fontWeight: 900, color: s.color, fontFamily: 'var(--font-nunito)', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted2)' }}>
            {candidateStats.total - candidateStats.unassigned} candidatos asignados a clientes
          </p>
        </Card>
      )}

      {/* ── Tab: Facturación ── */}
      {activeTab === 'facturacion' && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Información de facturación</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
            <Field label="Plan">
              <select value={billingPlan} onChange={e => setBillingPlan(e.target.value)} style={inputStyle}>
                {PLANS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select value={billingStatus} onChange={e => setBillingStatus(e.target.value)} style={inputStyle}>
                {BILLING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Email de facturación">
              <input value={billingEmail} onChange={e => setBillingEmail(e.target.value)} placeholder="billing@empresa.com" style={inputStyle} />
            </Field>
            <Field label="Nombre de facturación">
              <input value={billingName} onChange={e => setBillingName(e.target.value)} placeholder="Empresa S.A." style={inputStyle} />
            </Field>
            <Field label="Fin del período de prueba">
              <input type="date" value={trialEndsAt} onChange={e => setTrialEndsAt(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Fin del período actual">
              <input type="date" value={periodEndsAt} onChange={e => setPeriodEndsAt(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Notas internas">
              <textarea value={billingNotes} onChange={e => setBillingNotes(e.target.value)} rows={3} placeholder="Notas..." style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={saveBilling} disabled={savingBilling}
                style={{ padding: '9px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: savingBilling ? 'not-allowed' : 'pointer', opacity: savingBilling ? 0.7 : 1 }}>
                {savingBilling ? 'Guardando...' : 'Guardar cambios'}
              </button>
              {billingMsg && <p style={{ fontSize: 12, color: billingMsg.includes('Error') ? 'var(--coral)' : 'var(--emerald)' }}>{billingMsg}</p>}
            </div>
          </div>
        </Card>
      )}

      {/* ── Tab: Suscripción ── */}
      {activeTab === 'suscripcion' && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Datos de suscripción</p>
          {!subscription ? (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin suscripción registrada</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Plan', value: PLAN_LABELS[subscription.plan] ?? subscription.plan },
                  { label: 'Estado', value: subscription.stripe_status ?? subscription.status },
                  { label: 'Fin del período', value: formatDate(subscription.current_period_end) },
                  { label: 'Trial hasta', value: formatDate(subscription.trial_ends_at) },
                ].map(item => (
                  <div key={item.label} style={{ padding: '12px 16px', background: 'var(--surface2)', borderRadius: 10 }}>
                    <p style={{ fontSize: 10, color: 'var(--muted2)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{item.value}</p>
                  </div>
                ))}
              </div>
              {subscription.cancel_at_period_end && (
                <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>⚠ El cliente cancelará al fin del período actual</p>
                </div>
              )}
              {subscription.stripe_customer_id && (
                <div style={{ padding: '12px 16px', background: 'var(--surface2)', borderRadius: 10 }}>
                  <p style={{ fontSize: 10, color: 'var(--muted2)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>IDs de Stripe</p>
                  <p style={{ fontSize: 12, color: 'var(--muted2)', fontFamily: 'monospace' }}>Customer: {subscription.stripe_customer_id}</p>
                  {subscription.stripe_subscription_id && (
                    <p style={{ fontSize: 12, color: 'var(--muted2)', fontFamily: 'monospace', marginTop: 4 }}>Subscription: {subscription.stripe_subscription_id}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ── Tab: Uso IA ── */}
      {activeTab === 'ia' && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Uso de IA — últimos 30 días</p>
          {aiLoading ? (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando...</p>
          ) : aiLogs.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin llamadas de IA en este período</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 16 }}>
                {[
                  { label: 'Total llamadas', value: aiLogs.length },
                  { label: 'Tokens usados', value: aiLogs.reduce((s, l) => s + (l.prompt_tokens ?? 0) + (l.completion_tokens ?? 0), 0).toLocaleString() },
                  { label: 'Tasa de éxito', value: `${Math.round((aiLogs.filter(l => l.success).length / aiLogs.length) * 100)}%` },
                ].map(s => (
                  <div key={s.label} style={{ padding: '12px 16px', background: 'var(--surface2)', borderRadius: 10, textAlign: 'center' }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-nunito)' }}>{s.value}</p>
                    <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {aiLogs.slice(0, 50).map(l => (
                  <div key={l.id} style={{ padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: l.success ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)', color: l.success ? 'var(--emerald)' : 'var(--coral)', flexShrink: 0 }}>
                      {l.success ? 'OK' : 'ERR'}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--muted2)', flex: 1 }}>{ROUTE_LABELS[l.route] ?? l.route}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{((l.prompt_tokens ?? 0) + (l.completion_tokens ?? 0)).toLocaleString()} tokens</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{l.latency_ms != null ? `${l.latency_ms}ms` : '—'}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>{formatDateTime(l.created_at)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {/* ── Tab: Actividad ── */}
      {activeTab === 'actividad' && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Actividad reciente — últimos 30 días</p>
          {actLoading ? (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando...</p>
          ) : actLogs.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin actividad registrada</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {actLogs.slice(0, 100).map(l => {
                const color = ACTION_COLORS[l.action] ?? 'var(--muted2)'
                return (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 8px', borderRadius: 8, transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: 'var(--text)' }}>
                        <span style={{ color, fontWeight: 700 }}>{ACTION_LABELS[l.action] ?? l.action}</span>
                        {' '}<span style={{ color: 'var(--muted2)' }}>{ENTITY_LABELS[l.entity_type] ?? l.entity_type}</span>
                        {l.entity_label && <span style={{ fontWeight: 600 }}> &ldquo;{l.entity_label}&rdquo;</span>}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{formatDateTime(l.created_at)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
