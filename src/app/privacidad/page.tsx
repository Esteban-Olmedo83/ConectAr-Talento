// TEXTO PENDIENTE DE REVISIÓN LEGAL — contenido placeholder estructurado

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidad — ConectAr Talento',
  description: 'Política de privacidad y tratamiento de datos personales de ConectAr Talento.',
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

export default function PrivacidadPage() {
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
            Política de Privacidad
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
              1. Responsable del Tratamiento
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              <strong style={{ color: S.text }}>ConectAr Talento</strong> — operado por [RAZÓN SOCIAL PENDIENTE],
              con domicilio en Ciudad Autónoma de Buenos Aires, Argentina. Correo electrónico de contacto:{' '}
              <a href="mailto:conectar.rrhh.ar@gmail.com" style={{ color: S.accentSoft }}>
                conectar.rrhh.ar@gmail.com
              </a>.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              2. Qué Datos Recopilamos
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              Recopilamos: (a) <strong style={{ color: S.text }}>Datos de cuenta</strong>: nombre, email
              corporativo y nombre de empresa al registrarse; (b) <strong style={{ color: S.text }}>Datos de
              uso</strong>: acciones en la plataforma, dirección IP, tipo de navegador y dispositivo;
              (c) <strong style={{ color: S.text }}>Datos de candidatos</strong>: CVs, notas y cualquier
              información que el Usuario cargue en el sistema como parte de sus procesos de selección.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              3. Finalidad del Tratamiento
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              Los datos se tratan para: prestar el servicio ATS, mejorar la plataforma, enviar comunicaciones
              transaccionales (confirmaciones, alertas de seguridad), emitir facturas y cumplir obligaciones
              legales. No vendemos datos a terceros ni los usamos para publicidad comportamental.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              4. Transferencias Internacionales
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              Los datos pueden transferirse y almacenarse en servidores ubicados fuera de Argentina, incluyendo
              Estados Unidos, a través de los siguientes sub-encargados: <strong style={{ color: S.text }}>Supabase
              Inc.</strong> (base de datos, EE.UU.), <strong style={{ color: S.text }}>Vercel Inc.</strong> (hosting,
              EE.UU.) y <strong style={{ color: S.text }}>Groq Inc.</strong> (procesamiento de IA, EE.UU.).
              Estas transferencias se realizan bajo cláusulas contractuales tipo y mecanismos de adecuación.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              5. Retención de Datos
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              Los datos se conservan mientras la cuenta esté activa. Tras la eliminación de la cuenta, los
              datos personales se eliminan en un plazo de 30 días hábiles, salvo que existan obligaciones
              legales de retención (ej. documentación fiscal: 10 años según Código de Comercio argentino).
              Los logs de auditoría legal se conservan por 5 años.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              6. Derechos ARCO
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              De conformidad con la Ley N.° 25.326 y sus modificatorias, el titular de los datos tiene
              derecho a: <strong style={{ color: S.text }}>Acceso</strong> (conocer qué datos se tratan),
              <strong style={{ color: S.text }}> Rectificación</strong> (corregir datos inexactos),
              <strong style={{ color: S.text }}> Cancelación</strong> (eliminar datos) y
              <strong style={{ color: S.text }}> Oposición</strong> (oponerse al tratamiento).
              Para ejercer estos derechos, escribir a{' '}
              <a href="mailto:conectar.rrhh.ar@gmail.com" style={{ color: S.accentSoft }}>
                conectar.rrhh.ar@gmail.com
              </a> indicando el derecho que desea ejercer y adjuntando documentación que acredite identidad.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10 }}>
              7. Contacto con la AAIP
            </h2>
            <p style={{ fontSize: 14, color: S.textSec, lineHeight: 1.7 }}>
              Si considera que el tratamiento de sus datos no se ajusta a la normativa vigente, puede
              presentar una reclamación ante la Agencia de Acceso a la Información Pública (AAIP),
              autoridad de control en Argentina, en su sitio web{' '}
              <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer" style={{ color: S.accentSoft }}>
                www.argentina.gob.ar/aaip
              </a>.
              [TEXTO PENDIENTE DE REVISIÓN LEGAL]
            </p>
          </section>
        </div>

        <div style={{ marginTop: 56, paddingTop: 28, borderTop: `1px solid ${S.border}`, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Link href="/terminos" style={{ fontSize: 12, color: S.textMuted, textDecoration: 'none' }}>
            Términos y Condiciones
          </Link>
          <Link href="/cookies" style={{ fontSize: 12, color: S.textMuted, textDecoration: 'none' }}>
            Política de Cookies
          </Link>
        </div>
      </div>
    </div>
  )
}
