import Link from 'next/link'

function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 4 heads */}
      <circle cx="24" cy="5.5" r="4" fill="#74ACDF" />
      <circle cx="42.5" cy="24" r="4" fill="#4A90C8" />
      <circle cx="24" cy="42.5" r="4" fill="#74ACDF" />
      <circle cx="5.5" cy="24" r="4" fill="#4A90C8" />
      {/* Connecting arcs */}
      <path d="M27 7 Q41 9 41 21" stroke="#74ACDF" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M41 27 Q41 39 27 41" stroke="#4A90C8" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M21 41 Q7 39 7 27" stroke="#74ACDF" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M7 21 Q7 9 21 7" stroke="#4A90C8" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function BrandText({ onDark = false, size = 'md' }: { onDark?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }
  const base = onDark ? 'text-white' : 'text-gray-900'
  const ar = onDark ? 'text-sky-300' : 'text-sky-500'

  return (
    <span className={`font-bold tracking-tight ${sizes[size]}`}>
      <span className={base}>Conect</span>
      <span className={ar}>Ar</span>
      <span className={`${base} font-bold`}> Talento</span>
    </span>
  )
}

interface BrandLogoProps {
  onDark?: boolean
  size?: 'sm' | 'md' | 'lg'
  href?: string
  iconSize?: number
  iconOnly?: boolean
}

export function BrandLogo({ onDark = false, size = 'md', href, iconSize, iconOnly = false }: BrandLogoProps) {
  const iconDims = iconSize ?? (size === 'sm' ? 24 : size === 'lg' ? 40 : 32)
  const gap = size === 'sm' ? 'gap-1.5' : 'gap-2'

  const inner = (
    <span className={`flex items-center ${gap}`}>
      <LogoIcon size={iconDims} />
      {!iconOnly && <BrandText onDark={onDark} size={size} />}
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {inner}
      </Link>
    )
  }

  return <div className="inline-flex items-center">{inner}</div>
}
