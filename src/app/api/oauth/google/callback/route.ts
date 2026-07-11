import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/crypto/token-encrypt'

export const runtime = 'nodejs'

// ─── Drive / Sheets helpers ────────────────────────────────────────────────────

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

// ─── Integration-only callback (C3: dead admin-login branch removed) ──────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin
  const { searchParams } = requestUrl

  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return NextResponse.redirect(new URL('/integrations?error=google_denied', appUrl))
  }

  const storedState = request.cookies.get('oauth_state_google')?.value
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/integrations?error=google_state_mismatch', appUrl))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/integrations?error=google_no_code', appUrl))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri = `${appUrl}/api/oauth/google/callback`

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
    return NextResponse.redirect(new URL('/integrations?error=google_token_failed', appUrl))
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    refresh_token?: string
    expires_in?: number
  }

  // Require an authenticated session — this callback is only for workspace integration
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
      access_token: encryptToken(tokens.access_token),
      refresh_token: tokens.refresh_token ? encryptToken(tokens.refresh_token) : null,
      token_expires_at: tokenExpiresAt ?? null,
    },
    { onConflict: 'tenant_id,platform' }
  )

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
