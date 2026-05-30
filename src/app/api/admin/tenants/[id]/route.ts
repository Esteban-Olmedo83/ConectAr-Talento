import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, supabase } = await requireAdmin()
  if (response || !supabase) return response!

  const { id } = await params

  const { data, error } = await supabase.rpc('admin_get_tenant_detail', {
    p_tenant_id: id,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  return NextResponse.json(data)
}

interface BillingPatchBody {
  plan?: string
  status?: string
  billingEmail?: string
  billingName?: string
  notes?: string
  trialEndsAt?: string
  periodEndsAt?: string
}

const VALID_PLANS = ['free', 'starter', 'pro', 'business', 'enterprise']
const VALID_STATUSES = ['active', 'trial', 'suspended', 'cancelled']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin()
  if (response) return response

  const { id: tenantId } = await params
  if (!tenantId) return NextResponse.json({ error: 'tenantId requerido' }, { status: 400 })

  const body = (await request.json()) as BillingPatchBody

  if (body.plan && !VALID_PLANS.includes(body.plan)) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  // Update profiles.plan for all users in this tenant
  if (body.plan) {
    const { error: planErr } = await adminSupabase
      .from('profiles')
      .update({ plan: body.plan, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
    if (planErr) return NextResponse.json({ error: planErr.message }, { status: 500 })
  }

  // Upsert tenant_billing record
  const billingData: Record<string, unknown> = {
    tenant_id: tenantId,
    updated_at: new Date().toISOString(),
  }
  if (body.plan !== undefined) billingData.plan = body.plan
  if (body.status !== undefined) billingData.status = body.status
  if (body.billingEmail !== undefined) billingData.billing_email = body.billingEmail || null
  if (body.billingName !== undefined) billingData.billing_name = body.billingName || null
  if (body.notes !== undefined) billingData.notes = body.notes || null
  if (body.trialEndsAt !== undefined) billingData.trial_ends_at = body.trialEndsAt || null
  if (body.periodEndsAt !== undefined) billingData.current_period_ends_at = body.periodEndsAt || null

  const { error: billingErr } = await adminSupabase
    .from('tenant_billing')
    .upsert(billingData, { onConflict: 'tenant_id' })

  if (billingErr) return NextResponse.json({ error: billingErr.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
