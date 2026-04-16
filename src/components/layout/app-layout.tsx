'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
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

export function AppLayout({ children, pageTitle, user }: AppLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  const handleLogout = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ct_user')
    }
    router.push('/login')
  }, [router])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top header bar */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-background shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Page title */}
            {pageTitle && (
              <h1 className="text-lg font-semibold text-foreground hidden sm:block">
                {pageTitle}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Search button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Buscar"
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            </Button>

            {/* User avatar */}
            {user && (
              <button
                className={cn(
                  'flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                )}
                aria-label="Menu de usuario"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-xs font-bold shrink-0">
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

        {/* Scrollable page content */}
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
