'use client'

import React, { useState } from 'react'

// ─── Colores y tokens ────────────────────────────────────────────────────────
const C = {
  accent:      '#5D50D6',
  accent2:     '#8B7EFF',
  accentLight: '#EDE9FF',
  bg:          '#F4F4F8',
  white:       '#ffffff',
  text:        '#1a1a2e',
  muted:       '#6b7280',
  border:      '#e5e7eb',
  green:       '#16a34a',
  greenBg:     '#dcfce7',
  blue:        '#2563eb',
  blueBg:      '#dbeafe',
  gray:        '#6b7280',
  grayBg:      '#f3f4f6',
  red:         '#dc2626',
} as const

// ─── Datos mock ──────────────────────────────────────────────────────────────
const VACANTES = [
  { posicion: 'Dev Backend Sr',  depto: 'Ingeniería', estado: 'Abierta',    candidatos: 14, ats: 72, dias: 18 },
  { posicion: 'Product Manager', depto: 'Producto',   estado: 'En Proceso', candidatos:  7, ats: 81, dias: 11 },
  { posicion: 'UX Designer',     depto: 'Diseño',     estado: 'En Proceso', candidatos:  5, ats: 79, dias:  8 },
  { posicion: 'Data Analyst',    depto: 'Analytics',  estado: 'Abierta',    candidatos:  4, ats: 68, dias: 22 },
  { posicion: 'Scrum Master',    depto: 'Ingeniería', estado: 'Cerrada',    candidatos:  3, ats: 88, dias: 14 },
]

const CANDIDATOS = [
  { nombre: 'Valentina Morales',  vacante: 'Product Manager', etapa: 'Entrevista Final',  score: 88, fuente: 'LinkedIn' },
  { nombre: 'Matías Fernández',   vacante: 'Dev Backend Sr',  etapa: 'Revisión Técnica',  score: 74, fuente: 'Indeed'   },
  { nombre: 'Lucía Herrera',      vacante: 'UX Designer',     etapa: 'Entrevista RR.HH.', score: 82, fuente: 'Referido' },
  { nombre: 'Sebastián Castro',   vacante: 'Data Analyst',    etapa: 'Screening',         score: 65, fuente: 'Portal'   },
  { nombre: 'Camila Rodríguez',   vacante: 'Dev Backend Sr',  etapa: 'Revisión Técnica',  score: 70, fuente: 'LinkedIn' },
]

const FUNNEL = [
  { label: 'Nuevas',      count: 33, color: '#5D50D6', pct: 100 },
  { label: 'En Proceso',  count: 21, color: '#7C6FE8', pct:  64 },
  { label: 'Entrevistas', count: 12, color: '#9D91FF', pct:  36 },
  { label: 'Oferta',      count:  5, color: '#BDB5FF', pct:  15 },
  { label: 'Contratado',  count:  2, color: '#DDD9FF', pct:   6 },
]

const CANALES = [
  { label: 'LinkedIn',    pct: 40, color: '#5D50D6' },
  { label: 'Portal propio', pct: 25, color: '#7C6FE8' },
  { label: 'Referidos',   pct: 20, color: '#9D91FF' },
  { label: 'Indeed',      pct: 10, color: '#BDB5FF' },
  { label: 'Otros',       pct:  5, color: '#DDD9FF' },
]

// ─── Subcomponentes ──────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.white,
      borderRadius: 8,
      border: `1px solid ${C.border}`,
      marginBottom: 20,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: '-0.3px' }}>
        {children}
      </h2>
    </div>
  )
}

