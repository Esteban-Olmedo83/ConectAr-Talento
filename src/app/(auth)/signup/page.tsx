'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, CheckCircle2, Loader2, Zap, Rocket, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { User, UserPlan } from '@/types'

const plans: {
  id: UserPlan
  name: string
  price: string
  description: string
  features: string[]
  icon: React.ElementType
  highlighted?: boolean
}[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'Para empezar',
    icon: CheckCircle2,
    features: ['Hasta 3 vacantes activas', '50 candidatos/mes', 'Pipeline basico'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    description: 'Para equipos en crecimiento',
    icon: Rocket,
    highlighted: true,
    features: [
      'Vacantes ilimitadas',
      'Candidatos ilimitados',
      'IA analisis CVs',
      'Publicacion multi-plataforma',
      'Templates personalizados',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$149',
    description: 'Para grandes empresas',
    icon: Building2,
    features: [
      'Todo lo de Pro',
      'Multiples usuarios',
      'Integraciones avanzadas',
      'Reportes personalizados',
      'Soporte prioritario',
    ],
  },
]

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = React.useState('')
  const [company, setCompany] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [selectedPlan, setSelectedPlan] = React.useState<UserPlan>('free')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || !company.trim() || !email.trim() || !password) {
      setError('Por favor completá todos los campos.')
      return
    }
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.')
      return
    }

    setIsLoading(true)
    await new Promise((res) => setTimeout(res, 800))

    const user: User = {
      id: Math.random().toString(36).slice(2),
      email,
      fullName,
      plan: selectedPlan,
      tenantId: Math.random().toString(36).slice(2),
      companyName: company,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('ct_user', JSON.stringify(user))
    router.push('/pipeline')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-background dark:to-indigo-950/10 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500 text-white font-bold text-sm">
            CT
          </div>
          <span className="font-semibold text-foreground">ConectAr Talento</span>
        </Link>
        <p className="text-sm text-muted-foreground">
          Ya tenes cuenta?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Ingresa
          </Link>
        </p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Crea tu cuenta gratis
            </h1>
            <p className="text-muted-foreground">
              Sin tarjeta de credito. Empeza en menos de 2 minutos.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-background rounded-2xl border shadow-sm p-6 md:p-8 space-y-6">
            {error && (
              <div
                role="alert"
                className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Maria Garcia"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Acme S.A."
                    autoComplete="organization"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email de trabajo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="maria@empresa.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contrasena</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimo 6 caracteres"
                    autoComplete="new-password"
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
                    aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Plan selector */}
              <div className="space-y-3">
                <Label>Elegí tu plan</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {plans.map((plan) => {
                    const Icon = plan.icon
                    const isSelected = selectedPlan === plan.id
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan.id)}
                        className={cn(
                          'relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                            : 'border-border hover:border-indigo-300 hover:bg-accent',
                          plan.highlighted && !isSelected && 'border-indigo-300'
                        )}
                        aria-pressed={isSelected}
                      >
                        {plan.highlighted && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                            Mas popular
                          </span>
                        )}
                        <div className="flex items-center justify-between w-full">
                          <Icon
                            className={cn(
                              'h-4 w-4',
                              isSelected
                                ? 'text-indigo-600'
                                : 'text-muted-foreground'
                            )}
                          />
                          <span
                            className={cn(
                              'text-xs font-medium',
                              isSelected
                                ? 'text-indigo-600'
                                : 'text-muted-foreground'
                            )}
                          >
                            {plan.price}
                            <span className="font-normal">/mes</span>
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {plan.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {plan.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Crear cuenta gratis
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              Al registrarte aceptas nuestros{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terminos de servicio
              </Link>{' '}
              y{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Politica de privacidad
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
