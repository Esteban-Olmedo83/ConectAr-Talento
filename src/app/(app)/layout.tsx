'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { ToastProvider } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout'
import { UserContext } from '@/lib/context/user-context'
import { LanguageProvider, useLanguage } from '@/lib/context/language-context'
import { applyStoredTheme } from '@/components/ThemeProvider'
import { InterviewReminderModal } from '@/components/interviews/interview-reminder-modal'
import type { User } from '@/types'

function AppRouteLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const { t, setUserId } = useLanguage()

  useSessionTimeout()

  const TITLE_MAP: Record<string, string> = {
    '/dashboard': t.pageTitles.dashboard,
    '/pipeline': t.pageTitles.pipeline,
    '/vacancies': t.pageTitles.vacancies,
    '/candidates': t.pageTitles.candidates,
    '/interviews': t.pageTitles.interviews,
    '/templates': t.pageTitles.templates,
    '/integrations': t.pageTitles.integrations,
    '/reports': t.pageTitles.reports,
    '/settings': t.pageTitles.settings,
    '/job-profiles': t.pageTitles.jobProfiles,
    '/admin': t.pageTitles.admin,
    '/talent-pool': t.pageTitles.talentPool,
    '/clients': t.pageTitles.clients,
  }

  const pageTitle = TITLE_MAP[pathname] ?? ''

  React.useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      try {
        const { data: { user: sessionUser }, error: getUserError } = await supabase.auth.getUser()
        if (getUserError || !sessionUser) {
          router.replace('/login')
          return
        }

        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single()

        // Si no existe el perfil (el trigger no disparó), lo creamos ahora
        if (!profile) {
          const meta = sessionUser.user_metadata ?? {}
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: sessionUser.id,
              full_name: meta.full_name ?? meta.name ?? '',
              company_name: meta.company_name ?? '',
              plan: meta.plan ?? 'free',
              tenant_id: sessionUser.id,
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

        const loadedUser: User = {
          id: sessionUser.id,
          email: sessionUser.email ?? '',
          fullName: profile.full_name,
          companyName: profile.company_name,
          plan: profile.plan,
          tenantId: profile.tenant_id ?? sessionUser.id,
          avatarUrl: profile.avatar_url ?? undefined,
          googleDriveFolderId: profile.google_drive_folder_id ?? undefined,
          googleSheetsDbId: profile.google_sheets_db_id ?? undefined,
          createdAt: profile.created_at,
          groqApiKey: profile.groq_api_key ?? undefined,
          aiProvider: profile.ai_provider ?? 'groq',
        }
        setUser(loadedUser)
        // Aplicar preferencias de UI del usuario autenticado
        // (aísla tema y paleta por userId)
        setUserId(sessionUser.id)
        applyStoredTheme(sessionUser.id)
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
          <div className="h-10 w-10 flex items-center justify-center animate-pulse">
            <Image src="/logo-transparent.png" alt="ConectAr Talento" width={40} height={40} style={{ objectFit: 'contain' }} priority />
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
        <InterviewReminderModal />
      </UserContext.Provider>
    </ToastProvider>
  )
}

export default function AppRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AppRouteLayoutInner>{children}</AppRouteLayoutInner>
    </LanguageProvider>
  )
}
