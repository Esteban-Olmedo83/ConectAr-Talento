import Link from 'next/link'
import { BrainCircuit, BarChart3, Globe2, MessageCircle, Video, BookOpen, CheckCircle, ArrowRight, Zap, Star, Building2, Rocket, Briefcase, Users } from 'lucide-react'

const PLANS = [
  { name: 'Free', price: 0, features: ['1 vacante activa', '10 candidatos', '15 análisis IA/mes', 'Pipeline Kanban', 'Agenda de entrevistas'], cta: 'Empezar gratis', popular: false },
  { name: 'Starter', price: 29, features: ['5 vacantes activas', '100 candidatos', '75 análisis IA/mes', '1 cuenta LinkedIn', '1 cuenta de email', 'Templates incluidos'], cta: '14 días gratis', popular: false },
  { name: 'Pro', price: 79, features: ['Vacantes ilimitadas', 'Candidatos ilimitados', 'IA ilimitada ✨', '3 cuentas LinkedIn', '3 correos corporativos', '1 WhatsApp Business', 'Todos los job boards LATAM'], cta: '14 días gratis', popular: true },
  { name: 'Business', price: 149, features: ['Todo de Pro', '5 cuentas LinkedIn', '5 correos corporativos', '5 WhatsApp Business', 'Soporte 24/7', 'Onboarding dedicado'], cta: 'Hablar con ventas', popular: false },
]

const FEATURES = [
  { icon: BrainCircuit, bg: 'bg-indigo-50', color: 'text-indigo-600', title: 'IA que analiza CVs', desc: 'Subí un CV y la IA extrae skills, experiencia y calcula un score en segundos.' },
  { icon: BarChart3, bg: 'bg-violet-50', color: 'text-violet-600', title: 'Pipeline visual Kanban', desc: 'Drag-and-drop con scoring automático. Siempre sabés en qué etapa está cada candidato.' },
  { icon: Globe2, bg: 'bg-blue-50', color: 'text-blue-600', title: 'Publicación en LATAM', desc: 'Computrabajo, ZonaJobs, Bumeran, Indeed y LinkedIn con un solo click.' },
  { icon: MessageCircle, bg: 'bg-green-50', color: 'text-green-600', title: 'WhatsApp Business', desc: 'Comunicá con candidatos por WhatsApp directamente desde la app.' },
  { icon: Video, bg: 'bg-red-50', color: 'text-red-500', title: 'Video entrevistas', desc: 'Zoom, Meet o Teams directo desde la agenda. El link va al candidato automáticamente.' },
  { icon: BookOpen, bg: 'bg-amber-50', color: 'text-amber-600', title: '100 Perfiles LATAM', desc: 'Biblioteca con skills pre-cargadas para los 100 perfiles más buscados.' },
]

const INDUSTRIES = [
  { icon: Building2, label: 'Consultoras de RRHH', desc: 'Agencias especializadas en búsqueda y selección' },
  { icon: Rocket, label: 'Startups y Scaleups', desc: 'Equipos en crecimiento acelerado de LATAM' },
  { icon: Briefcase, label: 'Agencias de Empleo', desc: 'Bolsas de trabajo y headhunters regionales' },
  { icon: Users, label: 'Equipos HR corporativo', desc: 'Áreas de RRHH en empresas medianas y grandes' },
]

const TESTIMONIALS = [
  { name: 'Valentina Romero', role: 'HR Manager · Buenos Aires', text: 'En 10 minutos ya tenía mi primera vacante publicada en Computrabajo y LinkedIn. La IA me ahorra 2 horas por candidato.', stars: 5, initials: 'VR', bg: 'bg-indigo-600' },
  { name: 'Rodrigo Méndez', role: 'Talent Acquisition · Ciudad de México', text: 'Finalmente un ATS que habla mi idioma. El score IA me ayudó a reducir el tiempo de screening a la mitad.', stars: 5, initials: 'RM', bg: 'bg-violet-600' },
  { name: 'Camila Sousa', role: 'Reclutadora Freelance · Colombia', text: 'Uso el plan Free y ya cubro mis necesidades. Cuando crezca sé que el Pro me espera.', stars: 4, initials: 'CS', bg: 'bg-cyan-600' },
]

