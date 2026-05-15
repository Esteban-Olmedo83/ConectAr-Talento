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
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/types'

// ─── Nav structure ────────────────────────────────────────────────────────────
const mainNavItems = [
  { label: 'Dashboard', href: '/pipeline', icon: LayoutDashboard },
  { label: 'Pipeline', href: '/pipeline', icon: LayoutDashboard, hidden: true },
  { label: 'Candidatos', href: '/candidates', icon: Users },
  { label: 'Vacantes', href: '/vacancies', icon: Briefcase },
  { label: 'Entrevistas', href: '/interviews', icon: Calendar },
]

const toolNavItems = [
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

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
  isCollapsed: boolean
  onClick?: () => void
}

function NavItem({ href, icon: Icon, label, isActive, isCollapsed, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2.5 rounded-[10px] transition-all duration-150 text-sm font-medium',
        isCollapsed ? 'justify-center px-2 py-2.5' : 'px-2.5 py-[9px]',
        isActive
          ? 'bg-[var(--accent-soft)] text-[var(--accent-2)]'
          : 'text-[var(--muted2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'
      )}
    >
      <Icon
        className={cn('shrink-0 h-4 w-4', isActive ? 'text-[var(--accent-2)]' : '')}
        aria-hidden="true"
      />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  )
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="my-1 border-t border-[var(--border)]" />
  return (
    <p
      className="px-2.5 pt-4 pb-1 text-[10px] uppercase tracking-[0.12em] font-semibold"
      style={{ color: 'var(--muted)' }}
    >
      {label}
    </p>
  )
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

  function isActive(href: string) {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  // For Dashboard item — active when on /pipeline
  const dashboardActive = pathname === '/pipeline' || pathname?.startsWith('/pipeline/')

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        style={{
          width: isCollapsed ? 64 : 220,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out shrink-0',
          'lg:translate-x-0 lg:relative lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Navegación principal"
      >
        {/* Logo area */}
        <div
          className={cn(
            'flex items-center h-16 shrink-0 px-3',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Link href="/pipeline" onClick={onClose} className="flex items-center gap-2.5 min-w-0">
            {/* Gradient logo square */}
            <div
              className="shrink-0 flex items-center justify-center rounded-[9px] text-white font-black text-xs"
              style={{
                width: 30,
                height: 30,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                boxShadow: '0 0 12px var(--accent-glow)',
                fontFamily: 'var(--font-nunito)',
              }}
            >
              CT
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p
                  className="text-sm font-extrabold leading-none"
                  style={{ fontFamily: 'var(--font-nunito)', color: 'var(--text)' }}
                >
                  ConectAr
                </p>
                <p
                  className="text-[9px] uppercase tracking-widest leading-none mt-0.5"
                  style={{ color: 'var(--muted)' }}
                >
                  Talento
                </p>
              </div>
            )}
          </Link>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={onToggleCollapse}
            className={cn(
              'hidden lg:flex items-center justify-center w-6 h-6 rounded-md transition-colors shrink-0',
              'hover:bg-[var(--surface2)]',
              isCollapsed && 'hidden'
            )}
            style={{ color: 'var(--muted)' }}
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" aria-label="Menú">
          {/* Main section */}
          <SectionLabel label="Principal" collapsed={isCollapsed} />

          {/* Dashboard (points to /pipeline) */}
          <NavItem
            href="/pipeline"
            icon={LayoutDashboard}
            label="Dashboard"
            isActive={dashboardActive}
            isCollapsed={isCollapsed}
            onClick={onClose}
          />
          <NavItem
            href="/candidates"
            icon={Users}
            label="Candidatos"
            isActive={isActive('/candidates')}
            isCollapsed={isCollapsed}
            onClick={onClose}
          />
          <NavItem
            href="/vacancies"
            icon={Briefcase}
            label="Vacantes"
            isActive={isActive('/vacancies')}
            isCollapsed={isCollapsed}
            onClick={onClose}
          />
          <NavItem
            href="/interviews"
            icon={Calendar}
            label="Entrevistas"
            isActive={isActive('/interviews')}
            isCollapsed={isCollapsed}
            onClick={onClose}
          />

          {/* Tools section */}
          <SectionLabel label="Herramientas" collapsed={isCollapsed} />
          <NavItem
            href="/templates"
            icon={FileText}
            label="Templates"
            isActive={isActive('/templates')}
            isCollapsed={isCollapsed}
            onClick={onClose}
          />
          <NavItem
            href="/integrations"
            icon={Plug}
            label="Integraciones"
            isActive={isActive('/integrations')}
            isCollapsed={isCollapsed}
            onClick={onClose}
          />
          <NavItem
            href="/reports"
            icon={BarChart3}
            label="Informes"
            isActive={isActive('/reports')}
            isCollapsed={isCollapsed}
            onClick={onClose}
          />

          {/* Account section */}
          <SectionLabel label="Cuenta" collapsed={isCollapsed} />
          <NavItem
            href="/settings"
            icon={Settings}
            label="Configuración"
            isActive={isActive('/settings')}
            isCollapsed={isCollapsed}
            onClick={onClose}
          />
        </nav>

        {/* Bottom user area */}
        <div
          className="shrink-0 p-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {/* User badge */}
          {user && (
            <div
              className={cn(
                'flex items-center gap-2.5 px-2 py-2 rounded-[10px] mb-1',
                isCollapsed ? 'justify-center' : ''
              )}
            >
              {/* Gradient avatar */}
              <div
                className="shrink-0 flex items-center justify-center rounded-full text-white text-xs font-bold"
                style={{
                  width: 30,
                  height: 30,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                }}
              >
                {getInitials(user.fullName)}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold truncate leading-tight"
                    style={{ color: 'var(--text)' }}
                  >
                    {user.fullName}
                  </p>
                  <p
                    className="text-[10px] leading-tight mt-0.5"
                    style={{ color: 'var(--muted)' }}
                  >
                    {planLabels[user.plan] ?? user.plan}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            className={cn(
              'w-full flex items-center gap-2.5 rounded-[10px] px-2.5 py-[9px] text-sm transition-colors',
              isCollapsed ? 'justify-center' : ''
            )}
            style={{ color: 'var(--muted)' }}
            aria-label="Cerrar sesión"
            title={isCollapsed ? 'Cerrar sesión' : undefined}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--coral)'
              e.currentTarget.style.background = 'var(--surface2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--muted)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
