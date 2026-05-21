import Link from 'next/link'
import Image from 'next/image'

function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="ConectAr Talento"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
      priority
    />
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