const FAQ = [
  { q: '¿Necesito tarjeta de crédito para el plan Free?', a: 'No. El plan Free es 100% gratuito y no requiere tarjeta de crédito. Podés usarlo sin límite de tiempo.' },
  { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí, podés cancelar tu suscripción cuando quieras desde tu panel de configuración, sin penalidades ni cargos adicionales.' },
  { q: '¿Mis datos están seguros?', a: 'Absolutamente. Tus datos se almacenan en tu propio Google Drive con encriptación. Nosotros nunca accedemos sin tu permiso.' },
]

export default function PreviewV2() {
  return (
    <main className="min-h-screen font-sans bg-white">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-gray-900 text-lg">ConectAr Talento</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Funciones', 'Precios', 'Blog'].map(l => (
              <a key={l} href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/signup" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
              Empezar gratis <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, #eef2ff 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-700 text-sm font-medium mb-8">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            🚀 Ahora disponible en LATAM
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-tight mb-6">
            El talento que buscás,<br />
            <span className="text-indigo-600">conectado en un solo lugar.</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            La plataforma ATS con IA para reclutadores latinoamericanos. Analizá CVs, publicá en todos los job boards y gestioná entrevistas desde un solo lugar.
          </p>

          <div className="flex items-center justify-center gap-4 mb-10">
            <Link href="/signup" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all">
              Empezar gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 text-gray-700 font-medium px-8 py-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
              Ver demo
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            {['Sin tarjeta de crédito', 'Setup en 5 minutos', 'Tus datos en tu Google Drive'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF - industrias */}
      <section className="py-14 bg-gray-50 border-y border-gray-100">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">Donde confían nuestros reclutadores</p>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-4 gap-4">
          {INDUSTRIES.map(i => (
            <div key={i.label} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <i.icon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{i.label}</p>
                <p className="text-xs text-gray-400">{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Funcionalidades</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Todo lo que un reclutador necesita</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Diseñado para los desafíos reales del reclutamiento latinoamericano.</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className={`h-12 w-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-4">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Precios</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Precio justo para LATAM</h2>
          </div>
          <div className="flex justify-center mb-12">
            <span className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-semibold px-5 py-2 rounded-full">
              🎉 50% OFF los primeros 6 meses — Early Adopters
            </span>
          </div>
          <div className="grid grid-cols-4 gap-5 items-start">
            {PLANS.map(plan => (
              <div key={plan.name} className={`relative rounded-2xl border-2 p-6 flex flex-col ${plan.popular ? 'bg-indigo-700 border-indigo-700 shadow-2xl shadow-indigo-200 -mt-4 mb-4' : 'bg-white border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    ⭐ Más popular
                  </div>
                )}
                <h3 className={`font-black text-lg mb-1 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className={`flex items-baseline gap-1 mb-5 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  <span className="text-3xl font-black">${plan.price}</span>
                  <span className={`text-sm ${plan.popular ? 'text-indigo-200' : 'text-gray-400'}`}>USD/mes</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-indigo-300' : 'text-indigo-500'}`} />
                      <span className={`text-sm ${plan.popular ? 'text-indigo-100' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`w-full text-center py-2.5 rounded-xl font-bold text-sm transition-colors ${plan.popular ? 'bg-white text-indigo-700 hover:bg-indigo-50' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-4xl font-black text-gray-900 mb-12">Lo que dicen los reclutadores de LATAM</h2>
          <div className="grid grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full ${t.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{t.initials}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-center text-3xl font-black text-gray-900 mb-10">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {FAQ.map(item => (
              <div key={item.q} className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="font-bold text-gray-900 mb-2">{item.q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #4338ca, #7c3aed)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4">Tu próxima gran contratación empieza acá</h2>
          <p className="text-indigo-200 text-lg mb-8">Sin tarjeta de crédito. Sin configuración compleja. En 5 minutos estás reclutando con IA.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-10 py-4 rounded-xl shadow-2xl transition-all">
            Empezar gratis ahora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-black text-white">ConectAr Talento</span>
          </div>
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div><p className="text-sm leading-relaxed">El talento que buscás, conectado en un solo lugar.</p></div>
            {[
              { title: 'Producto', links: ['Funciones', 'Precios', 'Changelog'] },
              { title: 'Empresa', links: ['Nosotros', 'Blog', 'Contacto'] },
              { title: 'Legal', links: ['Términos', 'Privacidad', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-white text-sm font-semibold mb-3">{col.title}</p>
                <ul className="space-y-2 text-sm">{col.links.map(l => <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-sm">© 2026 ConectAr Talento. Hecho con ❤️ en Latinoamérica.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
