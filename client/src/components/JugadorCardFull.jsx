import { useState } from 'react'
import { User } from 'lucide-react'

export const COLOR_BANNER = {
  PO: { bg: '#f59e0b', text: '#1a1409' },
  LD: { bg: '#3b82f6', text: '#0a1830' },
  LI: { bg: '#3b82f6', text: '#0a1830' },
  DFC: { bg: '#3b82f6', text: '#0a1830' },
  MC: { bg: '#22c55e', text: '#06200f' },
  MCD: { bg: '#22c55e', text: '#06200f' },
  MCO: { bg: '#22c55e', text: '#06200f' },
  MD: { bg: '#22c55e', text: '#06200f' },
  MI: { bg: '#22c55e', text: '#06200f' },
  DC: { bg: '#ef4444', text: '#2a0a0a' },
  ED: { bg: '#ef4444', text: '#2a0a0a' },
  EI: { bg: '#ef4444', text: '#2a0a0a' },
  SD: { bg: '#ef4444', text: '#2a0a0a' },
}

export const COLOR_RAREZA = {
  inicial: { border: '#9ca3af', glow: 'rgba(156,163,175,0.45)', label: 'BASE', grad: 'linear-gradient(135deg,#d1d5db,#6b7280)' },
  bronce: { border: '#d97706', glow: 'rgba(217,119,6,0.65)', label: 'BRONCE', grad: 'linear-gradient(135deg,#fbbf24,#92400e)' },
  plata: { border: '#cbd5e1', glow: 'rgba(203,213,225,0.6)', label: 'PLATA', grad: 'linear-gradient(135deg,#f8fafc,#94a3b8)' },
  oro: { border: '#fbbf24', glow: 'rgba(251,191,36,0.75)', label: 'ORO', grad: 'linear-gradient(135deg,#fde68a,#d97706)' },
}

const PAISES = {
  Argentina: '🇦🇷', España: '🇪🇸', Brasil: '🇧🇷', Francia: '🇫🇷', Inglaterra: '🏴',
  Alemania: '🇩🇪', Italia: '🇮🇹', Portugal: '🇵🇹', 'Países Bajos': '🇳🇱', Uruguay: '🇺🇾',
  Bélgica: '🇧🇪', Croacia: '🇭🇷', Marruecos: '🇲🇦', Camerún: '🇨🇲', Senegal: '🇸🇳',
  Ghana: '🇬🇭', Nigeria: '🇳🇬', Colombia: '🇨🇴', Chile: '🇨🇱', México: '🇲🇽',
  Japón: '🇯🇵', Corea: '🇰🇷', Noruega: '🇳🇴', Suiza: '🇨🇭', Polonia: '🇵🇱',
  Serbia: '🇷🇸', Georgia: '🇬🇪', Ecuador: '🇪🇨', 'Burkina Faso': '🇧🇫', Irlanda: '🇮🇪',
}

function getCategoria(posiciones) {
  const p = posiciones?.[0] || 'MC'
  if (p === 'PO') return 'PO'
  if (['DFC','LD','LI'].includes(p)) return 'DEF'
  if (['DC','ED','EI','SD'].includes(p)) return 'DEL'
  return 'MED'
}

// TODAS las 6 stats, siempre, en orden fijo
const TODAS_STATS = [['RIT','ritmo'],['TIR','tiro'],['PAS','pase'],['REG','regate'],['DEF','defensa'],['FIS','fisico']]

