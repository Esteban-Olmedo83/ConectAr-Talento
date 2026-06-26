import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithRateLimit } from '@/app/api/_lib/api-guard'
import { logError } from '@/app/api/_lib/error-logger'

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

function buildJdPrompt(input: GenerateJdRequest): string {
  const salaryInfo = input.salaryRange ? `\nRango salarial: ${input.salaryRange}` : ''
  const levelInfo = input.level ? `\nNivel de seniority: ${input.level}` : ''
  const locationInfo = input.location ? `\nUbicación: ${input.location}` : ''

  return `Eres un experto en Recursos Humanos y employer branding para empresas latinoamericanas. Genera contenido profesional para una oferta de trabajo.\n\nDATOS DE LA VACANTE:\n- Puesto: ${input.title}\n- Departamento: ${input.department}\n- Modalidad: ${input.modality}${salaryInfo}${levelInfo}${locationInfo}\n- Requisitos principales: ${input.requirements.join(', ')}\n\nGenera los siguientes 3 contenidos. Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin texto adicional.\n\nINSTRUCCIONES POR SECCIÓN:\n\n1. JOB DESCRIPTION (jobDescription):\nDescripción completa y profesional en español con estas secciones exactas:\n- "Sobre el puesto": 2-3 párrafos describiendo el rol, su impacto y contexto de la empresa.\n- "Responsabilidades": Lista de 6-8 responsabilidades concretas con verbos de acción.\n- "Requisitos": Lista de requisitos dividida en obligatorios (5-6) y deseables (3-4).\n- "Beneficios": Lista de 5-6 beneficios atractivos acordes al mercado latinoamericano.\n- "Modalidad y condiciones": Detalle de horario, modalidad (${input.modality})${input.location ? `, ubicación (${input.location})` : ''}.\n\n2. POST DE LINKEDIN (linkedinPost):\n- Tono profesional pero cercano.\n- Usar emojis relevantes al inicio de cada sección y en puntos clave.\n- Incluir sección "¿Qué ofrecemos?" y "¿Qué buscamos?".\n- Llamada a la acción al final.\n- Terminar con exactamente 5 hashtags relevantes en español/inglés.\n- Máximo 1300 caracteres.\n\n3. MENSAJE DE WHATSAPP (whatsappMessage):\n- Tono casual y directo.\n- Máximo 300 caracteres.\n- Incluir: puesto, modalidad, 1-2 requisitos clave.\n- Sin emojis excesivos (máximo 3).\n- Terminar con instrucción simple de cómo postularse.\n\nFORMATO JSON REQUERIDO:\n{\n  "jobDescription": "texto completo con saltos de línea \\n",\n  "linkedinPost": "texto del post con saltos de línea \\n",\n  "whatsappMessage": "texto breve para WhatsApp"\n}`
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuthWithRateLimit('generate-jd')
  if (auth instanceof NextResponse) return auth

  try {
    const body = (await request.json()) as GenerateJdRequest

    if (!body.title || !body.department || !body.modality) {
      return NextResponse.json({ error: 'Faltan campos requeridos: title, department, modality.' }, { status: 400 })
    }
    if (!body.requirements || body.requirements.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos un requisito.' }, { status: 400 })
    }

    const apiKey = request.headers.get('x-ai-api-key') || process.env.GROQ_API_KEY
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
        messages: [{ role: 'user', content: buildJdPrompt(body) }],
        temperature: 0.7,
        max_tokens: 2048,
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

    let parsed: GenerateJdResponse
    try {
      parsed = JSON.parse(jsonText) as GenerateJdResponse
    } catch {
      console.error('JSON parse error. Raw text:', rawText)
      return NextResponse.json({ error: 'No se pudo parsear la respuesta de IA. Intente nuevamente.' }, { status: 502 })
    }

    return NextResponse.json({
      jobDescription: String(parsed.jobDescription ?? '').trim(),
      linkedinPost: String(parsed.linkedinPost ?? '').trim(),
      whatsappMessage: String(parsed.whatsappMessage ?? '').trim(),
    })
  } catch (error) {
    await logError({ endpoint: 'generate-jd', error, tenantId: auth.tenantId, userId: auth.userId })
    return NextResponse.json({ error: 'Error interno del servidor al generar la descripción.' }, { status: 500 })
  }
}
