import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
    const tenantId: string = (profile?.tenant_id as string) ?? user.id

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) ?? 'image'
    const entityId = (formData.get('id') as string) ?? 'unknown'

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'La imagen no puede superar 5 MB.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Solo se permiten imágenes JPG, PNG o WebP.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${tenantId}/${type}s/${entityId}/${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('cvs')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadErr) {
      console.error('[upload-image]', uploadErr)
      return NextResponse.json({ error: 'Error al subir la imagen: ' + uploadErr.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(path)

    return NextResponse.json({ ok: true, url: publicUrl })
  } catch (error) {
    console.error('[upload-image] unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
