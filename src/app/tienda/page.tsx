import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand'

export const metadata: Metadata = {
  title: 'Tienda — Recursos para Reclutadores | ConectAr Talento',
  description:
    'Ebooks, plantillas y guías prácticas para reclutadores latinoamericanos. Descargá recursos digitales para llevar tu reclutamiento al siguiente nivel.',
  alternates: { canonical: '/tienda' },
  openGraph: {
    title: 'Tienda de Recursos para Reclutadores — ConectAr Talento',
    description:
      'Ebooks, plantillas y guías prácticas para reclutadores latinoamericanos.',
    images: [{ url: '/logo.png', width: 512, height: 512 }],
  },
}

interface Product {
  id: string
  title: string
  subtitle: string
  description: string
  price: number
  originalPrice?: number
  badge?: string
  emoji: string
  gradient: string
  features: string[]
  whatsappMsg: string
}

const PRODUCTS: Product[] = [
  {
    id: 'guia-ia-reclutamiento',
    title: 'Guía Completa de Reclutamiento con IA',
    subtitle: 'Para reclutadores modernos en LATAM',
    description:
      'Aprendé a usar inteligencia artificial para atraer, filtrar y gestionar candidatos. Incluye prompts listos para usar, casos reales y checklist de implementación.',
    price: 9.99,
    originalPrice: 19.99,
    badge: '🔥 Más vendido',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #5D50D6 0%, #8B7EFF 100%)',
    features: [
      '80+ páginas de contenido práctico',
      '30 prompts listos para usar con Groq / ChatGPT',
      'Checklist de implementación paso a paso',
      'Casos reales de reclutadoras LATAM',
      'Actualizaciones gratuitas de por vida',
    ],
    whatsappMsg: 'Hola! Me interesa comprar la "Guía Completa de Reclutamiento con IA" de ConectAr Talento.',
  },
  {
    id: 'plantillas-jd-latam',
    title: '50 Plantillas de Job Descriptions para LATAM',
    subtitle: 'Listas para copiar, pegar y publicar',
    description:
      'Plantillas profesionales para los puestos más demandados en Argentina, México, Colombia y Chile. Optimizadas para LinkedIn, InfoJobs y Bumeran.',
    price: 12.99,
    emoji: '📋',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
    features: [
      '50 plantillas para roles de HR, Tech, Ventas y más',
      'Versiones para Argentina, México, Colombia y Chile',
      'Formato Word + PDF editable',
      'Ejemplos de misión, responsabilidades y beneficios',
      'Sección de requisitos dividida en obligatorios/deseables',
    ],
    whatsappMsg: 'Hola! Me interesa comprar las "50 Plantillas de Job Descriptions para LATAM" de ConectAr Talento.',
  },
  {
    id: 'preguntas-entrevista',
    title: '200 Preguntas de Entrevista por Competencias',
    subtitle: 'Para entrevistadores y headhunters',
    description:
      'Banco completo de preguntas conductuales, técnicas y de cultura organizacional. Incluye guías de evaluación y rubros de calificación.',
    price: 7.99,
    badge: '⚡ Nuevo',
    emoji: '💬',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    features: [
      '200 preguntas organizadas por competencia',
      'Guía de evaluación para cada respuesta',
      'Preguntas para roles junior, semi-senior y senior',
      'Sección especial para entrevistas en inglés',
      'Formato Google Docs + descarga PDF',
    ],
    whatsappMsg: 'Hola! Me interesa comprar las "200 Preguntas de Entrevista por Competencias" de ConectAr Talento.',
  },
  {
    id: 'pipeline-kanban-excel',
    title: 'Pipeline Kanban para Reclutadores en Excel',
    subtitle: 'Gestioná hasta 10 posiciones en paralelo',
    description:
      'Tablero Kanban profesional en Excel con fórmulas automáticas, KPIs de reclutamiento, dashboard de métricas y seguimiento de candidatos por etapa.',
    price: 14.99,
    originalPrice: 24.99,
    badge: '🎁 Oferta especial',
    emoji: '📊',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    features: [
      'Dashboard con KPIs: time-to-hire, conversion rate',
      'Tablero Kanban para 10 posiciones simultáneas',
      'Registro automático de candidatos por etapa',
      'Exportación a PDF para reportes a clientes',
      'Compatible con Excel 2016+ y Google Sheets',
    ],
    whatsappMsg: 'Hola! Me interesa comprar el "Pipeline Kanban para Reclutadores en Excel" de ConectAr Talento.',
  },
]

const WHATSAPP_BASE = 'https://wa.me/5491100000000'

