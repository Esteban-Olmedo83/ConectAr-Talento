'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { ToastProvider } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'

export default function AppRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        router.replace('/login')
        return
      }

      setUser({
        id: session.user.id,
        email: session.user.email ?? '',
        fullName: profile.full_name,
        companyName: profile.company_name,
        plan: profile.plan,
        tenantId: profile.tenant_id,
        avatarUrl: profile.avatar_url ?? undefined,
        googleDriveFolderId: profile.google_drive_folder_id ?? undefined,
        googleSheetsDbId: profile.google_sheets_db_id ?? undefined,
        createdAt: profile.created_at,
      })
      setIsLoading(false)
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
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-lg animate-pulse">
            CT
          </div>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <AppLayout user={user}>
        {children}
      </AppLayout>
    </ToastProvider>
  )
}
