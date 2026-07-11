import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '../guard'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  try {
    const { response } = await requireAdmin()
    if (response) return response

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || !UUID_RE.test(userId)) {
      return NextResponse.json({ error: 'userId inválido' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
      .from('legal_audit_log')
      .select('id, event_type, ip_address, document_version, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error

    return NextResponse.json({ logs: data ?? [] })
  } catch (err) {
    console.error('[api/admin/legal-audit]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
