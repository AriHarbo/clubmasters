import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import JugadorCardFull, { COLOR_RAREZA } from '../components/JugadorCardFull'
import CardCoverflow from '../components/CardCoverflow'
import { ChevronLeft, Package, Sparkles } from 'lucide-react'

const TIPO_INFO = {
  bronce: { label: 'SOBRE DE BRONCE', color: '#b45309', desc: 'Jugadores nivel 60-76' },
  plata: { label: 'SOBRE DE PLATA', color: '#9ca3af', desc: 'Jugadores nivel 73-83' },
  oro: { label: 'SOBRE DE ORO', color: '#f59e0b', desc: 'Jugadores nivel 80-88+' },
}

export default function Sobres() {
  const navigate = useNavigate()
  const [fase, setFase] = useState('cargando') // cargando | inicial | lista | abriendo | revelando | elegir-liberar
  const [sobres, setSobres] = useState([])
  const [jugadoresGenerados, setJugadoresGenerados] = useState([])
  const [cartaActual, setCartaActual] = useState(-1)
  const [sobreAbriendoId, setSobreAbriendoId] = useState(null)
  const [sobreInicialAbierto, setSobreInicialAbierto] = useState(true)
  const [plantillaCount, setPlantillaCount] = useState(0)
  const [jugadoresElegidos, setJugadoresElegidos] = useState([]) // IDs a quedarse
  const [aLiberar, setALiberar] = useState([]) // jugadorClubId a liberar
  const [misJugadores, setMisJugadores] = useState([])
  const [error, setError] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    init()
  }, [])

  const init = async () => {
    try {
      const { data } = await api.get('/sobre/mis-sobres')
      setSobres(data.sobres)
      setSobreInicialAbierto(data.sobreInicialAbierto)

      const { data: club } = await api.get('/club/mi-club')
      setPlantillaCount(club.jugadores?.length || 0)
      setMisJugadores(club.jugadores || [])

      if (!data.sobreInicialAbierto) {
        setFase('inicial')
      } else {
        setFase('lista')
      }
    } catch (err) {
      console.error(err)
      setFase('lista')
    }
  }

  const [tipoActual, setTipoActual] = useState('inicial')

  // Animación de revelar cartas una por una
  const revelarCartas = (jugadores, tipo = 'inicial') => {
    setJugadoresGenerados(jugadores)
    setTipoActual(tipo)
    setCartaActual(-1)
    setFase('revelando')
    jugadores.forEach((_, i) => {
      setTimeout(() => setCartaActual(i), 320 * (i + 1))
    })
  }

  const handleAbrirInicial = async () => {
    setFase('abriendo')
    try {
      const { data } = await api.post('/sobre/inicial')
      setTimeout(() => revelarCartas(data.jugadores, 'inicial'), 1200)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al abrir sobre')
      setFase('inicial')
    }
  }

  const handleAbrirSobre = async (sobreId, tipo) => {
    setSobreAbriendoId(sobreId)
    setFase('abriendo')
    try {
      const { data } = await api.post(`/sobre/abrir/${sobreId}`)
      setTimeout(() => revelarCartas(data.jugadores, tipo), 1200)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al abrir sobre')
      setFase('lista')
    }
  }

  const handleContinuarDesdeRevelado = () => {
    // Si es el sobre inicial, no hay que elegir nada — van todos
    if (!sobreInicialAbierto || sobreAbriendoId === null) {
      // Caso sobre inicial: ya están todos asignados desde el backend
      if (!sobreAbriendoId) {
        setFase('lista')
        init()
        return
      }
    }

    const idsGenerados = jugadoresGenerados.map(j => j.id)
    const plantillaFinal = plantillaCount + idsGenerados.length

    if (plantillaFinal <= 26) {
      // Hay lugar para todos, confirmar directo
      confirmarSinLiberar(idsGenerados)
    } else {
      // Hay que elegir a quién liberar
      setJugadoresElegidos(idsGenerados)
      setALiberar([])
      setFase('elegir-liberar')
    }
  }

  const confirmarSinLiberar = async (idsGenerados) => {
    setConfirmando(true)
    try {
      await api.post('/sobre/confirmar', { jugadorIds: idsGenerados, liberarJugadorClubIds: [] })
      setFase('lista')
      init()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al confirmar')
    } finally { setConfirmando(false) }
  }

  const toggleLiberar = (jcId) => {
    setALiberar(prev => prev.includes(jcId) ? prev.filter(id => id !== jcId) : [...prev, jcId])
  }

  const necesitaLiberar = plantillaCount + jugadoresElegidos.length - 26
  const puedeConfirmar = aLiberar.length >= necesitaLiberar

  const handleConfirmarConLiberados = async () => {
    setConfirmando(true)
    try {
      await api.post('/sobre/confirmar', { jugadorIds: jugadoresElegidos, liberarJugadorClubIds: aLiberar })
      setFase('lista')
      init()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al confirmar')
    } finally { setConfirmando(false) }
  }

  return (
    <div style={S.root}>
      <div style={S.bg} />
      <div style={S.overlay} />
      <div style={S.topLine} />

      {fase !== 'inicial' && fase !== 'abriendo' && fase !== 'revelando' && fase !== 'elegir-liberar' && (
        <header style={S.header}>
          <button onClick={() => navigate('/dashboard')} style={S.backBtn}>
            <ChevronLeft size={18} /><span>DASHBOARD</span>
          </button>
          <div style={S.headerCenter}>
            <Package size={16} color="#f59e0b" />
            <span style={S.headerTitle}>SOBRES</span>
          </div>
          <div style={S.plantillaCount}>{plantillaCount}/26 JUGADORES</div>
        </header>
      )}

      <div style={S.content}>

        {/* FASE: cargando */}
        {fase === 'cargando' && <div style={S.loadingText}>CARGANDO...</div>}

        {/* FASE: sobre inicial */}
        {fase === 'inicial' && (
          <div style={S.centerStage}>
            <div style={S.sobreGlowWrap}>
              <div style={S.sobreGlow} />
              <div onClick={handleAbrirInicial} style={S.sobreInicialBox}>
                <Package size={64} color="#fff" strokeWidth={1.2} />
              </div>
            </div>
            <div style={S.pre}>¡BIENVENIDO A TU CLUB!</div>
            <h1 style={S.title}>ABRÍ TU SOBRE INICIAL</h1>
            <p style={S.desc}>Estos son los 20 jugadores con los que vas a arrancar tu aventura</p>
            <button onClick={handleAbrirInicial} style={S.btnAbrirGrande}>
              <Sparkles size={18} /> ABRIR SOBRE
            </button>
          </div>
        )}

        {/* FASE: abriendo (animación previa) */}
        {fase === 'abriendo' && (
          <div style={S.centerStage}>
            <div style={S.sobreAbriendoBox}>
              <Package size={80} color="#fff" strokeWidth={1} />
            </div>
            <div style={S.pre}>ABRIENDO SOBRE...</div>
          </div>
        )}

        {/* FASE: revelando cartas */}
        {fase === 'revelando' && (
          <div style={S.revelandoWrap}>
            <div style={S.revelandoHeader}>
              <div style={S.pre}>
                {cartaActual >= jugadoresGenerados.length - 1 ? '✨ ¡SOBRE COMPLETO! ✨' : `REVELANDO CARTA ${Math.min(cartaActual + 1, jugadoresGenerados.length)} / ${jugadoresGenerados.length}`}
              </div>
              {cartaActual < jugadoresGenerados.length - 1 && (
                <div style={S.progressBarBg}>
                  <div style={{ ...S.progressBarFill, width: `${((cartaActual + 1) / jugadoresGenerados.length) * 100}%` }} />
                </div>
              )}
              {cartaActual >= jugadoresGenerados.length - 1 && (
                <div style={S.statsResumen}>
                  <div style={S.statResumenItem}>
                    <span style={S.statResumenVal}>{jugadoresGenerados.length}</span>
                    <span style={S.statResumenLabel}>JUGADORES</span>
                  </div>
                  <div style={S.statResumenDivider} />
                  <div style={S.statResumenItem}>
                    <span style={{ ...S.statResumenVal, color: '#f59e0b' }}>{Math.max(...jugadoresGenerados.map(j => j.media))}</span>
                    <span style={S.statResumenLabel}>MEDIA MÁX</span>
                  </div>
                  <div style={S.statResumenDivider} />
                  <div style={S.statResumenItem}>
                    <span style={{ ...S.statResumenVal, color: '#a78bfa' }}>{Math.round(jugadoresGenerados.reduce((s,j) => s+j.media, 0) / jugadoresGenerados.length)}</span>
                    <span style={S.statResumenLabel}>MEDIA PROM.</span>
                  </div>
                </div>
              )}
            </div>

            <CardCoverflow jugadores={jugadoresGenerados} rareza={tipoActual} cartaActual={cartaActual} />

            {cartaActual >= jugadoresGenerados.length - 1 && (
              <button onClick={handleContinuarDesdeRevelado} disabled={confirmando} style={S.btnContinuar}>
                {confirmando ? 'GUARDANDO...' : 'CONTINUAR →'}
              </button>
            )}
          </div>
        )}

        {/* FASE: elegir a quién liberar */}
        {fase === 'elegir-liberar' && (
          <div style={S.liberarWrap}>
            <div style={S.pre}>TU PLANTILLA ESTÁ LLENA (26/26)</div>
            <h2 style={S.titleSmall}>ELEGÍ A QUIÉN LIBERAR</h2>
            <p style={S.desc}>
              Necesitás liberar al menos <strong style={{ color: '#fff' }}>{necesitaLiberar}</strong> jugador{necesitaLiberar > 1 ? 'es' : ''} para hacer espacio.
              Los jugadores liberados {' '}pasarán a estar disponibles en el mercado.
            </p>
            <div style={S.liberarCounter}>
              {aLiberar.length}/{necesitaLiberar} SELECCIONADOS {aLiberar.length >= necesitaLiberar && '✓'}
            </div>

            <div style={S.cartasGridScroll}>
              {misJugadores.map(jc => (
                <div key={jc.id} onClick={() => toggleLiberar(jc.id)}>
                  <JugadorCardFull
                    jugador={jc.jugador}
                    rareza="inicial"
                    size="small"
                    seleccionado={aLiberar.includes(jc.id)}
                  />
                </div>
              ))}
            </div>

            {error && <div style={S.error}>{error}</div>}

            <button onClick={handleConfirmarConLiberados} disabled={!puedeConfirmar || confirmando} style={{ ...S.btnContinuar, opacity: puedeConfirmar ? 1 : 0.4 }}>
              {confirmando ? 'CONFIRMANDO...' : `CONFIRMAR Y LIBERAR (${aLiberar.length})`}
            </button>
          </div>
        )}

        {/* FASE: lista de sobres */}
        {fase === 'lista' && (
          <div style={S.listaWrap}>
            <div style={S.listaHeader}>
              <h2 style={S.titleSmall}>TUS SOBRES</h2>
              <p style={S.desc}>Abrí sobres para sumar nuevos jugadores a tu plantilla</p>
            </div>

            {sobres.length === 0 ? (
              <div style={S.emptyState}>
                <Package size={48} color="rgba(255,255,255,0.15)" />
                <div style={S.emptyTitle}>NO TENÉS SOBRES DISPONIBLES</div>
                <div style={S.emptyDesc}>Jugá los minijuegos diarios para ganar sobres gratis</div>
                <button onClick={() => navigate('/minijuegos')} style={S.btnMinijuegos}>IR A MINIJUEGOS</button>
              </div>
            ) : (
              <div style={S.sobresGrid}>
                {sobres.map(sobre => {
                  const info = TIPO_INFO[sobre.tipo] || TIPO_INFO.bronce
                  return (
                    <div key={sobre.id} onClick={() => handleAbrirSobre(sobre.id, sobre.tipo)} style={{ ...S.sobreCard, borderColor: info.color + '60' }}>
                      <div style={{ ...S.sobreCardGlow, background: `radial-gradient(circle, ${info.color}30, transparent 70%)` }} />
                      <Package size={40} color={info.color} strokeWidth={1.3} />
                      <div style={{ ...S.sobreCardLabel, color: info.color }}>{info.label}</div>
                      <div style={S.sobreCardDesc}>{info.desc}</div>
                      <div style={{ ...S.sobreCardBtn, background: `${info.color}18`, border: `1px solid ${info.color}50`, color: info.color }}>ABRIR →</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes pulse-sobre { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes glow-pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.15)} }
        @keyframes shake { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-3deg)} 75%{transform:rotate(3deg)} }
        @keyframes card-pop-in {
          0% { opacity: 0; transform: translateY(40px) scale(0.6) rotate(-8deg); }
          60% { transform: translateY(-6px) scale(1.08) rotate(2deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
        }
        @keyframes particle-float-0 { 0%,100%{transform:translateY(0) translateX(0); opacity:0.3} 50%{transform:translateY(-20px) translateX(8px); opacity:0.7} }
        @keyframes particle-float-1 { 0%,100%{transform:translateY(0) translateX(0); opacity:0.4} 50%{transform:translateY(-14px) translateX(-10px); opacity:0.8} }
        @keyframes particle-float-2 { 0%,100%{transform:translateY(0) translateX(0); opacity:0.25} 50%{transform:translateY(-24px) translateX(4px); opacity:0.6} }
      `}</style>
    </div>
  )
}

const S = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Barlow', sans-serif", background: '#03010d', position: 'relative', overflow: 'auto' },
  bg: { position: 'fixed', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1800&q=70')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.12) saturate(0.3)', zIndex: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(245,158,11,0.1) 0%, transparent 60%)', zIndex: 1 },
  topLine: { position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.7), rgba(124,58,237,0.9), rgba(245,158,11,0.7), transparent)', zIndex: 20 },
  header: { position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: '56px', background: 'rgba(3,1,13,0.75)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 },
  backBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.78rem', letterSpacing: '2px', padding: 0 },
  headerCenter: { display: 'flex', alignItems: 'center', gap: '10px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  headerTitle: { fontFamily: "'Bebas Neue'", fontSize: '1.2rem', letterSpacing: '4px', color: '#fff' },
  plantillaCount: { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)' },
  content: { position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', width: '100%', overflow: 'visible' },
  loadingText: { fontFamily: "'Barlow Condensed'", color: 'rgba(255,255,255,0.3)', letterSpacing: '3px', fontWeight: 700 },
  centerStage: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center', maxWidth: '480px' },
  sobreGlowWrap: { position: 'relative', marginBottom: '8px' },
  sobreGlow: { position: 'absolute', inset: '-30px', background: 'radial-gradient(circle, rgba(245,158,11,0.4), transparent 70%)', animation: 'glow-pulse 2.5s ease-in-out infinite', borderRadius: '50%' },
  sobreInicialBox: { position: 'relative', width: '140px', height: '140px', borderRadius: '12px', background: 'linear-gradient(145deg, #f59e0b, #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 40px rgba(245,158,11,0.4)', animation: 'pulse-sobre 2s ease-in-out infinite', zIndex: 2 },
  sobreAbriendoBox: { width: '160px', height: '160px', borderRadius: '12px', background: 'linear-gradient(145deg, #f59e0b, #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(245,158,11,0.6)', animation: 'shake 0.3s ease-in-out infinite' },
  pre: { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.78rem', letterSpacing: '4px', color: '#f59e0b' },
  title: { fontFamily: "'Bebas Neue'", fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', letterSpacing: '4px', color: '#fff', margin: 0, lineHeight: 1.1 },
  titleSmall: { fontFamily: "'Bebas Neue'", fontSize: '1.8rem', letterSpacing: '3px', color: '#fff', margin: 0 },
  desc: { fontFamily: "'Barlow'", fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 },
  btnAbrirGrande: { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '4px', background: 'linear-gradient(135deg,#f59e0b,#b45309)', border: 'none', color: '#1a1a1a', fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.9rem', letterSpacing: '2px', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' },
  revelandoWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '1400px' },
  revelandoHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' },
  progressBarBg: { width: '280px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressBarFill: { height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: '2px', transition: 'width 0.35s ease', boxShadow: '0 0 10px rgba(245,158,11,0.6)' },
  statsResumen: { display: 'flex', alignItems: 'center', gap: '20px', padding: '10px 24px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' },
  statResumenItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  statResumenVal: { fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: '#fff', lineHeight: 1 },
  statResumenLabel: { fontFamily: "'Barlow Condensed'", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)' },
  statResumenDivider: { width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' },
  cartasGridWrap: { position: 'relative', width: '100%' },
  particlesLayer: { position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 },
  cartasGrid: { display: 'flex', gap: '18px', overflowX: 'auto', overflowY: 'visible', padding: '30px 24px 50px', width: '100%', position: 'relative', zIndex: 1, scrollbarWidth: 'thin' },
  cartasGridScroll: { display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', maxHeight: '380px', overflowY: 'auto', padding: '20px 10px' },
  btnContinuar: { padding: '12px 32px', borderRadius: '4px', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', border: 'none', color: '#fff', fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px', cursor: 'pointer' },
  liberarWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '800px', textAlign: 'center' },
  liberarCounter: { fontFamily: "'Bebas Neue'", fontSize: '1.3rem', letterSpacing: '3px', color: '#f59e0b', margin: '4px 0' },
  listaWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '900px' },
  listaHeader: { textAlign: 'center' },
  sobresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%' },
  sobreCard: { position: 'relative', overflow: 'hidden', padding: '28px 20px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: 'transform 0.2s' },
  sobreCardGlow: { position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '80px', borderRadius: '50%', pointerEvents: 'none' },
  sobreCardLabel: { fontFamily: "'Bebas Neue'", fontSize: '1.1rem', letterSpacing: '2px', position: 'relative', zIndex: 1 },
  sobreCardDesc: { fontFamily: "'Barlow Condensed'", fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textAlign: 'center', position: 'relative', zIndex: 1 },
  sobreCardBtn: { marginTop: '4px', padding: '5px 14px', borderRadius: '3px', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '1.5px', position: 'relative', zIndex: 1 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px', textAlign: 'center' },
  emptyTitle: { fontFamily: "'Bebas Neue'", fontSize: '1.3rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' },
  emptyDesc: { fontFamily: "'Barlow Condensed'", fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px' },
  btnMinijuegos: { marginTop: '8px', padding: '10px 24px', borderRadius: '4px', background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.4)', color: '#ec4899', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.78rem', letterSpacing: '2px', cursor: 'pointer' },
  error: { padding: '10px 16px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontFamily: "'Barlow Condensed'", fontSize: '0.78rem', letterSpacing: '1px' },
}
