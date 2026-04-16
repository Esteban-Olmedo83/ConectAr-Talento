import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Format date with es-AR locale
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'time' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  if (format === 'short') {
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (format === 'long') {
    return d.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (format === 'time') {
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return d.toLocaleDateString('es-AR')
}

// Relative date in Spanish: "hace 2 horas", "ayer", "hace 3 días"
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) return 'hace un momento'
  if (diffMinutes === 1) return 'hace 1 minuto'
  if (diffMinutes < 60) return `hace ${diffMinutes} minutos`
  if (diffHours === 1) return 'hace 1 hora'
  if (diffHours < 24) return `hace ${diffHours} horas`
  if (diffDays === 1) return 'ayer'
  if (diffDays < 7) return `hace ${diffDays} días`
  if (diffWeeks === 1) return 'hace 1 semana'
  if (diffWeeks < 4) return `hace ${diffWeeks} semanas`
  if (diffMonths === 1) return 'hace 1 mes'
  if (diffMonths < 12) return `hace ${diffMonths} meses`
  if (diffYears === 1) return 'hace 1 año'
  return `hace ${diffYears} años`
}

// Truncate string with ellipsis
export function truncate(str: string, maxLength: number): string {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

// Get initials from full name (up to 2 chars)
export function getInitials(name: string): string {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Generate unique ID: timestamp + random
export function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 7)
  return `${timestamp}-${random}`
}

// Map ATS score (0–100) to Tailwind bg color class
export function scoreToColor(score: number): string {
  if (score >= 85) return 'bg-emerald-500'
  if (score >= 70) return 'bg-green-500'
  if (score >= 50) return 'bg-yellow-500'
  if (score >= 30) return 'bg-orange-500'
  return 'bg-red-500'
}

// Map ATS score to Spanish label
export function scoreToLabel(score: number): string {
  if (score >= 85) return 'Excelente'
  if (score >= 70) return 'Bueno'
  if (score >= 50) return 'Regular'
  return 'Bajo'
}

// Map ATS score to hex color for charts/inline styles
export function scoreToHex(score: number): string {
  if (score >= 85) return '#10b981'
  if (score >= 70) return '#22c55e'
  if (score >= 50) return '#eab308'
  if (score >= 30) return '#f97316'
  return '#ef4444'
}
