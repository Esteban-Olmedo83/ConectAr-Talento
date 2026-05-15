'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, Mail, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel'
import { BrandLogo } from '@/components/brand'

const LEFT_PANEL = {
  headline: 'Recuperá el acceso <em>a tu cuenta.</em>',
  subtitle: 'Te enviamos un código seguro a tu email. En menos de 2 minutos volvés a operar.',
  features: [
    { title: 'Código de un solo uso', desc: 'Generado al instante, válido por 15 minutos.' },
    { title: 'Expira en 15 minutos', desc: 'Seguridad máxima para tu cuenta.' },
    { title: 'Sin preguntas secretas', desc: 'Proceso simple y seguro.' },
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

type Step = 'email' | 'code'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>('email')
  const [email, setEmail] = React.useState('')
  const [code, setCode] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [resendCooldown, setResendCooldown] = React.useState(0)

  React.useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const sendCode = async (targetEmail: string) => {
    setIsLoading(true)
    setError('')
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: { shouldCreateUser: false },
    })
    setIsLoading(false)
    if (otpError) {
      console.error('[OTP error]', otpError.status, otpError.message)
      const msg = otpError.message?.toLowerCase() ?? ''
      if (otpError.status === 429 || msg.includes('rate') || msg.includes('too many')) {
        setError('Demasiados intentos. Esperá unos minutos antes de volver a intentarlo.')
      } else if (msg.includes('email not confirmed') || msg.includes('not found') || msg.includes('user not found')) {
        setError('No encontramos una cuenta con ese email.')
      } else {
        setError(`Error al enviar el código: ${otpError.message}`)
      }
      return false
    }
    setResendCooldown(60)
    return true
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Por favor ingresá tu email.'); return }
    const ok = await sendCode(email.trim())
    if (ok) setStep('code')
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (code.length !== 8) { setError('El código debe tener 8 dígitos.'); return }
    setIsLoading(true)
    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    setIsLoading(false)
    if (verifyError) { setError('Código incorrecto o expirado. Intentá de nuevo.'); return }
    router.push('/reset-password')
  }

  const rightContent = step === 'email' ? (
    <div className="w-full max-w-sm space-y-7">
      {/* Back link */}
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm transition-colors"
        style={{ color: S.textSec }}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio de sesión
      </Link>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        <div className="h-1 rounded-full" style={{ width: '40px', background: S.accent }} />
        <div className="h-1 rounded-full" style={{ width: '16px', background: 'rgba(255,255,255,0.15)' }} />
        <div className="h-1 rounded-full" style={{ width: '16px', background: 'rgba(255,255,255,0.15)' }} />
      </div>

      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: S.text }}>
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-sm" style={{ color: S.textSec }}>
          Te enviamos un código de 8 dígitos a tu email para verificar tu identidad.
        </p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-lg px-4 py-3 text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
          >
            {error}
          </div>
        )}
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
            autoFocus
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: S.inputBg, border: `1px solid ${S.inputBorder}`, color: S.text }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: S.accent, color: '#fff' }}
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Enviando código...</>
          ) : (
            <><Mail className="h-4 w-4" /> Enviar código de verificación</>
          )}
        </button>
      </form>

      <div className="text-center space-y-1.5">
        <p className="text-sm" style={{ color: S.textSec }}>
          ¿Recordaste tu contraseña?{' '}
          <Link href="/login" className="font-medium hover:underline" style={{ color: S.accentSoft }}>
            Volvé a ingresar
          </Link>
        </p>
        <p className="text-xs" style={{ color: S.textMuted }}>
          Revisá también tu carpeta de spam
        </p>
      </div>
    </div>
  ) : (
    <div className="w-full max-w-sm space-y-7">
      {/* Back */}
      <button
        onClick={() => { setStep('email'); setCode(''); setError('') }}
        className="inline-flex items-center gap-2 text-sm transition-colors"
        style={{ color: S.textSec }}
      >
        <ArrowLeft className="h-4 w-4" />
        Cambiar email
      </button>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        <div className="h-1 rounded-full" style={{ width: '40px', background: S.accent }} />
        <div className="h-1 rounded-full" style={{ width: '40px', background: S.accent }} />
        <div className="h-1 rounded-full" style={{ width: '16px', background: 'rgba(255,255,255,0.15)' }} />
      </div>

      {/* Heading */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-5 w-5" style={{ color: S.accentSoft }} />
          <h1 className="text-2xl font-bold" style={{ color: S.text }}>
            Verificá tu identidad
          </h1>
        </div>
        <p className="text-sm" style={{ color: S.textSec }}>
          Ingresá el código de 8 dígitos enviado a{' '}
          <span className="font-medium" style={{ color: S.text }}>{email}</span>.
          Revisá también la carpeta de spam.
        </p>
      </div>

      <form onSubmit={handleCodeSubmit} className="space-y-4" noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-lg px-4 py-3 text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
          >
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="code" className="text-xs font-medium uppercase tracking-wide" style={{ color: S.textSec }}>
            Código de verificación
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            placeholder="12345678"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
            required
            disabled={isLoading}
            autoFocus
            className="w-full rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono outline-none"
            style={{ background: S.inputBg, border: `1px solid ${S.inputBorder}`, color: S.text }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || code.length !== 8}
          className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: S.accent, color: '#fff' }}
        >
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verificando...</> : 'Verificar código'}
        </button>
      </form>

      <p className="text-center text-sm" style={{ color: S.textSec }}>
        ¿No te llegó?{' '}
        {resendCooldown > 0 ? (
          <span style={{ color: S.textMuted }}>Reenviar en {resendCooldown}s</span>
        ) : (
          <button
            onClick={() => sendCode(email)}
            disabled={isLoading}
            className="font-medium hover:underline disabled:opacity-50"
            style={{ color: S.accentSoft }}
          >
            Reenviar código
          </button>
        )}
      </p>
    </div>
  )

  return (
    <div className="flex min-h-screen" style={{ background: S.bg }}>
      <div className="flex-1">
        <AuthLeftPanel {...LEFT_PANEL} />
      </div>
      <div
        className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12"
        style={{
          background: S.panel,
          backdropFilter: 'blur(24px)',
          borderLeft: `1px solid ${S.border}`,
        }}
      >
        <div className="md:hidden mb-8">
          <BrandLogo onDark href="/" size="md" iconSize={28} />
        </div>
        {rightContent}
      </div>
    </div>
  )
}
