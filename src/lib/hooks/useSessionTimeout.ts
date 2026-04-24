import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 1 hour in milliseconds
const WARNING_THRESHOLD = 50 * 60 * 1000 // Warn at 50 minutes

export function useSessionTimeout() {
  const router = useRouter()

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout
    let warningTimer: NodeJS.Timeout
    let hasWarned = false

    const resetTimers = () => {
      hasWarned = false
      clearTimeout(inactivityTimer)
      clearTimeout(warningTimer)

      warningTimer = setTimeout(() => {
        if (!hasWarned) {
          hasWarned = true
          console.warn('Session expiring in 10 minutes due to inactivity')
        }
      }, WARNING_THRESHOLD)

      inactivityTimer = setTimeout(async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login?sessionExpired=true')
      }, INACTIVITY_TIMEOUT)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    events.forEach((event) => {
      document.addEventListener(event, resetTimers)
    })

    resetTimers()

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimers)
      })
      clearTimeout(inactivityTimer)
      clearTimeout(warningTimer)
    }
  }, [router])
}
