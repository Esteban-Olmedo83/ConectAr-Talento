import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHmac } from 'crypto'

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://www.conectartalento.com'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  if (!uid || !token) {
    return NextResponse.redirect(new URL('/?unsubscribe=invalid', APP_URL))
  }

  const secret = process.env.UNSUBSCRIBE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'fallback-secret'
  const expected = createHmac('sha256', secret).update(uid).digest('hex')

  if (token !== expected) {
    return NextResponse.redirect(new URL('/?unsubscribe=invalid', APP_URL))
  }

  const admin = createAdminClient()
  await admin
    .from('profiles')
    .update({ email_notifications: false })
    .eq('id', uid)

  return NextResponse.redirect(new URL('/?unsubscribe=ok', APP_URL))
}
