import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { user: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user, response: null }
}
