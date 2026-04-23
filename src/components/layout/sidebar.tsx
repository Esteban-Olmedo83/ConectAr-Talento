'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  FileText,
  Plug,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { User } from '@/types'
import { BrandLogo } from '@/components/brand'

// Nav items definition
const navItems = [
  { label: 'Pipeline', href: '/pipeline', icon: LayoutDashboard },
  { label: 'Vacantes', href: '/vacancies', icon: Briefcase },
  { label: 'Candidatos', href: '/candidates', icon: Users },
  { label: 'Entrevistas', href: '/interviews', icon: Calendar },
  { label: 'Templates', href: '/templates', icon: FileText },
  { label: 'Integraciones', href: '/integrations', icon: Plug },
  { label: 'Informes', href: '/reports', icon: BarChart3 },
]

const planLabels: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
  onClose: () => void
  user: User | null
  onLogout: () => void
}

export function Sidebar({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
  user,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out',
          'bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))]',
          isCollapsed ? 'w-16' : 'w-64',
          'lg:translate-x-0 lg:relative lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Navegacion principal"
      >
        {/* Logo area */}
        <div
          className={cn(
            'flex items-center h-16 border-b border-white/10 px-4 shrink-0',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center min-w-0">
            <BrandLogo onDark href="/" iconSize={28} size="sm" iconOnly={isCollapsed} />
          </div>
          <button
            onClick={onToggleCollapse}
            className={cn(
              'hidden lg:flex items-center justify-center w-6 h-6 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0'
            )}
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto py-4 px-2 space-y-1"
          aria-label="Menu"
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-white/60 hover:bg-white/10 hover:text-white',
                  isCollapsed && 'justify-center px-2'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'shrink-0 h-5 w-5',
                    isActive
                      ? 'text-white'
                      : 'text-white/60 group-hover:text-white'
                  )}
                  aria-hidden="true"
                />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom user section */}
        <div className="shrink-0 border-t border-white/10 p-3 space-y-1">
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors',
              isCollapsed && 'justify-center px-2'
            )}
            title={isCollapsed ? 'Configuracion' : undefined}
          >
            <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!isCollapsed && <span>Configuracion</span>}
          </Link>

          {user && (
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg',
                isCollapsed ? 'justify-center' : ''
              )}
            >
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-xs font-bold">
                {getInitials(user.fullName)}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate leading-tight">
                    {user.fullName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge
                      variant={user.plan === 'pro' || user.plan === 'business' ? 'default' : 'secondary'}
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      {planLabels[user.plan] ?? user.plan}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onLogout}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-red-400 transition-colors',
              isCollapsed && 'justify-center px-2'
            )}
            aria-label="Cerrar sesion"
            title={isCollapsed ? 'Cerrar sesion' : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!isCollapsed && <span>Cerrar sesion</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
