import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/crypto/token-encrypt'
import { logError } from '@/app/api/_lib/error-logger'

export const runtime = 'nodejs'

// ─── Drive / Sheets helpers ────────────────────────────────────────────────────

interface DriveCreateResult {
  id: string | null
  error?: string
}

async function createDriveFolder(accessToken: string, name: string, userId?: string): Promise<DriveCreateResult> {
  try {
    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' }),
    })

    const data = await res.json() as { id?: string; error?: { message: string } }

    if (!res.ok) {
      const errorMsg = data.error?.message || `HTTP ${res.status}`
      const errorDetail = {
        status: res.status,
        error: errorMsg,
        fullResponse: data,
      }
      console.error(`[Google Drive] Failed to create folder:`, errorDetail)
      if (userId) {
        await logError({
          endpoint: '/api/oauth/google/callback',
          error: new Error(`createDriveFolder failed (${res.status}): ${errorMsg}`),
          userId,
        })
      }
      return { id: null, error: errorMsg }
    }

    if (!data.id) {
      console.error('[Google Drive] Created folder but no ID in response:', data)
      if (userId) {
        await logError({
          endpoint: '/api/oauth/google/callback',
          error: new Error('createDriveFolder: No ID in response'),
          userId,
        })
      }
      return { id: null, error: 'No ID in response' }
    }

    console.log(`[Google Drive] Successfully created folder: ${data.id}`)
    return { id: data.id }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[Google Drive] Exception creating folder: ${errorMsg}`)
    if (userId) {
      await logError({
        endpoint: '/api/oauth/google/callback',
        error: err,
        userId,
      })
    }
    return { id: null, error: errorMsg }
  }
}

async function createSheetsFile(accessToken: string, name: string, folderId: string, userId?: string): Promise<DriveCreateResult> {
  try {
    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [folderId],
      }),
    })

    const data = await res.json() as { id?: string; error?: { message: string } }

    if (!res.ok) {
      const errorMsg = data.error?.message || `HTTP ${res.status}`
      const errorDetail = {
        status: res.status,
        error: errorMsg,
        fullResponse: data,
      }
      console.error(`[Google Sheets] Failed to create file:`, errorDetail)
      if (userId) {
        await logError({
          endpoint: '/api/oauth/google/callback',
          error: new Error(`createSheetsFile failed (${res.status}): ${errorMsg}`),
          userId,
        })
      }
      return { id: null, error: errorMsg }
    }

    if (!data.id) {
      console.error('[Google Sheets] Created file but no ID in response:', data)
      if (userId) {
        await logError({
          endpoint: '/api/oauth/google/callback',
          error: new Error('createSheetsFile: No ID in response'),
          userId,
        })
      }
      return { id: null, error: 'No ID in response' }
    }

    console.log(`[Google Sheets] Successfully created spreadsheet: ${data.id}`)
    return { id: data.id }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[Google Sheets] Exception creating file: ${errorMsg}`)
    if (userId) {
      await logError({
        endpoint: '/api/oauth/google/callback',
        error: err,
        userId,
      })
    }
    return { id: null, error: errorMsg }
  }
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
    console.error('[OAuth Google] State mismatch:', {
      hasState: !!state,
      hasStoredState: !!storedState,
      stateMatch: state === storedState,
      state: state?.substring(0, 20),
      storedState: storedState?.substring(0, 20),
      appUrl,
    })
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

  const { data: tenantProfile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id, company_name, google_drive_folder_id')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error(`[OAuth] Failed to fetch user profile:`, {
      code: profileError.code,
      message: profileError.message,
      userId: user.id,
    })
    return NextResponse.redirect(new URL('/integrations?error=profile_fetch_failed', appUrl))
  }

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

  // Ensure both Drive folder and Sheets file exist (even if partially configured)
  let folderId = tenantProfile?.google_drive_folder_id ?? null
  let sheetsId: string | null = null
  const updatePayload: Record<string, string | null> = {}

  console.log(`[OAuth] Starting Google Drive/Sheets provisioning:`, {
    userId: user.id,
    existingFolderId: folderId,
    companyName: tenantProfile?.company_name,
  })

  // Only create folder if it doesn't exist
  if (!folderId) {
    const companyName = (tenantProfile?.company_name as string | null) ?? 'Mi Empresa'
    console.log(`[OAuth] Creating Drive folder for: ${companyName}`)
    const folderResult = await createDriveFolder(tokens.access_token, `ConectAr Talento - ${companyName}`, user.id)
    if (folderResult.id) {
      folderId = folderResult.id
      updatePayload.google_drive_folder_id = folderId
      console.log(`[OAuth] Drive folder created successfully: ${folderId}`)
    } else {
      console.error(`[OAuth] Failed to create Drive folder:`, folderResult.error)
    }
  } else {
    console.log(`[OAuth] Drive folder already exists: ${folderId}`)
  }

  // Only create sheets if we have a folder (either existing or newly created)
  if (folderId) {
    console.log(`[OAuth] Creating Sheets file in folder: ${folderId}`)
    const sheetsResult = await createSheetsFile(tokens.access_token, 'Base de Datos - ConectAr Talento', folderId, user.id)
    if (sheetsResult.id) {
      sheetsId = sheetsResult.id
      updatePayload.google_sheets_db_id = sheetsId
      console.log(`[OAuth] Sheets file created successfully: ${sheetsId}`)
    } else {
      console.error(`[OAuth] Failed to create Sheets file:`, sheetsResult.error)
      // Don't fail the entire flow — user can retry later
    }
  } else {
    console.warn(`[OAuth] No Drive folder available, skipping Sheets creation`)
  }

  // Only update profile if we have new values to set
  if (Object.keys(updatePayload).length > 0) {
    try {
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)
        .select()

      if (updateError) {
        console.error(`[OAuth] Supabase UPDATE error:`, {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
        })
        await logError({
          endpoint: '/api/oauth/google/callback',
          error: new Error(`Supabase UPDATE failed: ${updateError.message}`),
          userId: user.id,
        })
      } else if (!updated || updated.length === 0) {
        console.warn(`[OAuth] UPDATE returned no rows. User ID: ${user.id}`)
        await logError({
          endpoint: '/api/oauth/google/callback',
          error: new Error(`UPDATE returned no rows for user ${user.id}`),
          userId: user.id,
        })
      } else {
        console.log(`[OAuth] Profile updated successfully with Google Drive config:`, {
          userId: user.id,
          payload: updatePayload,
          updatedRow: updated[0],
        })
      }
    } catch (err) {
      console.error(`[OAuth] Exception updating profile:`, err)
      await logError({
        endpoint: '/api/oauth/google/callback',
        error: err instanceof Error ? err : new Error(String(err)),
        userId: user.id,
      })
    }
  } else {
    console.warn(`[OAuth] No Google Drive/Sheets resources were successfully created`)
  }

  const response = NextResponse.redirect(new URL('/integrations?connected=gmail', appUrl))
  response.cookies.delete('oauth_state_google')
  return response
}
