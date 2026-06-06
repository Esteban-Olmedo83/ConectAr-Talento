'use client'

export default function ReportV3() {
  // ── Sparkline SVG helper ─────────────────────────────────────────────────
  const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const w = 64, h = 24, pad = 2
    const pts = data
      .map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2)
        const y = h - pad - ((v - min) / range) * (h - pad * 2)
        return `${x},${y}`
      })
      .join(' ')
    return (
      <svg width={w} height={h} style={{ overflow: 'visible' }}>
        <polyline
          points={pts} fill="none" stroke={color}
          strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.7"
        />
        {data.map((v, i) => {
          const x = pad + (i / (data.length - 1)) * (w - pad * 2)
          const y = h - pad - ((v - min) / range) * (h - pad * 2)
          return <circle key={i} cx={x} cy={y} r="2" fill={color} opacity={i === data.length - 1 ? 1 : 0.4} />
        })}
      </svg>
    )
  }

  // ── Line chart SVG ───────────────────────────────────────────────────────
  const LineChart = () => {
    const data = [3, 5, 4, 8, 6, 9, 7, 11]
    const labels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']
    const w = 100, h = 100, padL = 6, padR = 4, padT = 4, padB = 16
    const maxVal = 12
    const pts = data
      .map((v, i) => {
        const x = padL + (i / (data.length - 1)) * (w - padL - padR)
        const y = padT + ((maxVal - v) / maxVal) * (h - padT - padB)
        return `${x},${y}`
      })
      .join(' ')
    const lastX = padL + ((data.length - 1) / (data.length - 1)) * (w - padL - padR)
    const areaPts = `${padL},${h - padB} ${pts} ${lastX},${h - padB}`
    const gridLines = [0, 3, 6, 9, 12]
    return (
      <svg viewBox="0 0 100 100" width="100%" height="180" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="areaGradV3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5D50D6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5D50D6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map(g => {
          const y = padT + ((maxVal - g) / maxVal) * (h - padT - padB)
          return (
            <g key={g}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <text x={padL - 1} y={y + 1} fontSize="4" fill="rgba(255,255,255,0.25)" textAnchor="end">{g}</text>
            </g>
          )
        })}
        {data.map((_, i) => {
          const x = padL + (i / (data.length - 1)) * (w - padL - padR)
          return (
            <text key={i} x={x} y={h - padB + 6} fontSize="4" fill="rgba(255,255,255,0.3)" textAnchor="middle">
              {labels[i]}
            </text>
          )
        })}
        <polygon points={areaPts} fill="url(#areaGradV3)" />
        <polyline points={pts} fill="none" stroke="#8B7EFF" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((v, i) => {
          const x = padL + (i / (data.length - 1)) * (w - padL - padR)
          const y = padT + ((maxVal - v) / maxVal) * (h - padT - padB)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="2" fill="#8B7EFF" stroke="#151525" strokeWidth="0.8" />
              {i === data.length - 1 && (
                <text x={x} y={y - 3} fontSize="4" fill="#8B7EFF" textAnchor="middle" fontWeight="bold">{v}</text>
              )}
            </g>
          )
        })}
      </svg>
    )
  }

  // ── Donut chart using conic-gradient ─────────────────────────────────────
  const DonutChart = () => {
    const slices = [
      { label: 'LinkedIn', pct: 35, color: '#5D50D6' },
      { label: 'Portal', pct: 28, color: '#3b82f6' },
      { label: 'Referidos', pct: 20, color: '#10b981' },
      { label: 'Indeed', pct: 12, color: '#f59e0b' },
      { label: 'Otros', pct: 5, color: '#6b7280' },
    ]
    let acc = 0
    const stops = slices
      .map(s => {
        const start = acc
        acc += s.pct
        return `${s.color} ${start}% ${acc}%`
      })
      .join(', ')
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            background: `conic-gradient(${stops})`,
            position: 'relative',
            boxShadow: '0 0 30px rgba(93,80,214,0.3)',
          }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 80, height: 80, borderRadius: '50%',
              background: '#151525',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>61</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>total</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {slices.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{s.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{s.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Circular progress ring ────────────────────────────────────────────────
  const RingScore = ({ score, color }: { score: number; color: string }) => {
    const r = 26
    const circ = 2 * Math.PI * r
    const dash = (score / 100) * circ
    return (
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        />
        <text
          x="36" y="36" textAnchor="middle" dominantBaseline="central"
          style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}
          fontSize="13" fontWeight="900" fill="white"
        >{score}%</text>
      </svg>
    )
  }

  // ── Mini progress bar ─────────────────────────────────────────────────────
  const MiniBar = ({ value, color }: { value: number; color: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        flex: 1, height: 5, borderRadius: 3,
        background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
      }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', minWidth: 28, textAlign: 'right' }}>{value}%</span>
    </div>
  )

  const printCSS = `
    @media print {
      @page { size: A4 portrait; margin: 1.2cm; }
      body { background: #fff !important; color: #1a1a2e !important; }
      .v3-sticky-hdr { display: none !important; }
      .v3-print-hdr { display: flex !important; }
      .v3-no-print { display: none !important; }
      .v3-root { background: #fff !important; }
      .v3-card {
        background: #fff !important;
        border: 1px solid #e5e7eb !important;
        box-shadow: none !important;
      }
      .v3-stat { background: #f9fafb !important; border: 1px solid #e5e7eb !important; }
      .v3-pipe-box { background: #f3f4f6 !important; border: 1px solid #d1d5db !important; }
      .v3-text-muted { color: #6b7280 !important; }
      .v3-text-main { color: #1a1a2e !important; }
      .v3-rec { page-break-before: always; }
      .v3-footer { background: #f9fafb !important; border-top: 1px solid #e5e7eb !important; }
    }
  `

  // ── Pipeline data ─────────────────────────────────────────────────────────
  const pipeline = [
    { stage: 'Nuevas Vacantes', count: 61, pct: 100, color: '#5D50D6', bg: 'rgba(93,80,214,0.15)', icon: '📋', conv: '' },
    { stage: 'En Proceso', count: 43, pct: 70, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: '⚙️', conv: '70%' },
    { stage: 'Entrevistas', count: 28, pct: 46, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: '🎯', conv: '65%' },
    { stage: 'Oferta', count: 12, pct: 20, color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: '📄', conv: '43%' },
    { stage: 'Contratado', count: 5, pct: 8, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', icon: '✅', conv: '42%' },
  ]

  // ── Table data ────────────────────────────────────────────────────────────
  const tableRows = [
    { role: 'Analista de Riesgo', cands: 18, ats: 82, days: 34, status: 'urgent', prog: 70, barColor: '#5D50D6' },
    { role: 'Desarrollador Senior', cands: 14, ats: 76, days: 31, status: 'urgent', prog: 55, barColor: '#3b82f6' },
    { role: 'CFO', cands: 8, ats: 91, days: 42, status: 'urgent', prog: 40, barColor: '#f59e0b' },
    { role: 'Analista Financiero Jr', cands: 11, ats: 74, days: 18, status: 'open', prog: 60, barColor: '#5D50D6' },
    { role: 'Gerente de Compliance', cands: 6, ats: 88, days: 22, status: 'closing', prog: 85, barColor: '#10b981' },
    { role: 'Data Analyst', cands: 4, ats: 79, days: 12, status: 'open', prog: 30, barColor: '#8B7EFF' },
  ]

  // ── Candidate data ────────────────────────────────────────────────────────
  const candidates = [
    { initials: 'ML', name: 'Martina López', vacancy: 'CFO', score: 91, stage: 'Entrevista Final', source: 'LinkedIn', color: '#5D50D6', gradient: 'linear-gradient(135deg,#5D50D6,#8B7EFF)' },
    { initials: 'CR', name: 'Carlos Ríos', vacancy: 'Gerente Compliance', score: 88, stage: 'Oferta', source: 'Referido', color: '#10b981', gradient: 'linear-gradient(135deg,#059669,#10b981)' },
    { initials: 'SP', name: 'Sofía Paredes', vacancy: 'Analista de Riesgo', score: 82, stage: 'Entrevistas', source: 'Indeed', color: '#f59e0b', gradient: 'linear-gradient(135deg,#d97706,#fbbf24)' },
  ]

  // ── Insight cards ─────────────────────────────────────────────────────────
  const insights = [
    { icon: '⚡', border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', title: 'Pipeline saludable', body: 'Conversión del 41% supera el benchmark de industria del 35%. El embudo está funcionando eficientemente para el sector financiero.', tag: 'Positivo', tagColor: '#10b981' },
    { icon: '🔥', border: '#ef4444', bg: 'rgba(239,68,68,0.08)', title: 'Urgencia en 3 vacantes', body: 'Analista de Riesgo (34d), Dev Senior (31d) y CFO (42d) superan los 30 días de apertura. Requieren acción inmediata.', tag: 'Acción requerida', tagColor: '#ef4444' },
    { icon: '💡', border: '#3b82f6', bg: 'rgba(59,130,246,0.08)', title: 'Canal referidos subutilizado', body: 'Solo representa el 20% del sourcing actual. Los referidos en finanzas tienen un ROI 3x superior vs. LinkedIn y un 40% más de retención.', tag: 'Oportunidad', tagColor: '#3b82f6' },
  ]

  // ── Stat cards data ───────────────────────────────────────────────────────
  const statCards = [
    { value: '61', label: 'Postulaciones', trend: '+8 vs mes ant.', color: '#5D50D6', sparkData: [38, 42, 45, 50, 53, 55, 59, 61] },
    { value: '15', label: 'Días promedio', trend: '−3 días', color: '#3b82f6', sparkData: [22, 20, 19, 19, 18, 17, 16, 15] },
    { value: '79%', label: 'ATS Score', trend: '↑4% vs anterior', color: '#f59e0b', sparkData: [60, 65, 68, 70, 71, 74, 76, 79] },
    { value: '41%', label: 'Conversión', trend: '↑6% vs anterior', color: '#10b981', sparkData: [28, 30, 32, 35, 36, 38, 39, 41] },
  ]

  const cardStyle = {
    borderRadius: 16,
    background: 'linear-gradient(135deg, #151525 0%, #1a1530 100%)',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printCSS }} />
      <div
        className="v3-root"
        style={{ background: '#0D0D1A', minHeight: '100vh', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", color: 'white' }}
      >
        {/* ── PRINT HEADER ─────────────────────────────────────────────── */}
        <div className="v3-print-hdr" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 16px', borderBottom: '2px solid #5D50D6', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#5D50D6,#8B7EFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>◆</div>
            <span style={{ fontWeight: 900, fontSize: 15, color: '#1a1a2e' }}>ConectAr Talento</span>
          </div>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Informe Confidencial · Junio 2026</span>
        </div>

        {/* ── STICKY HEADER ────────────────────────────────────────────── */}
        <header
          className="v3-sticky-hdr"
          style={{ position: 'sticky', top: 0, zIndex: 100, height: 56, background: 'rgba(13,13,26,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(93,80,214,0.2)', display: 'flex', alignItems: 'center' }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg,#5D50D6,#8B7EFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 900 }}>◆</div>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>ConectAr Talento</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16 }}>/</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Informes</span>
            </div>

            {/* Center: client pill */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 8px', borderRadius: 100, background: 'rgba(93,80,214,0.12)', border: '1px solid rgba(93,80,214,0.4)', boxShadow: '0 0 12px rgba(93,80,214,0.15)', cursor: 'pointer', color: 'white' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#5D50D6,#8B7EFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: 'white', flexShrink: 0 }}>GI</div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Grupo Inversiones Patagonia</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: 2 }}>▾</span>
              </button>
            </div>

            {/* Right: period + print */}
            <div className="v3-no-print" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
              {['Mes actual ▾', 'Trimestre ▾'].map(label => (
                <button key={label} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>{label}</button>
              ))}
              <button
                onClick={() => typeof window !== 'undefined' && window.print()}
                title="Imprimir informe"
                style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
              >🖨</button>
            </div>
          </div>
        </header>

        {/* ── MAIN ─────────────────────────────────────────────────────── */}
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px' }}>

          {/* PAGE TITLE */}
          <div style={{ padding: '32px 0 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 className="v3-text-main" style={{ fontSize: 36, fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Informe de Reclutamiento
              </h1>
              <p className="v3-text-muted" style={{ marginTop: 8, fontSize: 14, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.01em' }}>
                Grupo Inversiones Patagonia &nbsp;·&nbsp; Junio 2026 &nbsp;·&nbsp; Confidencial
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', flexShrink: 0, marginTop: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>✓ Datos actualizados hace 2 min</span>
            </div>
          </div>

          {/* STAT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            {statCards.map((card, i) => (
              <div key={i} className="v3-stat v3-card" style={{ ...cardStyle, padding: '18px 18px 14px', borderLeft: `3px solid ${card.color}`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '50%', background: `${card.color}08`, transform: 'translate(20px,-20px)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div className="v3-text-muted" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{card.label}</div>
                    <div className="v3-text-main" style={{ fontSize: 30, fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>{card.value}</div>
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <Sparkline data={card.sparkData} color={card.color} />
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 100 }}>
                  ▲ {card.trend}
                </div>
              </div>
            ))}
          </div>

          {/* PIPELINE */}
          <div className="v3-card" style={{ ...cardStyle, padding: '22px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 className="v3-text-main" style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>Estado del Pipeline</h2>
              <span className="v3-text-muted" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Total de 61 candidatos · Junio 2026</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {pipeline.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  {i > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, padding: '0 4px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{s.conv}</span>
                      <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.25)', lineHeight: 1 }}>›</span>
                    </div>
                  )}
                  <div className="v3-pipe-box" style={{ flex: 1, padding: '14px 10px', borderRadius: 10, background: s.bg, border: `1px solid ${s.color}40`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: `${s.pct}%`, background: s.color, borderRadius: 2 }} />
                    <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 4, lineHeight: 1.2 }}>{s.stage}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: 'white', lineHeight: 1 }}>{s.count}</div>
                    <div style={{ fontSize: 11, color: s.color, fontWeight: 700, marginTop: 2 }}>{s.pct}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2-COLUMN: LINE CHART + DONUT */}
          <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 14, marginBottom: 20 }}>
            <div className="v3-card" style={{ ...cardStyle, padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 className="v3-text-main" style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>Actividad Semanal</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 2, background: '#8B7EFF', borderRadius: 2 }} />
                  <span className="v3-text-muted" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Entrevistas realizadas</span>
                </div>
              </div>
              <LineChart />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span className="v3-text-muted" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Semana 1</span>
                <span className="v3-text-muted" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Semana 8</span>
              </div>
            </div>
            <div className="v3-card" style={{ ...cardStyle, padding: '22px 24px' }}>
              <h2 className="v3-text-main" style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: '0 0 16px' }}>Distribución de Fuentes</h2>
              <DonutChart />
            </div>
          </div>

          {/* PERFORMANCE TABLE */}
          <div className="v3-card" style={{ ...cardStyle, padding: '22px 0', marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ padding: '0 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="v3-text-main" style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>Desempeño por Posición</h2>
              <span className="v3-text-muted" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>6 vacantes activas</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Vacante', 'Candidatos', 'ATS Prom', 'Días Abierta', 'Estado', 'Progreso'].map(h => (
                    <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 24px' }}>
                      <div className="v3-text-main" style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{row.role}</div>
                      <div className="v3-text-muted" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Grupo Inversiones Patagonia</div>
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      <span className="v3-text-main" style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{row.cands}</span>
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: row.ats >= 80 ? '#10b981' : row.ats >= 70 ? '#f59e0b' : '#ef4444' }}>{row.ats}%</span>
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: row.days > 30 ? '#ef4444' : row.days > 20 ? '#f59e0b' : 'rgba(255,255,255,0.7)' }}>{row.days}d</span>
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      {row.status === 'open' && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>Abierta</span>}
                      {row.status === 'urgent' && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>Urgente</span>}
                      {row.status === 'closing' && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>En cierre</span>}
                    </td>
                    <td style={{ padding: '12px 24px', minWidth: 120 }}>
                      <MiniBar value={row.prog} color={row.barColor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOP CANDIDATOS */}
          <div className="v3-card" style={{ ...cardStyle, padding: '22px 24px', marginBottom: 20 }}>
            <h2 className="v3-text-main" style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: '0 0 18px' }}>Top Candidatos por ATS Score</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {candidates.map((c, i) => (
                <div key={i} style={{ borderRadius: 12, padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: c.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'white', flexShrink: 0, boxShadow: `0 0 16px ${c.color}40` }}>{c.initials}</div>
                      <div>
                        <div className="v3-text-main" style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{c.name}</div>
                        <div className="v3-text-muted" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{c.vacancy}</div>
                      </div>
                    </div>
                    <RingScore score={c.score} color={c.color} />
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}35` }}>{c.stage}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>via {c.source}</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                    <span style={{ fontSize: 12, color: c.color, fontWeight: 600, cursor: 'pointer' }}>Ver perfil →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INSIGHTS / RECOMENDACIONES */}
          <div className="v3-rec" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>✨</span>
              <h2 className="v3-text-main" style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>Insights Clave</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {insights.map((r, i) => (
                <div key={i} style={{ borderRadius: 14, padding: '20px', background: r.bg, border: '1px solid rgba(255,255,255,0.06)', borderTop: `3px solid ${r.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 22 }}>{r.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: `${r.tagColor}18`, color: r.tagColor }}>{r.tag}</span>
                  </div>
                  <div className="v3-text-main" style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{r.title}</div>
                  <div className="v3-text-muted" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{r.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="v3-footer v3-card" style={{ ...cardStyle, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="v3-text-muted" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Generado por ConectAr Talento ATS</div>
              <div className="v3-text-muted" style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Este informe es confidencial y de uso exclusivo del cliente</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#5D50D6,#8B7EFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: 'white', boxShadow: '0 0 20px rgba(93,80,214,0.35)', flexShrink: 0 }}>EO</div>
              <div>
                <div className="v3-text-main" style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Esteban Olmedo</div>
                <div className="v3-text-muted" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Recruiter Senior</div>
                <div className="v3-text-muted" style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>conectar.rrhh.ar@gmail.com</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
