import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Uses the same redirect_uri as the integration flow (/api/oauth/google/callback)
// so no extra Google Cloud Console configuration is needed.
// The state prefix "auth:" tells the shared callback to use the auth path.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = new URL(request.url).origin
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin
  const clientId = process.env.GOOGLE_CLIENT_ID

  if (!clientId) {
    return NextResponse.redirect(new URL('/login?error=google_not_configured', appUrl))
  }

  const state = `auth:${crypto.randomUUID()}`
  // Reuse the same redirect_uri already registered in Google Cloud Console
  const redirectUri = `${appUrl}/api/oauth/google/callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('oauth_state_google_auth', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  })

  return response
}
