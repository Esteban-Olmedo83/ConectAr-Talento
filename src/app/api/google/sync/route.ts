import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

async function sheetsRequest(accessToken: string, spreadsheetId: string, body: unknown) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )
  return res.ok
}

async function clearAndWrite(accessToken: string, spreadsheetId: string, sheetName: string, rows: string[][]) {
  // Clear existing data
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:ZZ:clear`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: '{}',
    }
  )
  if (rows.length === 0) return

  // Write new data
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: rows }),
    }
  )
}

async function ensureSheet(accessToken: string, spreadsheetId: string, title: string) {
  // Add sheet if it doesn't exist (ignore error if it already exists)
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
    return NextResponse.json({ error: 'Google Drive no está configurado. Conectá Google en Integraciones.' }, { status: 400 })
  }

  const { data: integration } = await supabase
    .from('integrations')
    .select('access_token')
    .eq('tenant_id', tenantId)
    .eq('platform', 'gmail')
    .eq('status', 'connected')
    .single()

  if (!integration?.access_token) {
    return NextResponse.json({ error: 'Google no está conectado.' }, { status: 400 })
  }

  const accessToken = integration.access_token as string

  // Fetch data
  const [{ data: candidates }, { data: vacancies }, { data: applications }] = await Promise.all([
    supabase.from('candidates').select('*').eq('tenant_id', tenantId),
    supabase.from('vacancies').select('*').eq('tenant_id', tenantId),
    supabase.from('applications').select('*'),
  ])

  // Ensure sheets exist
  await Promise.all([
    ensureSheet(accessToken, sheetsId, 'Candidatos'),
    ensureSheet(accessToken, sheetsId, 'Vacantes'),
    ensureSheet(accessToken, sheetsId, 'Aplicaciones'),
  ])

  // Write Candidatos
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

  // Write Vacantes
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

  // Write Aplicaciones
  const applicationRows: string[][] = [
    ['ID', 'Candidato ID', 'Vacante ID', 'Estado', 'Aplicación'],
    ...(applications ?? []).map((a: Record<string, unknown>) => [
      String(a.id ?? ''),
      String(a.candidate_id ?? ''),
      String(a.vacancy_id ?? ''),
      String(a.status ?? ''),
      String(a.applied_at ?? '').slice(0, 10),
    ]),
  ]

  await Promise.all([
    clearAndWrite(accessToken, sheetsId, 'Candidatos', candidateRows),
    clearAndWrite(accessToken, sheetsId, 'Vacantes', vacancyRows),
    clearAndWrite(accessToken, sheetsId, 'Aplicaciones', applicationRows),
  ])

  return NextResponse.json({
    ok: true,
    synced: {
      candidates: (candidates ?? []).length,
      vacancies: (vacancies ?? []).length,
      applications: (applications ?? []).length,
    },
  })
}
