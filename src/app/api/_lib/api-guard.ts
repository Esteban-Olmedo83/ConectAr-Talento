import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createClient } from '@/lib/supabase/server'

const RATE_LIMITS: Record<string, { free: number; paid: number }> = {
  'analyze-cv':      { free: 5,  paid: 20 },
  'generate-jd':     { free: 10, paid: 40 },
  'generate-report': { free: 10, paid: 40 },
  'generate-message':{ free: 20, paid: 60 },
  default:           { free: 10, paid: 30 },
}

let redisClient: Redis | null = null

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    console.warn('UPSTASH_REDIS_REST_URL/TOKEN not configured — rate limiting degraded to fail-open')
    return null
  }
  if (!redisClient) redisClient = new Redis({ url, token })
  return redisClient
}

// Ratelimit instances cached per endpoint+plan so they're reused across requests
// within the same worker. Each uses slidingWindow, which is atomic via Lua script.
const limiterCache = new Map<string, Ratelimit>()

function getLimiter(endpoint: string, isPaid: boolean): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null

  const cacheKey = `${endpoint}:${isPaid ? 'paid' : 'free'}`
  if (limiterCache.has(cacheKey)) return limiterCache.get(cacheKey)!

  const limits = RATE_LIMITS[endpoint] ?? RATE_LIMITS.default
  const max = isPaid ? limits.paid : limits.free
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, '60 s'),
    prefix: 'rl',
  })
  limiterCache.set(cacheKey, limiter)
  return limiter
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
 *
 * Rate limiting uses @upstash/ratelimit slidingWindow, which is atomic (Lua script
 * on Redis). This prevents the bypass race condition of the prior GET→check→SET pattern.
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

  try {
    const limiter = getLimiter(endpoint, isPaid)
    if (limiter) {
      const { success } = await limiter.limit(user.id)
      if (!success) {
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
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail-open: allow the request when Redis is unavailable to avoid blocking users
  }

  return { userId: user.id, tenantId, plan }
}