export default function JugadorCardFull({ jugador, rareza = 'inicial', size = 'normal', onClick, seleccionado, seleccionable, animDelay = 0, floatVariant = 0, forceHover = null }) {
  const [hoveredLocal, setHoveredLocal] = useState(false)
  const hovered = forceHover !== null ? forceHover : hoveredLocal
  const pos = jugador.posicion?.[0] || '??'
  const banner = COLOR_BANNER[pos] || COLOR_BANNER.MC
  const rarezaInfo = COLOR_RAREZA[rareza] || COLOR_RAREZA.inicial
  const categoria = getCategoria(jugador.posicion)
  const stats = jugador.stats || {}
  const bandera = PAISES[jugador.nacionalidad] || '🌍'

  const dims = size === 'small'
    ? { w: 130, h: 210, nameFs: 0.66, mediaFs: 1.3, statFs: 0.68, iconSize: 46 }
    : size === 'large'
    ? { w: 230, h: 360, nameFs: 0.95, mediaFs: 2.2, statFs: 0.85, iconSize: 90 }
    : { w: 178, h: 280, nameFs: 0.8, mediaFs: 1.8, statFs: 0.74, iconSize: 62 }

  const isHovered = hovered && seleccionable !== false
  const floatDur = 3.2 + (floatVariant % 3) * 0.4
  const floatDelay = (floatVariant % 5) * 0.3

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => forceHover === null && setHoveredLocal(true)}
      onMouseLeave={() => forceHover === null && setHoveredLocal(false)}
      style={{
        width: dims.w,
        height: dims.h,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        willChange: 'transform',
        animation: (!isHovered && forceHover === null) ? `jcard-float-${floatVariant % 3} ${floatDur}s ease-in-out ${floatDelay}s infinite` : 'none',
      }}
    >
      <div
        style={{
          width: '100%', height: '100%', position: 'relative',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s',
          transform: isHovered ? 'scale(1.13) translateY(-14px)' : seleccionado ? 'scale(1.05) translateY(-6px)' : 'none',
          zIndex: isHovered ? 30 : seleccionado ? 10 : 1,
          filter: isHovered
            ? `drop-shadow(0 20px 34px ${rarezaInfo.glow})`
            : seleccionado
            ? `drop-shadow(0 10px 24px ${rarezaInfo.glow})`
            : `drop-shadow(0 6px 16px rgba(0,0,0,0.65))`,
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(165deg, #1c1c1c 0%, #0c0c0c 55%, #000 100%)',
          border: `${size === 'small' ? '2px' : '3px'} solid ${seleccionado ? '#22c55e' : rarezaInfo.border}`,
          borderRadius: size === 'small' ? '9px' : '12px',
          overflow: 'hidden',
          boxShadow: `0 0 0 1px ${rarezaInfo.border}30, inset 0 1px 0 rgba(255,255,255,0.08)${seleccionado ? ', inset 0 0 0 3px rgba(34,197,94,0.25)' : ''}`,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none', background: `radial-gradient(circle at 30% 20%, ${rarezaInfo.border}10, transparent 50%)` }} />

          {isHovered && (
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              <div style={{
                position: 'absolute', top: '-50%', left: '-30%', width: '60%', height: '200%',
                background: 'linear-gradient(75deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)',
                animation: 'card-shine-loop 1.3s ease-in-out infinite',
              }} />
            </div>
          )}

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: size === 'small' ? '7px 8px 0' : '10px 12px 0', flexShrink: 0, position: 'relative', zIndex: 2 }}>
            <div style={{ textAlign: 'center', lineHeight: 1 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: `${dims.mediaFs}rem`, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{jugador.media}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: `${dims.statFs * 0.95}rem`, color: rarezaInfo.border, fontWeight: 800, letterSpacing: '1px', marginTop: '1px' }}>{pos}</div>
            </div>
            <div style={{ fontSize: size === 'small' ? '0.95rem' : '1.3rem', opacity: 0.9, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}>{bandera}</div>
          </div>

          {/* Silueta */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 0 }}>
            <div style={{ position: 'absolute', width: '75%', height: '75%', borderRadius: '50%', background: `radial-gradient(circle, ${banner.bg}22, transparent 70%)` }} />
            <User size={dims.iconSize} strokeWidth={1.1} color={banner.bg} style={{ opacity: 0.55, position: 'relative', zIndex: 1 }} />
          </div>

          {/* Banner nombre */}
          <div style={{ background: banner.bg, padding: size === 'small' ? '4px 6px' : '6px 8px', textAlign: 'center', flexShrink: 0, position: 'relative', zIndex: 2, boxShadow: `0 -2px 8px ${banner.bg}30` }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: `${dims.nameFs}rem`, letterSpacing: '0.3px', color: banner.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {jugador.nombre?.toUpperCase()}
            </div>
          </div>

          {/* 6 STATS — grid 2 columnas x 3 filas */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: 'min-content',
            gap: '3px 10px',
            padding: size === 'small' ? '6px 10px 8px' : '8px 14px 10px',
            flexShrink: 0, position: 'relative', zIndex: 2,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {TODAS_STATS.map(([label, key]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: `${dims.statFs * 1.2}rem`, color: '#fff', minWidth: '18px' }}>{stats[key] ?? '--'}</span>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: `${dims.statFs * 0.85}rem`, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.5px' }}>{label}</span>
              </div>
            ))}
          </div>

          {rareza !== 'inicial' && (
            <div style={{
              position: 'absolute', top: size === 'small' ? '5px' : '7px', left: size === 'small' ? '5px' : '7px',
              padding: '2px 5px', borderRadius: '3px', background: rarezaInfo.grad,
              fontFamily: "'Barlow Condensed'", fontSize: size === 'small' ? '0.42rem' : '0.5rem',
              fontWeight: 800, letterSpacing: '0.5px', color: '#1a1a1a',
              boxShadow: `0 0 10px ${rarezaInfo.glow}`, zIndex: 3,
            }}>
              {rarezaInfo.label}
            </div>
          )}

          {seleccionado && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(34,197,94,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.15rem', color: '#fff', fontWeight: 900, zIndex: 5,
              boxShadow: '0 0 26px rgba(34,197,94,0.7)',
            }}>✓</div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes card-shine-loop {
          0% { transform: translateX(-30%) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          50% { transform: translateX(180%) rotate(0deg); opacity: 1; }
          65% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes jcard-float-0 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(-0.6deg); }
        }
        @keyframes jcard-float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-9px) rotate(0.6deg); }
        }
        @keyframes jcard-float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(0deg); }
        }
      `}</style>
    </div>
  )
}
