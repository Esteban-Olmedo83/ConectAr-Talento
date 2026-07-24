import { NextResponse } from 'next/server'
import { requireAuthWithRateLimit } from '@/app/api/_lib/api-guard'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST() {
  const auth = await requireAuthWithRateLimit('test-key')
  if (auth instanceof NextResponse) return auth

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('groq_api_key')
    .eq('id', auth.userId)
    .single()

  const apiKey = profile?.groq_api_key as string | null
  if (!apiKey) {
    return NextResponse.json({ ok: false, message: 'No hay clave de API configurada.' }, { status: 400 })
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (res.ok) {
      return NextResponse.json({ ok: true, message: 'Conexión exitosa con Groq.' })
    }
    const body = await res.json().catch(() => ({}))
    const detail = (body as { error?: { message?: string } })?.error?.message ?? res.statusText
    return NextResponse.json({ ok: false, message: `Error de Groq: ${detail}` }, { status: 400 })
  } catch {
    return NextResponse.json({ ok: false, message: 'No se pudo conectar con la API de Groq.' }, { status: 502 })
  }
}
