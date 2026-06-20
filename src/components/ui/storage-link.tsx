'use client'
import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
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

interface StorageLinkProps {
  href?: string | null
  children: ReactNode
  className?: string
  style?: CSSProperties
  target?: string
  rel?: string
}

export function StorageLink({
  href,
  children,
  className,
  style,
  target = '_blank',
  rel = 'noopener noreferrer',
}: StorageLinkProps) {
  const [resolvedHref, setResolvedHref] = useState<string | null>(null)

  useEffect(() => {
    if (!href) { setResolvedHref(null); return }
    const path = toStoragePath(href)
    const supabase = createClient()
    supabase.storage.from('cvs').createSignedUrl(path, 3600).then(({ data }) => {
      setResolvedHref(data?.signedUrl ?? null)
    })
  }, [href])

  if (!href) return <>{children}</>
  return (
    <a
      href={resolvedHref ?? '#'}
      className={className}
      style={style}
      target={target}
      rel={rel}
      onClick={!resolvedHref ? (e) => e.preventDefault() : undefined}
    >
      {children}
    </a>
  )
}
