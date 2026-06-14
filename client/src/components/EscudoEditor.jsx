import { useState, useCallback } from 'react'

const FORMAS_BASE = [
  { id: 'escudo1', label: 'CLÁSICO', path: 'M50,8 L92,22 L92,55 C92,75 72,90 50,96 C28,90 8,75 8,55 L8,22 Z' },
  { id: 'escudo2', label: 'REDONDEADO', path: 'M50,8 C50,8 90,18 90,18 L90,55 C90,78 72,91 50,97 C28,91 10,78 10,55 L10,18 Z' },
  { id: 'escudo3', label: 'HEXAGONAL', path: 'M50,6 L88,28 L88,72 L50,94 L12,72 L12,28 Z' },
  { id: 'escudo4', label: 'PUNTA', path: 'M50,8 L90,20 L90,58 L50,96 L10,58 L10,20 Z' },
  { id: 'escudo5', label: 'OVALADO', path: 'M50,8 C72,8 90,24 90,50 C90,75 72,94 50,94 C28,94 10,75 10,50 C10,24 28,8 50,8 Z' },
  { id: 'escudo6', label: 'MODERNO', path: 'M50,6 L92,20 L92,60 C92,78 75,90 50,97 C25,90 8,78 8,60 L8,20 Z' },
]

const DIVISIONES = [
  { id: 'ninguna', label: 'NINGUNA', render: () => null },
  { id: 'vertical', label: 'VERTICAL', render: (c1, c2) => <rect x="50" y="0" width="50" height="100" fill={c2} /> },
  { id: 'horizontal', label: 'HORIZONTAL', render: (c1, c2) => <rect x="0" y="50" width="100" height="50" fill={c2} /> },
  { id: 'diagonal', label: 'DIAGONAL', render: (c1, c2) => <polygon points="100,0 100,100 0,100" fill={c2} /> },
  { id: 'cuartos', label: 'CUARTOS', render: (c1, c2) => <><rect x="50" y="0" width="50" height="50" fill={c2} /><rect x="0" y="50" width="50" height="50" fill={c2} /></> },
  { id: 'franja', label: 'FRANJA', render: (c1, c2) => <rect x="30" y="0" width="40" height="100" fill={c2} /> },
]