function ProductCard({ product }: { product: Product }) {
  const waUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent(product.whatsappMsg)}`
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <div
      style={{
        background: '#13131f',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      className="product-card"
    >
      {/* Cover */}
      <div
        style={{
          background: product.gradient,
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          position: 'relative',
        }}
      >
        {product.badge && (
          <span
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 99,
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {product.badge}
          </span>
        )}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            backdropFilter: 'blur(4px)',
          }}
        >
          {product.emoji}
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {product.subtitle}
          </p>
          <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 800, lineHeight: 1.3 }}>
            {product.title}
          </h2>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6 }}>
          {product.description}
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {product.features.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: '#8B7EFF', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.5 }}>{f}</span>
            </li>
          ))}
        </ul>

        {/* Price + CTA */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-nunito)' }}>
              USD ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            {discount && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.12)', padding: '2px 6px', borderRadius: 99 }}>
                -{discount}%
              </span>
            )}
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 0',
              background: 'linear-gradient(135deg, #5D50D6 0%, #8B7EFF 100%)',
              color: '#fff',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 10,
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
          >
            Comprar por WhatsApp
          </a>
          <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
            Entrega inmediata vía correo electrónico
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TiendaPage() {
  return (
    <div style={{ background: '#0B0B14', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(93, 80, 214, 0.2);
        }
      `}</style>

      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,11,20,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <nav
        style={{
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
        }}
      >
          <BrandLogo onDark href="/" size="md" iconSize={28} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/"
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
            >
              Volver al inicio
            </Link>
            <Link
              href="/signup"
              style={{
                background: 'linear-gradient(135deg, #5D50D6 0%, #8B7EFF 100%)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              Usar el ATS gratis
            </Link>
          </div>
      </nav>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '64px 0 48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(93,80,214,0.15)',
              border: '1px solid rgba(93,80,214,0.3)',
              borderRadius: 99,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 600,
              color: '#8B7EFF',
              marginBottom: 24,
            }}
          >
            📚 Recursos digitales para reclutadores LATAM
          </div>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 16,
              fontFamily: 'var(--font-nunito)',
            }}
          >
            Llevá tu reclutamiento
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #5D50D6 0%, #8B7EFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              al siguiente nivel
            </span>
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 17,
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Ebooks, plantillas y herramientas creadas por y para reclutadores latinoamericanos.
            Descarga inmediata, pago seguro.
          </p>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 40,
              marginTop: 36,
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: '500+', label: 'Reclutadores satisfechos' },
              { value: '4', label: 'Recursos disponibles' },
              { value: '100%', label: 'Entrega digital' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#8B7EFF', fontFamily: 'var(--font-nunito)', lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bundle CTA */}
        <div
          style={{
            marginTop: 48,
            background: 'linear-gradient(135deg, rgba(93,80,214,0.15) 0%, rgba(139,126,255,0.08) 100%)',
            border: '1px solid rgba(93,80,214,0.3)',
            borderRadius: 20,
            padding: '32px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 32 }}>📦</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Pack Completo — Los 4 recursos</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, maxWidth: 480 }}>
            Llevate los 4 recursos con un descuento especial. Ideal para agencias y equipos de RRHH.
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, justifyContent: 'center' }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-nunito)' }}>USD $29.99</span>
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>$44.96</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.12)', padding: '3px 8px', borderRadius: 99 }}>-33%</span>
          </div>
          <a
            href={`${WHATSAPP_BASE}?text=${encodeURIComponent('Hola! Me interesa comprar el Pack Completo (los 4 recursos) de ConectAr Talento.')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(135deg, #5D50D6 0%, #8B7EFF 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              padding: '14px 32px',
              borderRadius: 12,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Conseguir el Pack por WhatsApp
          </a>
        </div>

        {/* Trust badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            marginTop: 40,
            flexWrap: 'wrap',
          }}
        >
          {[
            { emoji: '📧', text: 'Entrega inmediata por email' },
            { emoji: '🔒', text: 'Pago 100% seguro' },
            { emoji: '♾️', text: 'Actualizaciones gratuitas' },
            { emoji: '💬', text: 'Soporte por WhatsApp' },
          ].map(b => (
            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{b.emoji}</span>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{b.text}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <BrandLogo onDark href="/" size="sm" iconSize={22} />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 12 }}>
          © {new Date().getFullYear()} ConectAr Talento. Todos los derechos reservados.
          &nbsp;·&nbsp;
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacidad</Link>
          &nbsp;·&nbsp;
          <Link href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Términos</Link>
        </p>
      </footer>
    </div>
  )
}
