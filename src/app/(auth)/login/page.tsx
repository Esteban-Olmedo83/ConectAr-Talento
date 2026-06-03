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
    const err = params.get('error')
    const AUTH_ERRORS: Record<string, string> = {
      auth_callback_failed: 'Error al iniciar sesión. Por favor intentá de nuevo.',
    }
    if (err && AUTH_ERRORS[err]) setError(AUTH_ERRORS[err])
  }, [])

  const handleGoogleLogin = async () => {
    setError('')
    setIsLoading(true)
    const supabase = createClient()
    const appUrl = window.location.origin
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${appUrl}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    })
    if (oauthError) {
      setError('Error al iniciar sesión con Google. Por favor intentá de nuevo.')
      setIsLoading(false)
    }
  }

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
      {/* Left panel — hidden on mobile */}
      <div className="hidden md:flex md:flex-1">
        <AuthLeftPanel {...LEFT_PANEL} />
      </div>

      {/* Right panel — full width on mobile, half on desktop */}
      <div
        className="flex w-full md:flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10 relative"
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

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-60"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid rgba(255,255,255,0.12)`,
              color: '#ffffff',
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: S.border }} />
            <span className="text-xs font-medium tracking-widest" style={{ color: S.textMuted }}>
              O CON EMAIL
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
