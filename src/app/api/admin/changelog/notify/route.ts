import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSystemUpdateEmail } from '@/lib/email/send'
import { createHmac } from 'crypto'

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://www.conectartalento.com'

const INACTIVE_DAYS = 30

function buildUnsubscribeUrl(userId: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'fallback-secret'
  const token = createHmac('sha256', secret).update(userId).digest('hex')
  return `${APP_URL}/api/unsubscribe?uid=${userId}&token=${token}`
}

function isInactive(lastSignIn: string | null): boolean {
  if (!lastSignIn) return true
  const days = (Date.now() - new Date(lastSignIn).getTime()) / (1000 * 60 * 60 * 24)
  return days >= INACTIVE_DAYS
}

export async function POST(request: NextRequest) {
  const { response, supabase: _ } = await requireAdmin()
  if (response) return response

  const body = await request.json() as { updateId: string }
  if (!body.updateId) {
    return NextResponse.json({ error: 'updateId es requerido' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 1. Get the update
  const { data: update, error: updateErr } = await admin
    .from('system_updates')
    .select('id, title, description, type, is_published, target_tenant_id')
    .eq('id', body.updateId)
    .single()

  if (updateErr || !update) {
    return NextResponse.json({ error: 'Actualización no encontrada' }, { status: 404 })
  }

  // 2. Publish if not already published
  if (!update.is_published) {
    await admin
      .from('system_updates')
      .update({ is_published: true, published_at: new Date().toISOString() })
      .eq('id', update.id)
  }

  // 3. Resolve target users
  let profilesQuery = admin
    .from('profiles')
    .select('id, full_name, tenant_id, email_notifications')

  if (update.target_tenant_id) {
    profilesQuery = profilesQuery.eq('tenant_id', update.target_tenant_id)
  }

  // Filter only users who haven't opted out
  const { data: profiles, error: profilesErr } = await profilesQuery
    .neq('email_notifications', false)

  if (profilesErr || !profiles || profiles.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'no_recipients' })
  }

  // 4. Get email + last_sign_in_at from auth.users
  const userIds = profiles.map((p: { id: string }) => p.id)
  const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const authMap = new Map<string, { email: string; lastSignIn: string | null }>()
  for (const au of (authUsers?.users ?? [])) {
    if (userIds.includes(au.id) && au.email) {
      authMap.set(au.id, { email: au.email, lastSignIn: au.last_sign_in_at ?? null })
    }
  }

  // 5. Send emails
  const updatePayload = { id: update.id, title: update.title, description: update.description, type: update.type }
  let sent = 0
  const errors: string[] = []

  for (const profile of profiles) {
    const auth = authMap.get(profile.id)
    if (!auth?.email) continue
    const inactive = isInactive(auth.lastSignIn)
    const unsubscribeUrl = inactive ? buildUnsubscribeUrl(profile.id) : undefined
    const recipientName = (profile.full_name as string | null)?.split(' ')[0] ?? 'Reclutador'

    const result = await sendSystemUpdateEmail(auth.email, {
      recipientName,
      updates: [updatePayload],
      unsubscribeUrl,
    })

    if (result.ok) {
      sent++
    } else {
      errors.push(`${auth.email}: ${result.error}`)
    }
  }

  return NextResponse.json({ ok: true, sent, errors: errors.length > 0 ? errors : undefined })
}
