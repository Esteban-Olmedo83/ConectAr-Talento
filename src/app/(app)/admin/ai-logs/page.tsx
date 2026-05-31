'use client'

import * as React from 'react'
import Link from 'next/link'

interface AiLog {
  id: string
  user_id: string
  tenant_id: string | null
  route: string
  model: string
  prompt_tokens: number | null
  completion_tokens: number | null
  latency_ms: number | null
  success: boolean
  error_code: string | null
  plan: string
  created_at: string
  tenantId: string | null
  tenantName: string
}

interface Summary {
  totalCalls: number
  successCalls: number
  errorCalls: number
  totalTokens: number
  avgLatency: number
}

const ROUTE_LABELS: Record<string, string> = {
  '/api/ai/analyze-cv': 'Análisis CV',
  '/api/ai/generate-jd': 'Generar JD',
  '/api/ai/generate-message': 'Generar Mensaje',
  '/api/ai/generate-report': 'Generar Reporte',
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

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color ?? 'var(--accent)' }} />
      <p style={{ fontSize: 11, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-nunito)', lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{sub}</p>}
    </Card>
  )
}

export default function AiLogsPage() {
  const [logs, setLogs] = React.useState<AiLog[]>([])
  const [summary, setSummary] = React.useState<Summary | null>(null)
  const [routeCounts, setRouteCounts] = React.useState<Record<string, number>>({})
  const [distinctRoutes, setDistinctRoutes] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Filters
  const [days, setDays] = React.useState('7')
  const [routeFilter, setRouteFilter] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ days })
      if (routeFilter) params.set('route', routeFilter)
      const res = await fetch(`/api/admin/ai-logs?${params}`)
      if (!res.ok) throw new Error('Error al cargar logs')
      const data = await res.json() as { logs: AiLog[]; summary: Summary; routeCounts: Record<string, number>; distinctRoutes: string[] }
      setLogs(data.logs ?? [])
      setSummary(data.summary)
      setRouteCounts(data.routeCounts ?? {})
      setDistinctRoutes(data.distinctRoutes ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [days, routeFilter])

  const filtered = statusFilter === 'error'
    ? logs.filter(l => !l.success)
    : statusFilter === 'ok'
    ? logs.filter(l => l.success)
    : logs

  const successRate = summary && summary.totalCalls > 0
    ? Math.round((summary.successCalls / summary.totalCalls) * 100)
    : 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Llamadas" value={summary?.totalCalls ?? 0} color="var(--accent)" />
        <KpiCard label="Tokens Usados" value={(summary?.totalTokens ?? 0).toLocaleString('es-AR')} color="var(--accent-2)" />
        <KpiCard label="Latencia Promedio" value={`${summary?.avgLatency ?? 0}ms`} color="var(--emerald)" />
        <KpiCard
          label="Tasa de Éxito"
          value={`${successRate}%`}
          sub={`${summary?.errorCalls ?? 0} errores`}
          color={successRate >= 95 ? 'var(--emerald)' : successRate >= 80 ? 'var(--gold)' : 'var(--coral)'}
        />
      </div>

      {/* Route breakdown */}
      {Object.keys(routeCounts).length > 0 && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Llamadas por endpoint</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).map(([r, cnt]) => {
              const max = Math.max(...Object.values(routeCounts))
              const pct = Math.round((cnt / max) * 100)
              return (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--muted2)', width: 160, flexShrink: 0, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ROUTE_LABELS[r] ?? r}
                  </span>
                  <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'var(--surface2)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: 'var(--accent)' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', width: 36, textAlign: 'right', flexShrink: 0 }}>{cnt}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Filters + Table */}
      <Card>
        {/* Filters row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>Log de uso IA</p>
          <div style={{ flex: 1 }} />
          <select
            value={days}
            onChange={e => setDays(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, padding: '6px 10px', outline: 'none' }}
          >
            <option value="1">Hoy</option>
            <option value="7">7 días</option>
            <option value="30">30 días</option>
            <option value="90">90 días</option>
          </select>
          <select
            value={routeFilter}
            onChange={e => setRouteFilter(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, padding: '6px 10px', outline: 'none' }}
          >
            <option value="">Todos los endpoints</option>
            {distinctRoutes.map(r => <option key={r} value={r}>{ROUTE_LABELS[r] ?? r}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, padding: '6px 10px', outline: 'none' }}
          >
            <option value="">Todos</option>
            <option value="ok">Solo exitosos</option>
            <option value="error">Solo errores</option>
          </select>
          <button
            onClick={load}
            style={{ padding: '6px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, cursor: 'pointer' }}
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando...</p>
        ) : error ? (
          <p style={{ color: 'var(--coral)', fontSize: 13 }}>{error}</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin registros en este período</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Fecha', 'Tenant', 'Endpoint', 'Modelo', 'Tokens', 'Latencia', 'Estado'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr
                    key={l.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '7px 10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatDate(l.created_at)}</td>
                    <td style={{ padding: '7px 10px', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.tenantId ? (
                        <Link href={`/admin/tenants/${l.user_id}`} style={{ color: 'var(--accent-2)', textDecoration: 'none' }}>
                          {l.tenantName}
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>{l.tenantName}</span>
                      )}
                    </td>
                    <td style={{ padding: '7px 10px', fontFamily: 'monospace', color: 'var(--muted2)' }}>
                      {ROUTE_LABELS[l.route] ?? l.route.split('/').pop()}
                    </td>
                    <td style={{ padding: '7px 10px', color: 'var(--muted2)' }}>{l.model.split('-').slice(0, 2).join('-')}</td>
                    <td style={{ padding: '7px 10px', color: 'var(--text)', textAlign: 'right' }}>
                      {((l.prompt_tokens ?? 0) + (l.completion_tokens ?? 0)).toLocaleString()}
                    </td>
                    <td style={{ padding: '7px 10px', color: 'var(--text)', textAlign: 'right' }}>
                      {l.latency_ms != null ? `${l.latency_ms}ms` : '—'}
                    </td>
                    <td style={{ padding: '7px 10px' }}>
                      {l.success ? (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(52,211,153,0.15)', color: 'var(--emerald)' }}>OK</span>
                      ) : (
                        <span title={l.error_code ?? ''} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(248,113,113,0.15)', color: 'var(--coral)' }}>
                          {l.error_code ?? 'ERR'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
              Mostrando {filtered.length} de {logs.length} registros
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
