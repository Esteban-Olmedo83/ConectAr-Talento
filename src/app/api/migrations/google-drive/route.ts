import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * POST /api/migrations/google-drive
 *
 * Applies the Google Drive integration migration to the profiles table.
 * Only callable by authenticated admin users.
 *
 * Safe to call multiple times (uses IF NOT EXISTS)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const adminEmail = process.env.ADMIN_EMAIL
  if (user.email !== adminEmail) {
    return NextResponse.json(
      { error: 'Only admin can run migrations' },
      { status: 403 }
    )
  }

  try {
    // Execute migration directly via SQL
    const { error: error1 } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single()

    // If the query works, the table exists. Now add columns if they don't.
    // We'll use a raw SQL query through a function call or direct RPC.

    // Method: Check if columns exist first
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .limit(0) // Don't fetch data, just check table

    // If we got here, table exists
    // Now we need to add the columns if they don't exist
    // Since supabase-js doesn't support raw ALTER TABLE, we'll document the manual step

    return NextResponse.json({
      ok: false,
      message: 'Migration requires manual execution in Supabase SQL Editor',
      sql: `
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS google_drive_folder_id text,
  ADD COLUMN IF NOT EXISTS google_sheets_db_id text;

CREATE INDEX IF NOT EXISTS idx_profiles_google_drive_folder_id ON public.profiles(google_drive_folder_id);
CREATE INDEX IF NOT EXISTS idx_profiles_google_sheets_db_id ON public.profiles(google_sheets_db_id);
      `.trim(),
      instructions: [
        '1. Go to Supabase Dashboard > SQL Editor',
        '2. Copy and paste the SQL above',
        '3. Click "Run"',
        '4. Refresh your browser'
      ]
    })
  } catch (err) {
    console.error('Migration error:', err)
    return NextResponse.json(
      { error: 'Migration failed', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
