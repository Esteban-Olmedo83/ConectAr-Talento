import { NextRequest, NextResponse } from 'next/server'

interface GenerateJdRequest {
  title: string
  department: string
  modality: string
  requirements: string[]
  salaryRange?: string
  level?: string
  location?: string
}

interface GenerateJdResponse {
  jobDescription: string
  linkedinPost: string
  whatsappMessage: string
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

function buildJdPrompt(input: GenerateJdRequest): string {
  const salaryInfo = input.salaryRange ? `\nRango salarial: ${input.salaryRange}` : ''
  const levelInfo = input.level ? `\nNivel de seniority: ${input.level}` : ''
  const locationInfo = input.location ? `\nUbicación: ${input.location}` : ''

  return `Eres un experto en Recursos Humanos y employer branding para empresas latinoamericanas. Genera contenido profesional para una oferta de trabajo.

DATOS DE LA VACANTE:
- Puesto: ${input.title}
- Departamento: ${input.department}
- Modalidad: ${input.modality}${salaryInfo}${levelInfo}${locationInfo}
- Requisitos principales: ${input.requirements.join(', ')}

Genera los siguientes 3 contenidos. Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin texto adicional.

INSTRUCCIONES POR SECCIÓN:

1. JOB DESCRIPTION (jobDescription):
Descripción completa y profesional en español con estas secciones exactas:
- "Sobre el puesto": 2-3 párrafos describiendo el rol, su impacto y contexto de la empresa (inventar una empresa latinoamericana ficticia pero creíble).
- "Responsabilidades": Lista de 6-8 responsabilidades concretas con verbos de acción.
- "Requisitos": Lista de requisitos dividida en obligatorios (5-6) y deseables (3-4).
- "Beneficios": Lista de 5-6 beneficios atractivos acordes al mercado latinoamericano.
- "Modalidad y condiciones": Detalle de horario, modalidad (${input.modality}), ubicación${input.location ? ` (${input.location})` : ''}.

2. POST DE LINKEDIN (linkedinPost):
- Tono profesional pero cercano.
- Usar emojis relevantes al inicio de cada sección y en puntos clave.
- Incluir sección "¿Qué ofrecemos?" y "¿Qué buscamos?".
- Llamada a la acción al final.
- Terminar con exactamente 5 hashtags relevantes en español/inglés (ej: #Empleo #Tecnología #RemoteWork).
- Máximo 1300 caracteres para optimizar alcance en LinkedIn.

3. MENSAJE DE WHATSAPP (whatsappMessage):
- Tono casual y directo.
- Máximo 300 caracteres.
- Incluir: puesto, modalidad, 1-2 requisitos clave.
- Sin emojis excesivos (máximo 3).
- Terminar con instrucción simple de cómo postularse.

FORMATO JSON REQUERIDO:
{
  "jobDescription": "texto completo de la descripción de trabajo con saltos de línea \\n",
  "linkedinPost": "texto del post de LinkedIn con saltos de línea \\n",
  "whatsappMessage": "texto breve para WhatsApp"
}`
}

function extractJsonFromText(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) return jsonMatch[0]
  return text
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as GenerateJdRequest

    if (!body.title || !body.department || !body.modality) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: title, department, modality.' },
        { status: 400 }
      )
    }

    if (!body.requirements || body.requirements.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un requisito.' },
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

    const prompt = buildJdPrompt(body)

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
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
      return NextResponse.json({ error: 'Respuesta vacía de Gemini.' }, { status: 502 })
    }

    const jsonText = extractJsonFromText(rawText)
    let parsed: GenerateJdResponse

    try {
      parsed = JSON.parse(jsonText) as GenerateJdResponse
    } catch {
      console.error('JSON parse error. Raw text:', rawText)
      return NextResponse.json(
        { error: 'No se pudo parsear la respuesta de IA. Intente nuevamente.' },
        { status: 502 }
      )
    }

    const result: GenerateJdResponse = {
      jobDescription: String(parsed.jobDescription ?? '').trim(),
      linkedinPost: String(parsed.linkedinPost ?? '').trim(),
      whatsappMessage: String(parsed.whatsappMessage ?? '').trim(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('generate-jd route error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al generar la descripción.' },
      { status: 500 }
    )
  }
}
