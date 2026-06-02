import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin()
  if (response) return response

  const adminClient = createAdminClient()
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenantId')
  const entityType = searchParams.get('entityType')
  const days = parseInt(searchParams.get('days') ?? '30')

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, tenant_id, full_name, company_name')

  type Profile = { id: string; tenant_id: string; full_name: string; company_name: string }
  const profileList: Profile[] = profiles ?? []
  const profileMap = new Map<string, Profile>(profileList.map(p => [p.id, p]))
  const tenantMap = new Map<string, Profile>()
  for (const p of profileList) {
    if (!tenantMap.has(p.tenant_id)) tenantMap.set(p.tenant_id, p)
  }

  let query = adminClient
    .from('activity_logs')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(500)

  if (tenantId) query = query.eq('tenant_id', tenantId)
  if (entityType) query = query.eq('entity_type', entityType)

  const { data: logs, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (logs ?? []).map(l => {
    const userProfile = l.user_id ? profileMap.get(l.user_id) : null
    const tenantProfile = tenantMap.get(l.tenant_id)
    return {
      ...l,
      tenantName: tenantProfile?.company_name || tenantProfile?.full_name || l.tenant_id,
      userName: userProfile?.full_name || userProfile?.company_name || l.user_id,
    }
  })

  const distinctEntityTypes = [...new Set(rows.map(r => r.entity_type))].sort()
  const distinctTenants = [...new Set(rows.map(r => r.tenant_id))].map(tid => ({
    id: tid,
    name: tenantMap.get(tid)?.company_name || tenantMap.get(tid)?.full_name || tid,
  }))

  return NextResponse.json({ logs: rows, distinctEntityTypes, distinctTenants })
}
