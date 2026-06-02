import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const tenantId = profile?.tenant_id ?? user.id
  const admin = createAdminClient()

  const { data: updates, error } = await admin
    .from('system_updates')
    .select('id, title, description, type, published_at, target_tenant_id')
    .eq('is_published', true)
    .or(`target_tenant_id.is.null,target_tenant_id.eq.${tenantId}`)
    .order('published_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ updates: updates ?? [] })
}
