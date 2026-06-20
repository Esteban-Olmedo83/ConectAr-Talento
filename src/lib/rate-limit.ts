import { createAdminClient } from '@/lib/supabase/admin'

const AI_HOURLY_LIMITS: Record<string, number> = {
  free:       10,
  starter:    30,
  pro:        100,
  business:   300,
  enterprise: Infinity,
}

// Daily CV-analysis limits (tracked via ai_usage_logs)
const AI_DAILY_LIMITS: Record<string, number> = {
  free:       1,
  starter:    Infinity,
  pro:        Infinity,
  business:   Infinity,
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
      console.error('Rate limit check error:', error)
      return { allowed: false, limit, remaining: 0, resetAt }
    }

    const count = data as number
    const remaining = Math.max(0, limit - count)
    return { allowed: count <= limit, limit, remaining, resetAt }
  } catch (err) {
    console.error('Rate limit unexpected error:', err)
    return { allowed: true, limit, remaining: limit, resetAt }
  }
}

export async function checkAiDailyLimit(userId: string, plan: string, route = 'analyze-cv'): Promise<RateLimitResult> {
  const limit = AI_DAILY_LIMITS[plan] ?? AI_DAILY_LIMITS.free

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const resetAt = new Date(startOfDay)
  resetAt.setDate(resetAt.getDate() + 1)

  if (!isFinite(limit)) {
    return { allowed: true, limit, remaining: Infinity, resetAt }
  }

  try {
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('route', route)
      .eq('success', true)
      .gte('created_at', startOfDay.toISOString())

    if (error) {
      console.error('Daily AI limit check error:', error)
      return { allowed: true, limit, remaining: limit, resetAt }
    }

    const used = count ?? 0
    const remaining = Math.max(0, limit - used)
    return { allowed: used < limit, limit, remaining, resetAt }
  } catch (err) {
    console.error('Daily AI limit unexpected error:', err)
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
