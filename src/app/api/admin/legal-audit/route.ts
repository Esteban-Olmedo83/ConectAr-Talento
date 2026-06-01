import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Verificar que el solicitante sea admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const adminEmail = process.env.ADMIN_EMAIL ?? 'conectar.rrhh.ar@gmail.com'
    if (!user || user.email !== adminEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
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
