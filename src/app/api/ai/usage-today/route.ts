import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAiDailyLimit } from '@/lib/rate-limit'

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = (profile?.plan as string | null) ?? 'free'
  const result = await checkAiDailyLimit(user.id, plan, 'analyze-cv')

  return NextResponse.json({
    plan,
    limit: isFinite(result.limit) ? result.limit : null,
    remaining: isFinite(result.remaining) ? result.remaining : null,
    isUnlimited: !isFinite(result.limit),
    resetAt: result.resetAt.toISOString(),
  })
}
