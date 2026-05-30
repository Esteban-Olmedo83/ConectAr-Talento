import { NextResponse } from 'next/server'
import { requireAdmin } from '../guard'

export interface MonitoringData {
  summary: {
    totalAiCallsToday: number
    totalAiCallsWeek: number
    activeSubscriptions: number
    cancelingSubscriptions: number
  }
  tenantStats: {
    userId: string
    tenantId: string
    aiCallsToday: number
    aiCallsWeek: number
    stripeStatus: string | null
    cancelAtPeriodEnd: boolean
  }[]
}

export async function GET(): Promise<NextResponse> {
  const { response, supabase } = await requireAdmin()
  if (response || !supabase) return response!

  try {
    // AI usage per user: today and last 7 days
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [aiTodayRes, aiWeekRes, subsRes, profilesRes] = await Promise.all([
      supabase
        .from('ai_rate_limits')
        .select('user_id, call_count')
        .gte('hour_bucket', today.toISOString()),
      supabase
        .from('ai_rate_limits')
        .select('user_id, call_count')
        .gte('hour_bucket', weekAgo.toISOString()),
      supabase
        .from('subscriptions')
        .select('tenant_id, stripe_status, status, cancel_at_period_end'),
      supabase
        .from('profiles')
        .select('id, tenant_id'),
    ])

    // Aggregate AI calls by user
    const callsToday = new Map<string, number>()
    for (const row of (aiTodayRes.data ?? [])) {
      callsToday.set(row.user_id, (callsToday.get(row.user_id) ?? 0) + (row.call_count ?? 0))
    }
    const callsWeek = new Map<string, number>()
    for (const row of (aiWeekRes.data ?? [])) {
      callsWeek.set(row.user_id, (callsWeek.get(row.user_id) ?? 0) + (row.call_count ?? 0))
    }

    // Subscription status by tenant
    const subsByTenant = new Map<string, { stripeStatus: string | null; cancelAtPeriodEnd: boolean }>()
    let activeSubscriptions = 0
    let cancelingSubscriptions = 0
    for (const sub of (subsRes.data ?? [])) {
      const status = (sub.stripe_status ?? sub.status ?? null) as string | null
      const canceling = (sub.cancel_at_period_end ?? false) as boolean
      subsByTenant.set(sub.tenant_id, { stripeStatus: status, cancelAtPeriodEnd: canceling })
      if (status === 'active' || status === 'trialing') activeSubscriptions++
      if (canceling) cancelingSubscriptions++
    }

    // Build per-tenant stats
    const tenantStats = (profilesRes.data ?? []).map(p => ({
      userId: p.id,
      tenantId: p.tenant_id ?? '',
      aiCallsToday: callsToday.get(p.id) ?? 0,
      aiCallsWeek: callsWeek.get(p.id) ?? 0,
      stripeStatus: subsByTenant.get(p.tenant_id ?? '')?.stripeStatus ?? null,
      cancelAtPeriodEnd: subsByTenant.get(p.tenant_id ?? '')?.cancelAtPeriodEnd ?? false,
    }))

    const totalAiCallsToday = Array.from(callsToday.values()).reduce((a, b) => a + b, 0)
    const totalAiCallsWeek = Array.from(callsWeek.values()).reduce((a, b) => a + b, 0)

    return NextResponse.json({
      summary: { totalAiCallsToday, totalAiCallsWeek, activeSubscriptions, cancelingSubscriptions },
      tenantStats,
    } satisfies MonitoringData)
  } catch (err) {
    console.error('Monitoring error:', err)
    return NextResponse.json({ error: 'Error al cargar monitoreo' }, { status: 500 })
  }
}
