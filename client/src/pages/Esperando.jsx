import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Esperando() {
  const navigate = useNavigate()
  const [solicitud, setSolicitud] = useState(null)
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Cargar solicitud
    const cargarSolicitud = async () => {
      try {
        const { data } = await api.get('/solicitud/mis-solicitudes')
        if (!data) {
          navigate('/onboarding')
          return
        }
        setSolicitud(data)
      } catch {
        navigate('/onboarding')
      }
    }
    cargarSolicitud()

    // Polling para ver si fue aceptado
    const interval = setInterval(async () => {
    try {
        const { data } = await api.get('/solicitud/mis-solicitudes')
        if (!data) {
        // Cancelada o rechazada → volver a onboarding
        navigate('/onboarding')
        return
        }
        if (data.estado === 'aceptada') {
        // Aceptada → crear club
        navigate('/onboarding?ligaId=' + data.ligaId + '&step=crear-club')
        return
        }
    } catch {}
    }, 5000)

    // Animación de puntos
    const dotsInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.')
    }, 600)

    return () => {
      clearInterval(interval)
      clearInterval(dotsInterval)
    }
  }, [navigate])

  const handleCancelar = async () => {
    try {
      await api.delete(`/solicitud/cancelar/${solicitud.id}`)
      navigate('/onboarding')
    } catch {}
  }

  return (
    <div style={S.root}>
      <div style={S.bg} />
      <div style={S.overlay} />
      <div style={S.topLine} />

      <div style={S.center}>
        <div style={S.iconWrap}>
          <span style={S.icon}>⏳</span>
        </div>

        <div style={S.pre}>SOLICITUD ENVIADA</div>
        <h1 style={S.title}>ESPERANDO RESPUESTA{dots}</h1>

        {solicitud && (
          <div style={S.ligaCard}>
            <div style={S.ligaLabel}>LIGA SOLICITADA</div>
            <div style={S.ligaNombre}>{solicitud.liga?.nombre}</div>
            <div style={S.ligaInfo}>
              {solicitud.liga?.esPublica ? '🌍 PÚBLICA' : '🔒 PRIVADA'} · CADA {solicitud.liga?.frecuenciaDias} DÍAS
            </div>
          </div>
        )}

        <div style={S.infoBox}>
          <div style={S.infoDot} />
          <span style={S.infoText}>VERIFICANDO AUTOMÁTICAMENTE CADA 5 SEGUNDOS</span>
        </div>

        <p style={S.desc}>
          El creador de la liga necesita aceptar tu solicitud. Podés cerrar esta página y volver más tarde — tu solicitud seguirá activa.
        </p>

        <button style={S.btnCancel} onClick={handleCancelar}>
          CANCELAR SOLICITUD
        </button>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(1.8);opacity:0} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}

const S = {
  root: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Barlow', sans-serif", background: '#03010d',
    position: 'relative', overflow: 'hidden',
  },
  bg: {
    position: 'fixed', inset: 0,
    backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1800&q=70')",
    backgroundSize: 'cover', backgroundPosition: 'center',
    filter: 'brightness(0.15) saturate(0.4)', zIndex: 0,
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(109,40,217,0.2) 0%, transparent 60%), linear-gradient(180deg, rgba(3,1,13,0.6) 0%, rgba(3,1,13,0.4) 100%)',
    zIndex: 1,
  },
  topLine: {
    position: 'fixed', top: 0, left: 0, right: 0, height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.8), rgba(167,139,250,1), rgba(124,58,237,0.8), transparent)',
    zIndex: 20,
  },
  center: {
    position: 'relative', zIndex: 10,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', gap: '16px', maxWidth: '480px', padding: '0 20px',
  },
  iconWrap: {
    position: 'relative', width: '80px', height: '80px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '8px',
  },
  icon: {
    fontSize: '3.5rem', display: 'block',
    animation: 'float 3s ease-in-out infinite',
  },
  pre: {
    fontFamily: "'Barlow Condensed'", fontWeight: 700,
    fontSize: '0.72rem', letterSpacing: '5px', color: '#7c3aed',
  },
  title: {
    fontFamily: "'Bebas Neue'", fontSize: 'clamp(2rem,4vw,2.8rem)',
    letterSpacing: '4px', color: '#fff', margin: 0, lineHeight: 1,
    textShadow: '0 0 40px rgba(109,40,217,0.4)',
  },
  ligaCard: {
    padding: '16px 24px', borderRadius: '6px',
    background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
    width: '100%',
  },
  ligaLabel: {
    fontFamily: "'Barlow Condensed'", fontWeight: 700,
    fontSize: '0.62rem', letterSpacing: '4px', color: 'rgba(255,255,255,0.4)',
    marginBottom: '6px',
  },
  ligaNombre: {
    fontFamily: "'Bebas Neue'", fontSize: '1.8rem', letterSpacing: '3px',
    color: '#fff', lineHeight: 1, marginBottom: '4px',
  },
  ligaInfo: {
    fontFamily: "'Barlow Condensed'", fontWeight: 600,
    fontSize: '0.72rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)',
  },
  infoBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 16px', borderRadius: '4px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  },
  infoDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#22c55e', boxShadow: '0 0 6px #22c55e',
    animation: 'pulse-dot 2s ease-in-out infinite', flexShrink: 0,
  },
  infoText: {
    fontFamily: "'Barlow Condensed'", fontWeight: 700,
    fontSize: '0.68rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)',
  },
  desc: {
    fontFamily: "'Barlow'", fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0,
  },
  btnCancel: {
    padding: '12px 28px', borderRadius: '4px',
    background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
    color: 'rgba(239,68,68,0.7)', fontFamily: "'Barlow Condensed'",
    fontWeight: 700, fontSize: '0.82rem', letterSpacing: '2px',
    cursor: 'pointer', transition: 'all 0.2s', marginTop: '8px',
  },
}