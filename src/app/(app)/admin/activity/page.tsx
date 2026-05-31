'use client'

import * as React from 'react'
import Link from 'next/link'

interface ActivityLog {
  id: string
  tenant_id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  entity_label: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  tenantName: string
  userName: string | null
}

const ACTION_COLORS: Record<string, string> = {
  create: 'var(--emerald)',
  update: 'var(--accent-2)',
  delete: 'var(--coral)',
  archive: 'var(--gold)',
  restore: 'var(--accent)',
}
const ACTION_LABELS: Record<string, string> = {
  create: 'Creó',
  update: 'Actualizó',
  delete: 'Eliminó',
  archive: 'Archivó',
  restore: 'Restauró',
}
const ENTITY_LABELS: Record<string, string> = {
  candidate: 'Candidato',
  vacancy: 'Vacante',
  client: 'Cliente',
  application: 'Aplicación',
  interview: 'Entrevista',
  profile: 'Perfil',
  template: 'Plantilla',
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, ...style }}>
      {children}
    </div>
  )
}

export default function ActivityPage() {
  const [logs, setLogs] = React.useState<ActivityLog[]>([])
  const [distinctEntityTypes, setDistinctEntityTypes] = React.useState<string[]>([])
  const [distinctTenants, setDistinctTenants] = React.useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [days, setDays] = React.useState('7')
  const [tenantFilter, setTenantFilter] = React.useState('')
  const [entityFilter, setEntityFilter] = React.useState('')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ days })
      if (tenantFilter) params.set('tenantId', tenantFilter)
      if (entityFilter) params.set('entityType', entityFilter)
      const res = await fetch(`/api/admin/activity?${params}`)
      if (!res.ok) throw new Error('Error al cargar actividad')
      const data = await res.json() as { logs: ActivityLog[]; distinctEntityTypes: string[]; distinctTenants: { id: string; name: string }[] }
      setLogs(data.logs ?? [])
      setDistinctEntityTypes(data.distinctEntityTypes ?? [])
      setDistinctTenants(data.distinctTenants ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [days, tenantFilter, entityFilter])

  // Count by entity type
  const entityCounts: Record<string, number> = {}
  for (const l of logs) {
    entityCounts[l.entity_type] = (entityCounts[l.entity_type] ?? 0) + 1
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total acciones', value: logs.length, color: 'var(--accent)' },
          { label: 'Creaciones', value: logs.filter(l => l.action === 'create').length, color: 'var(--emerald)' },
          { label: 'Actualizaciones', value: logs.filter(l => l.action === 'update').length, color: 'var(--accent-2)' },
          { label: 'Eliminaciones', value: logs.filter(l => l.action === 'delete').length, color: 'var(--coral)' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: card.color }} />
            <p style={{ fontSize: 11, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 6 }}>{card.label}</p>
            <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-nunito)', lineHeight: 1.1 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Activity by entity type */}
      {Object.keys(entityCounts).length > 0 && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Actividad por entidad</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(entityCounts).sort((a, b) => b[1] - a[1]).map(([ent, cnt]) => (
              <div
                key={ent}
                style={{ padding: '6px 12px', background: 'var(--surface2)', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                onClick={() => setEntityFilter(entityFilter === ent ? '' : ent)}
              >
                <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{ENTITY_LABELS[ent] ?? ent}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-2)', background: 'var(--accent-soft)', padding: '1px 6px', borderRadius: 99 }}>{cnt}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters + Timeline */}
      <Card>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>Actividad global</p>
          <div style={{ flex: 1 }} />
          <select value={days} onChange={e => setDays(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, padding: '6px 10px', outline: 'none' }}>
            <option value="1">Hoy</option>
            <option value="7">7 días</option>
            <option value="30">30 días</option>
          </select>
          <select value={tenantFilter} onChange={e => setTenantFilter(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, padding: '6px 10px', outline: 'none' }}>
            <option value="">Todos los tenants</option>
            {distinctTenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, padding: '6px 10px', outline: 'none' }}>
            <option value="">Todas las entidades</option>
            {distinctEntityTypes.map(t => <option key={t} value={t}>{ENTITY_LABELS[t] ?? t}</option>)}
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
        ) : logs.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin actividad en este período</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {logs.map((l, i) => {
              const actionColor = ACTION_COLORS[l.action] ?? 'var(--muted2)'
              const actionLabel = ACTION_LABELS[l.action] ?? l.action
              const entityLabel = ENTITY_LABELS[l.entity_type] ?? l.entity_type
              return (
                <div
                  key={l.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '8px 10px',
                    borderRadius: 10,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  {/* Dot */}
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: actionColor, flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>
                      <span style={{ color: actionColor, fontWeight: 700 }}>{actionLabel}</span>
                      {' '}<span style={{ color: 'var(--muted2)' }}>{entityLabel}</span>
                      {l.entity_label && (
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}> &ldquo;{l.entity_label}&rdquo;</span>
                      )}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      <Link href={`/admin/tenants/${l.user_id ?? ''}`} style={{ color: 'var(--accent-2)', textDecoration: 'none' }}>
                        {l.tenantName}
                      </Link>
                      {l.userName && l.userName !== l.tenantName && (
                        <span> · {l.userName}</span>
                      )}
                      <span> · {formatDate(l.created_at)}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
