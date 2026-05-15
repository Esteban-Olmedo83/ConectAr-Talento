import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL!))
  }

  const appId = process.env.META_APP_ID
  if (!appId) {
    return NextResponse.redirect(
      new URL('/integrations?error=meta_not_configured', process.env.NEXT_PUBLIC_APP_URL!)
    )
  }

  const state = crypto.randomUUID()
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/meta/callback`

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: 'whatsapp_business_management,whatsapp_business_messaging',
    response_type: 'code',
  })

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('oauth_state_meta', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  })

  return response
}
