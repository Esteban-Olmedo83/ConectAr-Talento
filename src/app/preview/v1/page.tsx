'use client'

import React from 'react'

// ─── Brand tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#0B0B14',
  surface: '#13131F',
  accent: '#5D50D6',
  accent2: '#8B7EFF',
  border: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.45)',
  dim: 'rgba(255,255,255,0.65)',
}

// ─── Print styles injected via a <style> tag ──────────────────────────────────
const PRINT_CSS = `
@media print {
  @page { size: A4; margin: 1.5cm 1.8cm; }

  body { background: #fff !important; color: #111 !important; }

  #sticky-header { display: none !important; }
  #print-header  { display: flex !important; }

  * {
    background: transparent !important;
    color: #111 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    text-shadow: none !important;
  }

  #client-hero { background: #5D50D6 !important; color: #fff !important; }
  #client-hero * { color: #fff !important; }

  .kpi-card { border: 1px solid #ddd !important; }

  .funnel-track { background: #e5e7eb !important; }
  .funnel-bar   { opacity: 1 !important; }

  .source-row-bg  { background: #f3f4f6 !important; }
  .source-bar-bg  { background: #e5e7eb !important; }

  table { border-collapse: collapse !important; }
  thead tr { background: #f3f4f6 !important; }
  tbody tr:nth-child(even) { background: #f9fafb !important; }
  td, th { border-bottom: 1px solid #e5e7eb !important; color: #111 !important; }

  .badge { border: 1px solid #ccc !important; background: #f0f0f0 !important; color: #333 !important; }

  #recommendations { page-break-before: always; }
  .rec-card { border: 1px solid #ddd !important; border-left-width: 4px !important; }

  footer {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    border-top: 1px solid #ddd !important;
    padding: 12px 28px !important;
    background: #fff !important;
  }
}
`

// ─── Tiny icon components (inline SVG, no external deps) ─────────────────────
function IconBriefcase({ size = 22, color = C.accent2 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2 12h20" />
    </svg>
  )
}

