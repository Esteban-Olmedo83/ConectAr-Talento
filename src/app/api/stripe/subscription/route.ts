import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, plan')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ plan: 'free', status: null, subscription: null })
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select(
        'plan, status, stripe_status, cancel_at_period_end, canceled_at, ' +
        'stripe_current_period_end, current_period_ends_at, stripe_subscription_id'
      )
      .eq('tenant_id', profile.tenant_id)
      .maybeSingle()

    const subRecord = sub as Record<string, unknown> | null

    return NextResponse.json({
      plan: profile.plan ?? 'free',
      status: (subRecord?.stripe_status ?? subRecord?.status) as string | null ?? null,
      subscription: subRecord ?? null,
    })
  } catch (error) {
    console.error('Subscription GET error:', error)
    return NextResponse.json({ error: 'Error al obtener suscripción' }, { status: 500 })
  }
}
