import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../guard'

export async function GET() {
  const { response, supabase } = await requireAdmin()
  if (response || !supabase) return response!

  const { data, error } = await supabase.rpc('admin_get_tenants')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tenants: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  const { response, supabase } = await requireAdmin()
  if (response || !supabase) return response!

  const body = await request.json() as { tenantId: string; plan: string }
  if (!body.tenantId || !body.plan) {
    return NextResponse.json({ error: 'tenantId and plan are required' }, { status: 400 })
  }

  const { error } = await supabase.rpc('admin_update_plan', {
    p_tenant_id: body.tenantId,
    p_plan: body.plan,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
