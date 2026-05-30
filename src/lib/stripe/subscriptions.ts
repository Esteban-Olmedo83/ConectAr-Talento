import { getStripe, stripeStatusToPlan } from './client'
import { createAdminClient } from '@/lib/supabase/admin'

export interface CreateCheckoutSessionParams {
  userId: string
  tenantId: string
  plan: 'starter' | 'pro' | 'business'
  customerEmail: string
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const stripe = getStripe()
  const supabase = createAdminClient()

  // Reuse existing Stripe customer if one exists
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('tenant_id', params.tenantId)
    .maybeSingle()

  const priceId = process.env[`STRIPE_PRICE_${params.plan.toUpperCase()}`]
  if (!priceId) throw new Error(`STRIPE_PRICE_${params.plan.toUpperCase()} not configured`)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: sub?.stripe_customer_id ?? undefined,
    customer_email: sub?.stripe_customer_id ? undefined : params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      user_id: params.userId,
      tenant_id: params.tenantId,
      plan: params.plan,
    },
    subscription_data: {
      metadata: { tenant_id: params.tenantId, plan: params.plan },
    },
  })

  return session
}

export async function createBillingPortalSession(tenantId: string, returnUrl: string) {
  const stripe = getStripe()
  const supabase = createAdminClient()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (!sub?.stripe_customer_id) {
    throw new Error('No Stripe customer found for this tenant')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: returnUrl,
  })

  return session
}

export async function syncSubscriptionToDb(stripeSubscriptionId: string) {
  const stripe = getStripe()
  const supabase = createAdminClient()

  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
  const tenantId = subscription.metadata?.tenant_id
  if (!tenantId) return

  const priceId = subscription.items.data[0]?.price.id ?? null
  const { plan } = stripeStatusToPlan(subscription.status, priceId)

  const upsertData = {
    tenant_id: tenantId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    stripe_status: subscription.status,
    plan,
    status: subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'inactive',
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    stripe_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    current_period_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }

  await supabase
    .from('subscriptions')
    .upsert(upsertData, { onConflict: 'tenant_id' })

  // Keep profiles.plan in sync
  await supabase
    .from('profiles')
    .update({ plan })
    .eq('tenant_id', tenantId)
}
