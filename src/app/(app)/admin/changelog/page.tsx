'use client'

import * as React from 'react'

interface SystemUpdate {
  id: string
  title: string
  description: string
  type: 'fix' | 'feature' | 'improvement' | 'security'
  target_tenant_id: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  readCount: number
}

interface TenantRow {
  id: string
  companyName: string
  fullName: string
  email: string
  tenantId: string
}

const TYPE_LABELS: Record<string, string> = {
  fix: 'Fix',
  feature: 'Novedad',
  improvement: 'Mejora',
  security: 'Seguridad',
}

const TYPE_COLORS: Record<string, string> = {
  fix: '#f87171',
  feature: '#34d399',
  improvement: '#60a5fa',
  security: '#fbbf24',
}

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? '#9ca3af'
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: `${color}22`, color }}>
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminChangelogPage() {
  const [updates, setUpdates] = React.useState<SystemUpdate[]>([])
  const [tenants, setTenants] = React.useState<TenantRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [newTitle, setNewTitle] = React.useState('')
  const [newDescription, setNewDescription] = React.useState('')
  const [newType, setNewType] = React.useState<'fix' | 'feature' | 'improvement' | 'security'>('feature')
  const [newTargetTenant, setNewTargetTenant] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [submitMsg, setSubmitMsg] = React.useState('')
  const [notifying, setNotifying] = React.useState<string | null>(null)
  const [notifyMsg, setNotifyMsg] = React.useState<Record<string, string>>({})

  async function loadData() {
    try {
      const [updRes, tenRes] = await Promise.all([
        fetch('/api/admin/changelog'),
        fetch('/api/admin/tenants'),
      ])
      if (!updRes.ok) throw new Error('Failed to load updates')
      if (!tenRes.ok) throw new Error('Failed to load tenants')
      const updData = await updRes.json() as { updates: SystemUpdate[] }
      const tenData = await tenRes.json() as { tenants: TenantRow[] }
      setUpdates(updData.updates ?? [])
      setTenants(tenData.tenants ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadData() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !newDescription.trim()) return
    setSubmitting(true)
    setSubmitMsg('')
    try {
      const res = await fetch('/api/admin/changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          type: newType,
          target_tenant_id: newTargetTenant || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to create')
      setNewTitle('')
      setNewDescription('')
      setNewType('feature')
      setNewTargetTenant('')
      setSubmitMsg('Creado correctamente')
      await loadData()
    } catch {
      setSubmitMsg('Error al crear')
    } finally {
      setSubmitting(false)
    }
  }

  async function togglePublish(update: SystemUpdate) {
    try {
      const res = await fetch('/api/admin/changelog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: update.id, is_published: !update.is_published }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setUpdates(prev => prev.map(u => u.id === update.id ? { ...u, is_published: !update.is_published, published_at: !update.is_published ? new Date().toISOString() : u.published_at } : u))
    } catch {
      // silent
    }
  }

  async function handleNotify(update: SystemUpdate) {
    setNotifying(update.id)
    setNotifyMsg(prev => ({ ...prev, [update.id]: '' }))
    try {
      const res = await fetch('/api/admin/changelog/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId: update.id }),
      })
      const data = await res.json() as { ok: boolean; sent?: number; reason?: string; errors?: string[] }
      if (!res.ok) throw new Error('Error al notificar')
      const msg = data.reason === 'no_recipients'
        ? 'Sin destinatarios con email activo'
        : `✓ Email enviado a ${data.sent} usuario${data.sent !== 1 ? 's' : ''}`
      setNotifyMsg(prev => ({ ...prev, [update.id]: msg }))
      if (!update.is_published) {
        setUpdates(prev => prev.map(u => u.id === update.id ? { ...u, is_published: true, published_at: new Date().toISOString() } : u))
      }
    } catch {
      setNotifyMsg(prev => ({ ...prev, [update.id]: '✗ Error al enviar' }))
    } finally {
      setNotifying(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta actualización?')) return
    try {
      const res = await fetch(`/api/admin/changelog?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setUpdates(prev => prev.filter(u => u.id !== id))
    } catch {
      // silent
    }
  }

  function getTenantName(tenantId: string | null): string {
    if (!tenantId) return 'Todos los clientes'
    const t = tenants.find(t => t.tenantId === tenantId)
    return t ? (t.companyName || t.fullName || t.email) : tenantId
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando...</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Create form */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Nueva actualización</p>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: 5 }}>Título *</label>
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ej: Nuevo filtro en candidatos"
                required
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: 5 }}>Tipo *</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as typeof newType)}
                  style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
                >
                  <option value="feature">Novedad</option>
                  <option value="improvement">Mejora</option>
                  <option value="fix">Fix</option>
                  <option value="security">Seguridad</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: 5 }}>Destinatario</label>
                <select
                  value={newTargetTenant}
                  onChange={e => setNewTargetTenant(e.target.value)}
                  style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
                >
                  <option value="">Todos</option>
                  {tenants.map(t => (
                    <option key={t.tenantId} value={t.tenantId}>
                      {t.companyName || t.fullName || t.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted2)', display: 'block', marginBottom: 5 }}>Descripción *</label>
            <textarea
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              rows={3}
              required
              placeholder="Descripción detallada de la actualización..."
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 20px',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Creando...' : 'Crear borrador'}
            </button>
            {submitMsg && (
              <p style={{ fontSize: 12, color: submitMsg.includes('Error') ? 'var(--coral)' : 'var(--emerald)' }}>
                {submitMsg}
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Updates list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
          {updates.length} actualización{updates.length !== 1 ? 'es' : ''}
        </p>

        {updates.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin actualizaciones creadas</p>
          </div>
        ) : (
          updates.map(u => (
            <div
              key={u.id}
              style={{
                background: 'var(--surface)',
                border: `1px solid ${u.is_published ? 'var(--border)' : 'rgba(var(--border-rgb, 100,100,100),0.5)'}`,
                borderRadius: 14,
                padding: 16,
                opacity: u.is_published ? 1 : 0.75,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <TypeBadge type={u.type} />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 99,
                        background: u.is_published ? '#34d39922' : 'var(--surface2)',
                        color: u.is_published ? '#34d399' : 'var(--muted)',
                      }}
                    >
                      {u.is_published ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{u.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.5 }}>{u.description}</p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      Para: {getTenantName(u.target_tenant_id)}
                    </span>
                    {u.is_published && u.published_at && (
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                        Publicado: {formatDate(u.published_at)}
                      </span>
                    )}
                    {u.is_published && (
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                        Leído por: {u.readCount} usuario{u.readCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleNotify(u)}
                      disabled={notifying === u.id}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: '1px solid rgba(93,80,214,0.4)',
                        background: 'rgba(93,80,214,0.15)',
                        color: '#8B7EFF',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: notifying === u.id ? 'not-allowed' : 'pointer',
                        opacity: notifying === u.id ? 0.7 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {notifying === u.id ? 'Enviando...' : u.is_published ? '✉ Reenviar email' : '✉ Publicar y notificar'}
                    </button>
                    <button
                      onClick={() => togglePublish(u)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: u.is_published ? 'var(--surface2)' : 'var(--accent)',
                        color: u.is_published ? 'var(--muted2)' : '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {u.is_published ? 'Despublicar' : 'Publicar'}
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--surface2)',
                        color: 'var(--coral)',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                  {notifyMsg[u.id] && (
                    <span style={{ fontSize: 11, color: notifyMsg[u.id].startsWith('✓') ? '#34d399' : notifyMsg[u.id].startsWith('✗') ? '#f87171' : 'var(--muted)' }}>
                      {notifyMsg[u.id]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
