import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Política de privacidad — ConectAr Talento' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Política de privacidad</h1>
        <p className="text-sm text-muted-foreground mb-10">Última actualización: abril 2026</p>

        <div className="prose prose-sm max-w-none text-foreground space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Datos que recopilamos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Recopilamos información que vos nos proporcionás al crear una cuenta (nombre, email, empresa), datos de uso de la plataforma, y datos de candidatos que cargás como parte del servicio de reclutamiento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Cómo usamos los datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Usamos tus datos para brindarte el servicio, mejorar la plataforma, enviarte comunicaciones relevantes sobre tu cuenta, y cumplir obligaciones legales. No vendemos datos a terceros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Datos de candidatos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los datos de candidatos que cargás pertenecen a tu organización. ConectAr Talento los procesa únicamente para darte el servicio y no los accede ni comparte sin tu autorización. Te recomendamos informar a los candidatos sobre el procesamiento de sus datos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Seguridad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Aplicamos medidas técnicas y organizativas para proteger tu información: cifrado en tránsito (HTTPS), cifrado en reposo, autenticación segura, y control de acceso por roles. Usamos Supabase como proveedor de infraestructura con certificación SOC 2.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Retención de datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conservamos tus datos mientras tengas una cuenta activa. Al eliminar tu cuenta, eliminamos tus datos personales en un plazo de 30 días, salvo obligaciones legales de retención.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Tus derechos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tenés derecho a acceder, rectificar, eliminar y exportar tus datos. Para ejercer estos derechos, escribinos a{' '}
              <a href="mailto:privacidad@conectartalento.com" className="text-primary hover:underline">privacidad@conectartalento.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Usamos cookies esenciales para el funcionamiento de la sesión. No usamos cookies de tracking de terceros sin tu consentimiento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para consultas sobre privacidad, escribinos a{' '}
              <a href="mailto:privacidad@conectartalento.com" className="text-primary hover:underline">privacidad@conectartalento.com</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            ¿Preguntas?{' '}
            <Link href="/terms" className="text-primary hover:underline">Ver Términos de servicio</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
