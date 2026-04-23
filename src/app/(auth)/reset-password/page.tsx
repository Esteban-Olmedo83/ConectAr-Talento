'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface PasswordRules {
  length: boolean
  uppercase: boolean
  number: boolean
  symbol: boolean
}

function checkPassword(pwd: string): PasswordRules {
  return {
    length:    pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    number:    /[0-9]/.test(pwd),
    symbol:    /[^A-Za-z0-9]/.test(pwd),
  }
}

function isStrong(rules: PasswordRules) {
  return Object.values(rules).every(Boolean)
}

const RULES_LABELS: { key: keyof PasswordRules; label: string }[] = [
  { key: 'length',    label: 'Mínimo 8 caracteres' },
  { key: 'uppercase', label: 'Al menos una mayúscula' },
  { key: 'number',    label: 'Al menos un número' },
  { key: 'symbol',    label: 'Al menos un símbolo (!, @, #, $…)' },
]

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [done, setDone] = React.useState(false)

  const rules = checkPassword(password)
  const strong = isStrong(rules)
  const matches = password === confirm && confirm.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!strong) {
      setError('La contraseña no cumple todos los requisitos de seguridad.')
      return
    }
    if (!matches) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const { data: { user }, error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    // Registrar evento de seguridad
    if (user) {
      await supabase.from('security_events').insert({
        user_id: user.id,
        event_type: 'password_reset_completed',
        metadata: { method: 'otp_code' },
      })
    }

    setIsLoading(false)
    setDone(true)
    setTimeout(() => router.push('/pipeline'), 2500)
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">¡Contraseña actualizada!</h2>
          <p className="text-muted-foreground text-sm">Redirigiendo al dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Nueva contraseña</h1>
          <p className="text-muted-foreground text-sm">
            Elegí una contraseña segura para tu cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoFocus
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Indicadores de seguridad */}
            {password.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {RULES_LABELS.map(({ key, label }) => (
                  <li key={key} className="flex items-center gap-2 text-xs">
                    {rules[key]
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      : <XCircle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    }
                    <span className={rules[key] ? 'text-green-600' : 'text-muted-foreground'}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirmar */}
          <div className="space-y-2">
            <Label htmlFor="confirm">Repetir contraseña</Label>
            <Input
              id="confirm"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repetí la contraseña"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={isLoading}
              className={confirm.length > 0 ? (matches ? 'border-green-500' : 'border-destructive') : ''}
            />
            {confirm.length > 0 && !matches && (
              <p className="text-xs text-destructive">Las contraseñas no coinciden.</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !strong || !matches}
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              'Guardar nueva contraseña'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
