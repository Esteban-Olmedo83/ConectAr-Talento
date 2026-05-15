'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Bell, Search } from 'lucide-react'
import { Sidebar } from './sidebar'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'

interface AppLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  pageSubtitle?: string
  user: User | null
}

export function AppLayout({ children, pageTitle, pageSubtitle, user }: AppLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  const handleLogout = React.useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }, [router])

  const initials = user
    ? user.fullName
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Glass topbar */}
        <header
          className="flex items-center justify-between shrink-0 glass"
          style={{
            background: 'var(--topbar-bg)',
            borderBottom: '1px solid var(--border)',
            padding: '14px 28px',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-[var(--surface2)]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
              style={{ color: 'var(--muted)' }}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Page title + subtitle */}
            {pageTitle && (
              <div>
                <h1
                  className="leading-tight"
                  style={{
                    fontFamily: 'var(--font-nunito)',
                    fontSize: 18,
                    fontWeight: 800,
                    color: 'var(--text)',
                  }}
                >
                  {pageTitle}
                </h1>
                {pageSubtitle && (
                  <p
                    className="text-xs leading-tight mt-0.5"
                    style={{ color: 'var(--muted)' }}
                  >
                    {pageSubtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-[var(--surface2)]"
              aria-label="Buscar"
              style={{ color: 'var(--muted)' }}
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notifications */}
            <button
              className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-[var(--surface2)]"
              aria-label="Notificaciones"
              style={{ color: 'var(--muted)' }}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: 'var(--accent)' }}
                />
                <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ background: 'var(--accent)' }}
                />
              </span>
            </button>

            {/* User avatar */}
            {user && (
              <button
                className={cn(
                  'flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2'
                )}
                aria-label="Menú de usuario"
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  }}
                >
                  {initials}
                </div>
                <span
                  className="hidden md:block text-sm font-medium max-w-[120px] truncate"
                  style={{ color: 'var(--text)' }}
                >
                  {user.fullName}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable page content */}
        <main
          className="flex-1 overflow-y-auto p-6"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
