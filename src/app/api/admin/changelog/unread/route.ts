import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the user's tenant_id from their profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const tenantId = profile?.tenant_id ?? user.id
  if (!UUID_RE.test(tenantId)) {
    return NextResponse.json({ error: 'Invalid tenant' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get published updates visible to this user
  const { data: updates, error } = await admin
    .from('system_updates')
    .select('*')
    .eq('is_published', true)
    .or(`target_tenant_id.is.null,target_tenant_id.eq.${tenantId}`)
    .order('published_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!updates || updates.length === 0) {
    return NextResponse.json({ updates: [] })
  }

  // Get what's already been read by this user
  const updateIds = updates.map((u: Record<string, unknown>) => u.id as string)
  const { data: readRows } = await admin
    .from('update_reads')
    .select('update_id')
    .eq('user_id', user.id)
    .in('update_id', updateIds)

  const readSet = new Set((readRows ?? []).map((r: Record<string, unknown>) => r.update_id as string))

  const unread = updates.filter((u: Record<string, unknown>) => !readSet.has(u.id as string))

  return NextResponse.json({ updates: unread })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as { updateIds: string[] }
  if (!body.updateIds || !Array.isArray(body.updateIds) || body.updateIds.length === 0) {
    return NextResponse.json({ error: 'updateIds is required' }, { status: 400 })
  }
  const validIds = body.updateIds.filter((id: string) => UUID_RE.test(id))
  if (validIds.length === 0) {
    return NextResponse.json({ error: 'No valid updateIds' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Insert read records (ignore conflicts)
  const rows = validIds.map((updateId: string) => ({
    user_id: user.id,
    update_id: updateId,
  }))

  const { error } = await admin
    .from('update_reads')
    .upsert(rows, { onConflict: 'user_id,update_id', ignoreDuplicates: true })


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
