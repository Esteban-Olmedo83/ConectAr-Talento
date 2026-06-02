import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin()
  if (response) return response

  const adminClient = createAdminClient()
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenantId')
  const route = searchParams.get('route')
  const days = parseInt(searchParams.get('days') ?? '7')

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  // Get profiles for tenant lookup
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, tenant_id, full_name, company_name, plan')

  type Profile = { id: string; tenant_id: string; full_name: string; company_name: string; plan: string }
  const profileList: Profile[] = profiles ?? []
  const profileMap = new Map<string, Profile>(profileList.map(p => [p.id, p]))
  const tenantProfiles = new Map<string, Profile>()
  for (const p of profileList) {
    if (!tenantProfiles.has(p.tenant_id)) tenantProfiles.set(p.tenant_id, p)
  }

  // Collect user IDs for a given tenant filter
  let userIdFilter: string[] | null = null
  if (tenantId) {
    userIdFilter = (profiles ?? []).filter(p => p.tenant_id === tenantId).map(p => p.id)
    if (userIdFilter.length === 0) return NextResponse.json({ logs: [], summary: null })
  }

  let query = adminClient
    .from('ai_usage_logs')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(500)

  if (userIdFilter) query = query.in('user_id', userIdFilter)
  if (route) query = query.eq('route', route)

  const { data: logs, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (logs ?? []).map(l => {
    const profile = profileMap.get(l.user_id)
    const tenantProfile = profile ? tenantProfiles.get(profile.tenant_id) : null
    return {
      ...l,
      tenantId: profile?.tenant_id ?? null,
      tenantName: tenantProfile?.company_name || tenantProfile?.full_name || l.user_id,
      plan: profile?.plan ?? l.plan,
    }
  })

  const totalCalls = rows.length
  const successCalls = rows.filter(r => r.success).length
  const totalTokens = rows.reduce((s, r) => s + (r.prompt_tokens ?? 0) + (r.completion_tokens ?? 0), 0)
  const avgLatency = totalCalls > 0
    ? Math.round(rows.reduce((s, r) => s + (r.latency_ms ?? 0), 0) / totalCalls)
    : 0

  const routeCounts: Record<string, number> = {}
  for (const r of rows) {
    routeCounts[r.route] = (routeCounts[r.route] ?? 0) + 1
  }

  const distinctRoutes = Object.keys(routeCounts).sort()

  return NextResponse.json({
    logs: rows,
    summary: { totalCalls, successCalls, errorCalls: totalCalls - successCalls, totalTokens, avgLatency },
    routeCounts,
    distinctRoutes,
  })
}
