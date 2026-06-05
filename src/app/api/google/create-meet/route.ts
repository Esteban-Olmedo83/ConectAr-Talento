import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAccessToken } from '@/lib/google/refresh-token'

export const runtime = 'nodejs'

interface CreateMeetRequest {
  summary: string       // e.g. "Entrevista - Ana López - Desarrollador"
  startTime: string     // ISO 8601
  duration?: number     // minutes, default 60
  candidateEmail?: string
  description?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: tenantProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  const tenantId = tenantProfile?.tenant_id ?? user.id

  const tokenResult = await getGoogleAccessToken(supabase, tenantId)
  if ('error' in tokenResult) {
    return NextResponse.json({ error: tokenResult.error }, { status: 400 })
  }

  const body = await request.json() as CreateMeetRequest
  const duration = body.duration ?? 60

  const start = new Date(body.startTime)
  const end = new Date(start.getTime() + duration * 60_000)

  const attendees: { email: string }[] = [{ email: user.email! }]
  if (body.candidateEmail) attendees.push({ email: body.candidateEmail })

  const eventPayload = {
    summary: body.summary,
    description: body.description ?? 'Entrevista agendada desde ConectAr Talento.',
    start: { dateTime: start.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
    end: { dateTime: end.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
    attendees,
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  }

  const calRes = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    }
  )

  if (!calRes.ok) {
    const err = await calRes.json().catch(() => ({})) as { error?: { message?: string } }
    return NextResponse.json(
      { error: err.error?.message ?? 'Error al crear el evento en Google Calendar.' },
      { status: 502 }
    )
  }

  const event = await calRes.json() as {
    id: string
    htmlLink: string
    conferenceData?: { entryPoints?: { uri: string; entryPointType: string }[] }
  }

  const meetLink = event.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri

  return NextResponse.json({
    eventId: event.id,
    calendarLink: event.htmlLink,
    meetLink: meetLink ?? null,
  })
}
