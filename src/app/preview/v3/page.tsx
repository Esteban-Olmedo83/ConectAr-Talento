import Link from 'next/link'
import { BrainCircuit, BarChart3, Globe2, MessageCircle, Video, BookOpen, CheckCircle, ArrowRight, Zap, Star, TrendingUp, MapPin, Award } from 'lucide-react'

const PLANS = [
  { name: 'Free', price: 0, features: ['1 vacante activa', '10 candidatos', '15 análisis IA/mes', 'Pipeline Kanban', 'Agenda de entrevistas'], cta: 'Empezar gratis', popular: false, note: 'Para explorar la plataforma' },
  { name: 'Starter', price: 29, features: ['5 vacantes activas', '100 candidatos', '75 análisis IA/mes', '1 cuenta LinkedIn', '1 cuenta de email', 'Templates incluidos'], cta: '14 días gratis', popular: false, note: 'Para reclutadores individuales' },
  { name: 'Pro', price: 79, features: ['Vacantes ilimitadas', 'Candidatos ilimitados', 'IA ilimitada ✨', '3 cuentas LinkedIn', '3 correos corporativos', '1 WhatsApp Business', 'Todos los job boards LATAM'], cta: '14 días gratis', popular: true, note: 'Para equipos en crecimiento' },
  { name: 'Business', price: 149, features: ['Todo de Pro', '5 cuentas LinkedIn', '5 correos corporativos', '5 WhatsApp Business', 'Soporte 24/7', 'Onboarding dedicado'], cta: 'Hablar con ventas', popular: false, note: 'Para empresas y agencias' },
]

const STATS = [
  { value: '2.400+', label: 'Reclutadores activos', icon: TrendingUp, color: '#a78bfa' },
  { value: '85K+', label: 'CVs analizados con IA', icon: BrainCircuit, color: '#34d399' },
  { value: '18', label: 'Países de LATAM', icon: MapPin, color: '#fbbf24' },
  { value: '4.8★', label: 'Valoración promedio', icon: Award, color: '#f87171' },
]

const FEATURES = [
  { icon: BrainCircuit, borderColor: '#a78bfa', title: 'IA que analiza CVs', desc: 'Subí un CV y la IA extrae skills, experiencia y calcula un score en segundos.' },
  { icon: BarChart3, borderColor: '#60a5fa', title: 'Pipeline visual Kanban', desc: 'Drag-and-drop con scoring automático. Siempre sabés en qué etapa está cada candidato.' },
  { icon: Globe2, borderColor: '#34d399', title: 'Publicación en LATAM', desc: 'Computrabajo, ZonaJobs, Bumeran, Indeed y LinkedIn con un solo click.' },
  { icon: MessageCircle, borderColor: '#4ade80', title: 'WhatsApp Business', desc: 'Comunicá con candidatos por WhatsApp directamente desde la app.' },
  { icon: Video, borderColor: '#f87171', title: 'Video entrevistas', desc: 'Zoom, Meet o Teams directo desde la agenda. El link va al candidato automáticamente.' },
  { icon: BookOpen, borderColor: '#fbbf24', title: '100 Perfiles LATAM', desc: 'Biblioteca con skills pre-cargadas para los 100 perfiles más buscados.' },
]

const TESTIMONIALS = [
  { name: 'Valentina Romero', role: 'HR Manager · Buenos Aires', text: 'En 10 minutos ya tenía mi primera vacante publicada en Computrabajo y LinkedIn. La IA me ahorra 2 horas por candidato.', stars: 5, initials: 'VR', gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)' },
  { name: 'Rodrigo Méndez', role: 'Talent Acquisition · Ciudad de México', text: 'Finalmente un ATS que habla mi idioma. El score IA me ayudó a reducir el tiempo de screening a la mitad.', stars: 5, initials: 'RM', gradient: 'linear-gradient(135deg, #0891b2, #7c3aed)' },
  { name: 'Camila Sousa', role: 'Reclutadora Freelance · Colombia', text: 'Uso el plan Free y ya cubro mis necesidades. Cuando crezca sé que el Pro me espera.', stars: 4, initials: 'CS', gradient: 'linear-gradient(135deg, #d97706, #dc2626)' },
]

