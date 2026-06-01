// TEXTO PENDIENTE DE REVISIÓN LEGAL — contenido placeholder estructurado

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

export default function TerminosPage() {
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
            Términos y Condiciones de Uso
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
              1. Objeto
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma ConectAr Talento,
              un sistema de seguimiento de candidatos (ATS) disponible en línea para profesionales de
              recursos humanos y reclutadores con sede o actividad en la República Argentina y Latinoamérica.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              2. Partes
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              Son partes del presente acuerdo: (a) <strong style={{ color: S.text }}>ConectAr Talento</strong>,
              plataforma operada por [RAZÓN SOCIAL PENDIENTE], con domicilio en Ciudad Autónoma de Buenos Aires,
              Argentina; y (b) el <strong style={{ color: S.text }}>Usuario</strong>, persona física o jurídica
              que accede a la plataforma y acepta estos términos.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              3. Descripción del Servicio
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              ConectAr Talento ofrece herramientas para gestión de vacantes, candidatos, pipelines de
              selección, análisis de CVs con inteligencia artificial, generación de descripciones de puestos
              y reportes de reclutamiento. El servicio se presta bajo modalidad SaaS (Software como Servicio)
              y está sujeto a disponibilidad técnica.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              4. Precios y Facturación
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              El plan Free es gratuito sin límite de tiempo. Los planes Starter, Pro y Business se facturan
              mensualmente en dólares estadounidenses. Los precios pueden actualizarse con 30 días de aviso
              previo. No se realizan reembolsos por períodos ya facturados salvo incumplimiento de servicio
              por parte de ConectAr Talento.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              5. Rescisión
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              El Usuario puede rescindir en cualquier momento desde la configuración de su cuenta. La rescisión
              entrará en vigor al final del período facturado en curso. ConectAr Talento puede rescindir el
              acceso inmediatamente ante incumplimiento de estos términos o uso fraudulento del servicio.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              6. Limitación de Responsabilidad
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              ConectAr Talento no garantiza disponibilidad ininterrumpida del servicio. En ningún caso la
              responsabilidad total de ConectAr Talento ante el Usuario superará el importe abonado en los
              últimos 3 meses. No nos responsabilizamos por decisiones de contratación tomadas con base en
              los análisis de IA, cuya interpretación queda siempre bajo criterio del reclutador humano.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              7. Datos Personales
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              El tratamiento de datos personales se rige por nuestra{' '}
              <Link href="/privacidad" style={{ color: S.accentSoft }}>Política de Privacidad</Link> y la
              Ley N.° 25.326 de Protección de Datos Personales de la República Argentina. El Usuario es
              responsable de obtener los consentimientos necesarios de los candidatos cuyos datos carga
              en la plataforma.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              8. Jurisdicción y Ley Aplicable
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              Este acuerdo se rige por las leyes de la República Argentina. Para cualquier controversia,
              las partes se someten a la jurisdicción de los Tribunales Ordinarios de la Ciudad Autónoma
              de Buenos Aires (CABA), con renuncia a cualquier otro fuero que pudiera corresponder.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              9. Contacto
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              Para consultas sobre estos Términos, escribinos a{' '}
              <a href="mailto:conectar.rrhh.ar@gmail.com" style={{ color: S.accentSoft }}>
                conectar.rrhh.ar@gmail.com
              </a>.
            </p>
          </section>
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
