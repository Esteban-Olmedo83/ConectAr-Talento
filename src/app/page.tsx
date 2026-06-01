'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  BrainCircuit, BarChart3, Globe2, MessageCircle, Video, BookOpen,
  CheckCircle, ArrowRight, Zap, Star, TrendingUp, MapPin, Award,
} from 'lucide-react'

/* ─── Data ─────────────────────────────────────────────────── */
const STATS = [
  { value: 2400, suffix: '+', label: 'Reclutadores activos', icon: TrendingUp, color: '#8B7EFF' },
  { value: 85000, suffix: '+', label: 'CVs analizados con IA', icon: BrainCircuit, color: '#34d399' },
  { value: 18, suffix: '', label: 'Países de LATAM', icon: MapPin, color: '#fbbf24' },
  { value: 4.8, suffix: '★', label: 'Valoración promedio', icon: Award, color: '#f87171' },
]

const FEATURES = [
  { icon: BrainCircuit, color: '#8B7EFF', title: 'IA que analiza CVs', desc: 'Subí un CV y la IA extrae skills, experiencia y calcula un score en segundos.' },
  { icon: BarChart3, color: '#a78bfa', title: 'Pipeline visual Kanban', desc: 'Drag-and-drop con scoring automático. Siempre sabés en qué etapa está cada candidato.' },
  { icon: Globe2, color: '#60a5fa', title: 'Publicación en LATAM', desc: 'Computrabajo, ZonaJobs, Bumeran, Indeed y LinkedIn con un solo click.' },
  { icon: MessageCircle, color: '#34d399', title: 'WhatsApp Business', desc: 'Comunicá con candidatos por WhatsApp directamente desde la app.' },
  { icon: Video, color: '#f87171', title: 'Video entrevistas', desc: 'Zoom, Meet o Teams directo desde la agenda. El link va al candidato automáticamente.' },
  { icon: BookOpen, color: '#fbbf24', title: '100 Perfiles LATAM', desc: 'Biblioteca con skills pre-cargadas para los 100 perfiles más buscados.' },
]

const PLANS = [
  {
    name: 'Free', price: 0, note: 'Para explorar la plataforma',
    features: ['1 vacante activa', '10 candidatos', '15 análisis IA/mes', 'Pipeline Kanban', 'Agenda de entrevistas'],
    cta: 'Empezar gratis', popular: false,
  },
  {
    name: 'Starter', price: 29, note: 'Para reclutadores individuales',
    features: ['5 vacantes activas', '100 candidatos', '75 análisis IA/mes', '1 cuenta LinkedIn', '1 cuenta de email', 'Templates incluidos'],
    cta: '14 días gratis', popular: false,
  },
  {
    name: 'Pro', price: 79, note: 'Para equipos en crecimiento',
    features: ['Vacantes ilimitadas', 'Candidatos ilimitados', 'IA ilimitada ✨', '3 cuentas LinkedIn', '3 correos corporativos', '1 WhatsApp Business', 'Todos los job boards LATAM'],
    cta: '14 días gratis', popular: true,
  },
  {
    name: 'Business', price: 149, note: 'Para empresas y agencias',
    features: ['Todo de Pro', '5 cuentas LinkedIn', '5 correos corporativos', '5 WhatsApp Business', 'Soporte 24/7', 'Onboarding dedicado'],
    cta: 'Hablar con ventas', popular: false,
  },
]

const TESTIMONIALS = [
  { name: 'Valentina Romero', role: 'HR Manager · Buenos Aires', text: 'En 10 minutos ya tenía mi primera vacante publicada en Computrabajo y LinkedIn. La IA me ahorra 2 horas por candidato.', stars: 5, initials: 'VR', color: '#5D50D6' },
  { name: 'Rodrigo Méndez', role: 'Talent Acquisition · Ciudad de México', text: 'Finalmente un ATS que habla mi idioma. El score IA me ayudó a reducir el tiempo de screening a la mitad.', stars: 5, initials: 'RM', color: '#7c3aed' },
  { name: 'Camila Sousa', role: 'Reclutadora Freelance · Colombia', text: 'Uso el plan Free y ya cubro mis necesidades. Cuando crezca sé que el Pro me espera.', stars: 4, initials: 'CS', color: '#0891b2' },
]

