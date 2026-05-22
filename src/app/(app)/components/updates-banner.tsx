'use client'

import * as React from 'react'

interface SystemUpdate {
  id: string
  title: string
  description: string
  type: string
  is_published: boolean
  published_at: string | null
}

const TYPE_COLORS: Record<string, string> = {
  fix: '#f87171',
  feature: '#34d399',
  improvement: '#60a5fa',
  security: '#fbbf24',
}

const TYPE_LABELS: Record<string, string> = {
  fix: 'Fix',
  feature: 'Novedad',
  improvement: 'Mejora',
  security: 'Seguridad',
}

const SESSION_DISMISSED_KEY = 'ct_updates_banner_dismissed'

export function UpdatesNotificationBanner() {
  const [updates, setUpdates] = React.useState<SystemUpdate[]>([])
  const [expanded, setExpanded] = React.useState(false)
  const [dismissed, setDismissed] = React.useState(false)
  const [marking, setMarking] = React.useState(false)

  React.useEffect(() => {
    // Check if dismissed this session
    const sessionDismissed = sessionStorage.getItem(SESSION_DISMISSED_KEY)
    if (sessionDismissed === '1') {
      setDismissed(true)
      return
    }

    async function fetchUnread() {
      try {
        const res = await fetch('/api/admin/changelog/unread')
        if (!res.ok) return
        const data = await res.json() as { updates: SystemUpdate[] }
        if (data.updates && data.updates.length > 0) {
          setUpdates(data.updates)
        }
      } catch {
        // Silent — not critical
      }
    }

    fetchUnread()
  }, [])

  async function markAllRead() {
    if (updates.length === 0) return
    setMarking(true)
    try {
      await fetch('/api/admin/changelog/unread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateIds: updates.map(u => u.id) }),
      })
      setUpdates([])
      dismiss()
    } catch {
      // Silent
    } finally {
      setMarking(false)
    }
  }

  function dismiss() {
    sessionStorage.setItem(SESSION_DISMISSED_KEY, '1')
    setDismissed(true)
  }

  if (dismissed || updates.length === 0) return null

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--accent-soft) 0%, rgba(var(--accent-2-rgb, 99,102,241),0.08) 100%)',
        border: '1px solid rgba(var(--accent-rgb, 99,102,241), 0.3)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 4,
      }}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>✨</span>
        <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          Hay {updates.length} novedad{updates.length !== 1 ? 'es' : ''} del sistema
        </p>
        <button
          onClick={() => setExpanded(prev => !prev)}
          style={{
            padding: '5px 12px',
            borderRadius: 7,
            border: '1px solid rgba(var(--accent-rgb, 99,102,241), 0.3)',
            background: 'transparent',
            color: 'var(--accent-2)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {expanded ? 'Ocultar' : 'Ver novedades'}
        </button>
        <button
          onClick={dismiss}
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            border: 'none',
            background: 'transparent',
            color: 'var(--muted)',
            fontSize: 16,
            cursor: 'pointer',
            lineHeight: 1,
            flexShrink: 0,
          }}
          aria-label="Cerrar banner"
        >
          ×
        </button>
      </div>

      {/* Expanded list */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(var(--accent-rgb, 99,102,241), 0.2)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {updates.map(u => {
            const typeColor = TYPE_COLORS[u.type] ?? '#9ca3af'
            return (
              <div key={u.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 99,
                    background: `${typeColor}22`,
                    color: typeColor,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {TYPE_LABELS[u.type] ?? u.type}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{u.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 2, lineHeight: 1.4 }}>{u.description}</p>
                </div>
              </div>
            )
          })}
          <div style={{ marginTop: 4 }}>
            <button
              onClick={markAllRead}
              disabled={marking}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: marking ? 'not-allowed' : 'pointer',
                opacity: marking ? 0.7 : 1,
              }}
            >
              {marking ? 'Marcando...' : 'Marcar todo como leído'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
