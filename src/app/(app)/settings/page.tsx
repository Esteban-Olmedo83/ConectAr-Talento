'use client'

import * as React from 'react'
import { Monitor, Sun, Moon, Check, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/context/user-context'

// ─── Palette definitions ──────────────────────────────────────────────────────
const PALETTES = [
  { id: '', name: 'Índigo', color1: '#6c63ff', color2: '#a78bfa' },
  { id: 'palette-violet', name: 'Violeta', color1: '#8b5cf6', color2: '#c084fc' },
  { id: 'palette-sky', name: 'Cielo', color1: '#0ea5e9', color2: '#38bdf8' },
  { id: 'palette-emerald', name: 'Esmeralda', color1: '#10b981', color2: '#34d399' },
  { id: 'palette-rose', name: 'Rosa', color1: '#f43f5e', color2: '#fb7185' },
  { id: 'palette-amber', name: 'Ámbar', color1: '#f59e0b', color2: '#fbbf24' },
  { id: 'palette-fuchsia', name: 'Fucsia', color1: '#d946ef', color2: '#e879f9' },
  { id: 'palette-cyan', name: 'Cian', color1: '#06b6d4', color2: '#22d3ee' },
  { id: 'palette-slate', name: 'Slate', color1: '#e2e8f0', color2: '#cbd5e1' },
]

const PALETTE_CLASSES = PALETTES.filter(p => p.id).map(p => p.id)

const THEMES = [
  { id: 'dark', label: 'Oscuro', icon: Moon },
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'auto', label: 'Auto', icon: Monitor },
]

const SETTINGS_TABS = [
  { id: 'apariencia', label: 'Apariencia' },
  { id: 'cuenta', label: 'Cuenta' },
  { id: 'notificaciones', label: 'Notificaciones' },
  { id: 'ia', label: 'Conexión con IAs' },
  { id: 'datos', label: 'Datos' },
]

function applyTheme(theme: string) {
  const html = document.documentElement
  html.classList.remove('theme-light', 'theme-auto')
  if (theme !== 'dark') html.classList.add(`theme-${theme}`)
}

function applyPalette(palette: string) {
  const html = document.documentElement
  PALETTE_CLASSES.forEach(p => html.classList.remove(p))
  if (palette) html.classList.add(palette)
}

