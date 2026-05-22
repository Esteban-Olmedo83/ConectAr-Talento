'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/context/user-context'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const ADMIN_EMAIL = 'conectar.rrhh.ar@gmail.com'

const adminNavItems = [
  { label: 'Overview', href: '/admin' },
  { label: 'Clientes (Tenants)', href: '/admin/tenants' },
  { label: 'Monitoreo', href: '/admin/monitoring' },
  { label: 'Changelog', href: '/admin/changelog' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) {
      router.replace('/dashboard')
    }
  }, [user, router])

  if (!user || user.email !== ADMIN_EMAIL) return null

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Admin header */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, rgba(var(--accent-rgb),0.06) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          ✦
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-nunito)' }}>
            Panel de Administración
          </p>
          <p style={{ fontSize: 11, color: 'var(--muted)' }}>ConectAr Talento — Owner Access</p>
        </div>
      </div>

      {/* Admin sub-nav */}
      <nav
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 6,
        }}
      >
        {adminNavItems.map(item => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-2)]'
                  : 'text-[var(--muted2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
