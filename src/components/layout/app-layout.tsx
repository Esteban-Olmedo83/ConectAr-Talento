'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, Bell, Search, Sun, Moon, Globe } from 'lucide-react'
import { Sidebar } from './sidebar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useLang, type Lang } from '@/lib/i18n'
import type { User } from '@/types'

interface AppLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  user: User | null
}

const LANGS: { value: Lang; flag: string }[] = [
  { value: 'es', flag: '🇦🇷' },
  { value: 'en', flag: '🇺🇸' },
  { value: 'pt', flag: '🇧🇷' },
]

export function AppLayout({ children, pageTitle, user }: AppLayoutProps) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const { lang, setLang, t } = useLang()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [langOpen, setLangOpen] = React.useState(false)
  const langRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = React.useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }, [router])

  const isDark = resolvedTheme === 'dark'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-background shrink-0">
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
              <h1 className="text-lg font-semibold text-foreground hidden sm:block">
                {pageTitle}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              aria-label={t.common.search}
              className="text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notificaciones"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            </Button>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              aria-label={isDark ? t.theme.light : t.theme.dark}
              title={isDark ? t.theme.light : t.theme.dark}
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Language selector */}
            <div ref={langRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t.lang.label}
                title={t.lang.label}
                className="text-muted-foreground hover:text-foreground text-base"
                onClick={() => setLangOpen((o) => !o)}
              >
                <Globe className="h-4 w-4" />
              </Button>
              {langOpen && (
                <div className={cn(
                  'absolute right-0 top-full mt-1 z-50 min-w-[130px] rounded-xl border border-border bg-popover shadow-lg py-1 overflow-hidden'
                )}>
                  {LANGS.map(({ value, flag }) => (
                    <button
                      key={value}
                      onClick={() => { setLang(value); setLangOpen(false) }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                        lang === value
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      <span>{flag}</span>
                      <span>{t.lang[value]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User avatar */}
            {user && (
              <button
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-1"
                aria-label="Menu de usuario"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                  {user.fullName
                    .trim()
                    .split(/\s+/)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">
                  {user.fullName}
                </span>
              </button>
            )}
          </div>
        </header>

        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
