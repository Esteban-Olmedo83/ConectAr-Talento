'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { ToastProvider } from '@/components/ui/toast'
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
    const raw = localStorage.getItem('ct_user')
    if (!raw) {
      router.replace('/login')
      return
    }
    try {
      const parsed: User = JSON.parse(raw)
      setUser(parsed)
    } catch {
      localStorage.removeItem('ct_user')
      router.replace('/login')
      return
    }
    setIsLoading(false)
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
