import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// ─── Drive / Sheets helpers (used by integration flow) ────────────────────────

async function createDriveFolder(accessToken: string, name: string): Promise<string | null> {
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' }),
  })
  if (!res.ok) return null
  const data = await res.json() as { id?: string }
  return data.id ?? null
}

async function createSheetsFile(accessToken: string, name: string, folderId: string): Promise<string | null> {
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [folderId],
    }),
  })
  if (!res.ok) return null
  const data = await res.json() as { id?: string }
  return data.id ?? null
}

// ─── JWT payload parser (used by auth flow, no external lib needed) ───────────

function parseJwtPayload(token: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'))
  } catch {
    return {}
  }
}

// ─── Shared callback ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin
  const { searchParams } = requestUrl

  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  // State prefix "auth:" → login/signup flow; anything else → integration flow
  const isAuthFlow = typeof state === 'string' && state.startsWith('auth:')

  const errorRedirect = isAuthFlow
    ? new URL('/login?error=google_denied', appUrl)
    : new URL('/integrations?error=google_denied', appUrl)

  if (errorParam) return NextResponse.redirect(errorRedirect)

  // Verify state against the correct cookie
  const cookieName = isAuthFlow ? 'oauth_state_google_auth' : 'oauth_state_google'
  const storedState = request.cookies.get(cookieName)?.value

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      isAuthFlow
        ? new URL('/login?error=google_state_mismatch', appUrl)
        : new URL('/integrations?error=google_state_mismatch', appUrl)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      isAuthFlow
        ? new URL('/login?error=google_no_code', appUrl)
        : new URL('/integrations?error=google_no_code', appUrl)
    )
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri = `${appUrl}/api/oauth/google/callback`

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
    return NextResponse.redirect(
      isAuthFlow
        ? new URL('/login?error=google_token_failed', appUrl)
        : new URL('/integrations?error=google_token_failed', appUrl)
    )
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    refresh_token?: string
    expires_in?: number
    id_token?: string
  }

  // ── AUTH FLOW: login / signup ────────────────────────────────────────────────
  if (isAuthFlow) {
    let email: string | undefined
    let fullName: string | undefined
    let avatarUrl: string | undefined

    // Extract from id_token first (fastest, no extra network call)
    if (tokens.id_token) {
      const payload = parseJwtPayload(tokens.id_token)
      email = payload.email as string | undefined
      fullName = payload.name as string | undefined
      avatarUrl = payload.picture as string | undefined
    }

    // Fallback to userinfo endpoint
    if (!email) {
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (profileRes.ok) {
        const profile = await profileRes.json() as { email?: string; name?: string; picture?: string }
        email = profile.email
        fullName = profile.name
        avatarUrl = profile.picture
      }
    }

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=google_no_email', appUrl))
    }

    const adminClient = createAdminClient()

    // Use type:'signup' which relies on the email+password provider (always enabled),
    // unlike 'magiclink' which requires the Email OTP provider to be enabled.
    // generateLink upserts the user, so it works for both new and existing accounts.
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'signup',
      email,
      password: crypto.randomUUID(),
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

  // ── INTEGRATION FLOW: connect Google Workspace (Gmail / Drive) ───────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', appUrl))
  }

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  let accountName = 'Google Account'
  let accountEmail: string | undefined

  if (profileRes.ok) {
    const profile = await profileRes.json() as { name?: string; email?: string }
    accountName = profile.name ?? accountName
    accountEmail = profile.email
  }

  const { data: tenantProfile } = await supabase
    .from('profiles')
    .select('tenant_id, company_name, google_drive_folder_id')
    .eq('id', user.id)
    .single()

  const tenantId = tenantProfile?.tenant_id ?? user.id
  const tokenExpiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : undefined

  await supabase.from('integrations').upsert(
    {
      tenant_id: tenantId,
      platform: 'gmail',
      account_name: accountName,
      account_email: accountEmail ?? null,
      status: 'connected',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      token_expires_at: tokenExpiresAt ?? null,
    },
    { onConflict: 'tenant_id,platform' }
  )

  // Create Drive folder + Sheets file if not already set up
  if (!tenantProfile?.google_drive_folder_id) {
    const companyName = (tenantProfile?.company_name as string | null) ?? 'Mi Empresa'
    const folderId = await createDriveFolder(tokens.access_token, `ConectAr Talento - ${companyName}`)
    if (folderId) {
      const sheetsId = await createSheetsFile(tokens.access_token, 'Base de Datos - ConectAr Talento', folderId)
      await supabase.from('profiles').update({
        google_drive_folder_id: folderId,
        google_sheets_db_id: sheetsId ?? null,
      }).eq('id', user.id)
    }
  }

  const response = NextResponse.redirect(new URL('/integrations?connected=google', appUrl))
  response.cookies.delete('oauth_state_google')
  return response
}
