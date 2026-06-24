import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = createAdminClient()
    await supabase.from('profiles').select('id').limit(1)
    return NextResponse.json({ status: 'ok', ts: new Date().toISOString() })
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
