import { NextResponse } from 'next/server'
import { requireAdmin } from '../guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { response } = await requireAdmin()
  if (response) return response

  const admin = createAdminClient()

  const [profilesRes, candidatesRes, vacanciesRes, clientsRes, interviewsRes] = await Promise.all([
    admin.from('profiles').select('plan'),
    admin.from('candidates').select('id', { count: 'exact', head: true }),
    admin.from('vacancies').select('id', { count: 'exact', head: true }),
    admin.from('clients').select('id', { count: 'exact', head: true }),
    admin.from('interviews').select('id', { count: 'exact', head: true }),
  ])

  const planCounts: Record<string, number> = {}
  const tenantIds = new Set<string>()
  for (const p of profilesRes.data ?? []) {
    planCounts[p.plan] = (planCounts[p.plan] ?? 0) + 1
  }

  // count distinct tenants
  const { data: tenantRows } = await admin.from('profiles').select('tenant_id')
  for (const r of tenantRows ?? []) if (r.tenant_id) tenantIds.add(r.tenant_id)

  return NextResponse.json({
    totalTenants: tenantIds.size,
    totalCandidates: candidatesRes.count ?? 0,
    totalVacancies: vacanciesRes.count ?? 0,
    totalClients: clientsRes.count ?? 0,
    totalInterviews: interviewsRes.count ?? 0,
    planCounts,
  })
}
