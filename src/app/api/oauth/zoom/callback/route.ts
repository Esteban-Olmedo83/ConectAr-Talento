import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/crypto/token-encrypt'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin
  try {
  const { searchParams } = requestUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return NextResponse.redirect(new URL('/integrations?error=zoom_denied', appUrl))
  }

  const storedState = request.cookies.get('oauth_state_zoom')?.value
  if (!state || !storedState || state !== storedState) {
    console.error('[OAuth Zoom] State mismatch:', {
      hasState: !!state,
      hasStoredState: !!storedState,
      stateMatch: state === storedState,
      state: state?.substring(0, 20),
      storedState: storedState?.substring(0, 20),
      appUrl,
    })
    return NextResponse.redirect(new URL('/integrations?error=zoom_state_mismatch', appUrl))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/integrations?error=zoom_no_code', appUrl))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', appUrl))
  }

  const clientId = process.env.ZOOM_CLIENT_ID!
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!
  const redirectUri = `${appUrl}/api/oauth/zoom/callback`

  // Exchange code for tokens using Basic Auth
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const tokenRes = await fetchWithTimeout('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  }, 10_000)

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/integrations?error=zoom_token_failed', appUrl))
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    refresh_token?: string
    expires_in?: number
  }

  let accountName = 'Zoom Account'
  let accountEmail: string | undefined

  // Fetch user profile (non-critical — fall back to defaults on error)
  try {
    const profileRes = await fetchWithTimeout('https://api.zoom.us/v2/users/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }, 5_000)
    if (profileRes.ok) {
      const profile = await profileRes.json() as {
        first_name?: string
        last_name?: string
        email?: string
        display_name?: string
      }
      accountName = profile.display_name ?? (`${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || accountName)
      accountEmail = profile.email
    }
  } catch { /* non-fatal — continue with defaults */ }

  const { data: tenantProfile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  const tenantId = tenantProfile?.tenant_id ?? user.id
  const tokenExpiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : undefined

  await supabase.from('integrations').upsert(
    {
      tenant_id: tenantId,
      platform: 'zoom',
      account_name: accountName,
      account_email: accountEmail ?? null,
      status: 'connected',
      access_token: encryptToken(tokens.access_token),
      refresh_token: tokens.refresh_token ? encryptToken(tokens.refresh_token) : null,
      token_expires_at: tokenExpiresAt ?? null,
    },
    { onConflict: 'tenant_id,platform' }
  )

  const response = NextResponse.redirect(new URL('/integrations?connected=zoom', appUrl))
  response.cookies.delete('oauth_state_zoom')
  return response
  } catch (err) {
    console.error('[OAuth Zoom] unexpected error:', err)
    return NextResponse.redirect(new URL('/integrations?error=zoom_error', appUrl))
  }
}
