import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email/send'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, company_name')
      .eq('id', user.id)
      .single()

    const result = await sendWelcomeEmail({
      fullName: profile?.full_name ?? user.email?.split('@')[0] ?? 'Reclutador',
      companyName: profile?.company_name ?? 'tu empresa',
      email: user.email!,
    })

    if (!result.ok) {
      console.error('Welcome email error:', result.error)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('welcome email route error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
