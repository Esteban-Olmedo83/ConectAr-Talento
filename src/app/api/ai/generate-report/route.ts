import { NextRequest, NextResponse } from 'next/server'
import type { Recommendation } from '@/types'

interface GenerateReportRequest {
  overallRating: 1 | 2 | 3 | 4 | 5
  technicalSkills: number
  communication: number
  culturalFit: number
  strengths: string
  weaknesses: string
  recommendation: Recommendation
  notes?: string
}

interface GenerateReportResponse {
  report: string
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

const ratingLabels: Record<number, string> = {
  1: 'Muy deficiente (1/5)',
  2: 'Deficiente (2/5)',
  3: 'Aceptable (3/5)',
  4: 'Bueno (4/5)',
  5: 'Excelente (5/5)',
}

const recommendationLabels: Record<Recommendation, string> = {
  Avanzar: 'AVANZAR en el proceso',
  Considerar: 'CONSIDERAR con reservas',
  Rechazar: 'NO AVANZAR / Rechazar',
}

function buildReportPrompt(scorecard: GenerateReportRequest): string {
  return `Eres un especialista en Recursos Humanos con amplia experiencia en evaluación de candidatos para el mercado latinoamericano.

Genera un informe profesional de entrevista en español basado en la siguiente scorecard de evaluación.

DATOS DE LA EVALUACIÓN:
- Calificación general: ${ratingLabels[scorecard.overallRating]}
- Habilidades técnicas: ${scorecard.technicalSkills}/10
- Comunicación: ${scorecard.communication}/10
- Fit cultural: ${scorecard.culturalFit}/10
- Fortalezas identificadas: ${scorecard.strengths}
- Debilidades / áreas de mejora: ${scorecard.weaknesses}
- Recomendación del entrevistador: ${recommendationLabels[scorecard.recommendation]}
${scorecard.notes ? `- Notas adicionales: ${scorecard.notes}` : ''}

INSTRUCCIONES PARA EL INFORME:
1. Escribe exactamente 300 palabras en español formal latinoamericano.
2. Estructura el informe con los siguientes párrafos (sin subtítulos, fluido y narrativo):
   - Párrafo 1 (Introducción): Presentación del candidato y contexto de la entrevista. Calificación general.
   - Párrafo 2 (Evaluación técnica y profesional): Análisis de habilidades técnicas con ejemplos concretos basados en las notas.
   - Párrafo 3 (Competencias blandas y fit cultural): Comunicación, trabajo en equipo, alineación con la cultura organizacional.
   - Párrafo 4 (Fortalezas y áreas de desarrollo): Síntesis de puntos fuertes y oportunidades de mejora.
   - Párrafo 5 (Conclusión y recomendación): Recomendación final clara y fundamentada.
3. Usa lenguaje profesional y objetivo. Evita juicios personales subjetivos.
4. La recomendación final debe ser: "${recommendationLabels[scorecard.recommendation]}".
5. Responde ÚNICAMENTE con el texto del informe, sin JSON, sin markdown, sin títulos adicionales.`
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as GenerateReportRequest

    if (
      typeof body.overallRating !== 'number' ||
      body.overallRating < 1 ||
      body.overallRating > 5
    ) {
      return NextResponse.json(
        { error: 'overallRating debe ser un número entre 1 y 5.' },
        { status: 400 }
      )
    }

    if (!body.recommendation) {
      return NextResponse.json({ error: 'El campo recommendation es requerido.' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key de Gemini no configurada.' },
        { status: 500 }
      )
    }

    const prompt = buildReportPrompt(body)

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
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

    const reportText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!reportText) {
      return NextResponse.json({ error: 'Respuesta vacía de Gemini.' }, { status: 502 })
    }

    const result: GenerateReportResponse = {
      report: reportText.trim(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('generate-report route error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al generar el informe.' },
      { status: 500 }
    )
  }
}
