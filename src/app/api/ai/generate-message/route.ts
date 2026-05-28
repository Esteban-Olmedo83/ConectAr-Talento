import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('groq_api_key')
      .eq('id', user.id)
      .single()

    const { context, type } = (await request.json()) as { context?: string; type?: string }

    const apiKey = (profile?.groq_api_key as string | null) || process.env.GROQ_API_KEY
    if (!apiKey || !context) {
      return NextResponse.json({ message: '' }, { status: 400 })
    }

    const prompt =
      type === 'mensaje_adicional'
        ? `Eres un reclutador profesional latinoamericano. Generá un mensaje adicional breve (2-3 oraciones) y empático para cerrar un mensaje de WhatsApp de reclutamiento. El mensaje debe ser cálido y profesional. No repitas información del contexto, solo agregá una frase de cierre motivadora o de próximos pasos según corresponda.

Contexto: ${context}

Respondé ÚNICAMENTE con el texto del mensaje adicional, sin comillas, sin explicaciones.`
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
  } catch {
    return NextResponse.json({ message: '' }, { status: 500 })
  }
}
