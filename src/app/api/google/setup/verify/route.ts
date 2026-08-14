import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('google_drive_folder_id, google_sheets_db_id')
    .eq('id', user.id)
    .single()

  const folderId = profile?.google_drive_folder_id as string | null
  const sheetsId = profile?.google_sheets_db_id as string | null

  return NextResponse.json({
    folder: folderId ? 'OK' : 'MISSING',
    sheets: sheetsId ? 'OK' : 'MISSING',
    folderCreatedAt: folderId ? new Date().toISOString() : null,
    sheetsCreatedAt: sheetsId ? new Date().toISOString() : null,
  })
}
