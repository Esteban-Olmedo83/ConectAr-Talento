'use client'

import * as React from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'cc_consent'
const VERSION = '1.0'

interface ConsentData {
  accepted: boolean
  timestamp: number
  version: string
}

export function CookieBanner() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setVisible(true)
        return
      }
      const data = JSON.parse(raw) as ConsentData
      // Re-mostrar si la versión cambió
      if (data.version !== VERSION) {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const saveConsent = (accepted: boolean) => {
    const data: ConsentData = { accepted, timestamp: Date.now(), version: VERSION }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setVisible(false)

    // Registrar en backend de forma async — no bloquear UI
    const eventType = accepted ? 'cookies_accepted' : 'cookies_rejected'
    fetch('/api/legal/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventTypes: [eventType], documentVersions: { cookies: VERSION } }),
    }).catch(() => {})
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(560px, calc(100vw - 32px))',
        background: '#1A1A2E',
        border: '1px solid rgba(93,80,214,0.35)',
        borderRadius: 14,
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        flexWrap: 'wrap',
        zIndex: 9999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <p style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, minWidth: 200, margin: 0 }}>
        Usamos cookies para mejorar tu experiencia. Consultá nuestra{' '}
        <Link href="/cookies" style={{ color: '#8B7EFF', textDecoration: 'underline' }}>
          Política de Cookies
        </Link>
        {' '}y{' '}
        <Link href="/privacidad" style={{ color: '#8B7EFF', textDecoration: 'underline' }}>
          Privacidad
        </Link>.
      </p>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={() => saveConsent(false)}
          style={{
            padding: '8px 16px',
            borderRadius: 9,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Solo esenciales
        </button>
        <button
          onClick={() => saveConsent(true)}
          style={{
            padding: '8px 18px',
            borderRadius: 9,
            border: 'none',
            background: '#5D50D6',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Aceptar todas
        </button>
      </div>
    </div>
  )
}
