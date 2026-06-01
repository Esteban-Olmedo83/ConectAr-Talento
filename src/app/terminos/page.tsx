import { readFileSync } from 'fs'
import { join } from 'path'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Términos y Condiciones de Uso — ConectAr Talento',
  description: 'Términos y condiciones de uso de la plataforma ConectAr Talento.',
}

const S = {
  bg: '#0B0B14',
  surface: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  textSec: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.35)',
  accent: '#5D50D6',
  accentSoft: '#8B7EFF',
}

function renderMarkdown(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} style={{ fontSize: 15, fontWeight: 700, color: S.text, marginTop: 28, marginBottom: 8 }}>
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} style={{ fontSize: 17, fontWeight: 700, color: S.text, marginTop: 36, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${S.border}` }}>
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} style={{ fontSize: 22, fontWeight: 800, color: S.text, marginTop: 40, marginBottom: 12 }}>
          {line.slice(2)}
        </h1>
      )
    } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      elements.push(
        <p key={key++} style={{ fontSize: 14, fontWeight: 700, color: S.text, marginTop: 16, marginBottom: 4 }}>
          {line.slice(2, -2)}
        </p>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={key++} style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7, marginLeft: 20, marginBottom: 4 }}>
          {line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}
        </li>
      )
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={key++} style={{ borderLeft: `3px solid ${S.accent}`, paddingLeft: 16, margin: '12px 0', fontSize: 13, color: S.textSec, lineHeight: 1.7, fontStyle: 'italic' }}>
          {line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}
        </blockquote>
      )
    } else if (line.startsWith('---')) {
      elements.push(<hr key={key++} style={{ border: 'none', borderTop: `1px solid ${S.border}`, margin: '24px 0' }} />)
    } else if (line.trim() === '') {
      elements.push(<div key={key++} style={{ height: 8 }} />)
    } else {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>')
      elements.push(
        <p key={key++} style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7, marginBottom: 4 }}
          dangerouslySetInnerHTML={{ __html: formatted }} />
      )
    }
    i++
  }
  return elements
}

export default function TerminosPage() {
  const content = readFileSync(join(process.cwd(), 'docs/legal/sections/terminos.md'), 'utf-8')

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: S.textMuted, textDecoration: 'none', marginBottom: 40 }}
        >
          <ArrowLeft size={14} />
          Volver al inicio
        </Link>

        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: S.text, marginBottom: 8 }}>
            Términos y Condiciones de Uso
          </h1>
          <p style={{ fontSize: 13, color: S.textMuted }}>
            Versión: 1.0 — Vigente desde el 1 de junio de 2026
          </p>
          <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 6, fontStyle: 'italic' }}>
            ⚠ Borrador v1.0 — Pendiente de revisión por abogado matriculado antes de su publicación definitiva.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {renderMarkdown(content)}
        </div>

        <div style={{ marginTop: 56, paddingTop: 28, borderTop: `1px solid ${S.border}`, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Link href="/privacidad" style={{ fontSize: 12, color: S.textMuted, textDecoration: 'none' }}>
            Política de Privacidad
          </Link>
          <Link href="/cookies" style={{ fontSize: 12, color: S.textMuted, textDecoration: 'none' }}>
            Política de Cookies
          </Link>
        </div>
      </div>
    </div>
  )
}
