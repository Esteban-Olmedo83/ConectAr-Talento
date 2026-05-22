import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin()
  if (response) return response

  const { id } = await params
  const admin = createAdminClient()

  // Fetch tenant profile
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, full_name, company_name, plan, tenant_id, created_at, email')
    .eq('id', id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  const tenantId = (profile as Record<string, unknown>).tenant_id as string

  // Fetch clients, vacancies, candidates, billing in parallel
  const [
    { data: clients },
    { data: vacancies },
    { data: candidates },
    { data: billing },
  ] = await Promise.all([
    admin.from('clients').select('id, name, industry, contact_email, created_at').eq('tenant_id', tenantId),
    admin.from('vacancies').select('id, title, status, created_at').eq('tenant_id', tenantId),
    admin.from('candidates').select('id, full_name, client_id, created_at').eq('tenant_id', tenantId),
    admin.from('tenant_billing').select('*').eq('tenant_id', tenantId).maybeSingle(),
  ])

  // Get application counts per vacancy
  const vacancyIds = (vacancies ?? []).map((v: Record<string, unknown>) => v.id as string)
  const { data: appRows } = vacancyIds.length > 0
    ? await admin.from('applications').select('vacancy_id').in('vacancy_id', vacancyIds)
    : { data: [] }

  const appCountMap: Record<string, number> = {}
  for (const row of appRows ?? []) {
    const r = row as { vacancy_id: string }
    appCountMap[r.vacancy_id] = (appCountMap[r.vacancy_id] ?? 0) + 1
  }

  const vacanciesWithCounts = (vacancies ?? []).map((v: Record<string, unknown>) => ({
    ...v,
    applicationCount: appCountMap[v.id as string] ?? 0,
  }))

  const unassignedCandidates = (candidates ?? []).filter(
    (c: Record<string, unknown>) => !c.client_id
  ).length

  return NextResponse.json({
    tenant: profile,
    clients: clients ?? [],
    vacancies: vacanciesWithCounts,
    candidates: {
      total: (candidates ?? []).length,
      unassigned: unassignedCandidates,
    },
    billing: billing ?? null,
  })
}
