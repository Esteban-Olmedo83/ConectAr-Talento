import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { response } = await requireAdmin()
  if (response) return response

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('system_updates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get read counts for published updates
  const ids = (data ?? []).map((u: Record<string, unknown>) => u.id as string)
  const { data: readCounts } = ids.length > 0
    ? await admin.from('update_reads').select('update_id').in('update_id', ids)
    : { data: [] }

  const readCountMap: Record<string, number> = {}
  for (const row of readCounts ?? []) {
    const r = row as { update_id: string }
    readCountMap[r.update_id] = (readCountMap[r.update_id] ?? 0) + 1
  }

  const updates = (data ?? []).map((u: Record<string, unknown>) => ({
    ...u,
    readCount: readCountMap[u.id as string] ?? 0,
  }))

  return NextResponse.json({ updates })
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin()
  if (response) return response

  const admin = createAdminClient()
  const body = await request.json() as {
    title: string
    description: string
    type: string
    target_tenant_id?: string
  }

  if (!body.title || !body.description || !body.type) {
    return NextResponse.json({ error: 'title, description, and type are required' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('system_updates')
    .insert({
      title: body.title,
      description: body.description,
      type: body.type,
      target_tenant_id: body.target_tenant_id ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ update: data }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const { response } = await requireAdmin()
  if (response) return response

  const admin = createAdminClient()
  const body = await request.json() as {
    id: string
    title?: string
    description?: string
    type?: string
    is_published?: boolean
    target_tenant_id?: string | null
  }

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {}
  if (body.title !== undefined) updatePayload.title = body.title
  if (body.description !== undefined) updatePayload.description = body.description
  if (body.type !== undefined) updatePayload.type = body.type
  if (body.target_tenant_id !== undefined) updatePayload.target_tenant_id = body.target_tenant_id
  if (body.is_published !== undefined) {
    updatePayload.is_published = body.is_published
    if (body.is_published) {
      updatePayload.published_at = new Date().toISOString()
    }
  }

  const { data, error } = await admin
    .from('system_updates')
    .update(updatePayload)
    .eq('id', body.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ update: data })
}

export async function DELETE(request: NextRequest) {
  const { response } = await requireAdmin()
  if (response) return response

  const admin = createAdminClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id query param is required' }, { status: 400 })
  }

  const { error } = await admin.from('system_updates').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
