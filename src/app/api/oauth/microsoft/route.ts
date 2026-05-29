import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = new URL(request.url).origin
  const appUrl = appUrl || origin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', appUrl))
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(
      new URL('/integrations?error=microsoft_not_configured', appUrl)
    )
  }

  const state = crypto.randomUUID()
  const redirectUri = `${appUrl}/api/oauth/microsoft/callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: 'openid email profile User.Read Mail.Send Calendars.ReadWrite offline_access',
    response_mode: 'query',
  })

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('oauth_state_microsoft', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  })

  return response
}
