import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import useAuthStore from '../store/useAuthStore'

export default function Auth() {
  const [modo, setModo] = useState('login')
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const endpoint = modo === 'login' ? '/auth/login' : '/auth/register'
    const { data } = await api.post(endpoint, form)
    login(data.token, data.user)
    await redirigirSegunEstado(data.token)
  } catch (err) {
    if (err.response?.status === 404) {
      navigate('/onboarding')
    } else {
      setError(err.response?.data?.error || 'Error al conectar con el servidor')
    }
  } finally {
    setLoading(false)
  }
}

  const redirigirSegunEstado = async (token) => {
  const headers = { Authorization: `Bearer ${token}` }

  try {
    // 1. ¿Tiene solicitud pendiente o aceptada?
    const { data: solicitud } = await api.get('/solicitud/mis-solicitudes', { headers })
    
    if (solicitud?.estado === 'pendiente') {
      navigate('/esperando')
      return
    }
    
    if (solicitud?.estado === 'aceptada') {
      navigate(`/onboarding?ligaId=${solicitud.ligaId}&step=crear-club`)
      return
    }
  } catch {}

  try {
    // 2. ¿Tiene club?
    const { data: club } = await api.get('/club/mi-club', { headers })
    if (club?.id) {
      navigate('/dashboard')
      return
    }
  } catch {}

  // 3. Nada → onboarding
  navigate('/onboarding')
}

  return (
    <div style={styles.container}>
      {/* Fondo con cancha */}
      <div style={styles.bgOverlay} />

      <div style={styles.card}>
        <div style={styles.logoArea}>
          <span style={styles.logoIcon}>⚽</span>
          <h1 style={styles.title}>CLUBMASTERS</h1>
          <p style={styles.subtitle}>El manager de fútbol de tus amigos</p>
        </div>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(modo === 'login' ? styles.tabActive : {}) }}
            onClick={() => setModo('login')}
          >
            INICIAR SESIÓN
          </button>
          <button
            style={{ ...styles.tab, ...(modo === 'register' ? styles.tabActive : {}) }}
            onClick={() => setModo('register')}
          >
            REGISTRARSE
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          {modo === 'register' && (
            <input
              style={styles.input}
              type="text"
              placeholder="Nombre de usuario"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          )}
          <input
            style={styles.input}
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'CARGANDO...' : modo === 'login' ? 'ENTRAR' : 'CREAR CUENTA'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    background: `
      linear-gradient(to bottom, rgba(30,10,60,0.92) 0%, rgba(20,5,45,0.97) 100%),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect fill='%232d5a1b' width='800' height='500'/%3E%3Crect fill='%23357320' x='0' y='0' width='800' height='62'/%3E%3Crect fill='%232d5a1b' x='0' y='62' width='800' height='62'/%3E%3Crect fill='%23357320' x='0' y='124' width='800' height='62'/%3E%3Crect fill='%232d5a1b' x='0' y='186' width='800' height='62'/%3E%3Crect fill='%23357320' x='0' y='248' width='800' height='62'/%3E%3Crect fill='%232d5a1b' x='0' y='310' width='800' height='62'/%3E%3Crect fill='%23357320' x='0' y='372' width='800' height='62'/%3E%3Crect fill='%232d5a1b' x='0' y='434' width='800' height='62'/%3E%3Crect fill='none' stroke='white' stroke-width='3' x='60' y='30' width='680' height='440'/%3E%3Ccircle fill='none' stroke='white' stroke-width='3' cx='400' cy='250' r='70'/%3E%3Cline stroke='white' stroke-width='3' x1='400' y1='30' x2='400' y2='470'/%3E%3Crect fill='none' stroke='white' stroke-width='3' x='60' y='175' width='90' height='150'/%3E%3Crect fill='none' stroke='white' stroke-width='3' x='650' y='175' width='90' height='150'/%3E%3C/svg%3E")
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  card: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderTop: '3px solid #7c3aed',
    borderRadius: '4px',
    padding: '48px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.2)',
    position: 'relative',
    zIndex: 1,
  },
  logoArea: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '8px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '6px',
    marginBottom: '6px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.8rem',
    letterSpacing: '1px',
  },
  tabs: {
    display: 'flex',
    marginBottom: '28px',
    gap: '2px',
    background: 'rgba(0,0,0,0.3)',
    padding: '3px',
    borderRadius: '4px',
  },
  tab: {
    flex: 1,
    padding: '10px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    fontSize: '0.72rem',
    fontWeight: '700',
    letterSpacing: '1.5px',
    borderRadius: '3px',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#7c3aed',
    color: '#ffffff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  input: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px',
    padding: '13px 16px',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    letterSpacing: '0.5px',
  },
  error: {
    color: '#f87171',
    fontSize: '0.82rem',
    textAlign: 'center',
    padding: '8px',
    background: 'rgba(248,113,113,0.1)',
    borderRadius: '4px',
    border: '1px solid rgba(248,113,113,0.2)',
  },
  button: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    border: 'none',
    borderRadius: '4px',
    padding: '14px',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '0.85rem',
    cursor: 'pointer',
    letterSpacing: '2px',
    marginTop: '8px',
    transition: 'opacity 0.2s',
  },
}