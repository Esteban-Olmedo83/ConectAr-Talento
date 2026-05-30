import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe/subscriptions'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://conect-ar-talento-esteban-olmedo83s-projects.vercel.app'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = (await request.json()) as { plan?: string }
    if (!plan || !['starter', 'pro', 'business'].includes(plan)) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, company_name')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'Perfil incompleto' }, { status: 400 })
    }

    const session = await createCheckoutSession({
      userId: user.id,
      tenantId: profile.tenant_id,
      plan: plan as 'starter' | 'pro' | 'business',
      customerEmail: user.email!,
      successUrl: `${appUrl}/settings?tab=billing&success=1`,
      cancelUrl: `${appUrl}/settings?tab=billing&canceled=1`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 })
  }
}
