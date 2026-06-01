import { NextRequest, NextResponse } from 'next/server'
import { logLegalEvent, type LegalEventType } from '@/lib/legal-audit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      userId?: string
      eventTypes: LegalEventType[]
      documentVersions?: Record<string, string>
    }

    const { userId, eventTypes, documentVersions } = body

    if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
      return NextResponse.json({ error: 'eventTypes requerido' }, { status: 400 })
    }

    // Extraer IP real del request
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'
    const userAgent = request.headers.get('user-agent') ?? undefined

    await Promise.all(
      eventTypes.map((eventType) =>
        logLegalEvent({
          eventType,
          userId,
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