const SIMBOLOS = [
  { id: 'ninguno', label: '—', render: () => null },
  { id: 'estrella', label: '★', render: (c) => <polygon points="50,15 55,32 72,32 59,43 64,60 50,50 36,60 41,43 28,32 45,32" fill={c} /> },
  { id: 'balon', label: '⚽', render: (c) => <><circle cx="50" cy="48" r="20" fill={c} opacity="0.9" /><circle cx="50" cy="48" r="20" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" /><polygon points="50,35 56,40 54,48 46,48 44,40" fill="rgba(0,0,0,0.25)" /></> },
  { id: 'corona', label: '👑', render: (c) => <polygon points="34,58 38,40 46,50 50,36 54,50 62,40 66,58" fill={c} /> },
  { id: 'rayo', label: '⚡', render: (c) => <polygon points="55,20 42,50 52,50 45,78 62,44 50,44" fill={c} /> },
  { id: 'escudo_mini', label: '🛡', render: (c) => <path d="M50,28 L64,34 L64,50 C64,58 57,63 50,66 C43,63 36,58 36,50 L36,34 Z" fill={c} /> },
]

const COLORES_PRESET = [
  '#7c3aed', '#4f46e5', '#2563eb', '#0891b2', '#059669',
  '#16a34a', '#ca8a04', '#dc2626', '#db2777', '#9333ea',
  '#fff', '#e5e7eb', '#374151', '#111827', '#000',
  '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6',
]

export default function EscudoEditor({ onSave }) {
  const [forma, setForma] = useState(FORMAS_BASE[0])
  const [division, setDivision] = useState(DIVISIONES[0])
  const [simbolo, setSimboloo] = useState(SIMBOLOS[0])
  const [color1, setColor1] = useState('#1e1b4b')
  const [color2, setColor2] = useState('#7c3aed')
  const [colorSimbolo, setColorSimbolo] = useState('#f59e0b')
  const [colorBorde, setColorBorde] = useState('#a78bfa')
  const [guardado, setGuardado] = useState(false)

  const handleGuardar = useCallback(() => {
    const escudo = {
      formaId: forma.id,
      formaPa: forma.path,
      divisionId: division.id,
      simboloId: simbolo.id,
      color1, color2, colorSimbolo, colorBorde,
    }
    onSave(escudo)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }, [forma, division, simbolo, color1, color2, colorSimbolo, colorBorde, onSave])

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

      {/* PREVIEW */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <EscudoSVG forma={forma} division={division} simbolo={simbolo} color1={color1} color2={color2} colorSimbolo={colorSimbolo} colorBorde={colorBorde} size={160} />
        <button onClick={handleGuardar} style={{ padding: '10px 24px', borderRadius: '4px', background: guardado ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg,#7c3aed,#5b21b6)', border: guardado ? '1px solid rgba(16,185,129,0.5)' : 'none', color: '#fff', fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.8rem', letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.3s', width: '160px' }}>
          {guardado ? '✓ GUARDADO' : 'GUARDAR ESCUDO'}
        </button>
      </div>

      {/* CONTROLES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '380px' }}>

        {/* FORMA */}
        <Section label="FORMA DEL ESCUDO">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {FORMAS_BASE.map(f => (
              <button key={f.id} onClick={() => setForma(f)} style={{ padding: '6px 4px', borderRadius: '4px', border: `1px solid ${forma.id === f.id ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`, background: forma.id === f.id ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <svg viewBox="0 0 100 100" width="36" height="36">
                  <path d={f.path} fill={forma.id === f.id ? '#7c3aed' : 'rgba(255,255,255,0.2)'} />
                </svg>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.55rem', letterSpacing: '1px', color: forma.id === f.id ? '#a78bfa' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{f.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* DIVISIÓN */}
        <Section label="DIVISIÓN">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {DIVISIONES.map(d => (
              <button key={d.id} onClick={() => setDivision(d)} style={{ padding: '8px 6px', borderRadius: '4px', border: `1px solid ${division.id === d.id ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`, background: division.id === d.id ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.6rem', letterSpacing: '1px', color: division.id === d.id ? '#a78bfa' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{d.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* SÍMBOLO */}
        <Section label="SÍMBOLO">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
            {SIMBOLOS.map(s => (
              <button key={s.id} onClick={() => setSimboloo(s)} style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${simbolo.id === s.id ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`, background: simbolo.id === s.id ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', fontSize: '1rem' }}>
                <span style={{ color: simbolo.id === s.id ? '#fff' : 'rgba(255,255,255,0.5)' }}>{s.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* COLORES */}
        <Section label="COLORES">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ColorPicker label="COLOR PRIMARIO" value={color1} onChange={setColor1} presets={COLORES_PRESET} />
            <ColorPicker label="COLOR SECUNDARIO" value={color2} onChange={setColor2} presets={COLORES_PRESET} />
            <ColorPicker label="COLOR SÍMBOLO" value={colorSimbolo} onChange={setColorSimbolo} presets={COLORES_PRESET} />
            <ColorPicker label="COLOR BORDE" value={colorBorde} onChange={setColorBorde} presets={COLORES_PRESET} />
          </div>
        </Section>
      </div>
    </div>
  )
}

export function EscudoSVG({ forma, division, simbolo, color1, color2, colorSimbolo, colorBorde, size = 80 }) {
  const f = typeof forma === 'string'
    ? FORMAS_BASE.find(f => f.id === forma) || FORMAS_BASE[0]
    : forma
  const d = typeof division === 'string'
    ? DIVISIONES.find(d => d.id === division) || DIVISIONES[0]
    : division
  const s = typeof simbolo === 'string'
    ? SIMBOLOS.find(s => s.id === simbolo) || SIMBOLOS[0]
    : simbolo

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: `drop-shadow(0 4px 12px ${colorBorde}50)` }}>
      <defs>
        <clipPath id={`clip-${f.id}-${size}`}>
          <path d={f.path} />
        </clipPath>
      </defs>
      {/* Base */}
      <path d={f.path} fill={color1} />
      {/* División */}
      <g clipPath={`url(#clip-${f.id}-${size})`}>
        {d.render(color1, color2)}
      </g>
      {/* Símbolo */}
      {s.render(colorSimbolo)}
      {/* Borde */}
      <path d={f.path} fill="none" stroke={colorBorde} strokeWidth="3" />
    </svg>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.62rem', letterSpacing: '3px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>{label}</div>
      {children}
    </div>
  )
}

function ColorPicker({ label, value, onChange, presets }) {
  return (
    <div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.6rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
        {presets.map(c => (
          <div key={c} onClick={() => onChange(c)} style={{ width: '20px', height: '20px', borderRadius: '3px', background: c, cursor: 'pointer', border: value === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.15)', flexShrink: 0, transition: 'transform 0.1s', transform: value === c ? 'scale(1.2)' : 'scale(1)' }} />
        ))}
        <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: '24px', height: '24px', border: 'none', borderRadius: '3px', cursor: 'pointer', background: 'transparent', padding: 0 }} title="Color personalizado" />
      </div>
    </div>
  )
}
