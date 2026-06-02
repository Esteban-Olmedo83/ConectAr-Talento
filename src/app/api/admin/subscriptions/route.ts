import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { response } = await requireAdmin()
  if (response) return response

  const adminClient = createAdminClient()

  const [subsRes, profilesRes] = await Promise.all([
    adminClient.from('subscriptions').select('*').order('created_at', { ascending: false }),
    adminClient.from('profiles').select('id, tenant_id, full_name, company_name, plan'),
  ])

  if (subsRes.error) return NextResponse.json({ error: subsRes.error.message }, { status: 500 })

  type Profile = { id: string; tenant_id: string; full_name: string; company_name: string; plan: string }
  const profileList: Profile[] = profilesRes.data ?? []
  const tenantMap = new Map<string, Profile>()
  for (const p of profileList) {
    if (!tenantMap.has(p.tenant_id)) tenantMap.set(p.tenant_id, p)
  }

  const subscriptions = (subsRes.data ?? []).map(s => {
    const profile = tenantMap.get(s.tenant_id)
    return {
      ...s,
      tenantName: profile?.company_name || profile?.full_name || s.tenant_id,
    }
  })

  const summary = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.stripe_status === 'active' || s.status === 'active').length,
    trialing: subscriptions.filter(s => s.stripe_status === 'trialing' || s.status === 'trialing').length,
    pastDue: subscriptions.filter(s => s.stripe_status === 'past_due').length,
    canceled: subscriptions.filter(s => s.stripe_status === 'canceled' || s.status === 'canceled').length,
    cancelingAtPeriodEnd: subscriptions.filter(s => s.cancel_at_period_end).length,
  }

  return NextResponse.json({ subscriptions, summary })
}

export async function PATCH(request: NextRequest) {
  const { response } = await requireAdmin()
  if (response) return response

  const adminClient = createAdminClient()
  const body = await request.json() as { tenantId: string; plan?: string; action?: 'suspend' | 'reactivate' | 'cancel' }

  if (!body.tenantId) return NextResponse.json({ error: 'tenantId requerido' }, { status: 400 })

  if (body.plan) {
    const { error } = await adminClient
      .from('profiles')
      .update({ plan: body.plan, updated_at: new Date().toISOString() })
      .eq('tenant_id', body.tenantId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await adminClient
      .from('subscriptions')
      .update({ plan: body.plan, updated_at: new Date().toISOString() })
      .eq('tenant_id', body.tenantId)
  }

  if (body.action === 'suspend') {
    await adminClient.from('subscriptions')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('tenant_id', body.tenantId)
    await adminClient.from('tenant_billing')
      .upsert({ tenant_id: body.tenantId, status: 'suspended', updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' })
  }

  if (body.action === 'reactivate') {
    await adminClient.from('subscriptions')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('tenant_id', body.tenantId)
    await adminClient.from('tenant_billing')
      .upsert({ tenant_id: body.tenantId, status: 'active', updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' })
  }

  if (body.action === 'cancel') {
    await adminClient.from('subscriptions')
      .update({ status: 'canceled', canceled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('tenant_id', body.tenantId)
  }

  return NextResponse.json({ ok: true })
}
