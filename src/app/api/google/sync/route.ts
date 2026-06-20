import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { encryptToken, decryptToken } from '@/lib/crypto/token-encrypt'

export const runtime = 'nodejs'

async function refreshGoogleToken(
  refreshToken: string,
  supabase: SupabaseClient,
  tenantId: string
): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  })
  if (!res.ok) return null
  const data = await res.json() as { access_token?: string; expires_in?: number }
  if (!data.access_token) return null

  const tokenExpiresAt = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000).toISOString()
    : null

  await supabase
    .from('integrations')
    .update({ access_token: encryptToken(data.access_token), token_expires_at: tokenExpiresAt, status: 'connected' })
    .eq('tenant_id', tenantId)
    .eq('platform', 'gmail')

  return data.access_token
}

async function clearAndWrite(accessToken: string, spreadsheetId: string, sheetName: string, rows: string[][]) {
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:ZZ:clear`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: '{}',
    }
  )
  if (rows.length === 0) return

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: rows }),
    }
  )
  return res
}

async function ensureSheet(accessToken: string, spreadsheetId: string, title: string) {
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{ addSheet: { properties: { title } } }],
    }),
  })
}

export async function POST(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, google_sheets_db_id')
    .eq('id', user.id)
    .single()

  const tenantId = profile?.tenant_id ?? user.id
  const sheetsId = profile?.google_sheets_db_id as string | null

  if (!sheetsId) {
    return NextResponse.json(
      { error: 'Google Drive no está configurado. Conectá Google en Integraciones.' },
      { status: 400 }
    )
  }

  // Fetch integration (not filtered by status so we can attempt a token refresh)
  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token, refresh_token, token_expires_at')
    .eq('tenant_id', tenantId)
    .eq('platform', 'gmail')
    .maybeSingle()

  if (!integration) {
    return NextResponse.json({ error: 'Google no está conectado. Conectá tu cuenta en Integraciones.' }, { status: 400 })
  }

  const rawAccessToken = integration.access_token as string | null
  const rawRefreshToken = integration.refresh_token as string | null
  let accessToken = rawAccessToken ? decryptToken(rawAccessToken) : null
  const refreshToken = rawRefreshToken ? decryptToken(rawRefreshToken) : null
  const expiresAt = integration.token_expires_at as string | null

  // Refresh if missing or expired (with 5-minute buffer)
  const isExpired = !accessToken || (!!expiresAt && new Date(expiresAt).getTime() < Date.now() + 5 * 60 * 1000)

  if (isExpired) {
    if (!refreshToken) {
      await supabase
        .from('integrations')
        .update({ status: 'expired' })
        .eq('tenant_id', tenantId)
        .eq('platform', 'gmail')
      return NextResponse.json(
        { error: 'El token de Google expiró y no hay token de refresco. Reconectá tu cuenta en Integraciones.' },
        { status: 401 }
      )
    }
    const newToken = await refreshGoogleToken(refreshToken, supabase, tenantId)
    if (!newToken) {
      await supabase
        .from('integrations')
        .update({ status: 'expired' })
        .eq('tenant_id', tenantId)
        .eq('platform', 'gmail')
      return NextResponse.json(
        { error: 'No se pudo renovar el token de Google. Reconectá tu cuenta en Integraciones.' },
        { status: 401 }
      )
    }
    accessToken = newToken
  }

  const token = accessToken!

  // Fetch tenant data (applications filtered via candidate_id to respect tenant isolation)
  const [{ data: candidates }, { data: vacancies }] = await Promise.all([
    supabase.from('candidates').select('*').eq('tenant_id', tenantId),
    supabase.from('vacancies').select('*').eq('tenant_id', tenantId),
  ])

  const candidateIds = (candidates ?? []).map((c: Record<string, unknown>) => c.id as string)
  const { data: applications } = candidateIds.length > 0
    ? await supabase.from('applications').select('*').in('candidate_id', candidateIds)
    : { data: [] }

  // Ensure sheets exist
  await Promise.all([
    ensureSheet(token, sheetsId, 'Candidatos'),
    ensureSheet(token, sheetsId, 'Vacantes'),
    ensureSheet(token, sheetsId, 'Aplicaciones'),
  ])

  // Build rows
  const candidateRows: string[][] = [
    ['ID', 'Nombre', 'Email', 'Teléfono', 'Score ATS', 'Skills', 'Años Exp.', 'Educación', 'Fuente', 'Fecha'],
    ...(candidates ?? []).map((c: Record<string, unknown>) => [
      String(c.id ?? ''),
      String(c.full_name ?? ''),
      String(c.email ?? ''),
      String(c.phone ?? ''),
      String(c.ats_score ?? ''),
      Array.isArray(c.skills) ? (c.skills as string[]).join(', ') : String(c.skills ?? ''),
      String(c.experience_years ?? ''),
      String(c.education ?? ''),
      String(c.source ?? ''),
      String(c.created_at ?? '').slice(0, 10),
    ]),
  ]

  const vacancyRows: string[][] = [
    ['ID', 'Título', 'Departamento', 'Estado', 'Modalidad', 'Ubicación', 'Prioridad', 'Creada'],
    ...(vacancies ?? []).map((v: Record<string, unknown>) => [
      String(v.id ?? ''),
      String(v.title ?? ''),
      String(v.department ?? ''),
      String(v.status ?? ''),
      String(v.modality ?? ''),
      String(v.location ?? ''),
      String(v.priority ?? ''),
      String(v.created_at ?? '').slice(0, 10),
    ]),
  ]

  const applicationRows: string[][] = [
    ['ID', 'Candidato ID', 'Vacante ID', 'Estado', 'Postulación'],
    ...(applications ?? []).map((a: Record<string, unknown>) => [
      String(a.id ?? ''),
      String(a.candidate_id ?? ''),
      String(a.vacancy_id ?? ''),
      String(a.status ?? ''),
      String(a.applied_at ?? '').slice(0, 10),
    ]),
  ]

  // Check if Sheets API returns 401 (expired token slipped through)
  const writeResults = await Promise.all([
    clearAndWrite(token, sheetsId, 'Candidatos', candidateRows),
    clearAndWrite(token, sheetsId, 'Vacantes', vacancyRows),
    clearAndWrite(token, sheetsId, 'Aplicaciones', applicationRows),
  ])

  const anyUnauthorized = writeResults.some(r => r && r.status === 401)
  if (anyUnauthorized) {
    await supabase
      .from('integrations')
      .update({ status: 'expired' })
      .eq('tenant_id', tenantId)
      .eq('platform', 'gmail')
    return NextResponse.json(
      { error: 'El token de Google fue rechazado. Reconectá tu cuenta en Integraciones.' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    synced: {
      candidates: (candidates ?? []).length,
      vacancies: (vacancies ?? []).length,
      applications: (applications ?? []).length,
    },
  })
}
