import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../guard'

export async function GET() {
  const { response, supabase } = await requireAdmin()
  if (response || !supabase) return response!

  const { data, error } = await supabase.rpc('admin_get_changelog')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ updates: data ?? [] })
}

export async function POST(request: NextRequest) {
  const { response, supabase } = await requireAdmin()
  if (response || !supabase) return response!

  const body = await request.json() as {
    title: string; description: string; type: string; target_tenant_id?: string
  }
  if (!body.title || !body.description || !body.type) {
    return NextResponse.json({ error: 'title, description, and type are required' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('admin_upsert_changelog', {
    p_title: body.title,
    p_description: body.description,
    p_type: body.type,
    p_target_tenant: body.target_tenant_id ?? null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ update: data }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const { response, supabase } = await requireAdmin()
  if (response || !supabase) return response!

  const body = await request.json() as {
    id: string; title?: string; description?: string; type?: string
    is_published?: boolean; target_tenant_id?: string | null
  }
  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { data, error } = await supabase.rpc('admin_upsert_changelog', {
    p_id: body.id,
    p_title: body.title ?? null,
    p_description: body.description ?? null,
    p_type: body.type ?? null,
    p_target_tenant: body.target_tenant_id ?? null,
    p_is_published: body.is_published ?? null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ update: data })
}

export async function DELETE(request: NextRequest) {
  const { response, supabase } = await requireAdmin()
  if (response || !supabase) return response!

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id query param is required' }, { status: 400 })

  const { error } = await supabase.rpc('admin_delete_changelog', { p_id: id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