export default function PreviewV3() {
  return (
    <main className="min-h-screen font-sans" style={{ background: '#0f0f1a', color: 'white' }}>

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50" style={{ backdropFilter: 'blur(20px)', background: 'rgba(15,15,26,0.85)', borderBottom: '1px solid rgba(167,139,250,0.15)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-white text-lg tracking-tight">ConectAr <span style={{ color: '#a78bfa' }}>Talento</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Funciones', 'Precios', 'Blog'].map(l => (
              <a key={l} href="#" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(167,139,250,0.3)' }}>
              Iniciar sesión
            </Link>
            <Link href="/signup" className="text-sm font-bold px-5 py-2 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20" style={{ background: 'linear-gradient(135deg, #1a0533 0%, #0f0f1a 40%, #0a1628 100%)' }}>
        {/* Blobs */}
        <div className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 60%)', filter: 'blur(60px)' }} />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pb-16">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
            <span className="h-2 w-2 rounded-full bg-yellow-400" style={{ animation: 'pulse 2s infinite' }} />
            🚀 Ahora disponible en LATAM
          </div>

          <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6">
            <span className="text-white">El talento que buscás,</span><br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              conectado
            </span>{' '}
            <span style={{ color: '#fbbf24' }}>en un solo lugar.</span>
          </h1>

          <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            La plataforma ATS con IA para reclutadores latinoamericanos. Analizá CVs, publicá en todos los job boards y gestioná entrevistas desde un solo lugar.
          </p>

          <div className="flex items-center justify-center gap-4 mb-10">
            <Link href="/signup" className="flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
              Empezar gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 font-medium px-8 py-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
              Ver demo
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {['Sin tarjeta de crédito', 'Setup en 5 minutos', 'Tus datos en tu Google Drive'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Banda de stats */}
        <div className="relative w-full" style={{ background: 'rgba(167,139,250,0.07)', borderTop: '1px solid rgba(167,139,250,0.15)', borderBottom: '1px solid rgba(167,139,250,0.15)' }}>
          <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-4 gap-4">
            {STATS.map(s => (
              <div key={s.value} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-xl font-black text-white">{s.value}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24" style={{ background: '#0f0f1a' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#a78bfa' }}>Funcionalidades</span>
            <h2 className="text-4xl font-black text-white mt-2">Todo lo que un reclutador de LATAM necesita</h2>
            <p className="mt-3 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>Diseñado para los desafíos reales del reclutamiento latinoamericano.</p>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${f.borderColor}`, border: '1px solid rgba(255,255,255,0.07)', borderLeftWidth: '3px', borderLeftColor: f.borderColor }}>
                <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.borderColor}15` }}>
                  <f.icon className="h-6 w-6" style={{ color: f.borderColor }} />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24" style={{ background: 'linear-gradient(180deg, #0f0f1a 0%, #1a0533 100%)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-4">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#a78bfa' }}>Precios</span>
            <h2 className="text-4xl font-black text-white mt-2">Precio justo para LATAM</h2>
          </div>
          <div className="flex justify-center mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
              🎉 50% OFF los primeros 6 meses — Early Adopters
            </span>
          </div>
          <div className="grid grid-cols-4 gap-5 items-start">
            {PLANS.map(plan => (
              <div key={plan.name} className={`relative rounded-2xl p-6 flex flex-col ${plan.popular ? '-mt-4 mb-4' : ''}`}
                style={plan.popular
                  ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: '1px solid rgba(167,139,250,0.5)', boxShadow: '0 0 60px rgba(124,58,237,0.35)' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.15)' }
                }>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap" style={{ background: '#fbbf24', color: '#1a0533' }}>
                    ⭐ El favorito
                  </div>
                )}
                <span className="text-xs font-medium mb-3" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>{plan.note}</span>
                <h3 className="font-black text-xl mb-1 text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-black text-white">${plan.price}</span>
                  <span className="text-sm" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)' }}>USD/mes</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: plan.popular ? '#a5f3fc' : '#a78bfa' }} />
                      <span className="text-sm" style={{ color: plan.popular ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="w-full text-center py-3 rounded-xl font-bold text-sm"
                  style={plan.popular
                    ? { background: 'white', color: '#7c3aed' }
                    : { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa' }
                  }>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24" style={{ background: '#0f0f1a' }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-4xl font-black text-white mb-12">Lo que dicen los reclutadores</h2>
          <div className="grid grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.15)' }}>
                <div className="text-5xl font-black mb-3" style={{ color: 'rgba(167,139,250,0.2)', lineHeight: 1 }}>&ldquo;</div>
                <div className="flex gap-0.5 mb-3 -mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4" style={{ color: i < t.stars ? '#fbbf24' : 'rgba(255,255,255,0.1)', fill: i < t.stars ? '#fbbf24' : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 italic" style={{ color: 'rgba(255,255,255,0.7)' }}>{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ background: t.gradient }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{t.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4c1d95, #1e1b4b, #0c1445)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.06) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Tu próxima gran contratación<br />
            <span style={{ color: '#fbbf24' }}>empieza acá</span>
          </h2>
          <p className="text-lg mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Sin tarjeta de crédito. En 5 minutos estás reclutando con IA.</p>
          <p className="text-sm font-semibold mb-8" style={{ color: '#a78bfa' }}>🔥 347 reclutadores se unieron esta semana</p>
          <Link href="/signup" className="inline-flex items-center gap-2 font-bold px-10 py-4 rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 50px rgba(124,58,237,0.6)' }}>
            Empezar gratis ahora <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center justify-center gap-8 mt-8 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {['Sin tarjeta de crédito', 'Cancelá cuando quieras', '99.9% uptime'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12" style={{ background: '#06060f', borderTop: '1px solid rgba(167,139,250,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-white">ConectAr <span style={{ color: '#a78bfa' }}>Talento</span></span>
          </div>
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div><p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>El talento que buscás, conectado en un solo lugar.</p></div>
            {[
              { title: 'Producto', links: ['Funciones', 'Precios', 'Changelog'] },
              { title: 'Empresa', links: ['Nosotros', 'Blog', 'Contacto'] },
              { title: 'Legal', links: ['Términos', 'Privacidad', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-white mb-3">{col.title}</p>
                <ul className="space-y-2 text-sm">{col.links.map(l => <li key={l}><a href="#" style={{ color: 'rgba(255,255,255,0.4)' }} className="hover:text-white transition-colors">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>© 2026 ConectAr Talento. Hecho con ❤️ en Latinoamérica.</p>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>99.9% uptime</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
