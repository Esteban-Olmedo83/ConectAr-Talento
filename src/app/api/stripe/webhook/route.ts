import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/client'
import { syncSubscriptionToDb } from '@/lib/stripe/subscriptions'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Disable body parsing — Stripe needs the raw body to verify signature
export const dynamic = 'force-dynamic'

const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
])

export async function POST(request: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const body = await request.text()
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency check — skip already-processed events
  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && typeof session.subscription === 'string') {
          await syncSubscriptionToDb(session.subscription)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'invoice.payment_succeeded': {
        const sub = event.data.object as Stripe.Subscription | Stripe.Invoice
        const subscriptionId =
          'subscription' in sub
            ? (sub.subscription as string | null)
            : (sub as Stripe.Subscription).id
        if (subscriptionId) {
          await syncSubscriptionToDb(subscriptionId)
        }
        break
      }

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const sub = event.data.object as Stripe.Subscription | Stripe.Invoice
        const subscriptionId =
          'subscription' in sub
            ? (sub.subscription as string | null)
            : (sub as Stripe.Subscription).id
        if (subscriptionId) {
          await syncSubscriptionToDb(subscriptionId)
        }
        break
      }
    }

    // Mark event as processed
    await supabase.from('stripe_events').insert({ id: event.id, type: event.type })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
