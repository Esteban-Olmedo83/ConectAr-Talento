'use client'

import * as React from 'react'
import { Menu, Search, LogOut, Settings, User } from 'lucide-react'
import { Sidebar } from './sidebar'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { cn } from '@/lib/utils'
import type { User as UserType } from '@/types'

interface AppLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  pageSubtitle?: string
  user: UserType | null
}

export function AppLayout({ children, pageTitle, pageSubtitle, user }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const handleLogout = React.useCallback(async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.replace('/login')
  }, [])

  const initials = user
    ? user.fullName
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

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
            padding: '12px 16px',
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
            <NotificationBell />

            {/* User avatar + dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-1 py-0.5 transition-colors hover:bg-[var(--surface2)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2'
                  )}
                  aria-label="Menú de usuario"
                  aria-expanded={dropdownOpen}
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

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl z-50 overflow-hidden"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {/* User info header */}
                    <div
                      className="px-4 py-3"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                        {user.fullName}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>
                        {user.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <a
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface2)]"
                        style={{ color: 'var(--text)' }}
                      >
                        <Settings className="h-4 w-4 shrink-0" style={{ color: 'var(--muted)' }} />
                        Configuración
                      </a>
                      <a
                        href="/settings?tab=perfil"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface2)]"
                        style={{ color: 'var(--text)' }}
                      >
                        <User className="h-4 w-4 shrink-0" style={{ color: 'var(--muted)' }} />
                        Mi perfil
                      </a>
                    </div>

                    {/* Logout */}
                    <div style={{ borderTop: '1px solid var(--border)' }} className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface2)]"
                        style={{ color: '#f87171' }}
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Scrollable page content */}
        <main
          className="flex-1 overflow-y-auto p-3 sm:p-6"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
