import { NextRequest, NextResponse } from 'next/server'

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

interface GeminiCandidate {
  content: {
    parts: Array<{ text: string }>
  }
}

interface GeminiResponse {
  candidates?: GeminiCandidate[]
  error?: { message: string }
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
       : '- Basa el score en la calidad general del CV: experiencia, habilidades, educación, claridad.\n   - 85-100: CV excepcional con amplia experiencia y habilidades relevantes\n   - 70-84: CV sólido con buena experiencia\n   - 50-69: CV con experiencia moderada\n   - 30-49: CV con poca experiencia o información limitada\n   - 0-29: CV muy básico o con información insuficiente'
   }
6. Identifica 2-3 fortalezas principales del candidato.
7. Identifica 1-3 brechas o áreas de mejora (vacíos en el perfil).
8. Escribe un resumen profesional en español de 2-3 oraciones.

FORMATO JSON REQUERIDO (no incluir comentarios, solo JSON puro):
{
  "fullName": "string - nombre completo extraído del CV",
  "email": "string - email del candidato o cadena vacía si no está",
  "phone": "string o null - teléfono del candidato",
  "atsScore": número entre 0 y 100,
  "skills": ["array de strings con todas las habilidades identificadas"],
  "experienceYears": número de años de experiencia o null,
  "education": "string con el nivel y carrera educativa más alto o null",
  "strengths": ["array de 2-3 strings con fortalezas principales"],
  "gaps": ["array de 1-3 strings con brechas identificadas"],
  "summary": "string con resumen profesional en español"
}`
}

function extractJsonFromText(text: string): string {
  // Try to find JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) return jsonMatch[0]
  return text
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as AnalyzeCvRequest
    const { cvText, vacancyRequirements } = body

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: 'El texto del CV es demasiado corto o está vacío.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key de Gemini no configurada.' },
        { status: 500 }
      )
    }

    const prompt = buildPrompt(cvText, vacancyRequirements)

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text()
      console.error('Gemini API error:', errorText)
      return NextResponse.json(
        { error: `Error al llamar a Gemini: ${geminiRes.statusText}` },
        { status: 502 }
      )
    }

    const geminiData = (await geminiRes.json()) as GeminiResponse

    if (geminiData.error) {
      return NextResponse.json(
        { error: `Gemini error: ${geminiData.error.message}` },
        { status: 502 }
      )
    }

    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) {
      return NextResponse.json(
        { error: 'Respuesta vacía de Gemini.' },
        { status: 502 }
      )
    }

    const jsonText = extractJsonFromText(rawText)
    let parsed: AnalyzeCvResponse

    try {
      parsed = JSON.parse(jsonText) as AnalyzeCvResponse
    } catch {
      console.error('JSON parse error. Raw text:', rawText)
      return NextResponse.json(
        { error: 'No se pudo parsear la respuesta de IA. Intente nuevamente.' },
        { status: 502 }
      )
    }

    // Sanitize and validate the response
    const result: AnalyzeCvResponse = {
      fullName: String(parsed.fullName ?? '').trim() || 'Nombre no identificado',
      email: String(parsed.email ?? '').trim(),
      phone: parsed.phone ? String(parsed.phone).trim() : undefined,
      atsScore: Math.min(100, Math.max(0, Number(parsed.atsScore) || 0)),
      skills: Array.isArray(parsed.skills)
        ? parsed.skills.map((s) => String(s)).filter(Boolean)
        : [],
      experienceYears:
        typeof parsed.experienceYears === 'number' ? parsed.experienceYears : undefined,
      education: parsed.education ? String(parsed.education).trim() : undefined,
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.map((s) => String(s)).filter(Boolean)
        : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.map((s) => String(s)).filter(Boolean) : [],
      summary: String(parsed.summary ?? '').trim(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('analyze-cv route error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al analizar el CV.' },
      { status: 500 }
    )
  }
}
