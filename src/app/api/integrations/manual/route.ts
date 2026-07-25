import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/crypto/token-encrypt'
import type { IntegrationPlatform } from '@/types'

const VALID_PLATFORMS: IntegrationPlatform[] = [
  'linkedin', 'gmail', 'outlook', 'smtp', 'whatsapp', 'zoom', 'google_meet', 'teams', 'computrabajo',
]

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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

    if (!platform || !VALID_PLATFORMS.includes(platform as IntegrationPlatform)) {
      return NextResponse.json({ error: 'Plataforma inválida' }, { status: 400 })
    }

    if (account_name && account_name.length > 200) {
      return NextResponse.json({ error: 'Nombre de cuenta demasiado largo' }, { status: 400 })
    }

    const { data: tenantProfile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    const tenantId = tenantProfile?.tenant_id ?? user.id

    const { data, error } = await supabase
      .from('integrations')
      .upsert(
        {
          tenant_id: tenantId,
          platform: platform as IntegrationPlatform,
          account_name: account_name ?? platform,
          account_email: account_email ?? null,
          status: 'connected',
          metadata: api_key ? { api_key: encryptToken(api_key) } : null,
        },
        { onConflict: 'tenant_id,platform' }
      )
      .select()
      .single()

    if (error) {
      console.error('[integrations/manual] upsert error:', error)
      return NextResponse.json({ error: 'Error al guardar la integración' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[integrations/manual] POST error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json() as { platform?: string }
    const { platform } = body

    if (!platform || !VALID_PLATFORMS.includes(platform as IntegrationPlatform)) {
      return NextResponse.json({ error: 'Plataforma inválida' }, { status: 400 })
    }

    const { data: tenantProfile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    const tenantId = tenantProfile?.tenant_id ?? user.id

    const { error } = await supabase
      .from('integrations')
      .update({ status: 'inactive' })
      .eq('tenant_id', tenantId)
      .eq('platform', platform)

    if (error) {
      console.error('[integrations/manual] delete error:', error)
      return NextResponse.json({ error: 'Error al eliminar la integración' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[integrations/manual] DELETE error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
