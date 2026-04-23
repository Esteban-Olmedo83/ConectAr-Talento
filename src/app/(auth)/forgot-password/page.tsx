'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

type Step = 'email' | 'code'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>('email')
  const [email, setEmail] = React.useState('')
  const [code, setCode] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [resendCooldown, setResendCooldown] = React.useState(0)

  // Countdown para reenviar código
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
      // No revelar si el email existe o no
      setError('No pudimos procesar la solicitud. Verificá el email ingresado.')
      return false
    }

    setResendCooldown(60)
    return true
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Por favor ingresá tu email.')
      return
    }
    const ok = await sendCode(email.trim())
    if (ok) setStep('code')
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos.')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    setIsLoading(false)

    if (verifyError) {
      setError('Código incorrecto o expirado. Intentá de nuevo.')
      return
    }

    // Código verificado — sesión activa — ir a nueva contraseña
    router.push('/reset-password')
  }

  // ── PASO 1: ingresar email ─────────────────────────────────
  if (step === 'email') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">¿Olvidaste tu contraseña?</h1>
            <p className="text-muted-foreground text-sm">
              Te enviamos un código de 6 dígitos a tu email para verificar tu identidad.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
            {error && (
              <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Enviando código...</>
              ) : (
                <><Mail className="h-4 w-4" /> Enviar código de verificación</>
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // ── PASO 2: ingresar código ────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <button
          onClick={() => { setStep('email'); setCode(''); setError('') }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Cambiar email
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            <h1 className="text-2xl font-bold text-foreground">Verificá tu identidad</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Ingresá el código de 6 dígitos que enviamos a{' '}
            <span className="font-medium text-foreground">{email}</span>.
            Revisá también la carpeta de spam.
          </p>
        </div>

        <form onSubmit={handleCodeSubmit} className="space-y-4" noValidate>
          {error && (
            <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="code">Código de verificación</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              disabled={isLoading}
              autoFocus
              className="text-center text-2xl tracking-[0.5em] font-mono"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Verificando...</>
            ) : (
              'Verificar código'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿No te llegó?{' '}
          {resendCooldown > 0 ? (
            <span className="text-muted-foreground">Reenviar en {resendCooldown}s</span>
          ) : (
            <button
              onClick={() => sendCode(email)}
              disabled={isLoading}
              className="text-primary hover:underline disabled:opacity-50"
            >
              Reenviar código
            </button>
          )}
        </p>
      </div>
    </div>
  )
}
