import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ConectAr Talento — ATS con IA para reclutadores de LATAM'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B0B14',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient blobs */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(93,80,214,0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,126,255,0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(93,80,214,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(93,80,214,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            zIndex: 1,
            padding: '0 80px',
            textAlign: 'center',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(93,80,214,0.15)',
              border: '1px solid rgba(93,80,214,0.35)',
              borderRadius: 99,
              padding: '8px 20px',
              color: '#8B7EFF',
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            🚀 Plataforma ATS · Latinoamérica
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-1px',
            }}
          >
            ConectAr{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8B7EFF, #e879f9)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Talento
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 26,
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 400,
              maxWidth: 700,
            }}
          >
            El talento que buscás, conectado en un solo lugar.
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              marginTop: 16,
            }}
          >
            {[
              ['2400+', 'Reclutadores'],
              ['85K+', 'CVs con IA'],
              ['18', 'Países LATAM'],
            ].map(([value, label]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(93,80,214,0.1)',
                  border: '1px solid rgba(93,80,214,0.2)',
                  borderRadius: 12,
                  padding: '12px 24px',
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 900, color: '#8B7EFF' }}>{value}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
