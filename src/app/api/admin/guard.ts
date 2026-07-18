import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// H1 FIX: fail closed if ADMIN_EMAIL is not configured; no hardcoded fallback
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export async function requireAdmin() {
  if (!ADMIN_EMAIL) {
    console.error('[admin/guard] ADMIN_EMAIL env var not set — admin access blocked')
    return { user: null, supabase: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return { user: null, supabase: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  // Use service_role client so admin RPCs run with elevated privileges.
  // This allows revoking EXECUTE from the 'authenticated' role on admin functions.
  return { user, supabase: createAdminClient(), response: null }
}
