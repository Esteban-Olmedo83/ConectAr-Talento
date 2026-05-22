import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'conectar.rrhh.ar@gmail.com'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return { user: null, supabase: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user, supabase, response: null }
}
