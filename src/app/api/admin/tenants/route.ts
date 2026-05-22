import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { response } = await requireAdmin()
  if (response) return response

  const admin = createAdminClient()

  // Fetch all profiles
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, full_name, company_name, plan, tenant_id, created_at, email')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get per-tenant counts
  const tenantIds = (profiles ?? []).map((p: Record<string, unknown>) => p.tenant_id as string)

  const [
    { data: candidateCounts },
    { data: vacancyCounts },
    { data: clientCounts },
  ] = await Promise.all([
    admin.from('candidates').select('tenant_id').in('tenant_id', tenantIds),
    admin.from('vacancies').select('tenant_id').in('tenant_id', tenantIds),
    admin.from('clients').select('tenant_id').in('tenant_id', tenantIds),
  ])

  const countByTenant = (rows: Array<{ tenant_id: string }> | null) => {
    const m: Record<string, number> = {}
    for (const r of rows ?? []) {
      m[r.tenant_id] = (m[r.tenant_id] ?? 0) + 1
    }
    return m
  }

  const candMap = countByTenant(candidateCounts as Array<{ tenant_id: string }> | null)
  const vacMap = countByTenant(vacancyCounts as Array<{ tenant_id: string }> | null)
  const clientMap = countByTenant(clientCounts as Array<{ tenant_id: string }> | null)

  const tenants = (profiles ?? []).map((p: Record<string, unknown>) => ({
    id: p.id,
    email: p.email ?? '',
    fullName: p.full_name ?? '',
    companyName: p.company_name ?? '',
    plan: p.plan ?? 'free',
    tenantId: p.tenant_id,
    createdAt: p.created_at,
    candidateCount: candMap[p.tenant_id as string] ?? 0,
    vacancyCount: vacMap[p.tenant_id as string] ?? 0,
    clientCount: clientMap[p.tenant_id as string] ?? 0,
  }))

  return NextResponse.json({ tenants })
}

export async function PATCH(request: NextRequest) {
  const { response } = await requireAdmin()
  if (response) return response

  const admin = createAdminClient()
  const body = await request.json() as { tenantId: string; plan: string }

  if (!body.tenantId || !body.plan) {
    return NextResponse.json({ error: 'tenantId and plan are required' }, { status: 400 })
  }

  const { error } = await admin
    .from('profiles')
    .update({ plan: body.plan })
    .eq('tenant_id', body.tenantId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
