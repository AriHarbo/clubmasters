import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { ChevronLeft, Save, Users } from 'lucide-react'

const FORMACIONES = {
  '4-3-3': { nombre: '4-3-3', posiciones: ['PO','LD','DFC','DFC','LI','MC','MCD','MC','ED','DC','EI'] },
  '4-4-2': { nombre: '4-4-2', posiciones: ['PO','LD','DFC','DFC','LI','MD','MC','MC','MI','DC','DC'] },
  '4-2-3-1': { nombre: '4-2-3-1', posiciones: ['PO','LD','DFC','DFC','LI','MCD','MCD','MCO','ED','EI','DC'] },
  '3-5-2': { nombre: '3-5-2', posiciones: ['PO','DFC','DFC','DFC','MD','MC','MCD','MC','MI','DC','DC'] },
  '5-3-2': { nombre: '5-3-2', posiciones: ['PO','LD','DFC','DFC','DFC','LI','MC','MC','MC','DC','DC'] },
  '4-1-4-1': { nombre: '4-1-4-1', posiciones: ['PO','LD','DFC','DFC','LI','MCD','MD','MC','MC','MI','DC'] },
}

// Coordenadas XY de cada posición en la cancha (% del ancho/alto)
const COORDS_FORMACION = {
  '4-3-3': [
    { pos: 'PO',  x: 50, y: 88 },
    { pos: 'LD',  x: 82, y: 72 },
    { pos: 'DFC', x: 62, y: 72 },
    { pos: 'DFC', x: 38, y: 72 },
    { pos: 'LI',  x: 18, y: 72 },
    { pos: 'MC',  x: 70, y: 52 },
    { pos: 'MCD', x: 50, y: 55 },
    { pos: 'MC',  x: 30, y: 52 },
    { pos: 'ED',  x: 78, y: 28 },
    { pos: 'DC',  x: 50, y: 22 },
    { pos: 'EI',  x: 22, y: 28 },
  ],
  '4-4-2': [
    { pos: 'PO',  x: 50, y: 88 },
    { pos: 'LD',  x: 82, y: 72 },
    { pos: 'DFC', x: 62, y: 72 },
    { pos: 'DFC', x: 38, y: 72 },
    { pos: 'LI',  x: 18, y: 72 },
    { pos: 'MD',  x: 78, y: 48 },
    { pos: 'MC',  x: 58, y: 50 },
    { pos: 'MC',  x: 42, y: 50 },
    { pos: 'MI',  x: 22, y: 48 },
    { pos: 'DC',  x: 62, y: 22 },
    { pos: 'DC',  x: 38, y: 22 },
  ],
  '4-2-3-1': [
    { pos: 'PO',  x: 50, y: 88 },
    { pos: 'LD',  x: 82, y: 72 },
    { pos: 'DFC', x: 62, y: 72 },
    { pos: 'DFC', x: 38, y: 72 },
    { pos: 'LI',  x: 18, y: 72 },
    { pos: 'MCD', x: 62, y: 57 },
    { pos: 'MCD', x: 38, y: 57 },
    { pos: 'MCO', x: 50, y: 38 },
    { pos: 'ED',  x: 78, y: 33 },
    { pos: 'EI',  x: 22, y: 33 },
    { pos: 'DC',  x: 50, y: 18 },
  ],
  '3-5-2': [
    { pos: 'PO',  x: 50, y: 88 },
    { pos: 'DFC', x: 68, y: 72 },
    { pos: 'DFC', x: 50, y: 74 },
    { pos: 'DFC', x: 32, y: 72 },
    { pos: 'MD',  x: 82, y: 50 },
    { pos: 'MC',  x: 64, y: 50 },
    { pos: 'MCD', x: 50, y: 53 },
    { pos: 'MC',  x: 36, y: 50 },
    { pos: 'MI',  x: 18, y: 50 },
    { pos: 'DC',  x: 62, y: 22 },
    { pos: 'DC',  x: 38, y: 22 },
  ],
  '5-3-2': [
    { pos: 'PO',  x: 50, y: 88 },
    { pos: 'LD',  x: 88, y: 68 },
    { pos: 'DFC', x: 68, y: 73 },
    { pos: 'DFC', x: 50, y: 75 },
    { pos: 'DFC', x: 32, y: 73 },
    { pos: 'LI',  x: 12, y: 68 },
    { pos: 'MC',  x: 68, y: 48 },
    { pos: 'MC',  x: 50, y: 50 },
    { pos: 'MC',  x: 32, y: 48 },
    { pos: 'DC',  x: 62, y: 22 },
    { pos: 'DC',  x: 38, y: 22 },
  ],
  '4-1-4-1': [
    { pos: 'PO',  x: 50, y: 88 },
    { pos: 'LD',  x: 82, y: 72 },
    { pos: 'DFC', x: 62, y: 72 },
    { pos: 'DFC', x: 38, y: 72 },
    { pos: 'LI',  x: 18, y: 72 },
    { pos: 'MCD', x: 50, y: 60 },
    { pos: 'MD',  x: 78, y: 44 },
    { pos: 'MC',  x: 59, y: 44 },
    { pos: 'MC',  x: 41, y: 44 },
    { pos: 'MI',  x: 22, y: 44 },
    { pos: 'DC',  x: 50, y: 18 },
  ],
}

