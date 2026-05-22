import { NextResponse } from 'next/server'
import { requireAdmin } from '../guard'

export async function GET() {
  const { response, supabase } = await requireAdmin()
  if (response || !supabase) return response!

  const { data, error } = await supabase.rpc('admin_get_stats')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
