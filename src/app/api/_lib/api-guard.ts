import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Sliding window rate limiter (in-memory, per serverless instance).
// For multi-instance production, upgrade to Upstash Redis.
const rateLimitStore = new Map<string, number[]>()

const RATE_LIMITS: Record<string, { free: number; paid: number }> = {
  'analyze-cv':      { free: 5,  paid: 20 },
  'generate-jd':     { free: 10, paid: 40 },
  'generate-report': { free: 10, paid: 40 },
  'generate-message':{ free: 20, paid: 60 },
  default:           { free: 10, paid: 30 },
}
const WINDOW_MS = 60_000 // 1 minute

function isRateLimited(userId: string, endpoint: string, isPaidPlan: boolean): boolean {
  const key = `${userId}:${endpoint}`
  const now = Date.now()
  const timestamps = rateLimitStore.get(key) ?? []
  const recent = timestamps.filter(t => now - t < WINDOW_MS)
  const limits = RATE_LIMITS[endpoint] ?? RATE_LIMITS.default
  const max = isPaidPlan ? limits.paid : limits.free
  if (recent.length >= max) return true
  recent.push(now)
  rateLimitStore.set(key, recent)
  return false
}

const PAID_PLANS = new Set(['starter', 'pro', 'business', 'enterprise'])

export interface AuthContext {
  userId: string
  tenantId: string
  plan: string
}

/**
 * Validates session and enforces per-minute rate limits.
 * Returns AuthContext on success or a NextResponse with the appropriate error.
 */
export async function requireAuthWithRateLimit(
  endpoint: string
): Promise<AuthContext | NextResponse> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, plan')
    .eq('id', user.id)
    .single()

  const tenantId: string = (profile?.tenant_id as string) ?? user.id
  const plan: string = (profile?.plan as string) ?? 'free'
  const isPaid = PAID_PLANS.has(plan)

  if (isRateLimited(user.id, endpoint, isPaid)) {
    const limits = RATE_LIMITS[endpoint] ?? RATE_LIMITS.default
    const max = isPaid ? limits.paid : limits.free
    return NextResponse.json(
      { error: `Límite de ${max} solicitudes por minuto alcanzado. Intente en unos segundos.` },
      {
        status: 429,
        headers: { 'Retry-After': '60', 'X-RateLimit-Limit': String(max) },
      }
    )
  }

  return { userId: user.id, tenantId, plan }
}
