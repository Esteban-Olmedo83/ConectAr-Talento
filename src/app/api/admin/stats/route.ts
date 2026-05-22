import { NextResponse } from 'next/server'
import { requireAdmin } from '../guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { response } = await requireAdmin()
  if (response) return response

  const admin = createAdminClient()

  const [
    { count: totalTenants },
    { count: totalCandidates },
    { count: totalVacancies },
    { count: totalClients },
    { count: totalInterviews },
    { data: billingRows },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('candidates').select('*', { count: 'exact', head: true }),
    admin.from('vacancies').select('*', { count: 'exact', head: true }),
    admin.from('clients').select('*', { count: 'exact', head: true }),
    admin.from('interviews').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('plan'),
  ])

  // Count tenants by plan
  const planCounts: Record<string, number> = {}
  for (const row of billingRows ?? []) {
    const plan = (row as { plan: string }).plan ?? 'free'
    planCounts[plan] = (planCounts[plan] ?? 0) + 1
  }

  return NextResponse.json({
    totalTenants: totalTenants ?? 0,
    totalCandidates: totalCandidates ?? 0,
    totalVacancies: totalVacancies ?? 0,
    totalClients: totalClients ?? 0,
    totalInterviews: totalInterviews ?? 0,
    planCounts,
  })
}
