import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil',
    })
  }
  return _stripe
}

// Stripe Price IDs per plan (set in Vercel env vars)
export const STRIPE_PRICES: Record<string, string | undefined> = {
  starter:  process.env.STRIPE_PRICE_STARTER,
  pro:      process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
}

// Map Stripe subscription status → app plan
export function stripeStatusToPlan(
  stripeStatus: string,
  priceId: string | null
): { plan: string; subscriptionStatus: string } {
  if (stripeStatus !== 'active' && stripeStatus !== 'trialing') {
    return { plan: 'free', subscriptionStatus: stripeStatus }
  }
  const entry = Object.entries(STRIPE_PRICES).find(([, pid]) => pid === priceId)
  return {
    plan: entry ? entry[0] : 'free',
    subscriptionStatus: stripeStatus,
  }
}