/* ─── Hooks ─────────────────────────────────────────────────── */

/** Devuelve true cuando el elemento entra al viewport */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

/** Anima un número desde 0 hasta target cuando triggered=true */
function useCounter(target: number, decimals = 0, triggered = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!triggered) return
    const duration = 1800
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [triggered, target, decimals])
  return count
}

/* ─── Fade-up wrapper ────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Stat counter card ──────────────────────────────────────── */
function StatCard({ stat, triggered }: { stat: typeof STATS[0]; triggered: boolean }) {
  const decimals = stat.value % 1 !== 0 ? 1 : 0
  const count = useCounter(stat.value, decimals, triggered)
  const display = stat.value >= 1000
    ? count >= 1000 ? `${(count / 1000).toFixed(1)}K` : '0'
    : decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toString()

  return (
    <div className="text-center p-6 rounded-2xl" style={{ background: 'rgba(93,80,214,0.08)', border: '1px solid rgba(93,80,214,0.2)' }}>
      <div className="h-10 w-10 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: `${stat.color}20` }}>
        <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
      </div>
      <div className="text-4xl font-black mb-1" style={{ background: 'linear-gradient(135deg, #8B7EFF, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {display}{stat.suffix}
      </div>
      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  /* Parallax */
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Stats counter trigger */
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)
  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsVisible(true); obs.disconnect() } }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <main className="min-h-screen font-sans" style={{ background: '#0B0B14', color: 'white' }}>

      {/* ── NAV ── */}
      <nav style={{ background: 'rgba(11,11,20,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(93,80,214,0.2)' }} className="fixed top-0 inset-x-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5D50D6, #8B7EFF)' }}>
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-white text-lg">ConectAr Talento</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[['#features', 'Funciones'], ['#pricing', 'Precios']].map(([href, label]) => (
              <a key={label} href={href} className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(93,80,214,0.4)' }}>
              Iniciar sesión
            </Link>
            <Link href="/signup" className="text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: '#5D50D6' }}>
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        {/* Parallax blobs */}
        <div
          className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(93,80,214,0.18) 0%, transparent 70%)',
            filter: 'blur(50px)',
            transform: `translateY(${scrollY * 0.25}px)`,
            transition: 'transform 0.1s linear',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139,126,255,0.12) 0%, transparent 70%)',
            filter: 'blur(50px)',
            transform: `translateY(${scrollY * -0.15}px)`,
            transition: 'transform 0.1s linear',
          }}
        />
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(93,80,214,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(93,80,214,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-sm font-medium" style={{ background: 'rgba(93,80,214,0.15)', border: '1px solid rgba(93,80,214,0.3)', color: '#8B7EFF' }}>
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
            🚀 Ahora disponible en LATAM
          </div>

          <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6 text-white">
            El talento que buscás,<br />
            <span style={{ background: 'linear-gradient(135deg, #8B7EFF, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              conectado en un solo lugar.
            </span>
          </h1>

          <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            La plataforma ATS con IA para reclutadores latinoamericanos. Analizá CVs, publicá en todos los job boards y gestioná entrevistas desde un solo lugar.
          </p>

          <div className="flex items-center justify-center gap-4 mb-10">
            <Link href="/signup" className="flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #5D50D6, #8B7EFF)', boxShadow: '0 0 40px rgba(93,80,214,0.4)' }}>
              Empezar gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 font-medium px-8 py-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
              Iniciar sesión
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {['Sin tarjeta de crédito', 'Setup en 5 minutos', 'Tus datos en tu Google Drive'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS con contadores ── */}
      <section style={{ borderTop: '1px solid rgba(93,80,214,0.15)', borderBottom: '1px solid rgba(93,80,214,0.15)' }}>
        <div ref={statsRef} className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-4 gap-6">
          {STATS.map(s => (
            <StatCard key={s.label} stat={s} triggered={statsVisible} />
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#8B7EFF' }}>Funcionalidades</span>
            <h2 className="text-4xl font-black text-white mt-2">Todo lo que un reclutador de LATAM necesita</h2>
            <p className="mt-3 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>Diseñado para los desafíos reales del reclutamiento latinoamericano.</p>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={i * 80}>
                <div className="p-6 rounded-2xl h-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(93,80,214,0.2)' }}>
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}20` }}>
                    <f.icon className="h-6 w-6" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24" style={{ background: 'rgba(93,80,214,0.04)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-4">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#8B7EFF' }}>Precios</span>
            <h2 className="text-4xl font-black text-white mt-2">Precio justo para LATAM</h2>
          </FadeUp>
          <FadeUp delay={100} className="flex justify-center mb-12">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
              style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
              🎉 50% OFF los primeros 6 meses — Early Adopters
            </span>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {PLANS.map((plan, i) => (
              <FadeUp key={plan.name} delay={i * 80}>
                <div className={`relative rounded-2xl p-6 flex flex-col h-full ${plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
                  style={plan.popular
                    ? { background: 'linear-gradient(135deg, #5D50D6, #7c3aed)', border: '1px solid #8B7EFF', boxShadow: '0 0 60px rgba(93,80,214,0.4)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(93,80,214,0.2)' }
                  }>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap"
                      style={{ background: '#fbbf24', color: '#1a1a2e' }}>
                      ⭐ Más popular
                    </div>
                  )}
                  <span className="text-xs font-medium mb-2" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>{plan.note}</span>
                  <h3 className="font-black text-xl mb-1 text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-3xl font-black text-white">${plan.price}</span>
                    <span className="text-sm" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)' }}>USD/mes</span>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: plan.popular ? '#a5f3fc' : '#8B7EFF' }} />
                        <span className="text-sm" style={{ color: plan.popular ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="w-full text-center py-2.5 rounded-xl font-bold text-sm"
                    style={plan.popular
                      ? { background: 'white', color: '#5D50D6' }
                      : { background: 'rgba(93,80,214,0.2)', border: '1px solid rgba(93,80,214,0.4)', color: '#8B7EFF' }
                    }>
                    {plan.cta}
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-12">
            <h2 className="text-4xl font-black text-white">Lo que dicen los reclutadores</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 100}>
                <div className="p-6 rounded-2xl h-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(93,80,214,0.2)' }}>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4" style={{ color: idx < t.stars ? '#fbbf24' : 'rgba(255,255,255,0.1)', fill: idx < t.stars ? '#fbbf24' : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.7)' }}>&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: t.color }}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{t.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <FadeUp>
        <section className="py-24" style={{ background: 'linear-gradient(135deg, rgba(93,80,214,0.2), rgba(124,58,237,0.15))' }}>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black text-white mb-4">Tu próxima gran contratación empieza acá</h2>
            <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>Sin tarjeta de crédito. Sin configuración compleja. En 5 minutos estás reclutando con IA.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 font-bold px-10 py-4 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #5D50D6, #8B7EFF)', boxShadow: '0 0 40px rgba(93,80,214,0.5)' }}>
              Empezar gratis ahora <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </FadeUp>

      {/* ── FOOTER ── */}
      <footer className="py-12" style={{ background: '#060610', borderTop: '1px solid rgba(93,80,214,0.15)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5D50D6, #8B7EFF)' }}>
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-black text-white">ConectAr Talento</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>El talento que buscás, conectado en un solo lugar.</p>
            </div>
            {[
              { title: 'Producto', links: ['Funciones', 'Precios', 'Changelog'] },
              { title: 'Empresa', links: ['Nosotros', 'Blog', 'Contacto'] },
              { title: 'Legal', links: ['Términos', 'Privacidad', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-white mb-3">{col.title}</p>
                <ul className="space-y-2 text-sm">
                  {col.links.map(l => (
                    <li key={l}><a href="#" style={{ color: 'rgba(255,255,255,0.4)' }} className="hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>© 2026 ConectAr Talento. Hecho con ❤️ en Latinoamérica.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
