'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { ToastProvider } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout'
import { UserContext } from '@/lib/context/user-context'
import type { User } from '@/types'

const TITLE_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pipeline': 'Procesos de reclutamiento',
  '/vacancies': 'Gestión de Vacantes',
  '/candidates': 'Candidatos',
  '/interviews': 'Entrevistas',
  '/templates': 'Plantillas',
  '/integrations': 'Integraciones',
  '/reports': 'Informes',
  '/settings': 'Configuración',
}

export default function AppRouteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  useSessionTimeout()

  const pageTitle = TITLE_MAP[pathname] ?? ''

  React.useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.replace('/login')
          return
        }

        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // Si no existe el perfil (el trigger no disparó), lo creamos ahora
        if (!profile) {
          const meta = session.user.user_metadata ?? {}
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              full_name: meta.full_name ?? meta.name ?? '',
              company_name: meta.company_name ?? '',
              plan: meta.plan ?? 'free',
              tenant_id: session.user.id,
            })
            .select()
            .single()
          profile = newProfile
        }

        if (!profile) {
          // Perfil no se pudo crear — sesión inválida
          await supabase.auth.signOut()
          router.replace('/login')
          return
        }

        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          fullName: profile.full_name,
          companyName: profile.company_name,
          plan: profile.plan,
          tenantId: profile.tenant_id ?? session.user.id,
          avatarUrl: profile.avatar_url ?? undefined,
          googleDriveFolderId: profile.google_drive_folder_id ?? undefined,
          googleSheetsDbId: profile.google_sheets_db_id ?? undefined,
          createdAt: profile.created_at,
        })
      } catch {
        router.replace('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg animate-pulse"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              fontFamily: 'var(--font-nunito)',
            }}
          >
            CT
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <UserContext.Provider value={{ user }}>
        <AppLayout user={user} pageTitle={pageTitle}>
          {children}
        </AppLayout>
      </UserContext.Provider>
    </ToastProvider>
  )
}
