import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Trophy, Users, Settings, Play, ChevronLeft, Check, X, Clock, Shield } from 'lucide-react'

export default function Liga() {
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const [liga, setLiga] = useState(null)
  const [solicitudes, setSolicitudes] = useState([])
  const [clubes, setClubes] = useState([])
  const [tab, setTab] = useState('tabla')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formReglas, setFormReglas] = useState({ frecuenciaDias: 3 })
  const [editandoReglas, setEditandoReglas] = useState(false)

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    cargarDatos()
  }, [])

  useEffect(() => {
    if (!liga || !club?.esAdmin) return
    const interval = setInterval(cargarSolicitudes, 8000)
    return () => clearInterval(interval)
  }, [liga, club])

  const cargarDatos = async () => {
    try {
      const { data: clubData } = await api.get('/club/mi-club')
      setClub(clubData)
      setFormReglas({ frecuenciaDias: clubData.liga.frecuenciaDias })

      const { data: ligaData } = await api.get(`/liga/${clubData.ligaId}`)
      setLiga(ligaData)
      setClubes(ligaData.clubes || [])

      if (ligaData.creadorId === clubData.userId) {
        cargarSolicitudes(ligaData.id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const cargarSolicitudes = async (ligaId) => {
    try {
      const id = ligaId || liga?.id
      if (!id) return
      const { data } = await api.get(`/solicitud/liga/${id}`)
      setSolicitudes(data)
    } catch {}
  }

  const handleResponder = async (id, accion) => {
    try {
      await api.put(`/solicitud/responder/${id}`, { accion })
      setSolicitudes(prev => prev.filter(s => s.id !== id))
      setSuccess(accion === 'aceptar' ? 'Solicitud aceptada ✓' : 'Solicitud rechazada')
      setTimeout(() => setSuccess(''), 3000)
      if (accion === 'aceptar') cargarDatos()
    } catch {}
  }

  const handleIniciar = async () => {
    setLoading(true); setError('')
    try {
      await api.post('/solicitud/iniciar', { ligaId: liga.id })
      setSuccess('¡Liga iniciada! 🚀')
      setTimeout(() => setSuccess(''), 3000)
      cargarDatos()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar')
    } finally { setLoading(false) }
  }

  const handleGuardarReglas = async () => {
    setLoading(true); setError('')
    try {
      await api.put('/solicitud/reglas', { ligaId: liga.id, ...formReglas })
      setSuccess('Reglas actualizadas ✓')
      setEditandoReglas(false)
      setTimeout(() => setSuccess(''), 3000)
      cargarDatos()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally { setLoading(false) }
  }

  const esAdmin = liga && club && liga.creadorId === club.userId

  return (
    <div style={S.root}>
      <div style={S.bg} />
      <div style={S.overlay} />
      <div style={S.topLine} />

      {/* HEADER */}
      <header style={S.header}>
        <button onClick={() => navigate('/dashboard')} style={S.backBtn}>
          <ChevronLeft size={18} />
          <span>DASHBOARD</span>
        </button>
        <div style={S.headerCenter}>
          <Trophy size={18} color="#7c3aed" />
          <span style={S.headerTitle}>{liga?.nombre || 'MI LIGA'}</span>
          {liga?.iniciada
            ? <span style={S.badge('green')}>ACTIVA</span>
            : <span style={S.badge('yellow')}>ESPERANDO</span>
          }
        </div>
        {esAdmin && (
          <div style={S.adminBadge}>
            <Shield size={12} color="#a78bfa" />
            <span>ADMIN</span>
          </div>
        )}
      </header>

      <div style={S.content}>

        {/* TABS */}
        <div style={S.tabs}>
          {[
            { id: 'tabla', label: 'TABLA', icon: <Trophy size={14} /> },
            { id: 'clubes', label: 'CLUBES', icon: <Users size={14} /> },
            ...(esAdmin ? [
              { id: 'solicitudes', label: `SOLICITUDES${solicitudes.length > 0 ? ` (${solicitudes.length})` : ''}`, icon: <Clock size={14} /> },
              { id: 'ajustes', label: 'AJUSTES', icon: <Settings size={14} /> },
            ] : []),
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* MESSAGES */}
        {error && <div style={S.error}>{error}</div>}
        {success && <div style={S.successMsg}>{success}</div>}

        {/* TAB: TABLA */}
        {tab === 'tabla' && (
          <div style={S.panel}>
            {clubes.length === 0 ? (
              <EmptyState icon={<Users size={40} color="rgba(255,255,255,0.15)" />} title="TODAVÍA NO HAY CLUBES" desc={esAdmin ? "Compartí el código de la liga para que se unan tus amigos" : "Esperando que se unan más jugadores"} />
            ) : (
              <div style={S.tabla}>
                <div style={S.tablaHeader}>
                  <span style={{ width: '30px' }}>#</span>
                  <span style={{ flex: 1 }}>CLUB</span>
                  <span style={S.tablaCol}>PJ</span>
                  <span style={S.tablaCol}>G</span>
                  <span style={S.tablaCol}>E</span>
                  <span style={S.tablaCol}>P</span>
                  <span style={S.tablaCol}>GF</span>
                  <span style={S.tablaCol}>GC</span>
                  <span style={{ ...S.tablaCol, color: '#a78bfa' }}>PTS</span>
                </div>
                {clubes.map((c, i) => (
                  <div key={c.id} style={{ ...S.tablaRow, ...(c.userId === club?.userId ? S.tablaRowYou : {}) }}>
                    <span style={{ width: '30px', fontFamily: "'Bebas Neue'", fontSize: '1.1rem', color: i < 3 ? '#f59e0b' : 'rgba(255,255,255,0.4)' }}>{i + 1}</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.9rem', letterSpacing: '1px', color: '#fff' }}>{c.nombre}</span>
                      {c.userId === club?.userId && <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.58rem', letterSpacing: '2px', color: '#7c3aed', fontWeight: 700 }}>TU CLUB</span>}
                    </div>
                    {[0, 0, 0, 0, 0, 0, 0].map((_, j) => (
                      <span key={j} style={S.tablaCol}>0</span>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Código si no está iniciada */}
            {!liga?.iniciada && esAdmin && (
              <div style={S.codigoBox}>
                <div style={S.codigoLabel}>CÓDIGO DE INVITACIÓN</div>
                <div style={S.codigoVal}>{liga?.codigo}</div>
                <div style={S.codigoSub}>Compartí este código con tus amigos para que se unan</div>
              </div>
            )}
          </div>
        )}

        {/* TAB: CLUBES */}
        {tab === 'clubes' && (
          <div style={S.panel}>
            {clubes.length === 0 ? (
              <EmptyState icon={<Users size={40} color="rgba(255,255,255,0.15)" />} title="TODAVÍA NO HAY CLUBES" desc="Nadie se unió a la liga todavía" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {clubes.map(c => (
                  <ClubCard key={c.id} club={c} esMio={c.userId === club?.userId} esAdmin={esAdmin && liga.creadorId === c.userId} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SOLICITUDES (admin) */}
        {tab === 'solicitudes' && esAdmin && (
          <div style={S.panel}>
            <div style={S.panelTitle}>SOLICITUDES PENDIENTES</div>
            {solicitudes.length === 0 ? (
              <EmptyState icon={<Clock size={40} color="rgba(255,255,255,0.15)" />} title="SIN SOLICITUDES" desc="No hay solicitudes pendientes por ahora" />
            ) : (
              solicitudes.map(s => (
                <div key={s.id} style={S.solicitudRow}>
                  <div style={S.solicitudAvatar}>{s.user?.username?.[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', letterSpacing: '1px', color: '#fff' }}>{s.user?.username?.toUpperCase()}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.68rem', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)' }}>{s.user?.email}</div>
                  </div>
                  <button onClick={() => handleResponder(s.id, 'aceptar')} style={S.btnAceptar}>
                    <Check size={14} /> ACEPTAR
                  </button>
                  <button onClick={() => handleResponder(s.id, 'rechazar')} style={S.btnRechazar}>
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: AJUSTES (admin) */}
        {tab === 'ajustes' && esAdmin && (
          <div style={S.panel}>
            <div style={S.panelTitle}>AJUSTES DE LA LIGA</div>

            {/* Iniciar liga */}
            {!liga?.iniciada && (
              <div style={S.ajusteCard}>
                <div style={S.ajusteInfo}>
                  <Play size={18} color="#22c55e" />
                  <div>
                    <div style={S.ajusteTitulo}>INICIAR LIGA</div>
                    <div style={S.ajusteDesc}>Una vez iniciada no se podrán unir más jugadores. Necesitás al menos 2 clubes.</div>
                  </div>
                </div>
                <button onClick={handleIniciar} disabled={loading || clubes.length < 2} style={{ ...S.btnIniciar, opacity: clubes.length < 2 ? 0.4 : 1 }}>
                  {loading ? 'INICIANDO...' : `🚀 INICIAR (${clubes.length} CLUBES)`}
                </button>
              </div>
            )}

            {liga?.iniciada && (
              <div style={{ ...S.ajusteCard, borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)' }}>
                <div style={S.ajusteInfo}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                  <div>
                    <div style={{ ...S.ajusteTitulo, color: '#22c55e' }}>LIGA ACTIVA</div>
                    <div style={S.ajusteDesc}>La liga está en curso. No se pueden unir nuevos jugadores.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Frecuencia */}
            {!liga?.iniciada && (
              <div style={S.ajusteCard}>
                <div style={S.ajusteInfo}>
                  <Settings size={18} color="#a78bfa" />
                  <div>
                    <div style={S.ajusteTitulo}>FRECUENCIA DE FECHAS</div>
                    <div style={S.ajusteDesc}>Cada cuántos días se simula una fecha de partidos</div>
                  </div>
                </div>
                {editandoReglas ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[2, 3, 4, 7].map(d => (
                      <button key={d} onClick={() => setFormReglas({ frecuenciaDias: d })} style={{ padding: '6px 12px', borderRadius: '3px', border: `1px solid ${formReglas.frecuenciaDias === d ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`, background: formReglas.frecuenciaDias === d ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', color: formReglas.frecuenciaDias === d ? '#fff' : 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                        {d}D
                      </button>
                    ))}
                    <button onClick={handleGuardarReglas} style={{ padding: '6px 12px', borderRadius: '3px', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#fff', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                      GUARDAR
                    </button>
                    <button onClick={() => setEditandoReglas(false)} style={{ padding: '6px 10px', borderRadius: '3px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: "'Bebas Neue'", fontSize: '1.3rem', color: '#a78bfa' }}>CADA {liga?.frecuenciaDias} DÍAS</span>
                    <button onClick={() => setEditandoReglas(true)} style={{ padding: '5px 10px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', letterSpacing: '1px' }}>
                      EDITAR
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Código */}
            <div style={S.ajusteCard}>
              <div style={S.ajusteInfo}>
                <Shield size={18} color="#06b6d4" />
                <div>
                  <div style={S.ajusteTitulo}>CÓDIGO DE LA LIGA</div>
                  <div style={S.ajusteDesc}>Compartí este código para invitar jugadores a tu liga privada</div>
                </div>
              </div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', letterSpacing: '5px', color: '#06b6d4', textShadow: '0 0 15px rgba(6,182,212,0.4)' }}>
                {liga?.codigo}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ClubCard({ club, esMio, esAdmin }) {
  return (
    <div style={{ padding: '18px', borderRadius: '4px', background: esMio ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${esMio ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {club.nombre?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px', color: '#fff', lineHeight: 1 }}>{club.nombre}</div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.65rem', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{club.user?.username}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {esMio && <span style={{ padding: '2px 7px', borderRadius: '2px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', fontFamily: "'Barlow Condensed'", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1px', color: '#a78bfa' }}>TU CLUB</span>}
        {esAdmin && <span style={{ padding: '2px 7px', borderRadius: '2px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', fontFamily: "'Barlow Condensed'", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1px', color: '#f59e0b' }}>ADMIN</span>}
      </div>
    </div>
  )
}

function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', gap: '12px', textAlign: 'center' }}>
      {icon}
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', letterSpacing: '3px', color: 'rgba(255,255,255,0.3)' }}>{title}</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.78rem', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.2)', fontWeight: 600, maxWidth: '300px' }}>{desc}</div>
    </div>
  )
}

const S = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Barlow', sans-serif", background: '#03010d', position: 'relative' },
  bg: { position: 'fixed', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1800&q=70')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.12) saturate(0.3)', zIndex: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(109,40,217,0.18) 0%, transparent 60%)', zIndex: 1 },
  topLine: { position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.8), rgba(167,139,250,1), rgba(124,58,237,0.8), transparent)', zIndex: 20 },
  header: { position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: '56px', background: 'rgba(3,1,13,0.75)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 },
  backBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.78rem', letterSpacing: '2px', padding: 0, transition: 'color 0.2s' },
  headerCenter: { display: 'flex', alignItems: 'center', gap: '10px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  headerTitle: { fontFamily: "'Bebas Neue'", fontSize: '1.2rem', letterSpacing: '4px', color: '#fff' },
  badge: (color) => ({ padding: '2px 8px', borderRadius: '2px', background: color === 'green' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', border: `1px solid ${color === 'green' ? 'rgba(34,197,94,0.4)' : 'rgba(245,158,11,0.4)'}`, fontFamily: "'Barlow Condensed'", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '2px', color: color === 'green' ? '#22c55e' : '#f59e0b' }),
  adminBadge: { display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '2px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', fontFamily: "'Barlow Condensed'", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '2px', color: '#a78bfa' },
  content: { position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 28px', gap: '16px', maxWidth: '900px', width: '100%', margin: '0 auto' },
  tabs: { display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '4px', width: 'fit-content' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '3px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.78rem', letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(124,58,237,0.25)', color: '#fff', border: '1px solid rgba(124,58,237,0.3)' },
  panel: { display: 'flex', flexDirection: 'column', gap: '10px' },
  panelTitle: { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '4px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' },
  tabla: { display: 'flex', flexDirection: 'column', gap: '4px' },
  tablaHeader: { display: 'flex', alignItems: 'center', padding: '6px 12px', fontFamily: "'Barlow Condensed'", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' },
  tablaCol: { width: '36px', textAlign: 'center', fontFamily: "'Barlow Condensed'", fontSize: '0.78rem', fontWeight: 700 },
  tablaRow: { display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.2s' },
  tablaRowYou: { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' },
  codigoBox: { padding: '20px 24px', borderRadius: '4px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', marginTop: '8px', textAlign: 'center' },
  codigoLabel: { fontFamily: "'Barlow Condensed'", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '4px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' },
  codigoVal: { fontFamily: "'Bebas Neue'", fontSize: '2.5rem', letterSpacing: '8px', color: '#7c3aed', textShadow: '0 0 20px rgba(124,58,237,0.5)' },
  codigoSub: { fontFamily: "'Barlow Condensed'", fontSize: '0.7rem', letterSpacing: '1px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' },
  solicitudRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' },
  solicitudAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#fff', flexShrink: 0 },
  btnAceptar: { display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '3px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '1px', cursor: 'pointer' },
  btnRechazar: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '3px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', cursor: 'pointer' },
  ajusteCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '18px 20px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' },
  ajusteInfo: { display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 },
  ajusteTitulo: { fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.88rem', letterSpacing: '2px', color: '#fff', lineHeight: 1, marginBottom: '4px' },
  ajusteDesc: { fontFamily: "'Barlow'", fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 },
  btnIniciar: { padding: '10px 20px', borderRadius: '4px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: '#fff', fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.82rem', letterSpacing: '2px', cursor: 'pointer' },
  error: { padding: '10px 14px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontFamily: "'Barlow Condensed'", fontSize: '0.8rem', letterSpacing: '1px' },
  successMsg: { padding: '10px 14px', borderRadius: '4px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', fontFamily: "'Barlow Condensed'", fontSize: '0.8rem', letterSpacing: '1px' },
}
