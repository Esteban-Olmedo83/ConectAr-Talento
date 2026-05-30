'use client'

import * as React from 'react'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle2, Loader2, Zap, Rocket, Building2, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { UserPlan } from '@/types'
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel'
import { BrandLogo } from '@/components/brand'

const LEFT_PANEL = {
  headline: 'Empezá gratis. <em>Crecé sin límites.</em>',
  subtitle: 'Sin tarjeta de crédito. En menos de 2 minutos tenés tu cuenta activa.',
  features: [
    { title: 'Free para siempre', desc: 'Plan gratuito sin vencimiento ni sorpresas.' },
    { title: 'Setup en 2 minutos', desc: 'Importá tus vacantes y arrancá hoy mismo.' },
    { title: 'Soporte en español', desc: 'Equipo local, respuesta en menos de 24 hs.' },
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

const plans: {
  id: UserPlan
  name: string
  price: string
  description: string
  icon: React.ElementType
  highlighted?: boolean
}[] = [
  { id: 'free', name: 'Free', price: '$0', description: 'Para empezar', icon: CheckCircle2 },
  { id: 'starter', name: 'Starter', price: '$29', description: 'Para crecer', icon: Star },
  { id: 'pro', name: 'Pro', price: '$79', description: 'Para equipos', icon: Rocket, highlighted: true },
  { id: 'business', name: 'Business', price: '$149', description: 'Para empresas', icon: Building2 },
]

export default function SignupPage() {
  const [fullName, setFullName] = React.useState('')
  const [company, setCompany] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [selectedPlan, setSelectedPlan] = React.useState<UserPlan>('free')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState(false)

  const handleGoogleLogin = () => {
    setError('')
    window.location.href = '/api/auth/google'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!fullName.trim() || !company.trim() || !email.trim() || !password) {
      setError('Por favor completá todos los campos.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setIsLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim(), company_name: company.trim(), plan: selectedPlan },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (authError) {
      setError(
        authError.message === 'User already registered'
          ? 'Ya existe una cuenta con ese email. Intentá iniciar sesión.'
          : authError.message
      )
      setIsLoading(false)
      return
    }
    // Fire welcome email — fire and forget, do not block UI
    fetch('/api/emails/welcome', { method: 'POST' }).catch(() => {})
    setSuccess(true)
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: S.bg }}
      >
        <div className="text-center space-y-4 px-6">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full mx-auto"
            style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}
          >
            <CheckCircle2 className="h-8 w-8" style={{ color: '#34d399' }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: S.text }}>¡Cuenta creada!</h2>
          <p className="max-w-sm text-sm" style={{ color: S.textSec }}>
            Te enviamos un email de confirmación. Hacé click en el link del email para activar tu cuenta.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: S.bg }}>
      {/* Left panel — hidden on mobile */}
      <div className="hidden md:flex md:flex-1">
        <AuthLeftPanel {...LEFT_PANEL} />
      </div>

      {/* Right panel — full width on mobile */}
      <div
        className="flex w-full md:flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10 overflow-y-auto"
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

        <div className="w-full max-w-[380px] space-y-7 py-8">
          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold" style={{ color: S.text }}>
              Creá tu cuenta gratis
            </h1>
            <p className="text-sm" style={{ color: S.textSec }}>
              Sin tarjeta de crédito. En menos de 2 minutos.
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
            Registrarse con Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: S.border }} />
            <span className="text-xs font-medium tracking-widest" style={{ color: S.textMuted }}>
              O CON EMAIL
            </span>
            <div className="flex-1 h-px" style={{ background: S.border }} />
          </div>

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

            {/* Name + Company grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-medium uppercase tracking-wide" style={{ color: S.textSec }}>
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="María García"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: S.inputBg, border: `1px solid ${S.inputBorder}`, color: S.text }}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="company" className="text-xs font-medium uppercase tracking-wide" style={{ color: S.textSec }}>
                  Empresa
                </label>
                <input
                  id="company"
                  type="text"
                  placeholder="Tu Empresa S.A."
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: S.inputBg, border: `1px solid ${S.inputBorder}`, color: S.text }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide" style={{ color: S.textSec }}>
                Email de trabajo
              </label>
              <input
                id="email"
                type="email"
                placeholder="maria@empresa.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: S.inputBg, border: `1px solid ${S.inputBorder}`, color: S.text }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide" style={{ color: S.textSec }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none"
                  style={{ background: S.inputBg, border: `1px solid ${S.inputBorder}`, color: S.text }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: S.textMuted }}
                  aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Plan selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: S.textSec }}>
                Elegí tu plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {plans.map((plan) => {
                  const Icon = plan.icon
                  const isSelected = selectedPlan === plan.id
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      aria-pressed={isSelected}
                      className="relative flex flex-col items-start gap-1.5 rounded-xl p-3 text-left transition-all"
                      style={{
                        background: isSelected ? 'rgba(93,80,214,0.18)' : S.inputBg,
                        border: `1px solid ${isSelected ? S.accent : S.inputBorder}`,
                        outline: isSelected ? `1px solid ${S.accent}` : 'none',
                      }}
                    >
                      {plan.highlighted && (
                        <span
                          className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{ background: S.accent, color: '#fff' }}
                        >
                          MÁS POPULAR
                        </span>
                      )}
                      <div className="flex items-center justify-between w-full">
                        <Icon className="h-3.5 w-3.5" style={{ color: isSelected ? S.accentSoft : S.textMuted }} />
                        <span className="text-xs font-semibold" style={{ color: isSelected ? S.accentSoft : S.textSec }}>
                          {plan.price}
                        </span>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: S.text }}>{plan.name}</p>
                      <p className="text-[10px] leading-tight" style={{ color: S.textMuted }}>{plan.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: S.accent, color: '#fff' }}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...</>
              ) : (
                <><Zap className="h-4 w-4" /> Crear cuenta gratis</>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-xs text-center" style={{ color: S.textMuted }}>
            Al registrarte aceptás nuestros{' '}
            <Link href="/terms" className="hover:underline" style={{ color: S.textSec }}>Términos</Link>
            {' '}y{' '}
            <Link href="/privacy" className="hover:underline" style={{ color: S.textSec }}>Privacidad</Link>
            {' · '}
            <Link href="/login" className="hover:underline" style={{ color: S.accentSoft }}>Ya tengo cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
