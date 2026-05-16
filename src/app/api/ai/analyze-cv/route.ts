import { NextRequest, NextResponse } from 'next/server'
import { CvExtractionError, extractCvText } from '@/lib/cv/extract-text'

export const runtime = 'nodejs'

interface AnalyzeCvRequest {
  cvText: string
  vacancyRequirements?: string[]
}

interface AnalyzeCvResponse {
  fullName: string
  email: string
  phone?: string
  atsScore: number
  skills: string[]
  experienceYears?: number
  education?: string
  strengths: string[]
  gaps: string[]
  summary: string
}

function buildPrompt(cvText: string, vacancyRequirements?: string[]): string {
  const requirementsSection =
    vacancyRequirements && vacancyRequirements.length > 0
      ? `\n\nREQUISITOS DE LA VACANTE (para calcular el ATS score):\n${vacancyRequirements.map((r) => `- ${r}`).join('\n')}`
      : ''

  return `Eres un sistema ATS (Applicant Tracking System) experto en análisis de CVs para el mercado latinoamericano.

Analiza el siguiente CV y extrae la información estructurada. Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin texto adicional.${requirementsSection}

CV A ANALIZAR:
---
${cvText}
---

INSTRUCCIONES:
1. Extrae el nombre completo, email y teléfono del candidato.
2. Identifica todas las habilidades técnicas y blandas mencionadas.
3. Calcula los años totales de experiencia laboral relevante.
4. Identifica el nivel de educación más alto alcanzado.
5. Calcula el ATS score (0-100):
   ${
     vacancyRequirements && vacancyRequirements.length > 0
       ? '- Basa el score en qué tan bien las habilidades del candidato coinciden con los requisitos de la vacante.\n   - 85-100: Excelente match (≥80% de requisitos cubiertos)\n   - 70-84: Buen match (60-79% cubiertos)\n   - 50-69: Match regular (40-59% cubiertos)\n   - 30-49: Match bajo (20-39% cubiertos)\n   - 0-29: Muy bajo match (<20% cubiertos)'
       : '- Basa el score en la calidad general del CV: experiencia, habilidades, educación, claridad.'
   }
6. Identifica 2-3 fortalezas principales del candidato.
7. Identifica 1-3 brechas o áreas de mejora.
8. Escribe un resumen profesional en español de 2-3 oraciones.

FORMATO JSON REQUERIDO:
{
  "fullName": "string",
  "email": "string",
  "phone": "string o null",
  "atsScore": número entre 0 y 100,
  "skills": ["array de strings"],
  "experienceYears": número o null,
  "education": "string o null",
  "strengths": ["array de 2-3 strings"],
  "gaps": ["array de 1-3 strings"],
  "summary": "string"
}`
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get('content-type') ?? ''
    let cvText = ''
    let vacancyRequirements: string[] | undefined

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file')
      const rawRequirements = formData.get('vacancyRequirements')

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'No se recibió ningún archivo de CV.' }, { status: 400 })
      }

      try {
        cvText = await extractCvText(file)
      } catch (error) {
        const message = error instanceof CvExtractionError
          ? error.message
          : 'No se pudo extraer texto del CV.'

        return NextResponse.json({ error: message }, { status: 400 })
      }

      if (typeof rawRequirements === 'string' && rawRequirements.trim()) {
        try {
          const parsed = JSON.parse(rawRequirements) as unknown
          vacancyRequirements = Array.isArray(parsed)
            ? parsed.map((item) => String(item)).filter(Boolean)
            : undefined
        } catch {
          vacancyRequirements = undefined
        }
      }
    } else {
      const body = (await request.json()) as AnalyzeCvRequest
      cvText = body.cvText
      vacancyRequirements = body.vacancyRequirements
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json({ error: 'El texto del CV es demasiado corto o está vacío.' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key de Groq no configurada.' }, { status: 500 })
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
        temperature: 0.2,
        max_tokens: 1024,
      }),
    })

    if (!groqRes.ok) {
      const errorText = await groqRes.text()
      console.error('Groq API error:', errorText)
      return NextResponse.json({ error: `Error al llamar a Groq: ${groqRes.statusText}` }, { status: 502 })
    }

    const groqData = await groqRes.json()
    const rawText: string = groqData.choices?.[0]?.message?.content ?? ''

    if (!rawText) {
      return NextResponse.json({ error: 'Respuesta vacía de Groq.' }, { status: 502 })
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    const jsonText = jsonMatch ? jsonMatch[0] : rawText

    let parsed: AnalyzeCvResponse
    try {
      parsed = JSON.parse(jsonText) as AnalyzeCvResponse
    } catch {
      console.error('JSON parse error. Raw text:', rawText)
      return NextResponse.json({ error: 'No se pudo parsear la respuesta de IA. Intente nuevamente.' }, { status: 502 })
    }

    return NextResponse.json({
      fullName: String(parsed.fullName ?? '').trim() || 'Nombre no identificado',
      email: String(parsed.email ?? '').trim(),
      phone: parsed.phone ? String(parsed.phone).trim() : undefined,
      atsScore: Math.min(100, Math.max(0, Number(parsed.atsScore) || 0)),
      skills: Array.isArray(parsed.skills) ? parsed.skills.map((s) => String(s)).filter(Boolean) : [],
      experienceYears: typeof parsed.experienceYears === 'number' ? parsed.experienceYears : undefined,
      education: parsed.education ? String(parsed.education).trim() : undefined,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map((s) => String(s)).filter(Boolean) : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.map((s) => String(s)).filter(Boolean) : [],
      summary: String(parsed.summary ?? '').trim(),
    })
  } catch (error) {
    console.error('analyze-cv route error:', error)
    return NextResponse.json({ error: 'Error interno del servidor al analizar el CV.' }, { status: 500 })
  }
}
