import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export async function refreshGoogleToken(
  supabase: SupabaseClient,
  tenantId: string,
  refreshToken: string,
): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) return null

  const tokens = await res.json() as { access_token: string; expires_in?: number }

  const tokenExpiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : undefined

  await supabase.from('integrations').update({
    access_token: tokens.access_token,
    token_expires_at: tokenExpiresAt ?? null,
  }).eq('tenant_id', tenantId).eq('platform', 'gmail')

  return tokens.access_token
}

export async function getGoogleAccessToken(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<{ token: string } | { error: string }> {
  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token, refresh_token, token_expires_at')
    .eq('tenant_id', tenantId)
    .eq('platform', 'gmail')
    .eq('status', 'connected')
    .single()

  if (!integration?.access_token) {
    return { error: 'Google no está conectado. Conectalo en Integraciones.' }
  }

  let token = integration.access_token as string

  if (integration.token_expires_at) {
    const expiresAt = new Date(integration.token_expires_at as string).getTime()
    if (Date.now() >= expiresAt - 60_000 && integration.refresh_token) {
      const newToken = await refreshGoogleToken(supabase, tenantId, integration.refresh_token as string)
      if (!newToken) {
        return { error: 'Sesión de Google expirada. Reconectalo en Integraciones.' }
      }
      token = newToken
    }
  }

  return { token }
}
