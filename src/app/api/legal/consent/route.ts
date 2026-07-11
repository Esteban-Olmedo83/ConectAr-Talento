import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logLegalEvent, type LegalEventType } from '@/lib/legal-audit'

export async function POST(request: NextRequest) {
  try {
    // C1 FIX: require authenticated session; never accept userId from request body
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json() as {
      eventTypes: LegalEventType[]
      documentVersions?: Record<string, string>
    }

    const { eventTypes, documentVersions } = body

    if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
      return NextResponse.json({ error: 'eventTypes requerido' }, { status: 400 })
    }

    // IP from forwarded header (informational only; never used for authz)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'
    const userAgent = request.headers.get('user-agent') ?? undefined

    await Promise.all(
      eventTypes.map((eventType) =>
        logLegalEvent({
          eventType,
          userId: user.id, // always from session, never from body
          ipAddress,
          userAgent,
          documentVersion: documentVersions?.[eventType.split('_')[0]] ?? '1.0',
          metadata: { documentVersions: documentVersions ?? {} },
        })
      )
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/legal/consent]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