const COLOR_POS = {
  PO: '#f59e0b', LD: '#3b82f6', LI: '#3b82f6', DFC: '#3b82f6',
  MC: '#10b981', MCD: '#10b981', MCO: '#10b981', MD: '#10b981', MI: '#10b981',
  DC: '#ef4444', ED: '#ef4444', EI: '#ef4444', SD: '#ef4444',
}

export default function Plantilla() {
  const navigate = useNavigate()
  const [jugadores, setJugadores] = useState([])
  const [formacion, setFormacion] = useState('4-3-3')
  const [titulares, setTitulares] = useState({}) // { slotIndex: jugadorClubId }
  const [guardando, setGuardando] = useState(false)
  const [success, setSuccess] = useState('')
  const [slotSeleccionado, setSlotSeleccionado] = useState(null)
  const [tab, setTab] = useState('cancha') // cancha | lista

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    cargarPlantilla()
  }, [])

  const cargarPlantilla = async () => {
  try {
    const { data } = await api.get('/club/mi-club')
    const jjs = data.jugadores || []
    setJugadores(jjs)

    // Cargar formación guardada
    const formGuardada = data.formacion || '4-3-3'
    setFormacion(formGuardada)

    // Cargar titulares con la formación guardada
    const coords = COORDS_FORMACION[formGuardada]
    const tits = {}
    const usados = new Set()

    jjs.forEach(jc => {
        if (jc.esTitular && jc.posicionFormacion) {
          const slotIdx = coords.findIndex((c, ci) =>
            c.pos === jc.posicionFormacion &&
            !usados.has(ci)
          )
          if (slotIdx !== -1) {
            tits[slotIdx] = jc.id
            usados.add(slotIdx)
          }
        }
      })
      setTitulares(tits)
    } catch (err) {
      console.error(err)
    }
  }

  const handleClickSlot = (slotIdx) => {
    if (titulares[slotIdx]) {
      // Sacar jugador del slot
      const nuevo = { ...titulares }
      delete nuevo[slotIdx]
      setTitulares(nuevo)
      setSlotSeleccionado(null)
    } else {
      setSlotSeleccionado(slotSeleccionado === slotIdx ? null : slotIdx)
    }
  }

  const handleAsignarJugador = (jugadorClubId) => {
    if (slotSeleccionado === null) return

    // Sacar de otro slot si ya estaba
    const nuevo = { ...titulares }
    Object.keys(nuevo).forEach(k => {
      if (nuevo[k] === jugadorClubId) delete nuevo[k]
    })
    nuevo[slotSeleccionado] = jugadorClubId
    setTitulares(nuevo)
    setSlotSeleccionado(null)
  }

  const handleCambiarFormacion = (nuevaFormacion) => {
    setFormacion(nuevaFormacion)
    setTitulares({})
    setSlotSeleccionado(null)
  }

  const handleGuardar = async () => {
  setGuardando(true)
  try {
      const coords = COORDS_FORMACION[formacion]
      const payload = jugadores.map(jc => ({
        jugadorClubId: jc.id,
        esTitular: Object.values(titulares).includes(jc.id),
        posicionFormacion: (() => {
          const slotIdx = Object.keys(titulares).find(k => titulares[k] === jc.id)
          return slotIdx !== undefined ? coords[slotIdx].pos : null
        })()
      }))
      await api.put('/club/formacion', { jugadores: payload, formacion }) // ← agregá formacion
      setSuccess('Formación guardada ✓')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally { setGuardando(false) }
  }

  const coords = COORDS_FORMACION[formacion]
  const titularesCount = Object.keys(titulares).length
  const suplentes = jugadores.filter(jc => !Object.values(titulares).includes(jc.id))
  const titularesJugadores = jugadores.filter(jc => Object.values(titulares).includes(jc.id))

  const getJugadorEnSlot = (slotIdx) => {
    const jcId = titulares[slotIdx]
    return jugadores.find(jc => jc.id === jcId)
  }

  return (
    <div style={S.root}>
      <div style={S.bg} />
      <div style={S.overlay} />
      <div style={S.topLine} />

      {/* HEADER */}
      <header style={S.header}>
        <button onClick={() => navigate('/dashboard')} style={S.backBtn}>
          <ChevronLeft size={18} /><span>DASHBOARD</span>
        </button>
        <div style={S.headerCenter}>
          <Users size={16} color="#a78bfa" />
          <span style={S.headerTitle}>MI PLANTILLA</span>
          <span style={S.headerSub}>{titularesCount}/11 TITULARES</span>
        </div>
        <button onClick={handleGuardar} disabled={guardando} style={S.saveBtn}>
          <Save size={14} />
          {guardando ? 'GUARDANDO...' : 'GUARDAR'}
        </button>
      </header>

      {success && <div style={S.successBar}>{success}</div>}

      <div style={S.mainLayout}>

        {/* PANEL IZQUIERDO: cancha */}
        <div style={S.leftPanel}>

          {/* Selector de formación */}
          <div style={S.formacionSelector}>
            {Object.keys(FORMACIONES).map(f => (
              <button key={f} onClick={() => handleCambiarFormacion(f)} style={{ ...S.formBtn, ...(formacion === f ? S.formBtnActive : {}) }}>
                {f}
              </button>
            ))}
          </div>

          {/* CANCHA */}
          <div style={S.canchaWrap}>
            {/* SVG cancha */}
            <svg viewBox="0 0 100 100" style={S.canchaFondo} preserveAspectRatio="none">
              {/* Césped */}
              {[0,1,2,3,4,5,6,7].map(i => (
                <rect key={i} x="0" y={i*12.5} width="100" height="12.5" fill={i%2===0 ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)'} />
              ))}
              {/* Líneas */}
              <rect x="5" y="3" width="90" height="94" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="0.8" fill="rgba(255,255,255,0.2)" />
              {/* Área grande arriba */}
              <rect x="22" y="3" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              {/* Área chica arriba */}
              <rect x="35" y="3" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              {/* Área grande abajo */}
              <rect x="22" y="81" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              {/* Área chica abajo */}
              <rect x="35" y="90" width="30" height="7" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              {/* Punto penal arriba */}
              <circle cx="50" cy="13" r="0.6" fill="rgba(255,255,255,0.2)" />
              {/* Punto penal abajo */}
              <circle cx="50" cy="87" r="0.6" fill="rgba(255,255,255,0.2)" />
            </svg>

            {/* Slots de jugadores */}
            {coords.map((coord, idx) => {
              const jugadorEnSlot = getJugadorEnSlot(idx)
              const estaSeleccionado = slotSeleccionado === idx
              const accentColor = COLOR_POS[coord.pos] || '#7c3aed'

              return (
                <div
                  key={idx}
                  onClick={() => handleClickSlot(idx)}
                  style={{
                    position: 'absolute',
                    left: `${coord.x}%`,
                    top: `${coord.y}%`,
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'transform 0.15s',
                  }}
                >
                  <div style={{
                    width: jugadorEnSlot ? '44px' : '36px',
                    height: jugadorEnSlot ? '44px' : '36px',
                    borderRadius: '50%',
                    border: `2px solid ${estaSeleccionado ? '#fff' : jugadorEnSlot ? accentColor : 'rgba(255,255,255,0.25)'}`,
                    background: jugadorEnSlot
                      ? `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`
                      : estaSeleccionado
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: estaSeleccionado
                      ? '0 0 0 3px rgba(255,255,255,0.3), 0 0 16px rgba(255,255,255,0.2)'
                      : jugadorEnSlot
                        ? `0 0 10px ${accentColor}60`
                        : 'none',
                    transition: 'all 0.2s',
                    backdropFilter: 'blur(4px)',
                  }}>
                    {jugadorEnSlot ? (
                      <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.55rem', letterSpacing: '0.5px', color: '#fff', textAlign: 'center', lineHeight: 1.1, padding: '2px' }}>
                        {jugadorEnSlot.jugador.nombre.split(' ').pop().substring(0, 8).toUpperCase()}
                      </span>
                    ) : (
                      <span style={{ fontFamily: "'Bebas Neue'", fontSize: '0.65rem', color: estaSeleccionado ? '#fff' : 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>
                        {coord.pos}
                      </span>
                    )}
                  </div>
                  {jugadorEnSlot && (
                    <div style={{ background: accentColor, borderRadius: '2px', padding: '1px 4px', fontFamily: "'Bebas Neue'", fontSize: '0.65rem', color: '#fff', letterSpacing: '1px' }}>
                      {jugadorEnSlot.jugador.media}
                    </div>
                  )}
                  {!jugadorEnSlot && (
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px', fontWeight: 700 }}>
                      {coord.pos}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Info media */}
          <div style={S.mediaBar}>
            <div style={S.mediaStat}>
              <span style={S.mediaLabel}>MEDIA EQUIPO</span>
              <span style={S.mediaVal}>
                {titularesJugadores.length > 0
                  ? Math.round(titularesJugadores.reduce((s, jc) => s + jc.jugador.media, 0) / titularesJugadores.length)
                  : '--'}
              </span>
            </div>
            <div style={S.mediaStat}>
              <span style={S.mediaLabel}>TITULARES</span>
              <span style={{ ...S.mediaVal, color: titularesCount === 11 ? '#22c55e' : '#f59e0b' }}>{titularesCount}/11</span>
            </div>
            <div style={S.mediaStat}>
              <span style={S.mediaLabel}>FORMACIÓN</span>
              <span style={{ ...S.mediaVal, color: '#a78bfa' }}>{formacion}</span>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: lista jugadores */}
        <div style={S.rightPanel}>
          <div style={S.rightTabs}>
            <button onClick={() => setTab('suplentes')} style={{ ...S.rightTab, ...(tab === 'suplentes' ? S.rightTabActive : {}) }}>
              BANCO ({suplentes.length})
            </button>
            <button onClick={() => setTab('titulares')} style={{ ...S.rightTab, ...(tab === 'titulares' ? S.rightTabActive : {}) }}>
              TITULARES ({titularesCount})
            </button>
          </div>

          {slotSeleccionado !== null && (
            <div style={S.slotHint}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', animation: 'pulse-dot 1s ease-in-out infinite' }} />
              ELEGÍ UN JUGADOR PARA LA POSICIÓN <strong style={{ color: '#fff' }}>{coords[slotSeleccionado]?.pos}</strong>
            </div>
          )}

          <div style={S.jugadoresList}>
            {(tab === 'suplentes' ? suplentes : titularesJugadores).map(jc => (
              <JugadorCard
                key={jc.id}
                jc={jc}
                seleccionable={slotSeleccionado !== null && tab === 'suplentes'}
                esTitular={Object.values(titulares).includes(jc.id)}
                onSelect={() => handleAsignarJugador(jc.id)}
                onRemove={() => {
                  const nuevo = { ...titulares }
                  Object.keys(nuevo).forEach(k => { if (nuevo[k] === jc.id) delete nuevo[k] })
                  setTitulares(nuevo)
                }}
              />
            ))}
            {(tab === 'suplentes' ? suplentes : titularesJugadores).length === 0 && (
              <div style={{ textAlign: 'center', padding: '6px 10px', color: 'rgba(255,255,255,0.2)', fontFamily: "'Barlow Condensed'", letterSpacing: '2px', fontSize: '0.78rem' }}>
                {tab === 'suplentes' ? 'TODOS EN EL ONCE' : 'SIN TITULARES AÚN'}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  )
}

function JugadorCard({ jc, seleccionable, esTitular, onSelect, onRemove }) {
  const [h, setH] = useState(false)
  const pos = jc.jugador.posicion?.[0] || '?'
  const accent = COLOR_POS[pos] || '#7c3aed'

  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={seleccionable ? onSelect : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 12px', borderRadius: '4px',
        background: h && seleccionable ? `${accent}18` : esTitular ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${h && seleccionable ? accent + '60' : esTitular ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.07)'}`,
        cursor: seleccionable ? 'pointer' : 'default',
        transition: 'all 0.15s',
        boxShadow: h && seleccionable ? `0 0 14px ${accent}25` : 'none',
      }}
    >
      {/* Media */}
      <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: `${accent}20`, border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue'", fontSize: '1rem', color: accent }}>{jc.jugador.media}</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.82rem', letterSpacing: '1px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {jc.jugador.nombre.toUpperCase()}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
          {(jc.jugador.posicion || []).slice(0, 2).map((p, i) => (
            <span key={i} style={{ padding: '1px 4px', borderRadius: '2px', background: `${COLOR_POS[p] || '#7c3aed'}18`, border: `1px solid ${COLOR_POS[p] || '#7c3aed'}30`, fontFamily: "'Barlow Condensed'", fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.5px', color: COLOR_POS[p] || '#7c3aed' }}>{p}</span>
          ))}
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', fontWeight: 600 }}>{jc.jugador.nacionalidad}</span>
        </div>
      </div>

      {/* Entrenamiento */}
      {jc.nivelEntrenamiento > 0 && (
        <div style={{ flexShrink: 0, display: 'flex', gap: '2px' }}>
          {Array.from({ length: jc.nivelEntrenamiento }).map((_, i) => (
            <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#06b6d4' }} />
          ))}
        </div>
      )}

      {/* Botón remover si es titular */}
      {esTitular && !seleccionable && (
        <button onClick={onRemove} style={{ width: '22px', height: '22px', borderRadius: '3px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
      )}

      {seleccionable && h && (
        <div style={{ flexShrink: 0, fontFamily: "'Barlow Condensed'", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1px', color: accent }}>PONER</div>
      )}
    </div>
  )
}

const S = {
  root: { height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Barlow', sans-serif", background: '#03010d', position: 'relative' },
  bg: { position: 'fixed', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1800&q=70')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.12) saturate(0.3)', zIndex: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(109,40,217,0.15) 0%, transparent 60%)', zIndex: 1 },
  topLine: { position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.8), rgba(167,139,250,1), rgba(124,58,237,0.8), transparent)', zIndex: 20 },
  header: { position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '52px', background: 'rgba(3,1,13,0.75)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 },
  backBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', padding: 0 },
  headerCenter: { display: 'flex', alignItems: 'center', gap: '10px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  headerTitle: { fontFamily: "'Bebas Neue'", fontSize: '1.15rem', letterSpacing: '4px', color: '#fff' },
  headerSub: { fontFamily: "'Barlow Condensed'", fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.35)' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '3px', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', border: 'none', color: '#fff', fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.75rem', letterSpacing: '2px', cursor: 'pointer' },
  successBar: { position: 'relative', zIndex: 10, padding: '8px 24px', background: 'rgba(34,197,94,0.12)', border: 'none', borderBottom: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', fontFamily: "'Barlow Condensed'", fontSize: '0.75rem', letterSpacing: '2px', fontWeight: 700, textAlign: 'center', flexShrink: 0 },
  mainLayout: { position: 'relative', zIndex: 10, flex: 1, display: 'flex', gap: '0', minHeight: 0, overflow: 'hidden' },
  leftPanel: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 20px', flex: '0 0 58%', borderRight: '1px solid rgba(255,255,255,0.06)' },
  formacionSelector: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  formBtn: { padding: '4px 8px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.15s' },
  formBtnActive: { background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.5)', color: '#fff' },
  canchaWrap: { flex: 1, position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', minHeight: 0 },
  canchaFondo: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  mediaBar: { display: 'flex', justifyContent: 'space-around', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 },
  mediaStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  mediaLabel: { fontFamily: "'Barlow Condensed'", fontSize: '0.55rem', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' },
  mediaVal: { fontFamily: "'Bebas Neue'", fontSize: '1rem', color: '#fff', lineHeight: 1 },
  rightPanel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  rightTabs: { display: 'flex', padding: '8px 16px', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 },
  rightTab: { padding: '6px 14px', borderRadius: '3px', background: 'transparent', border: '1px solid transparent', color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.15s' },
  rightTabActive: { background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#fff' },
  slotHint: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(124,58,237,0.1)', borderBottom: '1px solid rgba(124,58,237,0.2)', fontFamily: "'Barlow Condensed'", fontSize: '0.7rem', letterSpacing: '2px', color: '#a78bfa', fontWeight: 700, flexShrink: 0 },
  jugadoresList: { flex: 1, overflowY: 'auto', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '3px' },
}
