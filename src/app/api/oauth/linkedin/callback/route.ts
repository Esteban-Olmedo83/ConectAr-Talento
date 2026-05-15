import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return NextResponse.redirect(new URL(`/integrations?error=linkedin_denied`, appUrl))
  }

  const storedState = request.cookies.get('oauth_state_linkedin')?.value
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/integrations?error=linkedin_state_mismatch', appUrl))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/integrations?error=linkedin_no_code', appUrl))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', appUrl))
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID!
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!
  const redirectUri = `${appUrl}/api/oauth/linkedin/callback`

  // Exchange code for tokens
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
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
    return NextResponse.redirect(new URL('/integrations?error=linkedin_token_failed', appUrl))
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    expires_in?: number
  }

  // Fetch user profile
  const profileRes = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName)', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const emailRes = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  let accountName = 'LinkedIn Account'
  let accountEmail: string | undefined

  if (profileRes.ok) {
    const profile = await profileRes.json() as {
      localizedFirstName?: string
      localizedLastName?: string
    }
    accountName = `${profile.localizedFirstName ?? ''} ${profile.localizedLastName ?? ''}`.trim() || accountName
  }

  if (emailRes.ok) {
    const emailData = await emailRes.json() as {
      elements?: Array<{ 'handle~'?: { emailAddress?: string } }>
    }
    accountEmail = emailData.elements?.[0]?.['handle~']?.emailAddress
  }

  // Get tenant_id from user metadata
  const tenantId = (user.user_metadata?.tenant_id as string) ?? user.id

  // Upsert integration
  const tokenExpiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : undefined

  await supabase.from('integrations').upsert(
    {
      tenant_id: tenantId,
      platform: 'linkedin',
      account_name: accountName,
      account_email: accountEmail ?? null,
      status: 'connected',
      access_token: tokens.access_token,
      token_expires_at: tokenExpiresAt ?? null,
    },
    { onConflict: 'tenant_id,platform' }
  )

  const response = NextResponse.redirect(new URL('/integrations?connected=linkedin', appUrl))
  response.cookies.delete('oauth_state_linkedin')
  return response
}
