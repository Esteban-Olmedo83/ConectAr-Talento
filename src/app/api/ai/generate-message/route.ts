import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithRateLimit } from '@/app/api/_lib/api-guard'
import { logError } from '@/app/api/_lib/error-logger'

export const runtime = 'nodejs'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuthWithRateLimit('generate-message')
  if (auth instanceof NextResponse) return auth

  try {
    const { context, type } = (await request.json()) as { context?: string; type?: string }

    const apiKey = request.headers.get('x-ai-api-key') || process.env.GROQ_API_KEY
    if (!apiKey || !context) {
      return NextResponse.json({ message: '' }, { status: 400 })
    }

    const prompt =
      type === 'mensaje_adicional'
        ? `Eres un reclutador profesional latinoamericano. Generá un mensaje adicional breve (2-3 oraciones) y empático para cerrar un mensaje de WhatsApp de reclutamiento. El mensaje debe ser cálido y profesional. No repitas información del contexto, solo agregá una frase de cierre motivadora o de próximos pasos según corresponda.\n\nContexto: ${context}\n\nRespondé ÚNICAMENTE con el texto del mensaje adicional, sin comillas, sin explicaciones.`
        : `Generá un mensaje breve y profesional en español rioplatense. Contexto: ${context}. Respondé solo con el texto del mensaje.`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      }),
    })

    if (!groqRes.ok) {
      return NextResponse.json({ message: '' }, { status: 502 })
    }

    const data = await groqRes.json()
    const message: string = data.choices?.[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ message })
  } catch (error) {
    await logError({ endpoint: 'generate-message', error, tenantId: auth.tenantId, userId: auth.userId })
    return NextResponse.json({ message: '' }, { status: 500 })
  }
}
