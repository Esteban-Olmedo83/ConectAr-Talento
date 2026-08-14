import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { decryptToken } from '@/lib/crypto/token-encrypt'

export const runtime = 'nodejs'

async function createDriveFolder(accessToken: string, name: string): Promise<string | null> {
  try {
    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' }),
    })

    const data = await res.json() as { id?: string; error?: { message: string } }

    if (!res.ok || !data.id) {
      console.error('[Google Setup] Failed to create folder:', data.error?.message)
      return null
    }

    return data.id
  } catch (err) {
    console.error('[Google Setup] Exception creating folder:', err)
    return null
  }
}

async function createSheetsFile(
  accessToken: string,
  name: string,
  folderId: string
): Promise<string | null> {
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

    if (!res.ok || !data.id) {
      console.error('[Google Setup] Failed to create sheets:', data.error?.message)
      return null
    }

    return data.id
  } catch (err) {
    console.error('[Google Setup] Exception creating sheets:', err)
    return null
  }
}

interface CreateRequest {
  createFolder?: boolean
  createSheets?: boolean
}

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as CreateRequest
  const { createFolder = true, createSheets = true } = body

  // Get current profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, company_name, google_drive_folder_id, google_sheets_db_id')
    .eq('id', user.id)
    .single()

  // Get Google integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token, refresh_token')
    .eq('tenant_id', profile?.tenant_id ?? user.id)
    .eq('platform', 'gmail')
    .maybeSingle()

  if (!integration?.access_token) {
    return NextResponse.json(
      { error: 'Google no está conectado. Reconectá tu cuenta.' },
      { status: 400 }
    )
  }

  const accessToken = decryptToken(integration.access_token as string)
  const updatePayload: Record<string, string> = {}
  const result: Record<string, boolean | string> = {}

  // Create folder if needed
  let folderId = profile?.google_drive_folder_id
  if (createFolder && !folderId) {
    const companyName = (profile?.company_name as string) ?? 'Mi Empresa'
    const newFolderId = await createDriveFolder(accessToken, `ConectAr Talento - ${companyName}`)
    if (newFolderId) {
      folderId = newFolderId
      updatePayload.google_drive_folder_id = newFolderId
      result.folderCreated = true
    } else {
      result.folderError = 'No se pudo crear la carpeta en Google Drive'
    }
  } else {
    result.folderCreated = false
  }

  // Create sheets if needed
  if (createSheets && folderId && !profile?.google_sheets_db_id) {
    const newSheetsId = await createSheetsFile(
      accessToken,
      'Base de Datos - ConectAr Talento',
      folderId
    )
    if (newSheetsId) {
      updatePayload.google_sheets_db_id = newSheetsId
      result.sheetsCreated = true
    } else {
      result.sheetsError = 'No se pudo crear la base de datos en Google Sheets'
    }
  } else {
    result.sheetsCreated = false
  }

  // Update profile if anything was created
  if (Object.keys(updatePayload).length > 0) {
    await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
  }

  return NextResponse.json({
    success: !result.folderError && !result.sheetsError,
    ...result,
  })
}