// ─── Apariencia Tab ───────────────────────────────────────────────────────────
function AparienciaTab() {
  const [theme, setTheme] = React.useState('dark')
  const [palette, setPalette] = React.useState('')

  React.useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('ct_theme') || 'dark'
      const savedPalette = localStorage.getItem('ct_palette') || ''
      setTheme(savedTheme)
      setPalette(savedPalette)
    } catch { /* noop */ }
  }, [])

  function handleThemeChange(newTheme: string) {
    setTheme(newTheme)
    applyTheme(newTheme)
    try { localStorage.setItem('ct_theme', newTheme) } catch { /* noop */ }
  }

  function handlePaletteChange(newPalette: string) {
    setPalette(newPalette)
    applyPalette(newPalette)
    try { localStorage.setItem('ct_palette', newPalette) } catch { /* noop */ }
  }

  return (
    <div className="space-y-8">
      {/* Mode section */}
      <div>
        <h3
          className="text-sm font-semibold mb-1"
          style={{ color: 'var(--text)' }}
        >
          Modo
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
          Elige cómo se ve la interfaz
        </p>
        <div className="flex gap-3">
          {THEMES.map(({ id, label, icon: Icon }) => {
            const active = theme === id
            return (
              <button
                key={id}
                onClick={() => handleThemeChange(id)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border py-5 px-3 transition-all cursor-pointer',
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'border-[var(--border)] hover:border-[var(--border2)] hover:bg-[var(--surface2)]'
                )}
                style={{
                  background: active ? 'var(--accent-soft)' : 'var(--surface2)',
                }}
              >
                <Icon
                  className="h-6 w-6"
                  style={{ color: active ? 'var(--accent-2)' : 'var(--muted2)' }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: active ? 'var(--accent-2)' : 'var(--text)' }}
                >
                  {label}
                </span>
                {active && (
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--accent)' }}
                  >
                    <Check className="h-2.5 w-2.5 text-white" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Palette section */}
      <div>
        <h3
          className="text-sm font-semibold mb-1"
          style={{ color: 'var(--text)' }}
        >
          Paleta de colores
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
          Personaliza los colores de acento de la interfaz
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {PALETTES.map(p => {
            const active = palette === p.id
            return (
              <button
                key={p.id || 'indigo'}
                onClick={() => handlePaletteChange(p.id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-3 transition-all cursor-pointer',
                  active
                    ? 'border-[var(--accent)]'
                    : 'border-[var(--border)] hover:border-[var(--border2)]'
                )}
                style={{
                  background: active ? 'var(--accent-soft)' : 'var(--surface2)',
                }}
              >
                <div className="flex gap-1">
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ background: p.color1 }}
                  />
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ background: p.color2 }}
                  />
                </div>
                <span
                  className="text-[11px] font-medium leading-tight"
                  style={{ color: active ? 'var(--accent-2)' : 'var(--muted2)' }}
                >
                  {p.name}
                </span>
                {active && (
                  <span
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--accent)' }}
                  >
                    <Check className="h-2 w-2 text-white" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Cuenta Tab ───────────────────────────────────────────────────────────────
const PLAN_INFO: Record<string, { label: string; features: string }> = {
  free: { label: 'Free', features: '1 integración, 3 vacantes activas, 50 candidatos' },
  starter: { label: 'Starter', features: '2 integraciones, 10 vacantes activas, 200 candidatos' },
  pro: { label: 'Pro', features: '3 integraciones, vacantes ilimitadas, candidatos ilimitados' },
  business: { label: 'Business', features: 'Todo en Pro + soporte prioritario' },
  enterprise: { label: 'Enterprise', features: 'Todo en Business + SLA garantizado' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

function CuentaTab() {
  const { user } = useUser()
  const router = useRouter()
  const [fullName, setFullName] = React.useState('')
  const [companyName, setCompanyName] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [saveMsg, setSaveMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [signingOut, setSigningOut] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setCompanyName(user.companyName || '')
    }
  }, [user])

  async function handleSavePerfil() {
    if (!user) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, company_name: companyName })
        .eq('id', user.id)
      if (error) throw error
      setSaveMsg({ type: 'success', text: 'Perfil actualizado correctamente.' })
    } catch {
      setSaveMsg({ type: 'error', text: 'No se pudo guardar. Intentá de nuevo.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const plan = user?.plan || 'free'
  const planInfo = PLAN_INFO[plan] || PLAN_INFO.free

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
  }

  return (
    <div className="space-y-6">
      {/* Perfil section */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Perfil
        </h3>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {getInitials(fullName || user?.fullName || 'U')}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {fullName || user?.fullName || '—'}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: 'var(--muted2)' }}>
              Nombre completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Tu nombre"
              style={inputStyle}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: 'var(--muted2)' }}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium" style={{ color: 'var(--muted2)' }}>
              Empresa
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Nombre de tu empresa"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSavePerfil}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {saving ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
          {saveMsg && (
            <span
              className="text-xs font-medium"
              style={{ color: saveMsg.type === 'success' ? 'var(--emerald)' : 'var(--coral)' }}
            >
              {saveMsg.text}
            </span>
          )}
        </div>
      </div>

      {/* Plan section */}
      <div
        className="rounded-xl border p-5 space-y-3"
        style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Plan actual
        </h3>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{
              background: 'color-mix(in srgb, var(--accent) 20%, transparent)',
              color: 'var(--accent-2)',
              border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)',
            }}
          >
            {planInfo.label}
          </span>
          <span className="text-sm" style={{ color: 'var(--muted2)' }}>
            {planInfo.features}
          </span>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--surface3)', color: 'var(--muted2)' }}
        >
          Cambiar plan — Próximamente
        </button>
      </div>

      {/* Zona de peligro */}
      <div
        className="rounded-xl border p-5 space-y-3"
        style={{
          borderColor: 'color-mix(in srgb, var(--coral) 30%, transparent)',
          background: 'color-mix(in srgb, var(--coral) 5%, transparent)',
        }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--coral)' }}>
          Zona de peligro
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'color-mix(in srgb, var(--coral) 15%, transparent)',
              color: 'var(--coral)',
              border: '1px solid color-mix(in srgb, var(--coral) 30%, transparent)',
            }}
          >
            {signingOut ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                Cerrando sesión...
              </>
            ) : (
              'Cerrar sesión'
            )}
          </button>
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--surface3)',
              color: 'var(--muted2)',
            }}
          >
            Eliminar cuenta — Contactar soporte
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Notificaciones Tab ───────────────────────────────────────────────────────
const EMAIL_NOTIFS = [
  { key: 'nueva_aplicacion', label: 'Nueva aplicación recibida', default: true },
  { key: 'entrevista_agendada', label: 'Entrevista agendada', default: true },
  { key: 'candidato_avanzo', label: 'Candidato avanzó de etapa', default: true },
  { key: 'reporte_semanal', label: 'Reporte semanal', default: true },
  { key: 'alertas_sistema', label: 'Alertas del sistema', default: true },
]

