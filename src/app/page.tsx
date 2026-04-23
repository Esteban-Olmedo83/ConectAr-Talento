import Link from 'next/link'
import {
  BrainCircuit,
  BarChart3,
  Globe2,
  MessageCircle,
  Video,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Zap,
  Star,
  ChevronRight,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand'

/* ─── features data ─────────────────────────────────────────── */
const FEATURES = [
  {
    iconName: 'brain',
    bg: 'bg-indigo-100',
    title: 'IA que analiza CVs',
    desc: 'Subí un CV y la IA extrae skills, experiencia y calcula un score ATS en segundos. Gratis con Gemini.',
  },
  {
    iconName: 'chart',
    bg: 'bg-purple-100',
    title: 'Pipeline visual',
    desc: 'Kanban drag-and-drop con scoring automático. Siempre sabés en qué etapa está cada candidato.',
  },
  {
    iconName: 'globe',
    bg: 'bg-blue-100',
    title: 'Publicación en LATAM',
    desc: 'Publicá en Computrabajo, ZonaJobs, Bumeran, Indeed y LinkedIn con un solo click desde la app.',
  },
  {
    iconName: 'message',
    bg: 'bg-green-100',
    title: 'WhatsApp Business',
    desc: 'Comunicá con candidatos por WhatsApp directamente desde la app. Hasta 5 números por empresa.',
  },
  {
    iconName: 'video',
    bg: 'bg-red-100',
    title: 'Video entrevistas',
    desc: 'Creá reuniones en Zoom, Meet o Teams directo desde la agenda. El link va al candidato automáticamente.',
  },
  {
    iconName: 'book',
    bg: 'bg-amber-100',
    title: '100 Perfiles LATAM',
    desc: 'Biblioteca con skills pre-cargadas para los 100 perfiles más buscados en Latinoamérica.',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: 0,
    features: ['1 vacante activa', '10 candidatos', 'IA básica (5 análisis/mes)', 'Google Drive como BD', 'Pipeline Kanban completo', 'Agenda de entrevistas'],
    cta: 'Empezar gratis',
    popular: false,
    dark: false,
  },
  {
    name: 'Starter',
    price: 29,
    features: ['5 vacantes activas', '100 candidatos', 'IA completa (50/mes)', '1 cuenta LinkedIn', '1 cuenta de email', 'Templates incluidos'],
    cta: '14 días gratis',
    popular: false,
    dark: false,
  },
  {
    name: 'Pro',
    price: 79,
    features: ['Vacantes ilimitadas', 'Candidatos ilimitados', 'IA sin límites', '3 cuentas LinkedIn', '3 correos corporativos', '1 WhatsApp Business', 'Todos los job boards'],
    cta: '14 días gratis',
    popular: true,
    dark: true,
  },
  {
    name: 'Business',
    price: 149,
    features: ['Todo de Pro', '5 cuentas LinkedIn', '5 correos corporativos', '5 WhatsApp Business', 'Todos los job boards LATAM', 'Soporte prioritario', 'Onboarding dedicado'],
    cta: 'Hablar con ventas',
    popular: false,
    dark: false,
  },
]

const TESTIMONIALS = [
  {
    name: 'Valentina Romero',
    role: 'HR Manager · Startup FinTech, Buenos Aires',
    text: 'En 10 minutos ya tenía mi primera vacante publicada en Computrabajo y LinkedIn. La IA me ahorra 2 horas por candidato.',
    stars: 5,
  },
  {
    name: 'Rodrigo Méndez',
    role: 'Talent Acquisition · Empresa Tecnológica, CDMX',
    text: 'Finalmente un ATS que habla mi idioma. El score ATS me ayudó a reducir el tiempo de screening a la mitad.',
    stars: 5,
  },
  {
    name: 'Camila Sousa',
    role: 'Reclutadora Freelance · Colombia',
    text: 'Uso el plan Free y ya cubro mis necesidades básicas. Cuando crezca sé que está la opción Pro esperándome.',
    stars: 4,
  },
]

function FeatureIcon({ name, className }: { name: string; className?: string }) {
  if (name === 'brain') return <BrainCircuit className={className} />
  if (name === 'chart') return <BarChart3 className={className} />
  if (name === 'globe') return <Globe2 className={className} />
  if (name === 'message') return <MessageCircle className={className} />
  if (name === 'video') return <Video className={className} />
  return <BookOpen className={className} />
}

const FEATURE_ICON_COLORS: Record<string, string> = {
  brain: 'text-indigo-600',
  chart: 'text-purple-600',
  globe: 'text-blue-600',
  message: 'text-green-600',
  video: 'text-red-500',
  book: 'text-amber-600',
}

export default function LandingPage() {
  const SOCIAL_LOGOS = ['Mercado Libre', 'Globant', 'OLX', 'Naranja X', 'Etermax', 'Despegar']

  return (
    <main className="min-h-screen font-sans">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
        {/* bg blobs */}
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

        {/* nav */}
        <nav className="absolute top-0 inset-x-0 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
          <BrandLogo onDark href="/" size="md" iconSize={30} />
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-white/80 hover:text-white text-sm transition-colors">Funciones</a>
            <a href="#pricing" className="text-white/80 hover:text-white text-sm transition-colors">Precios</a>
            <a href="#" className="text-white/80 hover:text-white text-sm transition-colors">Blog</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-white/90 hover:text-white text-sm font-medium px-4 py-1.5 rounded-lg border border-white/30 hover:border-white/60 transition-colors">Iniciar sesión</Link>
            <Link href="/signup" className="bg-white text-indigo-600 hover:bg-white/90 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">Empezar gratis</Link>
          </div>
        </nav>

        {/* hero content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-sm font-medium mb-8">
            <Zap className="h-3.5 w-3.5 text-yellow-300" />
            🚀 Ahora disponible en LATAM
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            El talento que buscás,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              conectado en un solo lugar.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed">
            La plataforma ATS con IA para reclutadores latinoamericanos. Analizá CVs, publicá en todos los job boards y gestioná entrevistas desde un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
            <Link href="/signup" className="flex items-center gap-2 bg-white text-indigo-600 hover:bg-white/95 font-bold px-8 py-3.5 rounded-xl text-base shadow-xl transition-all">
              Empezar gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium px-8 py-3.5 rounded-xl text-base transition-all">
              Iniciar sesión <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
            <span>✅ Sin tarjeta de crédito</span>
            <span>✅ Configuración en 5 minutos</span>
            <span>✅ Tus datos en tu Google Drive</span>
          </div>
        </div>

        {/* wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80H1440V40C1200 80 960 0 720 40C480 80 240 0 0 40V80Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-10 bg-white border-b border-gray-100">
        <p className="text-center text-sm text-gray-400 font-medium uppercase tracking-wider mb-6">
          Usado por reclutadores de las mejores empresas de LATAM
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 px-6">
          {SOCIAL_LOGOS.map((name) => (
            <div key={name} className="h-8 px-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-400">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Funcionalidades</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
              Todo lo que un reclutador de LATAM necesita
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Diseñado para los desafíos reales del reclutamiento latinoamericano, con IA accesible y sin costos ocultos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                <div className={`h-12 w-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <FeatureIcon name={f.iconName} className={`h-6 w-6 ${FEATURE_ICON_COLORS[f.iconName]}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Precios</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Precio justo para LATAM</h2>
            <p className="text-gray-500 mt-3">
              Primeros 6 meses con{' '}
              <span className="text-indigo-600 font-semibold">50% OFF para Early Adopters</span>.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 p-6 flex flex-col ${
                  plan.dark
                    ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-200 md:-mt-4 md:mb-4'
                    : 'bg-white border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    ⭐ Más popular
                  </div>
                )}
                <h3 className={`font-bold text-lg mb-1 ${plan.dark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className={`flex items-baseline gap-1 mb-5 ${plan.dark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="text-3xl font-extrabold">${plan.price}</span>
                  <span className={`text-sm ${plan.dark ? 'text-indigo-200' : 'text-gray-400'}`}>USD/mes</span>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.dark ? 'text-indigo-300' : 'text-indigo-500'}`} />
                      <span className={`text-sm ${plan.dark ? 'text-indigo-100' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    plan.dark
                      ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-12">
            Lo que dicen los reclutadores de LATAM
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Tu próxima gran contratación empieza acá
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Sin tarjeta de crédito. Sin configuración compleja. En 5 minutos estás reclutando con IA.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-white/95 font-bold px-10 py-4 rounded-xl text-base shadow-2xl transition-all"
          >
            Empezar gratis ahora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-3">
                <BrandLogo onDark href="/" size="sm" iconSize={24} />
              </div>
              <p className="text-sm leading-relaxed">El talento que buscás, conectado en un solo lugar.</p>
            </div>
            {[
              { title: 'Producto', links: ['Funciones', 'Precios', 'Seguridad', 'Changelog'] },
              { title: 'Empresa', links: ['Nosotros', 'Blog', 'Prensa', 'Contacto'] },
              { title: 'Legal', links: ['Términos', 'Privacidad', 'Cookies'] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-white text-sm font-semibold mb-3">{col.title}</p>
                <ul className="space-y-2 text-sm">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-sm">© 2026 ConectAr Talento. Hecho con ❤️ en Latinoamérica.</p>
            <p className="text-xs text-gray-600">ConectAr HR · Suite integral de RRHH para LATAM</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
