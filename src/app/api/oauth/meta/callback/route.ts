import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return NextResponse.redirect(new URL('/integrations?error=meta_denied', appUrl))
  }

  const storedState = request.cookies.get('oauth_state_meta')?.value
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/integrations?error=meta_state_mismatch', appUrl))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/integrations?error=meta_no_code', appUrl))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', appUrl))
  }

  const appId = process.env.META_APP_ID!
  const appSecret = process.env.META_APP_SECRET!
  const redirectUri = `${appUrl}/api/oauth/meta/callback`

  // Exchange code for tokens
  const tokenRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    }).toString()
  )

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/integrations?error=meta_token_failed', appUrl))
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    expires_in?: number
  }

  // Fetch user/business info
  const profileRes = await fetch(
    `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${tokens.access_token}`
  )

  let accountName = 'WhatsApp Business Account'
  let accountEmail: string | undefined

  if (profileRes.ok) {
    const profile = await profileRes.json() as {
      name?: string
      email?: string
    }
    accountName = profile.name ?? accountName
    accountEmail = profile.email
  }

  const tenantId = (user.user_metadata?.tenant_id as string) ?? user.id
  const tokenExpiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : undefined

  await supabase.from('integrations').upsert(
    {
      tenant_id: tenantId,
      platform: 'whatsapp',
      account_name: accountName,
      account_email: accountEmail ?? null,
      status: 'connected',
      access_token: tokens.access_token,
      token_expires_at: tokenExpiresAt ?? null,
    },
    { onConflict: 'tenant_id,platform' }
  )

  const response = NextResponse.redirect(new URL('/integrations?connected=whatsapp', appUrl))
  response.cookies.delete('oauth_state_meta')
  return response
}
