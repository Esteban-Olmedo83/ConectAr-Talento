import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAccessToken } from '@/lib/google/refresh-token'

export const runtime = 'nodejs'

interface SendEmailRequest {
  to: string
  subject: string
  htmlBody: string
  replyTo?: string
}

function buildRawEmail(from: string, to: string, subject: string, html: string, replyTo?: string): string {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
    '',
    html,
  ]
  return Buffer.from(lines.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: tenantProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  const tenantId = tenantProfile?.tenant_id ?? user.id

  const tokenResult = await getGoogleAccessToken(supabase, tenantId)
  if ('error' in tokenResult) {
    return NextResponse.json({ error: tokenResult.error }, { status: 400 })
  }

  // Get the connected Gmail account email
  const { data: integration } = await supabase
    .from('integrations')
    .select('account_email')
    .eq('tenant_id', tenantId)
    .eq('platform', 'gmail')
    .single()

  const fromEmail = (integration?.account_email as string | null) ?? user.email!
  const body = await request.json() as SendEmailRequest

  if (!body.to || !body.subject || !body.htmlBody) {
    return NextResponse.json({ error: 'Faltan campos requeridos: to, subject, htmlBody.' }, { status: 400 })
  }

  const rawEmail = buildRawEmail(fromEmail, body.to, body.subject, body.htmlBody, body.replyTo)

  const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenResult.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawEmail }),
  })

  if (!gmailRes.ok) {
    const err = await gmailRes.json().catch(() => ({})) as { error?: { message?: string } }
    return NextResponse.json(
      { error: err.error?.message ?? 'Error al enviar el email vía Gmail.' },
      { status: 502 }
    )
  }

  const msg = await gmailRes.json() as { id: string }
  return NextResponse.json({ ok: true, messageId: msg.id, sentFrom: fromEmail })
}
