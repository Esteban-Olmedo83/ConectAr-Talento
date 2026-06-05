import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAccessToken } from '@/lib/google/refresh-token'

export const runtime = 'nodejs'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, google_drive_folder_id')
    .eq('id', user.id)
    .single()

  const tenantId = profile?.tenant_id ?? user.id
  const folderId = profile?.google_drive_folder_id as string | null

  if (!folderId) {
    return NextResponse.json(
      { error: 'Google Drive no está configurado. Reconectá Google en Integraciones para crear la carpeta.' },
      { status: 400 }
    )
  }

  const tokenResult = await getGoogleAccessToken(supabase, tenantId)
  if ('error' in tokenResult) {
    return NextResponse.json({ error: tokenResult.error }, { status: 400 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const candidateName = (formData.get('candidateName') as string | null) ?? 'Candidato'

  if (!file) {
    return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 })
  }

  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'El archivo supera el límite de 10MB.' }, { status: 400 })
  }

  const fileName = `CV - ${candidateName} - ${new Date().toLocaleDateString('es-AR')}.${file.name.split('.').pop() ?? 'pdf'}`

  // Multipart upload to Drive
  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  })

  const boundary = '-------ConectArBoundary'
  const fileBuffer = await file.arrayBuffer()

  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`),
    Buffer.from(metadata),
    Buffer.from(`\r\n--${boundary}\r\nContent-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`),
    Buffer.from(fileBuffer),
    Buffer.from(`\r\n--${boundary}--`),
  ])

  const driveRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenResult.token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': String(body.length),
      },
      body,
    }
  )

  if (!driveRes.ok) {
    const err = await driveRes.json().catch(() => ({})) as { error?: { message?: string } }
    return NextResponse.json(
      { error: err.error?.message ?? 'Error al subir el archivo a Google Drive.' },
      { status: 502 }
    )
  }

  const driveFile = await driveRes.json() as { id: string; name: string; webViewLink: string }

  return NextResponse.json({
    fileId: driveFile.id,
    fileName: driveFile.name,
    driveLink: driveFile.webViewLink,
  })
}
