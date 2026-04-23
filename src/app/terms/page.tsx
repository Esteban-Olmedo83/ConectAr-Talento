import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/brand'

export const metadata = { title: 'Términos de servicio — ConectAr Talento' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Términos de servicio</h1>
        <p className="text-sm text-muted-foreground mb-10">Última actualización: abril 2026</p>

        <div className="prose prose-sm max-w-none text-foreground space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Aceptación de los términos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Al acceder y usar ConectAr Talento, aceptás estos términos de servicio. Si no estás de acuerdo, no utilices la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Descripción del servicio</h2>
            <p className="text-muted-foreground leading-relaxed">
              ConectAr Talento es una plataforma ATS (Applicant Tracking System) diseñada para reclutadores latinoamericanos. Ofrecemos herramientas para gestionar vacantes, candidatos, entrevistas y análisis de CVs con inteligencia artificial.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Uso aceptable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Te comprometés a usar la plataforma de forma legal y ética. Está prohibido usar el servicio para discriminar candidatos por género, raza, religión, orientación sexual u otras características protegidas por ley.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Datos y privacidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sos responsable de los datos de candidatos que cargás en la plataforma. ConectAr Talento actúa como procesador de datos y aplica medidas de seguridad para proteger la información. Consultá nuestra{' '}
              <Link href="/privacy" className="text-primary hover:underline">Política de privacidad</Link>{' '}
              para más detalles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Planes y facturación</h2>
            <p className="text-muted-foreground leading-relaxed">
              El plan Free es gratuito sin límite de tiempo. Los planes pagos se facturan mensualmente o anualmente según la opción elegida. Podés cancelar en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Limitación de responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              ConectAr Talento no garantiza que el servicio sea ininterrumpido o libre de errores. En ningún caso seremos responsables por daños indirectos, incidentales o consecuentes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para consultas sobre estos términos, escribinos a{' '}
              <a href="mailto:legal@conectartalento.com" className="text-primary hover:underline">legal@conectartalento.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
