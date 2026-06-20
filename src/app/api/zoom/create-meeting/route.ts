import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken, decryptToken } from '@/lib/crypto/token-encrypt'

export const runtime = 'nodejs'

interface CreateMeetingRequest {
  topic?: string
  startTime?: string  // ISO 8601
  duration?: number   // minutes
}

async function refreshZoomToken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  refreshToken: string,
): Promise<string | null> {
  const clientId = process.env.ZOOM_CLIENT_ID!
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) return null

  const tokens = await res.json() as {
    access_token: string
    refresh_token?: string
    expires_in?: number
  }

  const tokenExpiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : undefined

  await supabase.from('integrations').update({
    access_token: encryptToken(tokens.access_token),
    refresh_token: encryptToken(tokens.refresh_token ?? refreshToken),
    token_expires_at: tokenExpiresAt ?? null,
  }).eq('tenant_id', tenantId).eq('platform', 'zoom')

  return tokens.access_token
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

  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token, refresh_token, token_expires_at')
    .eq('tenant_id', tenantId)
    .eq('platform', 'zoom')
    .eq('status', 'connected')
    .single()

  if (!integration?.access_token) {
    return NextResponse.json({ error: 'Zoom no está conectado. Conectalo en Integraciones.' }, { status: 400 })
  }

  const rawAccessToken = integration.access_token as string
  const rawRefreshToken = integration.refresh_token as string | null
  let accessToken = decryptToken(rawAccessToken)

  // Refresh if expired (with 60-second buffer)
  if (integration.token_expires_at) {
    const expiresAt = new Date(integration.token_expires_at as string).getTime()
    if (Date.now() >= expiresAt - 60_000 && rawRefreshToken) {
      const newToken = await refreshZoomToken(supabase, tenantId, decryptToken(rawRefreshToken))
      if (!newToken) {
        return NextResponse.json({ error: 'Sesión de Zoom expirada. Reconectalo en Integraciones.' }, { status: 401 })
      }
      accessToken = newToken
    }
  }

  const body = await request.json() as CreateMeetingRequest

  const meetingPayload = {
    topic: body.topic ?? 'Entrevista',
    type: 2,
    start_time: body.startTime ?? new Date().toISOString(),
    duration: body.duration ?? 60,
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: true,
      waiting_room: false,
    },
  }

  const zoomRes = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(meetingPayload),
  })

  if (!zoomRes.ok) {
    const err = await zoomRes.json().catch(() => ({})) as { message?: string }
    return NextResponse.json(
      { error: err.message ?? 'Error al crear la reunión en Zoom.' },
      { status: 502 }
    )
  }

  const meeting = await zoomRes.json() as { join_url: string; id: number }
  return NextResponse.json({ joinUrl: meeting.join_url, meetingId: meeting.id })
}
