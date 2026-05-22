import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../guard'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, supabase } = await requireAdmin()
  if (response || !supabase) return response!

  const { id } = await params

  const { data, error } = await supabase.rpc('admin_get_tenant_detail', {
    p_tenant_id: id,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  return NextResponse.json(data)
}
