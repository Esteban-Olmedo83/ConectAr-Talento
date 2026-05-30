import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendInterviewScheduledEmail } from '@/lib/email/send'

interface InterviewNotifyBody {
  candidateId: string
  vacancyTitle: string
  scheduledAt: string
  interviewerName: string
  interviewType: string
  meetingPlatform?: string
  meetingLink?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as InterviewNotifyBody

    if (!body.candidateId || !body.vacancyTitle || !body.scheduledAt) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Fetch candidate email and company name
    const [{ data: candidate }, { data: profile }] = await Promise.all([
      supabase.from('candidates').select('full_name, email').eq('id', body.candidateId).single(),
      supabase.from('profiles').select('company_name').eq('id', user.id).single(),
    ])

    if (!candidate?.email) {
      return NextResponse.json({ ok: false, reason: 'candidate_no_email' })
    }

    const result = await sendInterviewScheduledEmail({
      candidateName: candidate.full_name,
      candidateEmail: candidate.email,
      vacancyTitle: body.vacancyTitle,
      companyName: profile?.company_name ?? 'la empresa',
      scheduledAt: new Date(body.scheduledAt),
      interviewerName: body.interviewerName,
      interviewType: body.interviewType,
      meetingPlatform: body.meetingPlatform,
      meetingLink: body.meetingLink,
    })

    if (!result.ok) {
      console.error('Interview notification email error:', result.error)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('interview-scheduled email route error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