function IconClock({ size = 22, color = '#60A5FA' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function IconStar({ size = 22, color = '#FBBF24' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function IconTrendingUp({ size = 22, color = '#34D399' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function IconPrinter({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

function IconChevronDown({ size = 14, color = C.muted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function IconAlertTriangle({ size = 20, color = '#FBBF24' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconCheckCircle({ size = 20, color = '#34D399' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function IconInfo({ size = 20, color = '#60A5FA' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FUNNEL = [
  { label: 'Nuevas Vacantes', count: 47, pct: 100, color: '#5D50D6' },
  { label: 'En Proceso',      count: 31, pct: 66,  color: '#3B82F6' },
  { label: 'Entrevistas',     count: 18, pct: 38,  color: '#F59E0B' },
  { label: 'Oferta Enviada',  count: 8,  pct: 17,  color: '#10B981' },
  { label: 'Contratado',      count: 4,  pct: 8,   color: '#059669' },
]

const SOURCES = [
  { label: 'LinkedIn',  pct: 38, color: '#3B82F6' },
  { label: 'Portal',    pct: 22, color: '#8B7EFF' },
  { label: 'Referidos', pct: 18, color: '#34D399' },
  { label: 'Indeed',    pct: 14, color: '#F97316' },
  { label: 'Otros',     pct: 8,  color: '#6B7280' },
]

type Stage = 'En Proceso' | 'Entrevistas' | 'Oferta Enviada' | 'Contratado' | 'Nuevas Vacantes'

const STAGE_COLORS: Record<Stage, { bg: string; color: string }> = {
  'En Proceso':     { bg: 'rgba(59,130,246,0.18)',  color: '#93C5FD' },
  'Entrevistas':    { bg: 'rgba(245,158,11,0.18)',  color: '#FCD34D' },
  'Oferta Enviada': { bg: 'rgba(16,185,129,0.18)',  color: '#6EE7B7' },
  'Contratado':     { bg: 'rgba(5,150,105,0.22)',   color: '#A7F3D0' },
  'Nuevas Vacantes':{ bg: 'rgba(93,80,214,0.18)',   color: '#8B7EFF' },
}

interface Candidate {
  name: string
  role: string
  stage: Stage
  score: number
  source: string
  date: string
}

const CANDIDATES: Candidate[] = [
  { name: 'Valentina Herrera',  role: 'Analista de Datos',    stage: 'Entrevistas',    score: 91, source: 'LinkedIn',  date: '02 jun 2026' },
  { name: 'Matías Domínguez',   role: 'Dev Backend Senior',   stage: 'Oferta Enviada', score: 88, source: 'Referidos', date: '29 may 2026' },
  { name: 'Sofía Castillo',     role: 'UX Designer',          stage: 'En Proceso',     score: 79, source: 'Portal',    date: '04 jun 2026' },
  { name: 'Leandro Ríos',       role: 'DevOps Engineer',      stage: 'Contratado',     score: 95, source: 'LinkedIn',  date: '25 may 2026' },
  { name: 'Camila Fernández',   role: 'Product Manager',      stage: 'Entrevistas',    score: 84, source: 'Indeed',    date: '01 jun 2026' },
  { name: 'Nicolás Gutiérrez',  role: 'Analista de Sistemas', stage: 'En Proceso',     score: 72, source: 'Portal',    date: '05 jun 2026' },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function Initials({ letters, size = 40, bg = C.accent, fontSize = 15 }: {
  letters: string; size?: number; bg?: string; fontSize?: number
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize, color: '#fff', flexShrink: 0, letterSpacing: '0.04em',
    }}>
      {letters}
    </div>
  )
}

function KpiCard({ icon, value, label, detail, iconBg }: {
  icon: React.ReactNode; value: string; label: string; detail: string; iconBg: string
}) {
  return (
    <div className="kpi-card" style={{
      flex: 1, minWidth: 0,
      background: C.surface, borderRadius: 12, padding: '20px 22px',
      border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{detail}</div>
      </div>
    </div>
  )
}

function FunnelChart() {
  return (
    <div style={{
      background: C.surface, borderRadius: 12, padding: '22px 24px',
      border: `1px solid ${C.border}`, flex: '0 0 60%', minWidth: 0,
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Embudo de selección
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {FUNNEL.map((row) => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 134, fontSize: 12, color: C.dim, flexShrink: 0 }}>{row.label}</div>
            <div className="funnel-track" style={{
              flex: 1, height: 10, borderRadius: 6,
              background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
            }}>
              <div className="funnel-bar" style={{
                width: `${row.pct}%`, height: '100%', borderRadius: 6,
                background: row.color,
              }} />
            </div>
            <div style={{ width: 26, fontSize: 12, fontWeight: 700, color: C.text, textAlign: 'right', flexShrink: 0 }}>
              {row.count}
            </div>
            <div style={{ width: 36, fontSize: 11, color: C.muted, textAlign: 'right', flexShrink: 0 }}>
              {row.pct}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SourcesChart() {
  return (
    <div style={{
      background: C.surface, borderRadius: 12, padding: '22px 24px',
      border: `1px solid ${C.border}`, flex: '0 0 40%', minWidth: 0,
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        Fuentes de candidatos
      </div>

      {/* Donut via conic-gradient */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: `conic-gradient(
            #3B82F6 0% 38%,
            #8B7EFF 38% 60%,
            #34D399 60% 78%,
            #F97316 78% 92%,
            #6B7280 92% 100%
          )`,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 22,
            background: C.surface, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>47</div>
              <div style={{ fontSize: 9, color: C.muted, lineHeight: 1.2 }}>total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SOURCES.map((s) => (
          <div key={s.label} className="source-row-bg" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: C.dim, flex: 1 }}>{s.label}</div>
            <div className="source-bar-bg" style={{
              width: 70, height: 6, borderRadius: 4,
              background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
            }}>
              <div style={{ width: `${s.pct}%`, height: '100%', borderRadius: 4, background: s.color }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, width: 34, textAlign: 'right' }}>{s.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CandidatesTable() {
  return (
    <div style={{
      background: C.surface, borderRadius: 12,
      border: `1px solid ${C.border}`, overflow: 'hidden',
    }}>
      <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Candidatos en proceso</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              {['Candidato', 'Vacante', 'Etapa', 'Score ATS', 'Fuente', 'Fecha'].map((h) => (
                <th key={h} style={{
                  padding: '10px 16px', textAlign: 'left', fontSize: 11,
                  fontWeight: 700, color: C.muted, letterSpacing: '0.06em',
                  textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`,
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CANDIDATES.map((c, i) => {
              const stageStyle = STAGE_COLORS[c.stage]
              const scoreColor = c.score >= 85 ? '#34D399' : c.score >= 70 ? '#FBBF24' : '#F87171'
              const initials = c.name.split(' ').map(n => n[0]).join('').slice(0, 2)
              const avatarBg = `hsl(${(i * 47) % 360}, 50%, 35%)`
              return (
                <tr key={c.name} style={{
                  background: i % 2 === 1 ? 'rgba(255,255,255,0.025)' : 'transparent',
                }}>
                  <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Initials letters={initials} size={32} fontSize={11} bg={avatarBg} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap' }}>
                        {c.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.dim, whiteSpace: 'nowrap' }}>{c.role}</span>
                  </td>
                  <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                    <span className="badge" style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                      background: stageStyle.bg, color: stageStyle.color, whiteSpace: 'nowrap',
                    }}>
                      {c.stage}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 50, height: 5, borderRadius: 4,
                        background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${c.score}%`, height: '100%', borderRadius: 4,
                          background: scoreColor,
                        }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor }}>{c.score}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.dim }}>{c.source}</span>
                  </td>
                  <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>{c.date}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Recommendations() {
  const recs: Array<{
    icon: React.ReactNode
    borderColor: string
    title: string
    text: string
  }> = [
    {
      icon: <IconAlertTriangle size={20} color="#FBBF24" />,
      borderColor: '#FBBF24',
      title: 'Acelerar etapa de entrevistas',
      text: '13 candidatos llevan más de 7 días en espera. Reprogramar entrevistas puede evitar pérdida de talento calificado.',
    },
    {
      icon: <IconCheckCircle size={20} color="#34D399" />,
      borderColor: '#34D399',
      title: 'Score ATS alto',
      text: 'El 74% de los candidatos supera 75 puntos. La calidad del sourcing es excelente este trimestre.',
    },
    {
      icon: <IconInfo size={20} color="#60A5FA" />,
      borderColor: '#60A5FA',
      title: 'Diversificar canales',
      text: 'LinkedIn concentra el 38% del flujo. Se recomienda explorar Bumeran y ZonaJobs para ampliar la cobertura.',
    },
  ]

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {recs.map((r) => (
        <div key={r.title} className="rec-card" style={{
          flex: 1, minWidth: 0,
          background: C.surface, borderRadius: 12,
          border: `1px solid ${C.border}`,
          borderLeft: `4px solid ${r.borderColor}`,
          padding: '18px 20px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: `${r.borderColor}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {r.icon}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.title}</span>
          </div>
          <p style={{ fontSize: 12, color: C.dim, lineHeight: 1.65, margin: 0 }}>{r.text}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ReportV1() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div style={{
        minHeight: '100vh',
        background: C.bg,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>

        {/* PRINT-ONLY HEADER */}
        <div id="print-header" style={{
          display: 'none',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '0 0 16px', borderBottom: '2px solid #5D50D6', marginBottom: 24,
        }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>ConectAr Talento — Informe de Reclutamiento</span>
          <span style={{ fontSize: 12 }}>Banco Regional del Norte · Último trimestre</span>
          <span style={{ fontSize: 12 }}>6 jun 2026</span>
        </div>

        {/* STICKY HEADER */}
        <header id="sticky-header" style={{
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(11,11,20,0.82)',
          borderBottom: `1px solid ${C.border}`,
          padding: '0 28px',
          height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          {/* Left */}
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', flexShrink: 0 }}>
            Informe de Reclutamiento
          </div>

          {/* Center: client pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.07)', borderRadius: 24,
            border: `1px solid ${C.border}`,
            padding: '5px 12px 5px 8px',
            cursor: 'pointer', userSelect: 'none',
          }}>
            <Initials letters="BR" size={26} fontSize={10} bg={C.accent} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Banco Regional del Norte</span>
            <IconChevronDown size={13} color={C.muted} />
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.07)', borderRadius: 20,
              border: `1px solid ${C.border}`,
              padding: '5px 12px',
              cursor: 'pointer', userSelect: 'none',
            }}>
              <span style={{ fontSize: 12, color: C.dim }}>Último trimestre</span>
              <IconChevronDown size={12} color={C.muted} />
            </div>

            <button
              onClick={handlePrint}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: C.accent, borderRadius: 20,
                border: 'none', padding: '7px 14px',
                cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 600,
              }}
            >
              <IconPrinter size={15} color="#fff" />
              Imprimir
            </button>
          </div>
        </header>

        {/* CLIENT HERO BAND */}
        <div id="client-hero" style={{
          background: `linear-gradient(90deg, ${C.accent} 0%, #7C6BE8 100%)`,
          padding: '0 28px',
          height: 80,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(255,255,255,0.22)',
              border: '2px solid rgba(255,255,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '0.04em',
              flexShrink: 0,
            }}>
              BR
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Banco Regional del Norte</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 }}>Tecnología · Activo</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>Generado el 6 jun 2026</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 }}>Por Esteban Olmedo</div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main style={{ padding: '28px 28px 0' }}>

          {/* KPI ROW */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <KpiCard
              icon={<IconBriefcase size={22} color={C.accent2} />}
              iconBg="rgba(139,126,255,0.15)"
              value="47"
              label="Postulaciones"
              detail="Total del trimestre"
            />
            <KpiCard
              icon={<IconClock size={22} color="#60A5FA" />}
              iconBg="rgba(96,165,250,0.15)"
              value="18 días"
              label="Tiempo Promedio"
              detail="Desde postulación a oferta"
            />
            <KpiCard
              icon={<IconStar size={22} color="#FBBF24" />}
              iconBg="rgba(251,191,36,0.15)"
              value="82%"
              label="Score ATS"
              detail="Promedio de candidatos activos"
            />
            <KpiCard
              icon={<IconTrendingUp size={22} color="#34D399" />}
              iconBg="rgba(52,211,153,0.15)"
              value="34%"
              label="Conversión"
              detail="Postulación → contratación"
            />
          </div>

          {/* CHARTS ROW */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <FunnelChart />
            <SourcesChart />
          </div>

          {/* CANDIDATES TABLE */}
          <div style={{ marginBottom: 24 }}>
            <CandidatesTable />
          </div>

          {/* SECTION LABEL */}
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.muted,
            letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 14,
          }}>
            Recomendaciones
          </div>

          {/* RECOMMENDATIONS */}
          <div id="recommendations" style={{ marginBottom: 0 }}>
            <Recommendations />
          </div>

        </main>

        {/* FOOTER */}
        <footer style={{
          marginTop: 40,
          padding: '24px 28px',
          borderTop: `1px solid ${C.border}`,
          background: C.surface,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 13, color: '#fff',
            }}>
              C
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>ConectAr Talento</span>
          </div>

          {/* Timestamp */}
          <div style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>
            Informe generado el 6 de junio de 2026 a las 11:42 AM
          </div>

          {/* User card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 12, color: '#fff', flexShrink: 0,
            }}>
              EO
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Esteban Olmedo</div>
              <div style={{ fontSize: 11, color: C.muted }}>Recruiter Senior</div>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
