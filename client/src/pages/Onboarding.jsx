import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Search } from 'lucide-react'
import api from '../services/api'
import useAuthStore from '../store/useAuthStore'
import EscudoEditor from '../components/EscudoEditor'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [step, setStep] = useState('elegir') // elegir | crear-liga | unirse-liga | crear-club | esperando | lobby
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ligaData, setLigaData] = useState(null)
  const [solicitudId, setSolicitudId] = useState(null)
  const [solicitudes, setSolicitudes] = useState([])

  // Form crear liga
  const [formLiga, setFormLiga] = useState({
    nombre: '',
    frecuenciaDias: 3,
    esPublica: false,
    minimoJugadores: 2,
  })

  // Form crear club
  const [formClub, setFormClub] = useState({
    nombre: '',
    escudo: null,
  })

  // Form unirse
  const [busqueda, setBusqueda] = useState('')
  const [codigo, setCodigo] = useState('')
  const [ligasBuscadas, setLigasBuscadas] = useState([])
  const [modoUnirse, setModoUnirse] = useState('buscar') // buscar | codigo

  useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const ligaId = params.get('ligaId')
  const stepParam = params.get('step')

  if (ligaId && stepParam === 'crear-club') {
    // Cargar la liga y mostrar el paso de crear club
    const cargarLiga = async () => {
      try {
        const { data } = await api.get(`/liga/${ligaId}`)
        setLigaData(data)
        setStep('crear-club')
      } catch {}
    }
    cargarLiga()
  }
}, [])

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  // Polling para solicitud aceptada
  useEffect(() => {
    if (step !== 'esperando') return
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get('/solicitud/mis-solicitudes')
        if (data?.estado === 'aceptada') {
          setLigaData(data.liga)
          setStep('crear-club')
          clearInterval(interval)
        }
      } catch {}
    }, 4000)
    return () => clearInterval(interval)
  }, [step])

  // Polling solicitudes para el creador en lobby
  useEffect(() => {
    if (step !== 'lobby' || !ligaData) return
    const fetchSolicitudes = async () => {
      try {
        const { data } = await api.get(`/solicitud/liga/${ligaData.id}`)
        setSolicitudes(data)
      } catch {}
    }
    fetchSolicitudes()
    const interval = setInterval(fetchSolicitudes, 5000)
    return () => clearInterval(interval)
  }, [step, ligaData])

  const handleCrearLiga = async () => {
    if (!formLiga.nombre.trim()) return setError('Ingresá un nombre para la liga')
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/liga/crear', formLiga)
      setLigaData(data)
      setStep('crear-club')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la liga')
    } finally { setLoading(false) }
  }

  const handleBuscarLigas = async () => {
    try {
      const { data } = await api.get(`/solicitud/buscar?q=${busqueda}`)
      setLigasBuscadas(data)
    } catch {}
  }

  const handleSolicitarUnirse = async (liga) => {
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/solicitud/solicitar', { ligaId: liga.id })
      setSolicitudId(data.id)
      setLigaData(liga)
      navigate('/esperando')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al solicitar')
    } finally { setLoading(false) }
  }

  const handleUnirseConCodigo = async () => {
    if (!codigo.trim()) return setError('Ingresá un código')
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/solicitud/codigo', { codigo })
      setLigaData(data.liga)
      // Liga privada → solicitar y esperar
      const { data: solicitud } = await api.post('/solicitud/solicitar', { ligaId: data.liga.id })
      setSolicitudId(solicitud.id)
      navigate('/esperando')
    } catch (err) {
      setError(err.response?.data?.error || 'Código inválido')
    } finally { setLoading(false) }
  }

  const handleCancelarSolicitud = async () => {
    try {
      await api.delete(`/solicitud/cancelar/${solicitudId}`)
      setStep('unirse-liga')
      setSolicitudId(null)
      setLigaData(null)
    } catch {}
  }

  const handleCrearClub = async () => {
    if (!formClub.nombre.trim()) return setError('Ingresá un nombre para tu club')
    if (!formClub.escudo) return setError('Diseñá tu escudo antes de continuar')
    setLoading(true); setError('')
    try {
      await api.post('/club/crear', {
        nombre: formClub.nombre,
        escudo: formClub.escudo,
        ligaId: ligaData.id,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el club')
    } finally { setLoading(false) }
  }

  const handleResponderSolicitud = async (id, accion) => {
    try {
      await api.put(`/solicitud/responder/${id}`, { accion })
      setSolicitudes(prev => prev.filter(s => s.id !== id))
    } catch {}
  }

  const handleIniciarLiga = async () => {
    setLoading(true); setError('')
    try {
      await api.post('/solicitud/iniciar', { ligaId: ligaData.id })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar la liga')
    } finally { setLoading(false) }
  }

  return (
    <div style={S.root}>
      <div style={S.bg} />
      <div style={S.overlay} />
      <div style={S.topLine} />

      <div style={S.header}>
        <span style={S.logo}>⚽ CLUBMASTERS</span>
        <span style={S.headerSub}>FOOTBALL MANAGER</span>
      </div>

      <div style={S.content}>
        {step === 'elegir' && <StepElegir onCrear={() => setStep('crear-liga')} onUnirse={() => setStep('unirse-liga')} user={user} />}
        {step === 'crear-liga' && <StepCrearLiga form={formLiga} setForm={setFormLiga} onBack={() => setStep('elegir')} onNext={handleCrearLiga} loading={loading} error={error} />}
        {step === 'unirse-liga' && <StepUnirse modoUnirse={modoUnirse} setModoUnirse={setModoUnirse} busqueda={busqueda} setBusqueda={setBusqueda} ligas={ligasBuscadas} onBuscar={handleBuscarLigas} onSolicitar={handleSolicitarUnirse} codigo={codigo} setCodigo={setCodigo} onCodigo={handleUnirseConCodigo} onBack={() => setStep('elegir')} loading={loading} error={error} />}
        {step === 'crear-club' && <StepCrearClub form={formClub} setForm={setFormClub} onNext={handleCrearClub} loading={loading} error={error} ligaNombre={ligaData?.nombre} />}
      </div>
    </div>
  )
}

// ─── STEP: ELEGIR ────────────────────────────────────────────────────────────
function StepElegir({ onCrear, onUnirse, user }) {
  return (
    <div style={S.stepWrap}>
      <div style={S.stepTitle}>
        <div style={S.stepPre}>BIENVENIDO, {user?.username?.toUpperCase()}</div>
        <h2 style={S.stepH2}>¿CÓMO QUERÉS EMPEZAR?</h2>
        <p style={S.stepDesc}>Creá tu propia liga o unite a una existente</p>
      </div>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <OptionCard
          icon={<Trophy size={40} color="#7c3aed" strokeWidth={1.5} />}
          title="CREAR LIGA"
          desc="Creá tu propia liga, invitá amigos y definí las reglas"
          accent="#7c3aed"
          onClick={onCrear}
          features={['Elegís el nombre y las reglas', 'Pública o privada', 'Vos decidís cuándo arrancar']}
        />
        <OptionCard
          icon={<Search size={40} color="#06b6d4" strokeWidth={1.5} />}
          title="UNIRSE A LIGA"
          desc="Buscá una liga pública o ingresá un código privado"
          accent="#06b6d4"
          onClick={onUnirse}
          features={['Buscá por nombre', 'Ingresá código privado', 'El creador te acepta']}
        />
      </div>
    </div>
  )
}

function OptionCard({ icon, title, desc, accent, onClick, features }) {
  const [h, setH] = useState(false)
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick} style={{ width: '300px', padding: '32px 28px', borderRadius: '6px', cursor: 'pointer', background: h ? `linear-gradient(145deg, ${accent}18, rgba(3,1,13,0.6))` : 'rgba(255,255,255,0.04)', border: `1px solid ${h ? accent + '70' : 'rgba(255,255,255,0.1)'}`, borderTop: `3px solid ${accent}`, boxShadow: h ? `0 0 40px ${accent}30` : 'none', transition: 'all 0.25s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ filter: h ? `drop-shadow(0 0 12px ${accent})` : 'none', transition: 'filter 0.3s' }}>{icon}</div>
      <div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', letterSpacing: '3px', color: '#fff', lineHeight: 1, marginBottom: '8px' }}>{title}</div>
        <div style={{ fontFamily: "'Barlow'", fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{desc}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: accent, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '1rem', letterSpacing: '1px', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{f}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
        <div style={{ height: '1px', width: h ? '32px' : '16px', background: accent, transition: 'width 0.3s' }} />
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '3px', color: accent }}>EMPEZAR</span>
      </div>
    </div>
  )
}

// ─── STEP: CREAR LIGA ────────────────────────────────────────────────────────
function StepCrearLiga({ form, setForm, onBack, onNext, loading, error }) {
  return (
    <div style={S.stepWrap}>
      <div style={S.stepTitle}>
        <div style={S.stepPre}>PASO 1 DE 2</div>
        <h2 style={S.stepH2}>CREAR LIGA</h2>
        <p style={S.stepDesc}>Configurá tu liga antes de crear tu club</p>
      </div>
      <div style={S.formCard}>
        <FormField label="NOMBRE DE LA LIGA">
          <input style={S.input} placeholder="Ej: La Liga de los Pibes" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
        </FormField>

        <FormField label="FRECUENCIA DE FECHAS">
          <div style={{ display: 'flex', gap: '8px' }}>
            {[2, 3, 4, 7].map(d => (
              <button key={d} onClick={() => setForm({ ...form, frecuenciaDias: d })} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: `1px solid ${form.frecuenciaDias === d ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`, background: form.frecuenciaDias === d ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', color: form.frecuenciaDias === d ? '#fff' : 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s' }}>
                {d} DÍAS
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="TIPO DE LIGA">
          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ val: false, label: '🔒 PRIVADA', desc: 'Solo con código' }, { val: true, label: '🌍 PÚBLICA', desc: 'Aparece en búsquedas' }].map(opt => (
              <button key={String(opt.val)} onClick={() => setForm({ ...form, esPublica: opt.val })} style={{ flex: 1, padding: '12px', borderRadius: '4px', border: `1px solid ${form.esPublica === opt.val ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`, background: form.esPublica === opt.val ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', color: form.esPublica === opt.val ? '#fff' : 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.82rem', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
                <div>{opt.label}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '2px', fontWeight: 600 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </FormField>

        {form.esPublica && (
          <FormField label="MÍNIMO DE JUGADORES PARA ARRANCAR">
            <div style={{ display: 'flex', gap: '8px' }}>
              {[2, 4, 6, 8, 10].map(n => (
                <button key={n} onClick={() => setForm({ ...form, minimoJugadores: n })} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: `1px solid ${form.minimoJugadores === n ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`, background: form.minimoJugadores === n ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', color: form.minimoJugadores === n ? '#fff' : 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {n}
                </button>
              ))}
            </div>
          </FormField>
        )}

        {error && <div style={S.error}>{error}</div>}

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button style={S.btnSecondary} onClick={onBack}>← VOLVER</button>
          <button style={S.btnPrimary} onClick={onNext} disabled={loading}>
            {loading ? 'CREANDO...' : 'SIGUIENTE: CREAR CLUB →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── STEP: UNIRSE A LIGA ─────────────────────────────────────────────────────
function StepUnirse({ modoUnirse, setModoUnirse, busqueda, setBusqueda, ligas, onBuscar, onSolicitar, codigo, setCodigo, onCodigo, onBack, loading, error }) {
  return (
    <div style={S.stepWrap}>
      <div style={S.stepTitle}>
        <div style={S.stepPre}>UNIRSE A UNA LIGA</div>
        <h2 style={S.stepH2}>ENCONTRÁ TU LIGA</h2>
      </div>
      <div style={S.formCard}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[{ id: 'buscar', label: '🔍 BUSCAR PÚBLICA' }, { id: 'codigo', label: '🔒 INGRESAR CÓDIGO' }].map(m => (
            <button key={m.id} onClick={() => setModoUnirse(m.id)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: `1px solid ${modoUnirse === m.id ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`, background: modoUnirse === m.id ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)', color: modoUnirse === m.id ? '#fff' : 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.82rem', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s' }}>
              {m.label}
            </button>
          ))}
        </div>

        {modoUnirse === 'buscar' ? (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="Buscar liga por nombre..." value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && onBuscar()} />
              <button style={S.btnPrimary} onClick={onBuscar}>BUSCAR</button>
            </div>
            {ligas.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow Condensed'", letterSpacing: '2px', fontSize: '0.85rem' }}>
                BUSCÁ UNA LIGA PARA VER RESULTADOS
              </div>
            )}
            {ligas.map(liga => (
              <div key={liga.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', letterSpacing: '2px', color: '#fff' }}>{liga.nombre}</div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
                    {liga._count?.clubes || 0} CLUBES · CADA {liga.frecuenciaDias} DÍAS
                  </div>
                </div>
                <button style={{ ...S.btnPrimary, padding: '8px 16px', fontSize: '0.75rem' }} onClick={() => onSolicitar(liga)} disabled={loading}>
                  SOLICITAR
                </button>
              </div>
            ))}
          </>
        ) : (
          <>
            <FormField label="CÓDIGO DE LA LIGA">
              <input style={S.input} placeholder="Ej: ABC123" value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} />
            </FormField>
            {error && <div style={S.error}>{error}</div>}
            <button style={S.btnPrimary} onClick={onCodigo} disabled={loading}>
              {loading ? 'VERIFICANDO...' : 'INGRESAR CON CÓDIGO'}
            </button>
          </>
        )}

        <button style={{ ...S.btnSecondary, marginTop: '12px' }} onClick={onBack}>← VOLVER</button>
      </div>
    </div>
  )
}

// ─── STEP: CREAR CLUB ────────────────────────────────────────────────────────
function StepCrearClub({ form, setForm, onNext, loading, error, ligaNombre }) {
  return (
    <div style={S.stepWrap}>
      <div style={S.stepTitle}>
        <div style={S.stepPre}>PASO 2 DE 2 · {ligaNombre}</div>
        <h2 style={S.stepH2}>CREÁ TU CLUB</h2>
        <p style={S.stepDesc}>Elegí el nombre y diseñá el escudo de tu club</p>
      </div>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={S.formCard}>
          <FormField label="NOMBRE DEL CLUB">
            <input style={S.input} placeholder="Ej: Los Guerreros FC" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </FormField>
          {error && <div style={S.error}>{error}</div>}
          <button style={S.btnPrimary} onClick={onNext} disabled={loading || !form.escudo}>
            {loading ? 'CREANDO...' : !form.escudo ? 'DISEÑÁ TU ESCUDO PRIMERO' : '¡CREAR CLUB Y EMPEZAR! →'}
          </button>
        </div>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '3px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>DISEÑÁ TU ESCUDO</div>
          <EscudoEditor onSave={escudo => setForm(f => ({ ...f, escudo }))} />
        </div>
      </div>
    </div>
  )
}

// ─── STEP: ESPERANDO ─────────────────────────────────────────────────────────
function StepEsperando({ liga, onCancelar }) {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    const i = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 600)
    return () => clearInterval(i)
  }, [])
  return (
    <div style={{ ...S.stepWrap, alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>⏳</div>
      <div style={S.stepPre}>SOLICITUD ENVIADA</div>
      <h2 style={S.stepH2}>ESPERANDO RESPUESTA{dots}</h2>
      <p style={{ ...S.stepDesc, maxWidth: '400px' }}>
        Tu solicitud para unirte a <strong style={{ color: '#fff' }}>{liga?.nombre}</strong> fue enviada. El creador de la liga necesita aceptarte.
      </p>
      <div style={{ padding: '16px 24px', borderRadius: '4px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', marginTop: '8px', marginBottom: '24px', fontFamily: "'Barlow Condensed'", fontSize: '0.8rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)' }}>
        🔄 VERIFICANDO AUTOMÁTICAMENTE CADA 4 SEGUNDOS
      </div>
      <button style={S.btnSecondary} onClick={onCancelar}>CANCELAR SOLICITUD</button>
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  )
}

// ─── STEP: LOBBY ─────────────────────────────────────────────────────────────
function StepLobby({ liga, solicitudes, onResponder, onIniciar, loading, error }) {
  return (
    <div style={S.stepWrap}>
      <div style={S.stepTitle}>
        <div style={S.stepPre}>LOBBY DE LIGA</div>
        <h2 style={S.stepH2}>{liga?.nombre?.toUpperCase()}</h2>
        <p style={S.stepDesc}>Esperá que se unan tus amigos y después iniciá la liga</p>
      </div>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* Info liga */}
        <div style={{ ...S.formCard, minWidth: '280px' }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '3px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>INFO DE LA LIGA</div>
          <InfoRow label="CÓDIGO" value={liga?.codigo} accent highlight />
          <InfoRow label="TIPO" value={liga?.esPublica ? 'PÚBLICA' : 'PRIVADA'} />
          <InfoRow label="FRECUENCIA" value={`CADA ${liga?.frecuenciaDias} DÍAS`} />
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.7rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>COMPARTÍ EL CÓDIGO</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', letterSpacing: '6px', color: '#7c3aed', textShadow: '0 0 20px rgba(124,58,237,0.5)' }}>{liga?.codigo}</div>
          </div>
        </div>

        {/* Solicitudes */}
        <div style={{ ...S.formCard, minWidth: '320px' }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '3px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
            SOLICITUDES PENDIENTES {solicitudes.length > 0 && <span style={{ color: '#7c3aed' }}>({solicitudes.length})</span>}
          </div>
          {solicitudes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.25)', fontFamily: "'Barlow Condensed'", letterSpacing: '2px', fontSize: '0.78rem' }}>
              SIN SOLICITUDES PENDIENTES
            </div>
          ) : (
            solicitudes.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {s.user?.username?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.88rem', letterSpacing: '1px', color: '#fff', flex: 1 }}>{s.user?.username?.toUpperCase()}</span>
                <button onClick={() => onResponder(s.id, 'aceptar')} style={{ padding: '5px 10px', borderRadius: '3px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '1px', cursor: 'pointer' }}>✓ ACEPTAR</button>
                <button onClick={() => onResponder(s.id, 'rechazar')} style={{ padding: '5px 10px', borderRadius: '3px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '1px', cursor: 'pointer' }}>✗</button>
              </div>
            ))
          )}

          {error && <div style={S.error}>{error}</div>}

          <button style={{ ...S.btnPrimary, marginTop: '16px', width: '100%' }} onClick={onIniciar} disabled={loading}>
            {loading ? 'INICIANDO...' : '🚀 INICIAR LIGA'}
          </button>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.65rem', letterSpacing: '1px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '8px' }}>
            Necesitás al menos 2 clubes para iniciar
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.68rem', letterSpacing: '3px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{label}</div>
      {children}
    </div>
  )
}

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.72rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.88rem', letterSpacing: '2px', color: highlight ? '#a78bfa' : '#fff', fontWeight: 700 }}>{value}</span>
    </div>
  )
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  root: { minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', fontFamily: "'Barlow', sans-serif", background: '#03010d', overflowX: 'hidden' },
  bg: { position: 'fixed', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1800&q=70')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.15) saturate(0.4)', zIndex: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(109,40,217,0.2) 0%, transparent 60%), linear-gradient(180deg, rgba(3,1,13,0.6) 0%, rgba(3,1,13,0.4) 100%)', zIndex: 1 },
  topLine: { position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.8), rgba(167,139,250,1), rgba(124,58,237,0.8), transparent)', zIndex: 20 },
  header: { position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0 0', gap: '2px' },
  logo: { fontFamily: "'Bebas Neue'", fontSize: '1.6rem', letterSpacing: '6px', color: '#fff' },
  headerSub: { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.6rem', letterSpacing: '5px', color: '#7c3aed' },
  content: { position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1px 20px 40px' },
  stepWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', width: '100%', maxWidth: '860px' },
  stepTitle: { textAlign: 'center' },
  stepPre: { fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '1rem', letterSpacing: '5px', color: '#7c3aed', marginBottom: '16px' },
  stepH2: { fontFamily: "'Bebas Neue'", fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '6px', color: '#fff', margin: 0, lineHeight: 1, textShadow: '0 0 40px rgba(109,40,217,0.4)' },
  stepDesc: { fontFamily: "'Barlow'", fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', marginTop: '8px', lineHeight: 1.5 },
  formCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '6px', padding: '28px', minWidth: '360px', maxWidth: '480px', width: '100%' },
  input: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', padding: '12px 14px', color: '#fff', fontFamily: "'Barlow'", fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
  error: { padding: '10px 14px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontFamily: "'Barlow Condensed'", fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '12px' },
  btnPrimary: { background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', border: 'none', borderRadius: '4px', padding: '13px 20px', color: '#fff', fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px', cursor: 'pointer', width: '100%', transition: 'opacity 0.2s' },
  btnSecondary: { background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', padding: '11px 20px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.82rem', letterSpacing: '2px', cursor: 'pointer', width: '100%', transition: 'all 0.2s' },
}
