'use client'

import * as React from 'react'
import { Monitor, Sun, Moon, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  { id: 'ia', label: 'IA & Gemini' },
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

// ─── Placeholder tab ──────────────────────────────────────────────────────────
function PlaceholderTab({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center rounded-xl border"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--surface2)',
      }}
    >
      <p className="text-sm font-medium" style={{ color: 'var(--muted2)' }}>
        {label}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
        Próximamente
      </p>
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
        {activeTab === 'cuenta' && <PlaceholderTab label="Configuración de cuenta" />}
        {activeTab === 'notificaciones' && <PlaceholderTab label="Configuración de notificaciones" />}
        {activeTab === 'ia' && <PlaceholderTab label="Configuración de IA & Gemini" />}
        {activeTab === 'datos' && <PlaceholderTab label="Gestión de datos" />}
      </main>
    </div>
  )
}