function StatusBadge({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Abierta':    { bg: C.greenBg, color: C.green },
    'En Proceso': { bg: C.blueBg,  color: C.blue  },
    'Cerrada':    { bg: C.grayBg,  color: C.gray  },
  }
  const s = map[estado] ?? { bg: C.grayBg, color: C.gray }
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      borderRadius: 20,
      padding: '2px 10px',
      fontSize: 12,
      fontWeight: 600,
    }}>
      {estado}
    </span>
  )
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? C.green : score >= 70 ? C.accent : C.red
  return (
    <span style={{
      background: color + '18',
      color,
      borderRadius: 20,
      padding: '2px 10px',
      fontSize: 12,
      fontWeight: 700,
    }}>
      {score}%
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 6, fontSize: 13 }}>
      <span style={{ color: C.muted, minWidth: 96 }}>{label}:</span>
      <span style={{ fontWeight: 600, color: C.text }}>{value}</span>
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function ReportV2() {
  const [period, setPeriod] = useState('Este mes')

  return (
    <>
      {/* ── Print + base styles ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; }

        .screen-header { display: flex !important; }
        .print-header  { display: none !important; }

        @media print {
          @page { size: A4; margin: 1.5cm; }

          body { background: #fff !important; }

          .screen-header { display: none !important; }
          .print-header  { display: flex !important; }
          .no-print      { display: none !important; }

          .report-card   { box-shadow: none !important; border: 1px solid #d1d5db !important; }

          .page-break    { page-break-before: always; }

          /* Force color printing for all colored elements */
          .funnel-band,
          .channel-fill,
          .kpi-highlighted,
          .rec-num-badge,
          .th-row,
          .status-pill,
          .score-pill-print {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" }}>

        {/* ══════════════════════════════════════════════════════════════
            STICKY HEADER — screen only
        ══════════════════════════════════════════════════════════════ */}
        <header className="screen-header no-print" style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: C.white,
          borderBottom: `1px solid ${C.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          padding: '0 28px',
          height: 58,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: C.accent, letterSpacing: '-0.5px' }}>
              ConectAr<span style={{ color: C.text }}>Talento</span>
            </span>
            <span style={{ color: C.border, fontSize: 14, margin: '0 4px' }}>›</span>
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>Informes</span>
          </div>

          {/* Client pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: C.accentLight,
            border: `1px solid ${C.accent2}`,
            borderRadius: 24,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: C.accent,
            userSelect: 'none',
          }}>
            <span style={{
              width: 22, height: 22,
              background: C.accent,
              borderRadius: '50%',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>TG</span>
            TechGrow SA
            <span style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
          </div>

          {/* Period filter + export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 13,
                color: C.text,
                background: C.white,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option>Este mes</option>
              <option>Último trimestre</option>
              <option>Este año</option>
            </select>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: C.accent,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📄 Exportar PDF
            </button>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════════
            PRINT HEADER — print only
        ══════════════════════════════════════════════════════════════ */}
        <div className="print-header" style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 0 16px 0',
          borderBottom: `2px solid ${C.accent}`,
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36,
              background: C.accent,
              borderRadius: 8,
              color: '#fff',
              fontWeight: 800,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>CT</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.accent }}>ConectAr Talento</div>
              <div style={{ fontSize: 11, color: C.muted }}>Sistema ATS · Informes</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>TechGrow SA</div>
            <div style={{ fontSize: 11, color: C.muted }}>Junio 2026 · 06/06/2026</div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════════════════════════════ */}
        <main style={{ maxWidth: 980, margin: '0 auto', padding: '28px 24px 40px' }}>

          {/* ── 1. REPORT COVER ─────────────────────────────────────── */}
          <div className="report-card" style={{
            background: C.white,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            borderLeft: `4px solid ${C.accent}`,
            padding: '32px 36px',
            marginBottom: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: C.muted,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              ConectAr Talento · Sistema ATS
            </div>

            <h1 style={{
              margin: '0 0 6px 0',
              fontSize: 28,
              fontWeight: 800,
              color: C.accent,
              letterSpacing: '-1px',
              lineHeight: 1.15,
            }}>
              INFORME DE RECLUTAMIENTO
            </h1>

            <p style={{ margin: '0 0 28px 0', fontSize: 15, color: C.muted, fontWeight: 400 }}>
              Análisis del proceso · TechGrow SA · Junio 2026
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <InfoRow label="Cliente"   value="TechGrow SA" />
                <InfoRow label="Industria" value="Tecnología" />
                <InfoRow label="Período"   value="1 jun – 6 jun 2026" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <InfoRow label="Preparado por" value="Esteban Olmedo" />
                <InfoRow label="Cargo"         value="Recruiter Senior" />
                <InfoRow label="Fecha"         value="06/06/2026" />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: 0 }} />
          </div>

          {/* ── 2. RESUMEN EJECUTIVO ────────────────────────────────── */}
          <Card>
            <div style={{ padding: '24px 28px' }}>
              <SectionTitle icon="🔖">Resumen Ejecutivo</SectionTitle>

              <p style={{
                margin: '0 0 24px 0',
                fontSize: 14,
                lineHeight: 1.8,
                color: C.text,
                borderLeft: `3px solid ${C.accentLight}`,
                paddingLeft: 14,
              }}>
                Durante el período analizado, <strong>TechGrow SA</strong> registró{' '}
                <strong>33 postulaciones</strong> con un score ATS promedio de{' '}
                <strong>76%</strong>. La tasa de conversión del <strong>27%</strong> se
                encuentra por debajo del objetivo del 35%, requiriendo atención especial
                en las etapas intermedias del proceso de selección.
              </p>

              {/* KPI strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 1,
                background: C.border,
                borderRadius: 8,
                overflow: 'hidden',
              }}>
                {[
                  { val: '33',  label: 'Postulaciones', icon: '👥', highlight: true  },
                  { val: '22',  label: 'Días promedio',  icon: '⏱', highlight: false },
                  { val: '76%', label: 'Score ATS prom.',icon: '🎯', highlight: false },
                  { val: '27%', label: 'Conversión',     icon: '📈', highlight: false },
                ].map((k, i) => (
                  <div key={i} className={k.highlight ? 'kpi-highlighted' : ''} style={{
                    background: k.highlight ? C.accent : C.white,
                    color: k.highlight ? '#fff' : C.text,
                    padding: '18px 14px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{k.icon}</div>
                    <div style={{
                      fontSize: 26,
                      fontWeight: 800,
                      letterSpacing: '-1px',
                      lineHeight: 1,
                    }}>
                      {k.val}
                    </div>
                    <div style={{
                      fontSize: 11,
                      marginTop: 5,
                      color: k.highlight ? 'rgba(255,255,255,0.8)' : C.muted,
                      fontWeight: 500,
                    }}>
                      {k.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* ── 3. CHARTS SECTION ───────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            marginBottom: 20,
          }}>

            {/* Embudo */}
            <div className="report-card" style={{
              background: C.white,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              padding: '24px 28px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <SectionTitle icon="📊">Embudo del proceso</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                {FUNNEL.map((f, i) => (
                  <div key={i} className="funnel-band" style={{
                    width: `${Math.max(f.pct, 14)}%`,
                    background: f.color,
                    borderRadius:
                      i === 0
                        ? '6px 6px 0 0'
                        : i === FUNNEL.length - 1
                        ? '0 0 6px 6px'
                        : 0,
                    padding: '9px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minWidth: 130,
                  }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: i < 3 ? '#fff' : C.accent,
                      whiteSpace: 'nowrap',
                    }}>
                      {f.label}
                    </span>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: i < 3 ? '#fff' : C.accent,
                      background: 'rgba(255,255,255,0.22)',
                      borderRadius: 12,
                      padding: '1px 7px',
                    }}>
                      {f.count}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 11, color: C.muted, textAlign: 'center' }}>
                Tasa de paso promedio: <strong style={{ color: C.accent }}>62%</strong> entre etapas
              </div>
            </div>

            {/* Canales */}
            <div className="report-card" style={{
              background: C.white,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              padding: '24px 28px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <SectionTitle icon="📡">Canales de sourcing</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {CANALES.map((c, i) => (
                  <div key={i}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                      fontSize: 13,
                    }}>
                      <span style={{ fontWeight: 500, color: C.text }}>{c.label}</span>
                      <span style={{ fontWeight: 700, color: C.accent }}>{c.pct}%</span>
                    </div>
                    <div style={{
                      background: C.grayBg,
                      borderRadius: 4,
                      height: 10,
                      overflow: 'hidden',
                    }}>
                      <div className="channel-fill" style={{
                        width: `${c.pct}%`,
                        height: '100%',
                        background: c.color,
                        borderRadius: 4,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 11, color: C.muted }}>
                Total: 33 candidatos · Período: 1–6 jun 2026
              </div>
            </div>
          </div>

          {/* ── 4. TABLA VACANTES ────────────────────────────────────── */}
          <Card>
            <div style={{ padding: '24px 28px 16px' }}>
              <SectionTitle icon="📋">Estado de Vacantes</SectionTitle>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr className="th-row" style={{ background: C.accent }}>
                    {['Posición', 'Departamento', 'Estado', 'Candidatos', 'ATS Prom.', 'Días abierta'].map(h => (
                      <th key={h} style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 12,
                        letterSpacing: 0.3,
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {VACANTES.map((v, i) => (
                    <tr key={i} style={{
                      borderBottom: `1px solid ${C.border}`,
                      background: i % 2 === 1 ? '#FAFAFA' : C.white,
                    }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: C.text }}>{v.posicion}</td>
                      <td style={{ padding: '11px 16px', color: C.muted }}>{v.depto}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <StatusBadge estado={v.estado} />
                      </td>
                      <td style={{ padding: '11px 16px', color: C.text, textAlign: 'center' }}>{v.candidatos}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                        <ScorePill score={v.ats} />
                      </td>
                      <td style={{ padding: '11px 16px', color: C.muted, textAlign: 'center' }}>{v.dias}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 28px', borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.muted }}>
                5 vacantes · Última actualización: 06/06/2026 10:45 h
              </span>
            </div>
          </Card>

          {/* ── 5. TABLA CANDIDATOS ──────────────────────────────────── */}
          <div className="page-break">
            <Card>
              <div style={{ padding: '24px 28px 16px' }}>
                <SectionTitle icon="👤">Candidatos en Proceso</SectionTitle>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: C.accentLight }}>
                      {['Nombre', 'Vacante', 'Etapa', 'Score', 'Fuente'].map(h => (
                        <th key={h} style={{
                          padding: '9px 16px',
                          textAlign: 'left',
                          color: C.accent,
                          fontWeight: 700,
                          fontSize: 12,
                          borderBottom: `2px solid ${C.accent}`,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CANDIDATOS.map((c, i) => (
                      <tr key={i} style={{
                        borderBottom: `1px solid ${C.border}`,
                        background: i % 2 === 1 ? '#FAFAFA' : C.white,
                      }}>
                        <td style={{ padding: '11px 16px', fontWeight: 600, color: C.text }}>{c.nombre}</td>
                        <td style={{ padding: '11px 16px', color: C.muted }}>{c.vacante}</td>
                        <td style={{ padding: '11px 16px' }}>
                          <span className="status-pill" style={{
                            background: C.blueBg,
                            color: C.blue,
                            borderRadius: 20,
                            padding: '2px 10px',
                            fontSize: 12,
                            fontWeight: 500,
                          }}>
                            {c.etapa}
                          </span>
                        </td>
                        <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                          <ScorePill score={c.score} />
                        </td>
                        <td style={{ padding: '11px 16px', color: C.muted }}>{c.fuente}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '12px 28px', borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.muted }}>
                  5 candidatos activos · Datos en tiempo real
                </span>
              </div>
            </Card>
          </div>

          {/* ── 6. RECOMENDACIONES ───────────────────────────────────── */}
          <Card>
            <div style={{ padding: '24px 28px' }}>
              <SectionTitle icon="💡">Recomendaciones</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  {
                    n: 1,
                    title: 'Reducir tiempo en etapa "En Proceso"',
                    body: 'El promedio actual de 9 días en esta etapa supera el benchmark del sector (5 días). Se recomienda establecer SLAs de revisión y automatizar notificaciones a los evaluadores para agilizar la toma de decisiones.',
                  },
                  {
                    n: 2,
                    title: 'Fortalecer canal de referidos',
                    body: 'Los candidatos provenientes de referidos presentan un costo por contratación un 60% menor que otros canales, con un score ATS promedio de 84%. Implementar un programa formal de referidos con incentivos para empleados actuales.',
                  },
                  {
                    n: 3,
                    title: 'Revisar requisitos de "Dev Backend Sr"',
                    body: 'La tasa de rechazo del 78% en esta vacante indica posible desalineación entre el perfil solicitado y el mercado disponible. Se sugiere revisar los requisitos técnicos junto al área de Ingeniería para flexibilizar criterios no esenciales.',
                  },
                ].map(r => (
                  <div key={r.n} style={{
                    display: 'flex',
                    gap: 16,
                    padding: '16px 18px',
                    background: C.accentLight,
                    borderRadius: 8,
                    border: `1px solid ${C.accent2}33`,
                  }}>
                    <div className="rec-num-badge" style={{
                      width: 32,
                      height: 32,
                      minWidth: 32,
                      background: C.accent,
                      borderRadius: '50%',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 1,
                    }}>
                      {r.n}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 5 }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
                        {r.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

        </main>

        {/* ══════════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════════ */}
        <footer style={{
          background: C.grayBg,
          borderTop: `1px solid ${C.border}`,
          padding: '18px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: C.muted,
        }}>
          <div>
            <span style={{ fontWeight: 600, color: C.accent }}>ConectAr Talento</span>
            {' '}© 2026 — Sistema ATS
          </div>

          {/* User signature */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              background: C.accent,
              borderRadius: '50%',
              color: '#fff',
              fontWeight: 700,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>EO</div>
            <div>
              <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>Esteban Olmedo</div>
              <div style={{ color: C.muted, fontSize: 11 }}>
                Recruiter Senior · conectar.rrhh.ar@gmail.com
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
