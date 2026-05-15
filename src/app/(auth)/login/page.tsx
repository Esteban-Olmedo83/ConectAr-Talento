'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel'
import { BrandLogo } from '@/components/brand'

const LEFT_PANEL = {
  headline: 'El talento que buscás, <em>conectado en un solo lugar.</em>',
  subtitle: 'La plataforma ATS diseñada para reclutadores latinoamericanos.',
  features: [
    { title: 'IA para análisis de CVs', desc: 'Puntuación automática y detección de skills.' },
    { title: 'Procesos de reclutamiento', desc: 'Gestioná candidatos con drag & drop en tiempo real.' },
    { title: 'Publicación en +10 job boards', desc: 'LinkedIn, Indeed, Computrabajo, ZonaJobs y más.' },
  ],
}

const S = {
  bg: '#0B0B14',
  panel: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.07)',
  accent: '#5D50D6',
  accentSoft: '#8B7EFF',
  text: '#ffffff',
  textSec: 'rgba(255,255,255,0.45)',
  textMuted: 'rgba(255,255,255,0.25)',
  inputBg: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(255,255,255,0.12)',
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.push('/dashboard')
    }
    checkAuth()
  }, [router])

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'auth_callback_failed') {
      setError('Error al iniciar sesión con Google. Por favor intentá de nuevo.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Por favor completá todos los campos.'); return }
    setIsLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos.' : authError.message)
      setIsLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen" style={{ background: S.bg }}>
      {/* Left panel */}
      <div className="flex-1">
        <AuthLeftPanel {...LEFT_PANEL} />
      </div>

      {/* Right panel */}
      <div
        className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12 relative"
        style={{
          background: S.panel,
          backdropFilter: 'blur(24px)',
          borderLeft: `1px solid ${S.border}`,
        }}
      >
        {/* Mobile logo */}
        <div className="md:hidden mb-8">
          <BrandLogo onDark href="/" size="md" iconSize={28} />
        </div>

        <div className="w-full max-w-sm space-y-7">
          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold" style={{ color: S.text }}>
              Bienvenido de vuelta
            </h1>
            <p className="text-sm" style={{ color: S.textSec }}>
              Ingresá a tu cuenta para continuar
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: S.border }} />
            <span className="text-xs font-medium tracking-widest" style={{ color: S.textMuted }}>
              CON EMAIL
            </span>
            <div className="flex-1 h-px" style={{ background: S.border }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
              >
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide" style={{ color: S.textSec }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: S.inputBg,
                  border: `1px solid ${S.inputBorder}`,
                  color: S.text,
                }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide" style={{ color: S.textSec }}>
                  Contraseña
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs hover:underline"
                  style={{ color: S.accentSoft }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-colors"
                  style={{
                    background: S.inputBg,
                    border: `1px solid ${S.inputBorder}`,
                    color: S.text,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: S.textMuted }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: S.accent, color: '#fff' }}
            >
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Ingresando...</> : 'Ingresar'}
            </button>
          </form>

          {/* Footer links */}
          <div className="text-center space-y-1.5">
            <p className="text-sm" style={{ color: S.textSec }}>
              ¿No tenés cuenta?{' '}
              <Link href="/signup" className="font-medium hover:underline" style={{ color: S.accentSoft }}>
                Registrate gratis
              </Link>
            </p>
            <p className="text-xs" style={{ color: S.textMuted }}>
              Sin tarjeta de crédito requerida
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
