import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// H1 FIX: fail closed if ADMIN_EMAIL is not configured; no hardcoded fallback
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export async function requireAdmin() {
  if (!ADMIN_EMAIL) {
    console.error('[admin/guard] ADMIN_EMAIL env var not set — admin access blocked')
    return { user: null, supabase: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return { user: null, supabase: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user, supabase, response: null }
}
