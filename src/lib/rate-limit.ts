import { createAdminClient } from '@/lib/supabase/admin'

const AI_HOURLY_LIMITS: Record<string, number> = {
  free:       10,
  starter:    30,
  pro:        100,
  business:   300,
  enterprise: Infinity,
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: Date
}

export async function checkAiRateLimit(userId: string, plan: string): Promise<RateLimitResult> {
  const limit = AI_HOURLY_LIMITS[plan] ?? AI_HOURLY_LIMITS.free

  // Truncate to current hour
  const now = new Date()
  const hourBucket = new Date(now)
  hourBucket.setMinutes(0, 0, 0)

  const resetAt = new Date(hourBucket)
  resetAt.setHours(resetAt.getHours() + 1)

  if (!isFinite(limit)) {
    return { allowed: true, limit, remaining: Infinity, resetAt }
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('increment_ai_usage', {
      p_user_id: userId,
      p_hour_bucket: hourBucket.toISOString(),
    })

    if (error) {
      // Fail open: don't block users if rate limit check fails
      console.error('Rate limit check error:', error)
      return { allowed: true, limit, remaining: limit, resetAt }
    }

    const count = data as number
    const remaining = Math.max(0, limit - count)
    return { allowed: count <= limit, limit, remaining, resetAt }
  } catch (err) {
    console.error('Rate limit unexpected error:', err)
    return { allowed: true, limit, remaining: limit, resetAt }
  }
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(isFinite(result.limit) ? result.limit : 'unlimited'),
    'X-RateLimit-Remaining': String(isFinite(result.remaining) ? result.remaining : 'unlimited'),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  }
}
