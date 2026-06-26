import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const { searchParams } = new URL(request.url)
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

  // Extract userId from state (format: "userId:nonce") — avoids double-refresh on rotating tokens
  const userId = state.split(':')[0]
  if (!userId || !/^[0-9a-f-]{36}$/.test(userId)) {
    return NextResponse.redirect(new URL('/integrations?error=google_state_invalid', appUrl))
  }

  const adminClient = createAdminClient()

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
    return NextResponse.redirect(new URL('/integrations?error=google_token_failed', appUrl))
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    refresh_token?: string
    expires_in?: number
  }

  // Fetch user profile
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  let accountName = 'Google Account'
  let accountEmail: string | undefined

  if (profileRes.ok) {
    const profile = await profileRes.json() as {
      name?: string
      email?: string
    }
    accountName = profile.name ?? accountName
    accountEmail = profile.email
  }

  // Get tenant_id from profiles table (consistent with other OAuth callbacks)
  const { data: tenantProfile } = await adminClient
    .from('profiles')
    .select('tenant_id, google_drive_folder_id, google_sheets_db_id')
    .eq('id', userId)
    .single()

  const tenantId = tenantProfile?.tenant_id ?? userId
  const tokenExpiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : undefined

  await adminClient.from('integrations').upsert(
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

  // ── Crear carpeta y hoja de Google Drive (solo si no existen aún) ──────────
  let driveFolderId = tenantProfile?.google_drive_folder_id as string | null | undefined
  let sheetsId = tenantProfile?.google_sheets_db_id as string | null | undefined

  const accessToken = tokens.access_token

  try {
    // 1. Crear carpeta "ConectAr Talento" en Drive (si no existe aún)
    if (!driveFolderId) {
      const folderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'ConectAr Talento',
          mimeType: 'application/vnd.google-apps.folder',
        }),
      })
      if (folderRes.ok) {
        const folderData = await folderRes.json() as { id?: string }
        driveFolderId = folderData.id
      }
    }

    // 2. Crear hoja de cálculo "ConectAr Talento — Base de datos" (si no existe aún)
    if (!sheetsId) {
      const sheetsRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { title: 'ConectAr Talento — Base de datos' },
          sheets: [
            { properties: { title: 'Candidatos' } },
            { properties: { title: 'Vacantes' } },
            { properties: { title: 'Aplicaciones' } },
          ],
        }),
      })
      if (sheetsRes.ok) {
        const sheetsData = await sheetsRes.json() as { spreadsheetId?: string }
        sheetsId = sheetsData.spreadsheetId

        // 3. Mover la hoja a la carpeta de Drive (si ambas existen)
        if (driveFolderId && sheetsId) {
          await fetch(
            `https://www.googleapis.com/drive/v3/files/${sheetsId}?addParents=${driveFolderId}&removeParents=root&fields=id,parents`,
            {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          )
        }
      }
    }

    // 4. Guardar los IDs en el perfil del usuario
    if (driveFolderId || sheetsId) {
      const updates: Record<string, string> = {}
      if (driveFolderId) updates.google_drive_folder_id = driveFolderId
      if (sheetsId) updates.google_sheets_db_id = sheetsId

      await adminClient
        .from('profiles')
        .update(updates)
        .eq('id', userId)
    }
  } catch {
    // No bloquear el flujo si Drive falla — la cuenta Gmail queda conectada igual
  }

  const response = NextResponse.redirect(new URL('/integrations?connected=google', appUrl))
  response.cookies.delete('oauth_state_google')
  return response
}
