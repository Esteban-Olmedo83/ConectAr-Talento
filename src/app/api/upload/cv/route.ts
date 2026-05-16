import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractCvText, CvExtractionError } from '@/lib/cv/extract-text'

export const runtime = 'nodejs'

const PLAN_LIMITS: Record<string, number> = { free: 10, starter: 50, pro: Infinity, business: Infinity, enterprise: Infinity }

function buildPrompt(cvText: string, vacancyRequirements: string[]): string {
  const reqSection = vacancyRequirements.length > 0
    ? `\n\nREQUISITOS DE LA VACANTE (usá estos para calcular el ATS score):\n${vacancyRequirements.map(r => `- ${r}`).join('\n')}`
    : ''
  const scoreInstructions = vacancyRequirements.length > 0
    ? '- Calculá el score según coincidencia con los requisitos: 90-100 (≥85% match), 75-89 (70-84%), 60-74 (50-69%), 40-59 (30-49%), 0-39 (<30%)'
    : '- Evaluá calidad general: experiencia, skills, educación, presentación'

  return `Sos un sistema ATS experto en análisis de CVs para el mercado latinoamericano. Analizá el siguiente CV y extraé información estructurada.
Respondé ÚNICAMENTE con un objeto JSON válido, sin markdown, sin texto adicional.${reqSection}

CV:
---
${cvText.slice(0, 8000)}
---

INSTRUCCIONES:
1. Extraé nombre completo, email y teléfono (si están presentes).
2. Identificá TODAS las habilidades técnicas y blandas mencionadas o implícitas.
3. Calculá años totales de experiencia laboral relevante.
4. Identificá el nivel educativo más alto alcanzado (título + carrera).
5. ATS Score (0-100): ${scoreInstructions}
6. Identificá 2-3 fortalezas principales del candidato.
7. Identificá 1-3 brechas o áreas de mejora.
8. Escribí un resumen profesional de 2-3 oraciones en español.

IMPORTANTE: Si no encontrás un dato, usá null o cadena vacía. No inventes información.

JSON REQUERIDO (solo JSON, sin ningún texto alrededor):
{
  "fullName": "nombre completo o cadena vacía",
  "email": "email o cadena vacía",
  "phone": "teléfono con código de país o null",
  "atsScore": número entre 0 y 100,
  "skills": ["array de strings con skills"],
  "experienceYears": número de años o null,
  "education": "descripción del nivel educativo más alto o null",
  "strengths": ["2-3 strings con fortalezas"],
  "gaps": ["1-3 strings con brechas"],
  "summary": "resumen profesional en español"
}`
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Get plan and tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, tenant_id')
      .eq('id', user.id)
      .single()
    const plan: string = (profile?.plan as string) ?? 'free'
    const tenantId: string = (profile?.tenant_id as string) ?? user.id

    // Plan-based monthly limit
    const monthlyLimit = PLAN_LIMITS[plan] ?? 10
    if (isFinite(monthlyLimit)) {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const { count } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', startOfMonth.toISOString())
      if ((count ?? 0) >= monthlyLimit) {
        return NextResponse.json({
          error: `Límite del plan ${plan} alcanzado (${monthlyLimit} análisis/mes). Actualizá tu plan para análisis ilimitados.`,
        }, { status: 429 })
      }
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const vacancyRequirementsRaw = formData.get('vacancyRequirements') as string | null
    const vacancyRequirements: string[] = vacancyRequirementsRaw
      ? (JSON.parse(vacancyRequirementsRaw) as string[])
      : []

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 })
    }

    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'El archivo no puede superar 5 MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from file using the shared utility (pdf2json, mammoth, etc.)
    let cvText = ''

    try {
      cvText = await extractCvText(file)
    } catch (e) {
      console.error('[upload-cv] text extraction error:', e)
      const message = e instanceof CvExtractionError
        ? e.message
        : 'No se pudo leer el archivo. Asegurate de que sea un PDF de texto (no escaneado), DOCX, RTF o TXT.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json({
        error: 'El archivo está vacío o no contiene texto extraíble. Si es un PDF escaneado (imagen), convertilo a PDF de texto primero.',
      }, { status: 400 })
    }

    // Upload original file to Supabase Storage
    let cvUrl: string | undefined
    let cvFileName: string | undefined
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `${tenantId}/${Date.now()}-${safeName}`
      const { error: uploadErr } = await supabase.storage
        .from('cvs')
        .upload(storagePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(storagePath)
        cvUrl = publicUrl
        cvFileName = file.name
      } else {
        console.warn('[upload-cv] storage warning:', uploadErr.message)
      }
    } catch (e) {
      console.warn('[upload-cv] storage error (non-fatal):', e)
    }

    // Analyze with Groq
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key de Groq no configurada en el servidor.' }, { status: 500 })
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: buildPrompt(cvText, vacancyRequirements) }],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('[upload-cv] Groq error:', errText)
      return NextResponse.json({ error: 'Error al analizar el CV con IA. Intentá de nuevo.' }, { status: 502 })
    }

    const groqData = await groqRes.json()
    const rawText: string = groqData.choices?.[0]?.message?.content ?? ''

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : rawText

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: Record<string, any>
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      console.error('[upload-cv] JSON parse error. Raw:', rawText)
      return NextResponse.json({ error: 'La IA no devolvió un resultado válido. Intentá de nuevo.' }, { status: 502 })
    }

    return NextResponse.json({
      ok: true,
      cvUrl,
      cvFileName,
      analysis: {
        fullName: String(parsed.fullName ?? '').trim() || 'Nombre no identificado',
        email: String(parsed.email ?? '').trim(),
        phone: parsed.phone ? String(parsed.phone).trim() : undefined,
        atsScore: Math.min(100, Math.max(0, Number(parsed.atsScore) || 0)),
        skills: Array.isArray(parsed.skills)
          ? (parsed.skills as unknown[]).map(s => String(s)).filter(Boolean)
          : [],
        experienceYears: typeof parsed.experienceYears === 'number' ? parsed.experienceYears : undefined,
        education: parsed.education ? String(parsed.education).trim() : undefined,
        strengths: Array.isArray(parsed.strengths)
          ? (parsed.strengths as unknown[]).map(s => String(s)).filter(Boolean)
          : [],
        gaps: Array.isArray(parsed.gaps)
          ? (parsed.gaps as unknown[]).map(s => String(s)).filter(Boolean)
          : [],
        summary: String(parsed.summary ?? '').trim(),
      },
    })
  } catch (error) {
    console.error('[upload-cv] unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
