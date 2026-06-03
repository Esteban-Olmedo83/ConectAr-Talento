import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBillingPortalSession } from '@/lib/stripe/subscriptions'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.conectartalento.com'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'Perfil incompleto' }, { status: 400 })
    }

    const session = await createBillingPortalSession(
      profile.tenant_id,
      `${appUrl}/settings?tab=billing`
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json({ error: 'Error al abrir portal de facturación' }, { status: 500 })
  }
}
