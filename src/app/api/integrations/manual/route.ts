import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { IntegrationPlatform } from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json() as {
    platform?: string
    account_name?: string
    account_email?: string
    api_key?: string
  }

  const { platform, account_name, account_email, api_key } = body

  if (!platform) {
    return NextResponse.json({ error: 'Falta el campo platform' }, { status: 400 })
  }

  const tenantId = (user.user_metadata?.tenant_id as string) ?? user.id

  const { data, error } = await supabase
    .from('integrations')
    .upsert(
      {
        tenant_id: tenantId,
        platform: platform as IntegrationPlatform,
        account_name: account_name ?? platform,
        account_email: account_email ?? null,
        status: 'connected',
        // Store api_key in metadata since there's no dedicated column
        metadata: api_key ? { api_key } : null,
      },
      { onConflict: 'tenant_id,platform' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json() as { platform?: string }
  const { platform } = body

  if (!platform) {
    return NextResponse.json({ error: 'Falta el campo platform' }, { status: 400 })
  }

  const tenantId = (user.user_metadata?.tenant_id as string) ?? user.id

  const { error } = await supabase
    .from('integrations')
    .update({ status: 'inactive' })
    .eq('tenant_id', tenantId)
    .eq('platform', platform)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
