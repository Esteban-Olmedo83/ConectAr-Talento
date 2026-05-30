import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendStageChangedEmail } from '@/lib/email/send'

interface StageChangedBody {
  candidateId: string
  vacancyTitle: string
  newStage: string
  recruiterMessage?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as StageChangedBody

    if (!body.candidateId || !body.vacancyTitle || !body.newStage) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const [{ data: candidate }, { data: profile }] = await Promise.all([
      supabase.from('candidates').select('full_name, email').eq('id', body.candidateId).single(),
      supabase.from('profiles').select('company_name').eq('id', user.id).single(),
    ])

    if (!candidate?.email) {
      return NextResponse.json({ ok: false, reason: 'candidate_no_email' })
    }

    const result = await sendStageChangedEmail({
      candidateName: candidate.full_name,
      candidateEmail: candidate.email,
      vacancyTitle: body.vacancyTitle,
      companyName: profile?.company_name ?? 'la empresa',
      newStage: body.newStage,
      recruiterMessage: body.recruiterMessage,
    })

    if (!result.ok) {
      console.error('Stage changed email error:', result.error)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('stage-changed email route error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
