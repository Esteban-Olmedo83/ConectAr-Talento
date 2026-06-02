'use client'

import * as React from 'react'
import { Bell, CheckCheck, Sparkles, Wrench, TrendingUp, Shield, ChevronDown, ChevronUp } from 'lucide-react'

interface SystemUpdate {
  id: string
  title: string
  description: string
  type: string
  published_at: string | null
  target_tenant_id: string | null
}

const TYPE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  fix:         { label: 'Fix',       color: '#f87171', icon: <Wrench size={13} /> },
  feature:     { label: 'Novedad',   color: '#34d399', icon: <Sparkles size={13} /> },
  improvement: { label: 'Mejora',    color: '#60a5fa', icon: <TrendingUp size={13} /> },
  security:    { label: 'Seguridad', color: '#fbbf24', icon: <Shield size={13} /> },
}

function TypeBadge({ type }: { type: string }) {
  const meta = TYPE_META[type] ?? { label: type, color: '#9ca3af', icon: null }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
      background: `${meta.color}22`, color: meta.color,
    }}>
      {meta.icon}
      {meta.label}
    </span>
  )
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function UpdateCard({ update, unread, onMarkRead }: {
  update: SystemUpdate
  unread: boolean
  onMarkRead: (id: string) => void
}) {
  const [expanded, setExpanded] = React.useState(false)
  const isLong = update.description.length > 180

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${unread ? 'rgba(var(--accent-rgb,99,102,241),0.4)' : 'var(--border)'}`,
      borderRadius: 14,
      padding: '18px 20px',
      position: 'relative',
      transition: 'border-color 0.2s',
    }}>
      {unread && (
        <span style={{
          position: 'absolute', top: 16, right: 18,
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--accent)',
          boxShadow: '0 0 6px var(--accent)',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <TypeBadge type={update.type} />
        {update.target_tenant_id && (
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
            background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
          }}>
            Solo para vos
          </span>
        )}
        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>
          {formatDate(update.published_at)}
        </span>
      </div>

      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
        {update.title}
      </p>

      <p style={{
        fontSize: 13, color: 'var(--muted2)', lineHeight: 1.6,
        display: !expanded && isLong ? '-webkit-box' : 'block',
        WebkitLineClamp: !expanded && isLong ? 3 : undefined,
        WebkitBoxOrient: !expanded && isLong ? 'vertical' as const : undefined,
        overflow: !expanded && isLong ? 'hidden' : 'visible',
      }}>
        {update.description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        {isLong && (
          <button
            onClick={() => setExpanded(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 600, color: 'var(--accent-2)',
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            {expanded ? <><ChevronUp size={14} /> Ver menos</> : <><ChevronDown size={14} /> Ver más</>}
          </button>
        )}
        {unread && (
          <button
            onClick={() => onMarkRead(update.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              marginLeft: 'auto',
              fontSize: 11, fontWeight: 600,
              padding: '5px 12px', borderRadius: 7,
              border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--muted2)',
              cursor: 'pointer',
            }}
          >
            <CheckCheck size={13} />
            Marcar como leído
          </button>
        )}
      </div>
    </div>
  )
}

export default function NovedadesPage() {
  const [allUpdates, setAllUpdates] = React.useState<SystemUpdate[]>([])
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set())
  const [loading, setLoading] = React.useState(true)
  const [markingAll, setMarkingAll] = React.useState(false)
  const [filter, setFilter] = React.useState<'todos' | 'sin-leer'>('todos')

  React.useEffect(() => {
    async function load() {
      try {
        // Fetch all published updates
        const [allRes, unreadRes] = await Promise.all([
          fetch('/api/novedades'),
          fetch('/api/admin/changelog/unread'),
        ])
        const allData = allRes.ok ? await allRes.json() as { updates: SystemUpdate[] } : { updates: [] }
        const unreadData = unreadRes.ok ? await unreadRes.json() as { updates: SystemUpdate[] } : { updates: [] }

        setAllUpdates(allData.updates ?? [])
        // Compute read IDs = all minus unread
        const unreadSet = new Set((unreadData.updates ?? []).map((u: SystemUpdate) => u.id))
        const readSet = new Set(
          (allData.updates ?? [])
            .filter((u: SystemUpdate) => !unreadSet.has(u.id))
            .map((u: SystemUpdate) => u.id)
        )
        setReadIds(readSet)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function markRead(id: string) {
    await fetch('/api/admin/changelog/unread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updateIds: [id] }),
    })
    setReadIds(prev => new Set([...prev, id]))
  }

  async function markAllRead() {
    const unreadIds = allUpdates.filter(u => !readIds.has(u.id)).map(u => u.id)
    if (unreadIds.length === 0) return
    setMarkingAll(true)
    await fetch('/api/admin/changelog/unread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updateIds: unreadIds }),
    })
    setReadIds(prev => new Set([...prev, ...unreadIds]))
    setMarkingAll(false)
  }

  const unreadCount = allUpdates.filter(u => !readIds.has(u.id)).length

  const displayed = filter === 'sin-leer'
    ? allUpdates.filter(u => !readIds.has(u.id))
    : allUpdates

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bell size={20} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-nunito)' }}>
            Novedades del sistema
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Actualizaciones, mejoras y correcciones de ConectAr Talento
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 9,
              border: 'none',
              background: 'var(--accent)',
              color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: markingAll ? 'not-allowed' : 'pointer',
              opacity: markingAll ? 0.7 : 1,
            }}
          >
            <CheckCheck size={14} />
            Marcar todo como leído
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['todos', 'sin-leer'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: '1px solid var(--border)',
              background: filter === f ? 'var(--accent-soft)' : 'transparent',
              color: filter === f ? 'var(--accent-2)' : 'var(--muted2)',
              cursor: 'pointer',
            }}
          >
            {f === 'todos' ? 'Todas' : `Sin leer${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Cargando novedades...</div>
      ) : displayed.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 56,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
        }}>
          <Bell size={32} style={{ color: 'var(--muted)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>
            {filter === 'sin-leer' ? '¡Todo al día! No tenés novedades sin leer.' : 'No hay novedades publicadas aún.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayed.map(u => (
            <UpdateCard
              key={u.id}
              update={u}
              unread={!readIds.has(u.id)}
              onMarkRead={markRead}
            />
          ))}
        </div>
      )}
    </div>
  )
}
