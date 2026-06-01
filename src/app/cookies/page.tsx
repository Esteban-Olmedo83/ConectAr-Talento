// TEXTO PENDIENTE DE REVISIÓN LEGAL — contenido placeholder estructurado

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Política de Cookies — ConectAr Talento',
  description: 'Política de uso de cookies de ConectAr Talento.',
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

export default function CookiesPage() {
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

        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: S.text, marginBottom: 8 }}>
            Política de Cookies
          </h1>
          <p style={{ fontSize: 13, color: S.textMuted }}>
            Versión: v1.0 — Vigente desde el 1 de junio de 2026
          </p>
          <p style={{ fontSize: 12, color: S.accent, marginTop: 6, fontStyle: 'italic' }}>
            ⚠ TEXTO PENDIENTE DE REVISIÓN LEGAL — Solo para uso interno de desarrollo
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              1. ¿Qué son las cookies?
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo
              cuando los visitás. Se usan para recordar tus preferencias, mantener tu sesión activa y
              recopilar información estadística sobre el uso del sitio.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              2. Tipos de Cookies que Usamos
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${S.border}`, borderRadius: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 6 }}>
                  🔒 Cookies Esenciales
                </h3>
                <p style={{ fontSize: 13, color: S.textSec, lineHeight: 1.6 }}>
                  Necesarias para el funcionamiento básico del servicio: autenticación de sesión,
                  seguridad CSRF y preferencias de navegación. No se pueden desactivar ya que son
                  indispensables para usar la plataforma.
                </p>
                <p style={{ fontSize: 12, color: S.textMuted, marginTop: 8 }}>
                  Base legal: interés legítimo / ejecución del contrato. Duración: sesión / 30 días.
                </p>
              </div>

              <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${S.border}`, borderRadius: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 6 }}>
                  📊 Cookies Analíticas
                </h3>
                <p style={{ fontSize: 13, color: S.textSec, lineHeight: 1.6 }}>
                  Nos permiten entender cómo los usuarios interactúan con la plataforma para mejorar
                  la experiencia. Usamos Google Analytics 4 para recopilar métricas de uso de forma
                  anonimizada (sin identificar al usuario individualmente).
                </p>
                <p style={{ fontSize: 12, color: S.textMuted, marginTop: 8 }}>
                  Base legal: consentimiento. Duración: hasta 2 años. Proveedor: Google LLC (EE.UU.).
                </p>
              </div>

              <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${S.border}`, borderRadius: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 6 }}>
                  💬 Cookies de Terceros
                </h3>
                <p style={{ fontSize: 13, color: S.textSec, lineHeight: 1.6 }}>
                  Nuestro chat de soporte (Crisp) puede colocar cookies para identificar la conversación
                  y mejorar la atención al cliente. Estas cookies son controladas por Crisp.chat.
                </p>
                <p style={{ fontSize: 12, color: S.textMuted, marginTop: 8 }}>
                  Base legal: consentimiento. Proveedor: Crisp IM SARL (Francia).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              3. Gestión de Cookies
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              Podés gestionar tu consentimiento de cookies en cualquier momento a través del banner de
              cookies que aparece al ingresar por primera vez. También podés configurar tu navegador
              para rechazar o eliminar cookies. Ten en cuenta que deshabilitar cookies esenciales puede
              impedir el acceso a la plataforma.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              4. Más Información
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              Para más información sobre el tratamiento de tus datos, consultá nuestra{' '}
              <Link href="/privacidad" style={{ color: S.accentSoft }}>Política de Privacidad</Link>.
              Para contactarnos sobre cookies:{' '}
              <a href="mailto:conectar.rrhh.ar@gmail.com" style={{ color: S.accentSoft }}>
                conectar.rrhh.ar@gmail.com
              </a>.
            </p>
          </section>
        </div>

        <div style={{ marginTop: 56, paddingTop: 28, borderTop: `1px solid ${S.border}`, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Link href="/terminos" style={{ fontSize: 12, color: S.textMuted, textDecoration: 'none' }}>
            Términos y Condiciones
          </Link>
          <Link href="/privacidad" style={{ fontSize: 12, color: S.textMuted, textDecoration: 'none' }}>
            Política de Privacidad
          </Link>
        </div>
      </div>
    </div>
  )
}