const INAPP_NOTIFS = [
  { key: 'recordatorio_entrevistas', label: 'Recordatorio de entrevistas', default: true },
  { key: 'candidatos_sin_actividad', label: 'Candidatos sin actividad por más de 7 días', default: true },
  { key: 'vacantes_por_vencer', label: 'Vacantes próximas a vencer', default: false },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none"
      style={{
        background: checked ? 'var(--accent)' : 'var(--surface3)',
      }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(1.375rem)' : 'translateX(0.25rem)' }}
      />
    </button>
  )
}

type NotifPrefs = Record<string, boolean>

function defaultNotifPrefs(): NotifPrefs {
  const prefs: NotifPrefs = {}
  for (const n of [...EMAIL_NOTIFS, ...INAPP_NOTIFS]) {
    prefs[n.key] = n.default
  }
  return prefs
}

function NotificacionesTab() {
  const [prefs, setPrefs] = React.useState<NotifPrefs>(defaultNotifPrefs)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('ct_notif_prefs')
      if (raw) {
        const parsed = JSON.parse(raw) as NotifPrefs
        setPrefs(prev => ({ ...prev, ...parsed }))
      }
    } catch { /* noop */ }
  }, [])

  function handleToggle(key: string, value: boolean) {
    setPrefs(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    try {
      localStorage.setItem('ct_notif_prefs', JSON.stringify(prefs))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { /* noop */ }
  }

  const sectionStyle: React.CSSProperties = {
    borderColor: 'var(--border)',
    background: 'var(--surface2)',
  }

  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="rounded-xl border p-5 space-y-4" style={sectionStyle}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Notificaciones por email
        </h3>
        <div className="space-y-3">
          {EMAIL_NOTIFS.map(n => (
            <div key={n.key} className="flex items-center justify-between gap-4">
              <span className="text-sm" style={{ color: 'var(--text)' }}>
                {n.label}
              </span>
              <Toggle checked={!!prefs[n.key]} onChange={v => handleToggle(n.key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* In-app */}
      <div className="rounded-xl border p-5 space-y-4" style={sectionStyle}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Notificaciones en la app
        </h3>
        <div className="space-y-3">
          {INAPP_NOTIFS.map(n => (
            <div key={n.key} className="flex items-center justify-between gap-4">
              <span className="text-sm" style={{ color: 'var(--text)' }}>
                {n.label}
              </span>
              <Toggle checked={!!prefs[n.key]} onChange={v => handleToggle(n.key, v)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Guardar preferencias
        </button>
        {saved && (
          <span className="text-xs font-medium" style={{ color: 'var(--emerald)' }}>
            Preferencias guardadas
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Conexión con IAs Tab ─────────────────────────────────────────────────────
type IAProvider = 'gemini' | 'openai' | 'claude' | 'groq'

interface IAOption {
  id: IAProvider
  name: string
  badge: string
  badgeType: 'green' | 'amber'
  description: string
  keyLink: string
  keyLinkLabel: string
}

const IA_OPTIONS: IAOption[] = [
  {
    id: 'gemini',
    name: 'Gemini (Google)',
    badge: 'Gratis',
    badgeType: 'green',
    description: '2M tokens/día en plan gratuito',
    keyLink: 'https://aistudio.google.com',
    keyLinkLabel: 'Obtener API key gratis en aistudio.google.com',
  },
  {
    id: 'openai',
    name: 'GPT-4o (OpenAI)',
    badge: 'De pago',
    badgeType: 'amber',
    description: 'Requiere cuenta OpenAI con créditos',
    keyLink: 'https://platform.openai.com/api-keys',
    keyLinkLabel: 'platform.openai.com/api-keys',
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    badge: 'De pago',
    badgeType: 'amber',
    description: 'API de Anthropic, plan pay-per-use',
    keyLink: 'https://console.anthropic.com',
    keyLinkLabel: 'console.anthropic.com',
  },
  {
    id: 'groq',
    name: 'Llama (Meta / Groq)',
    badge: 'Gratis (Groq)',
    badgeType: 'green',
    description: 'Via Groq API, extremadamente rápido',
    keyLink: 'https://console.groq.com/keys',
    keyLinkLabel: 'console.groq.com/keys',
  },
]

interface AIConfig {
  provider: IAProvider
  apiKey: string
}

function ConexionIAsTab() {
  const [selected, setSelected] = React.useState<IAProvider>('gemini')
  const [apiKey, setApiKey] = React.useState('')
  const [showKey, setShowKey] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [hasSavedKey, setHasSavedKey] = React.useState(false)
  const [testing, setTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState<{ ok: boolean; message: string } | null>(null)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('ct_ai_config')
      if (raw) {
        const config = JSON.parse(raw) as AIConfig
        setSelected(config.provider || 'gemini')
        setApiKey(config.apiKey || '')
        setHasSavedKey(!!config.apiKey)
      }
    } catch { /* noop */ }
  }, [])

  function handleSelectIA(id: IAProvider) {
    setSelected(id)
    setSaved(false)
    setTestResult(null)
    // Load saved key for this provider if any
    try {
      const raw = localStorage.getItem('ct_ai_config')
      if (raw) {
        const config = JSON.parse(raw) as AIConfig
        if (config.provider === id) {
          setApiKey(config.apiKey || '')
          setHasSavedKey(!!config.apiKey)
        } else {
          setApiKey('')
          setHasSavedKey(false)
        }
      } else {
        setApiKey('')
        setHasSavedKey(false)
      }
    } catch { /* noop */ }
  }

  function handleSaveKey() {
    try {
      const config: AIConfig = { provider: selected, apiKey }
      localStorage.setItem('ct_ai_config', JSON.stringify(config))
      setSaved(true)
      setHasSavedKey(!!apiKey)
      setTestResult(null)
      setTimeout(() => setSaved(false), 2500)
    } catch { /* noop */ }
  }

  async function handleTestConexion() {
    if (!apiKey) return
    setTesting(true)
    setTestResult(null)
    try {
      if (selected === 'gemini') {
        // Try gemini-1.5-flash first (higher free-tier quota), fall back to gemini-2.0-flash
        const models = ['gemini-1.5-flash', 'gemini-2.0-flash']
        let lastError = ''
        let success = false
        for (const model of models) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Di hola en una palabra.' }] }],
            }),
          })
          const data = await res.json()
          if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            setTestResult({ ok: true, message: `Conexión exitosa con ${model}. Respuesta: "${data.candidates[0].content.parts[0].text.trim()}"` })
            success = true
            break
          }
          const rawMsg: string = data.error?.message || ''
          if (rawMsg.toLowerCase().includes('quota') || rawMsg.toLowerCase().includes('rate') || res.status === 429) {
            lastError = 'Cuota gratuita agotada. El plan gratuito de Gemini tiene límite diario. Revisá tu uso en ai.dev/rate-limit o esperá al reinicio de cuota (medianoche PT). Si necesitás más cuota, habilitá facturación en console.cloud.google.com.'
          } else if (res.status === 400 && rawMsg.toLowerCase().includes('api key')) {
            lastError = 'API key inválida. Verificá que la key sea correcta en aistudio.google.com.'
            break
          } else {
            lastError = rawMsg || 'Respuesta inesperada de la API'
          }
        }
        if (!success) {
          setTestResult({ ok: false, message: lastError })
        }
      } else {
        setTestResult({ ok: true, message: 'API key guardada. La prueba directa está disponible para Gemini.' })
      }
    } catch (e) {
      setTestResult({ ok: false, message: e instanceof Error ? e.message : 'Error de red' })
    } finally {
      setTesting(false)
    }
  }

  const selectedOption = IA_OPTIONS.find(o => o.id === selected)!

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
  }

  return (
    <div className="space-y-6">
      {/* IA selector */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          IA Predeterminada
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {IA_OPTIONS.map(opt => {
            const active = selected === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectIA(opt.id)}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all cursor-pointer',
                  active
                    ? 'border-[var(--accent)]'
                    : 'border-[var(--border)] hover:border-[var(--muted)]'
                )}
                style={{
                  background: active ? 'var(--accent-soft)' : 'var(--surface)',
                }}
              >
                <div className="flex items-center gap-2 w-full">
                  <span
                    className="text-sm font-semibold flex-1"
                    style={{ color: active ? 'var(--accent-2)' : 'var(--text)' }}
                  >
                    {opt.name}
                  </span>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: opt.badgeType === 'green'
                        ? 'color-mix(in srgb, var(--emerald) 20%, transparent)'
                        : 'color-mix(in srgb, var(--gold) 25%, transparent)',
                      color: opt.badgeType === 'green' ? 'var(--emerald)' : 'var(--gold)',
                    }}
                  >
                    {opt.badge}
                  </span>
                  {active && (
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'var(--accent)' }}
                    >
                      <Check className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {opt.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* API Key section */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          API Key de {selectedOption.name}
        </h3>

        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Obtené tu API key en{' '}
          <a
            href={selectedOption.keyLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-2)', textDecoration: 'underline' }}
          >
            {selectedOption.keyLinkLabel}
          </a>
        </p>

        {!hasSavedKey && !apiKey && (
          <div
            className="rounded-lg px-4 py-3 text-xs"
            style={{
              background: 'color-mix(in srgb, var(--sky) 12%, transparent)',
              color: 'var(--sky)',
              border: '1px solid color-mix(in srgb, var(--sky) 25%, transparent)',
            }}
          >
            Sin API key configurada — el sistema usará Gemini con cuota compartida del sistema.
          </div>
        )}

        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setSaved(false) }}
            placeholder={`Pegá tu API key de ${selectedOption.name}`}
            style={{ ...inputStyle, paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            onClick={() => setShowKey(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--muted)' }}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSaveKey}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Guardar
          </button>

          {hasSavedKey && (
            <button
              onClick={handleTestConexion}
              disabled={testing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'var(--surface3)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            >
              {testing ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                  Probando...
                </>
              ) : (
                'Probar conexión'
              )}
            </button>
          )}

          {saved && (
            <span className="text-xs font-medium" style={{ color: 'var(--emerald)' }}>
              API key guardada
            </span>
          )}
        </div>

        {testResult && (
          <div
            className="rounded-lg px-4 py-3 text-sm font-medium"
            style={{
              background: testResult.ok
                ? 'color-mix(in srgb, var(--emerald) 15%, transparent)'
                : 'color-mix(in srgb, var(--coral) 15%, transparent)',
              color: testResult.ok ? 'var(--emerald)' : 'var(--coral)',
              border: `1px solid ${testResult.ok
                ? 'color-mix(in srgb, var(--emerald) 30%, transparent)'
                : 'color-mix(in srgb, var(--coral) 30%, transparent)'}`,
            }}
          >
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Datos Tab ────────────────────────────────────────────────────────────────
function DatosTab() {
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function handleSeedDemo() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/demo/seed?reset=true', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setResult({
          type: 'success',
          message: `Datos demo cargados: ${data.counts?.vacancies ?? 0} vacantes, ${data.counts?.candidates ?? 0} candidatos, ${data.counts?.applications ?? 0} postulaciones. ¡Andá al Dashboard!`,
        })
      } else {
        setResult({ type: 'error', message: data.message || 'Ocurrió un error inesperado' })
      }
    } catch {
      setResult({ type: 'error', message: 'No se pudo conectar con el servidor' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl border p-5"
        style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}
      >
        <h3
          className="text-sm font-semibold mb-1"
          style={{ color: 'var(--text)' }}
        >
          Datos de demostración
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
          Cargá 5 vacantes, 12 candidatos y 11 postulaciones de ejemplo para explorar todas las funcionalidades. Si ya tenés datos previos, se reemplazarán por los datos demo.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSeedDemo}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'var(--accent)',
              color: '#fff',
            }}
          >
            {loading ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                />
                Cargando...
              </>
            ) : (
              'Cargar datos de demostración'
            )}
          </button>
        </div>

        {result && (
          <div
            className="mt-4 rounded-lg px-4 py-3 text-sm font-medium"
            style={{
              background:
                result.type === 'success'
                  ? 'color-mix(in srgb, var(--emerald) 15%, transparent)'
                  : 'color-mix(in srgb, var(--coral) 15%, transparent)',
              color:
                result.type === 'success'
                  ? 'var(--emerald)'
                  : 'var(--coral)',
              border: `1px solid ${
                result.type === 'success'
                  ? 'color-mix(in srgb, var(--emerald) 30%, transparent)'
                  : 'color-mix(in srgb, var(--coral) 30%, transparent)'
              }`,
            }}
          >
            {result.message}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('apariencia')

  return (
    <div className="flex gap-6 h-full">
      {/* Left nav */}
      <aside
        className="w-48 shrink-0 rounded-xl border p-2 self-start"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <nav className="space-y-0.5">
          {SETTINGS_TABS.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-2)]'
                    : 'text-[var(--muted2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Content area */}
      <main
        className="flex-1 rounded-xl border p-6 min-h-[500px]"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="mb-6">
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-nunito)', color: 'var(--text)' }}
          >
            {SETTINGS_TABS.find(t => t.id === activeTab)?.label}
          </h2>
        </div>

        {activeTab === 'apariencia' && <AparienciaTab />}
        {activeTab === 'cuenta' && <CuentaTab />}
        {activeTab === 'notificaciones' && <NotificacionesTab />}
        {activeTab === 'ia' && <ConexionIAsTab />}
        {activeTab === 'datos' && <DatosTab />}
      </main>
    </div>
  )
}
