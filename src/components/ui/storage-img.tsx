'use client'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/client'

const SUPABASE_PUBLIC_PREFIX = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cvs/`
  : null

function toStoragePath(src: string): string {
  if (SUPABASE_PUBLIC_PREFIX && src.startsWith(SUPABASE_PUBLIC_PREFIX)) {
    return decodeURIComponent(src.slice(SUPABASE_PUBLIC_PREFIX.length))
  }
  return src
}

interface StorageImgProps {
  src?: string | null
  alt?: string
  className?: string
  style?: CSSProperties
}

export function StorageImg({ src, alt = '', className, style }: StorageImgProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!src) { setResolvedSrc(null); return }
    const path = toStoragePath(src)
    const supabase = createClient()
    supabase.storage.from('cvs').createSignedUrl(path, 3600).then(({ data }) => {
      setResolvedSrc(data?.signedUrl ?? null)
    })
  }, [src])

  if (!resolvedSrc) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={resolvedSrc} alt={alt} className={className} style={style} />
}
