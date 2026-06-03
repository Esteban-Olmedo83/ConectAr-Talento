import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendStageChangedEmail } from '@/lib/email/send'

interface StageChangedBody {
  candidateId: string
  clientId?: string
  vacancyTitle: string
  newStage: string
  recruiterMessage?: string
}

interface ClientRow {
  name: string
  logo_url: string | null
  website: string | null
  recruitment_email: string | null
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

    // Fetch client branding when a clientId is provided
    let clientData: ClientRow | null = null
    if (body.clientId) {
      const { data } = await supabase
        .from('clients')
        .select('name, logo_url, website, recruitment_email')
        .eq('id', body.clientId)
        .single()
      if (data) clientData = data as ClientRow
    }

    if (!(candidate as { email?: string } | null)?.email) {
      return NextResponse.json({ ok: false, reason: 'candidate_no_email' })
    }

    const cand = candidate as { full_name: string; email: string }
    const prof = profile as { company_name?: string } | null
    const companyName = clientData?.name ?? prof?.company_name ?? 'la empresa'

    const result = await sendStageChangedEmail({
      candidateName: cand.full_name,
      candidateEmail: cand.email,
      replyTo: clientData?.recruitment_email ?? undefined,
      vacancyTitle: body.vacancyTitle,
      companyName,
      companyLogoUrl: clientData?.logo_url,
      companyWebsite: clientData?.website,
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
