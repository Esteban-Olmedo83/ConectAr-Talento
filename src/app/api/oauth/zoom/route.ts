import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL!))
  }

  const clientId = process.env.ZOOM_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(
      new URL('/integrations?error=zoom_not_configured', process.env.NEXT_PUBLIC_APP_URL!)
    )
  }

  const state = crypto.randomUUID()
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/zoom/callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  })

  const authUrl = `https://zoom.us/oauth/authorize?${params.toString()}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('oauth_state_zoom', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  })

  return response
}
