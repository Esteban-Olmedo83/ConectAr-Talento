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

  // L3 FIX: require dedicated UNSUBSCRIBE_SECRET; fail closed if not set
  const secret = process.env.UNSUBSCRIBE_SECRET
  if (!secret) {
    console.error('[unsubscribe] UNSUBSCRIBE_SECRET env var not set — unsubscribe blocked')
    return NextResponse.redirect(new URL('/?unsubscribe=invalid', APP_URL))
  }

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
