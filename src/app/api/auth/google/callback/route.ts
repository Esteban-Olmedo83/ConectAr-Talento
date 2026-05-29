import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function parseJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))
  } catch {
    return {}
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return NextResponse.redirect(new URL('/login?error=google_denied', appUrl))
  }

  const storedState = request.cookies.get('oauth_state_google_auth')?.value
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/login?error=google_state_mismatch', appUrl))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=google_no_code', appUrl))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri = `${appUrl}/api/auth/google/callback`

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/login?error=google_token_failed', appUrl))
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    id_token?: string
  }

  // Extract email and profile from id_token (no external library needed — just base64 decode)
  let email: string | undefined
  let fullName: string | undefined
  let avatarUrl: string | undefined

  if (tokens.id_token) {
    const payload = parseJwtPayload(tokens.id_token)
    email = payload.email as string | undefined
    fullName = (payload.name as string | undefined)
    avatarUrl = (payload.picture as string | undefined)
  }

  // Fallback to userinfo endpoint
  if (!email) {
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (profileRes.ok) {
      const profile = await profileRes.json() as {
        email?: string
        name?: string
        picture?: string
      }
      email = profile.email
      fullName = profile.name
      avatarUrl = profile.picture
    }
  }

  if (!email) {
    return NextResponse.redirect(new URL('/login?error=google_no_email', appUrl))
  }

  const adminClient = createAdminClient()

  // generateLink creates the user if they don't exist, or issues a magic link
  // for existing users. Email is marked confirmed when the link is followed.
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/pipeline`,
      data: {
        full_name: fullName ?? '',
        company_name: '',
        plan: 'free',
        avatar_url: avatarUrl ?? '',
      },
    },
  })

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.redirect(new URL('/login?error=google_link_failed', appUrl))
  }

  const response = NextResponse.redirect(linkData.properties.action_link)
  response.cookies.delete('oauth_state_google_auth')
  return response
}
