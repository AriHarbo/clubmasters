import { useState } from 'react'
import JugadorCardFull from './JugadorCardFull'

// Fila de cartas con leve curvatura/perspectiva tipo abanico.
// Todas son visibles e interactivas — el hover funciona en cualquiera, no solo la central.
export default function CardCoverflow({ jugadores, rareza, cartaActual }) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const visibles = jugadores.slice(0, cartaActual + 1)
  const total = visibles.length
  const centro = (total - 1) / 2

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '360px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '0',
      padding: '40px 20px',
    }}>
      {visibles.map((j, i) => {
        const offsetFromCenter = i - centro
        // Leve abanico: cuanto más lejos del centro, un poco más rotado e inclinado hacia abajo
        const rotate = offsetFromCenter * 2.2
        const translateY = Math.abs(offsetFromCenter) * 4
        const isHovered = hoverIdx === i
        const esNueva = i === cartaActual

        return (
          <div
            key={j.id + i}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            style={{
              position: 'relative',
              marginLeft: i === 0 ? 0 : '-28px',
              transform: isHovered
                ? `rotate(0deg) translateY(-10px)`
                : `rotate(${rotate}deg) translateY(${translateY}px)`,
              transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), z-index 0s',
              zIndex: isHovered ? 50 : i,
              willChange: 'transform',
              animation: esNueva ? 'card-deal-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
            }}
          >
            <JugadorCardFull
              jugador={j}
              rareza={rareza}
              size="normal"
              floatVariant={i}
              forceHover={isHovered}
            />
          </div>
        )
      })}

      <style>{`
        @keyframes card-deal-in {
          0% { opacity: 0; transform: translateY(50px) scale(0.5) rotate(-15deg); }
          60% { transform: translateY(-8px) scale(1.05) rotate(2deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  )
}
