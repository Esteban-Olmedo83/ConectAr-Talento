'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Bell, Search } from 'lucide-react'
import { Sidebar } from './sidebar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { User } from '@/types'

interface AppLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  user: User | null
}

const pageMeta: Array<{ match: RegExp; title: string; subtitle: string }> = [
  { match: /^\/pipeline(?:\/|$)/, title: 'Pipeline', subtitle: 'Gestiona el flujo completo de candidatos' },
  { match: /^\/vacancies(?:\/|$)/, title: 'Vacantes', subtitle: 'Publicacion y seguimiento de busquedas activas' },
  { match: /^\/candidates(?:\/|$)/, title: 'Candidatos', subtitle: 'Base de talento, scoring y evaluacion' },
  { match: /^\/interviews(?:\/|$)/, title: 'Entrevistas', subtitle: 'Agenda, feedback y decisiones del proceso' },
  { match: /^\/templates(?:\/|$)/, title: 'Templates', subtitle: 'Plantillas para comunicacion y automatizaciones' },
  { match: /^\/integrations(?:\/|$)/, title: 'Integraciones', subtitle: 'Conecta herramientas y automatiza el flujo' },
  { match: /^\/reports(?:\/|$)/, title: 'Informes', subtitle: 'Metricas, analitica y exportaciones ejecutivas' },
  { match: /^\/settings(?:\/|$)/, title: 'Configuracion', subtitle: 'Preferencias de cuenta y de organizacion' },
]

export function AppLayout({ children, pageTitle, user }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  const routeMeta = React.useMemo(() => {
    const found = pageMeta.find((item) => item.match.test(pathname))
    if (found) return found
    return { title: pageTitle || 'ConectAr Talento', subtitle: 'Plataforma de reclutamiento' }
  }, [pathname, pageTitle])

  const handleLogout = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ct_user')
    }
    router.push('/login')
  }, [router])

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.11),transparent_26%),radial-gradient(circle_at_top_right,hsl(var(--warning)/0.14),transparent_22%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--surface-muted))_48%,hsl(var(--background)))]" />
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-10 flex h-20 shrink-0 items-center justify-between border-b border-border/80 bg-surface/88 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {pageTitle && (
              <div className="hidden sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  ConectAr HR
                </p>
                <h1 className="text-lg font-semibold text-text-primary">{pageTitle}</h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              aria-label="Buscar"
              className="hidden min-w-[220px] justify-start gap-2 border-border/80 bg-background/70 text-text-secondary md:inline-flex"
            >
              <Search className="h-4 w-4" />
              Buscar candidatos, vacantes...
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Notificaciones"
              className="relative border border-transparent bg-surface/55 text-text-secondary hover:border-border hover:bg-surface hover:text-text-primary"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/50 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
            </Button>

            {user && (
              <button
                className={cn(
                  'flex items-center gap-2.5 rounded-full border border-border/80 bg-surface px-1.5 py-1.5 shadow-[var(--shadow-sm)] transition-colors [transition-duration:var(--motion-fast)] hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/55 focus-visible:ring-offset-2'
                )}
                aria-label="Menu de usuario"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/14 text-xs font-bold text-accent">
                  {user.fullName
                    .trim()
                    .split(/\s+/)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="hidden min-w-0 md:block">
                  <span className="block max-w-[140px] truncate text-sm font-medium text-text-primary">
                    {user.fullName}
                  </span>
                  <span className="block text-xs text-text-secondary">{user.companyName}</span>
                </div>
              </button>
            )}
          </div>
        </header>

        <div className="relative z-10 shrink-0 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-xl md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
            {routeMeta.title}
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-text-primary">{routeMeta.title}</h2>
          <p className="mt-0.5 text-sm text-text-secondary">{routeMeta.subtitle}</p>
        </div>

        <main className="relative z-0 flex-1 overflow-y-auto p-4 md:p-6" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
