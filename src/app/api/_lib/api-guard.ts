import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { createClient } from '@/lib/supabase/server'

// Upstash Redis client for distributed rate limiting
let redisClient: Redis | null = null

function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables')
    }

    redisClient = new Redis({ url, token })
  }
  return redisClient
}

// Sliding window rate limiter using Upstash Redis.
const RATE_LIMITS: Record<string, { free: number; paid: number }> = {
  'analyze-cv':      { free: 5,  paid: 20 },
  'generate-jd':     { free: 10, paid: 40 },
  'generate-report': { free: 10, paid: 40 },
  'generate-message':{ free: 20, paid: 60 },
  default:           { free: 10, paid: 30 },
}
const WINDOW_MS = 60_000 // 1 minute

async function isRateLimited(userId: string, endpoint: string, isPaidPlan: boolean): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const key = `rate-limit:${userId}:${endpoint}`
    const now = Date.now()

    // Get current timestamps from Redis (stored as string: "ts1,ts2,ts3,...")
    const stored = await redis.get<string>(key)
    let timestamps: number[] = stored ? stored.split(',').map(Number) : []

    // Filter out timestamps outside the window
    const recent = timestamps.filter(t => now - t < WINDOW_MS)

    const limits = RATE_LIMITS[endpoint] ?? RATE_LIMITS.default
    const max = isPaidPlan ? limits.paid : limits.free

    if (recent.length >= max) return true

    // Add current timestamp
    recent.push(now)

    // Store updated timestamps with 1-minute TTL (plus buffer)
    await redis.setex(key, Math.ceil(WINDOW_MS / 1000), recent.join(','))

    return false
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // If Redis is unavailable, fail open (allow the request) to avoid blocking users
    // In production, consider logging this for monitoring
    return false
  }
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

  if (await isRateLimited(user.id, endpoint, isPaid)) {
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
