'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const features = [
  {
    title: 'IA para analisis de CVs',
    description: 'Puntuacion automatica y deteccion de skills con inteligencia artificial.',
  },
  {
    title: 'Pipeline visual Kanban',
    description: 'Gestioná candidatos con drag & drop en tiempo real.',
  },
  {
    title: 'Publicacion en +10 job boards',
    description: 'LinkedIn, Indeed, Computrabajo, ZonaJobs y mas con un clic.',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  // Show error from OAuth callback if present in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'auth_callback_failed') {
      setError('Error al iniciar sesión con Google. Por favor intentá de nuevo.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor completá todos los campos.')
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos.'
          : authError.message
      )
      setIsLoading(false)
      return
    }

    router.push('/pipeline')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen">
      {/* LEFT PANEL — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />

        {/* Top: logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur font-bold text-white text-lg">
            CT
          </div>
          <span className="text-white font-semibold text-lg">ConectAr Talento</span>
        </div>

        {/* Center: tagline + features */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              El talento que buscas,
              <br />
              <span className="text-indigo-300">conectado en un solo lugar.</span>
            </h2>
            <p className="mt-4 text-indigo-200 text-lg">
              La plataforma ATS disenada para reclutadores latinoamericanos.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-300 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-medium">{f.title}</p>
                  <p className="text-indigo-300 text-sm">{f.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: social proof */}
        <div className="relative">
          <p className="text-indigo-300 text-sm">
            Confiado por reclutadores en Argentina, Mexico, Colombia y Chile.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — login form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500 font-bold text-white text-base">
            CT
          </div>
          <span className="font-semibold text-foreground">ConectAr Talento</span>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground text-sm">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                o con email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
              >
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
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contrasena</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Olvidaste tu contrasena?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              No tenes cuenta?{' '}
              <Link
                href="/signup"
                className="text-primary font-medium hover:underline"
              >
                Registrate gratis
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              Sin tarjeta de credito requerida.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
