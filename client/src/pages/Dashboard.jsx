import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import useAuthStore from '../store/useAuthStore'
import { Trophy, ShoppingCart, Package, Users, Zap, Gamepad2, Bell, Settings, LogOut, ChevronRight, TrendingUp, Calendar, Wifi } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [visible, setVisible] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    setTimeout(() => setVisible(true), 60)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.1,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? '167,139,250' : '6,182,212',
    }))

    let raf, lastTime = 0
    const draw = (time) => {
      if (time - lastTime < 50) { raf = requestAnimationFrame(draw); return }
      lastTime = time
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw(0)
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', fontFamily: "'Barlow', sans-serif", background: '#03010d' }}>

      <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1800&q=70')", backgroundSize: 'cover', backgroundPosition: 'center 30%', filter: 'brightness(0.18) saturate(0.5)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(109,40,217,0.22) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg, rgba(3,1,13,0.5) 0%, transparent 30%, transparent 70%, rgba(3,1,13,0.7) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', zIndex: 20, background: 'linear-gradient(90deg, transparent 0%, rgba(109,40,217,0.6) 20%, rgba(167,139,250,1) 50%, rgba(109,40,217,0.6) 80%, transparent 100%)', boxShadow: '0 0 20px rgba(167,139,250,0.6)' }} />

      <Header user={user} navigate={navigate} logout={logout} />

      <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', padding: '18px 28px 10px', gap: '12px', minHeight: 0, overflow: 'hidden' }}>

        {/* HERO */}
        <div style={{ flexShrink: 0, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)', transition: 'all 0.5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '20px', height: '1px', background: '#a78bfa' }} />
            <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '5px', color: '#a78bfa' }}>SELECCIONÁ UNA OPCIÓN</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(2.4rem, 3.8vw, 3.4rem)', letterSpacing: '6px', color: '#fff', margin: 0, lineHeight: 1, textShadow: '0 0 60px rgba(109,40,217,0.4)' }}>
            ¿QUÉ HACEMOS HOY?
          </h1>
        </div>

        {/* GRID: 2 cols — izquierda: liga+minijuegos, derecha: 2x2 */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '10px', minHeight: 0 }}>

          {/* MI LIGA — 60% altura */}
          <BigCard
            style={{ gridColumn: 1, gridRow: 1 }}
            accent="#7c3aed" glow="rgba(124,58,237,0.35)"
            delay={80} visible={visible}
            onClick={() => navigate('/liga')}
            tag="FECHA 1 EN CURSO"
            tagIcon={<Wifi size={10} />}
            title="MI LIGA"
            sub="Tabla · Resultados · Fixture"
            icon={<Trophy size={22} color="#7c3aed" />}
          >
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {[
                { pos: 1, name: 'FC AZULEJO', pts: 12, color: '#3b82f6', you: false },
                { pos: 2, name: 'ROJO UNITED', pts: 10, color: '#ef4444', you: false },
                { pos: 3, name: 'MI CLUB FC', pts: 9, color: '#a78bfa', you: true },
                { pos: 4, name: 'LOS DORADOS', pts: 7, color: '#f59e0b', you: false },
              ].map(row => (
                <div key={row.pos} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '3px', background: row.you ? 'rgba(124,58,237,0.14)' : 'rgba(255,255,255,0.04)', border: `1px solid ${row.you ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.06)'}` }}>
                  <span style={{ fontFamily: "'Bebas Neue'", fontSize: '1.05rem', color: row.you ? '#a78bfa' : 'rgba(255,255,255,0.4)', width: '14px' }}>{row.pos}</span>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.color, boxShadow: `0 0 6px ${row.color}`, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.9rem', letterSpacing: '1px', color: row.you ? '#fff' : 'rgba(255,255,255,0.8)', flex: 1 }}>{row.name}</span>
                  <span style={{ fontFamily: "'Bebas Neue'", fontSize: '1.05rem', color: row.you ? '#a78bfa' : 'rgba(255,255,255,0.6)' }}>{row.pts}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ height: '1px', width: '22px', background: '#7c3aed' }} />
              <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '3px', color: '#7c3aed' }}>VER LIGA COMPLETA</span>
            </div>
          </BigCard>

          {/* MINIJUEGOS — 40% altura, mismo ancho que liga */}
          <MiniJuegosCard
            style={{ gridColumn: 1, gridRow: 2 }}
            delay={150} visible={visible}
            onClick={() => navigate('/minijuegos')}
          />

          {/* MERCADO */}
          <SmallCard accent="#10b981" glow="rgba(16,185,129,0.3)" icon={<ShoppingCart size={32} color="#10b981" />} label="MERCADO" desc="Comprá · Vendé · Negociá" delay={160} visible={visible} onClick={() => navigate('/mercado')} style={{ gridColumn: 2, gridRow: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '2px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', marginTop: '8px' }}>
              <TrendingUp size={10} color="#34d399" />
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', color: '#34d399' }}>23 JUGADORES HOY</span>
            </div>
          </SmallCard>

          {/* SOBRES */}
          <SmallCard accent="#f59e0b" glow="rgba(245,158,11,0.3)" icon={<Package size={26} color="#f59e0b" />} label="SOBRES" desc="Abrí y sumá jugadores" delay={220} visible={visible} onClick={() => navigate('/sobres')} style={{ gridColumn: 3, gridRow: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: '2.4rem', color: '#f59e0b', textShadow: '0 0 20px rgba(245,158,11,0.5)', lineHeight: 1 }}>3</span>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.4)' }}>DISPONIBLES</span>
            </div>
          </SmallCard>

          {/* MI PLANTILLA */}
          <SmallCard accent="#a78bfa" glow="rgba(167,139,250,0.3)" icon={<Users size={26} color="#a78bfa" />} label="MI PLANTILLA" desc="Formación · Tácticas · XI" delay={280} visible={visible} onClick={() => navigate('/plantilla')} style={{ gridColumn: 2, gridRow: 2 }}>
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              {['DFC','MC','MC','DC'].map((pos, i) => (
                <div key={i} style={{ padding: '2px 6px', borderRadius: '2px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', fontFamily: "'Barlow Condensed'", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', color: '#a78bfa' }}>{pos}</div>
              ))}
            </div>
          </SmallCard>

          {/* ENTRENAMIENTO */}
          <SmallCard accent="#06b6d4" glow="rgba(6,182,212,0.3)" icon={<Zap size={26} color="#06b6d4" />} label="ENTRENAMIENTO" desc="Mejorá las stats del equipo" delay={340} visible={visible} onClick={() => navigate('/entrenamiento')} style={{ gridColumn: 3, gridRow: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '8px' }}>
              {[['RITMO', 72], ['TIRO', 58], ['PASE', 81]].map(([stat, val]) => (
                <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,0.35)', width: '36px' }}>{stat}</span>
                  <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${val}%`, background: '#06b6d4', boxShadow: '0 0 6px rgba(6,182,212,0.6)', borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontFamily: "'Bebas Neue'", fontSize: '0.85rem', color: '#06b6d4', minWidth: '22px', textAlign: 'right' }}>{val}</span>
                </div>
              ))}
            </div>
          </SmallCard>

        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 10, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '20px', padding: '0 28px', height: '40px', background: 'rgba(3,1,13,0.7)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.45)' }}>SERVIDOR ONLINE</span>
        </div>
        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={12} color="rgba(255,255,255,0.35)" />
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.45)' }}>FECHA 1 EN CURSO</span>
        </div>
        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={12} color="rgba(255,255,255,0.35)" />
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.45)' }}>PRÓX. PARTIDO: 2 DÍAS</span>
        </div>
      </footer>

      <style>{`
        @keyframes shimmer-card { 0%{left:-100%} 100%{left:150%} }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes float-icon { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  )
}

function Header({ user, navigate, logout }) {
  const [activeNav, setActiveNav] = useState(0)
  const navItems = ['INICIO', 'MI LIGA', 'ONLINE', 'MERCADO', 'CLUB']
  return (
    <header style={{ position: 'relative', zIndex: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: '60px', background: 'rgba(3,1,13,0.75)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>

      {/* LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <span style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.7))' }}>⚽</span>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.35rem', letterSpacing: '5px', color: '#fff', lineHeight: 1 }}>CLUBMASTERS</div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.55rem', letterSpacing: '4px', color: '#7c3aed' }}>FOOTBALL MANAGER</div>
        </div>
      </div>

      {/* NAV */}
      <nav style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex' }}>
        {navItems.map((item, i) => (
          <div key={i} onClick={() => setActiveNav(i)} style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2.5px', color: activeNav === i ? '#fff' : 'rgba(255,255,255,0.38)', padding: '0 18px', height: '60px', display: 'flex', alignItems: 'center', borderBottom: activeNav === i ? '2px solid #7c3aed' : '2px solid transparent', cursor: 'pointer', transition: 'color 0.2s', position: 'relative' }}>
            {item}
            {activeNav === i && <div style={{ position: 'absolute', bottom: '-1px', left: '50%', transform: 'translateX(-50%)', width: '5px', height: '5px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 8px #a78bfa' }} />}
          </div>
        ))}
      </nav>

      {/* RIGHT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Pill icon="💰" val="$10.000.000" />
        <Pill icon="💎" val="340 PTS" />
        <IconBtn><Bell size={15} color="rgba(255,255,255,0.6)" /></IconBtn>
        <IconBtn><Settings size={15} color="rgba(255,255,255,0.6)" /></IconBtn>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '5px 12px', borderRadius: '3px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', cursor: 'pointer' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#fff', boxShadow: '0 0 10px rgba(124,58,237,0.5)' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.88rem', letterSpacing: '1.5px', color: '#fff', lineHeight: 1 }}>{user?.username?.toUpperCase()}</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.55rem', letterSpacing: '2px', color: '#a78bfa' }}>MANAGER</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/') }} style={{ width: '32px', height: '32px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LogOut size={14} />
        </button>
      </div>
    </header>
  )
}

function Pill({ icon, val }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 11px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.82rem', letterSpacing: '1px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: '0.9rem' }}>{icon}</span>{val}
    </div>
  )
}

function IconBtn({ children }) {
  const [h, setH] = useState(false)
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ width: '34px', height: '34px', borderRadius: '3px', background: h ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.05)', border: `1px solid ${h ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
      {children}
    </div>
  )
}

function BigCard({ children, accent, glow, delay, visible, onClick, tag, tagIcon, title, sub, icon, style }) {
  const [h, setH] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ ...style, position: 'relative', overflow: 'hidden', borderRadius: '4px', cursor: 'pointer', background: h ? `linear-gradient(145deg, ${accent}18 0%, rgba(3,1,13,0.6) 100%)` : 'rgba(255,255,255,0.03)', border: `1px solid ${h ? accent + '70' : 'rgba(255,255,255,0.09)'}`, borderLeft: `3px solid ${accent}`, boxShadow: h ? `0 0 40px ${glow}` : 'none', display: 'flex', flexDirection: 'column', padding: '18px 18px', opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-20px)', transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms, background 0.25s, border 0.25s, box-shadow 0.25s` }}>
      {h && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}0d 50%, transparent 60%)`, animation: 'shimmer-card 0.7s ease forwards', pointerEvents: 'none' }} />}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${accent}, transparent)`, opacity: 0.6 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '2px', background: `${accent}18`, border: `1px solid ${accent}35`, fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '3px', color: accent }}>
          {tagIcon}{tag}
        </div>
        <div style={{ opacity: 0.7 }}>{icon}</div>
      </div>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', letterSpacing: '3px', color: '#fff', lineHeight: 1, marginBottom: '4px', textShadow: h ? `0 0 20px ${accent}60` : 'none', transition: 'text-shadow 0.3s' }}>{title}</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: '0.75rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '2px' }}>{sub}</div>
      {children}
    </div>
  )
}

function MiniJuegosCard({ style, delay, visible, onClick }) {
  const [h, setH] = useState(false)
  const accent = '#ec4899'
  const glow = 'rgba(236,72,153,0.3)'
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ ...style, position: 'relative', overflow: 'hidden', borderRadius: '4px', cursor: 'pointer', background: h ? `linear-gradient(145deg, ${accent}14 0%, rgba(3,1,13,0.5) 100%)` : 'rgba(255,255,255,0.03)', border: `1px solid ${h ? accent + '60' : 'rgba(255,255,255,0.08)'}`, borderLeft: `3px solid ${accent}`, boxShadow: h ? `0 0 30px ${glow}` : 'none', display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, background 0.2s, border 0.2s, box-shadow 0.2s` }}>
      {h && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}0a 50%, transparent 60%)`, animation: 'shimmer-card 0.7s ease forwards', pointerEvents: 'none' }} />}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${accent}, transparent)`, opacity: 0.6 }} />
      <div style={{ width: '48px', height: '48px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accent}12`, border: `1px solid ${accent}25`, flexShrink: 0, transition: 'transform 0.25s, box-shadow 0.25s', transform: h ? 'scale(1.08)' : 'scale(1)', boxShadow: h ? `0 0 16px ${glow}` : 'none', animation: h ? 'float-icon 2s ease-in-out infinite' : 'none' }}>
        <Gamepad2 size={26} color={accent} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.7rem', letterSpacing: '3px', color: '#fff', lineHeight: 1, marginBottom: '4px', textShadow: h ? `0 0 14px ${accent}50` : 'none', transition: 'text-shadow 0.25s' }}>MINIJUEGOS</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: '0.75rem', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.45)' }}>Jugá diario · Ganá sobres gratis</div>
      </div>
      <ChevronRight size={20} color={h ? accent : 'rgba(255,255,255,0.2)'} style={{ transition: 'all 0.2s', transform: h ? 'translateX(3px)' : 'none', flexShrink: 0 }} />
    </div>
  )
}

function SmallCard({ children, accent, glow, icon, label, desc, delay, visible, onClick, style }) {
  const [h, setH] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ ...style, position: 'relative', overflow: 'hidden', borderRadius: '4px', cursor: 'pointer', background: h ? `linear-gradient(145deg, ${accent}14 0%, rgba(3,1,13,0.5) 100%)` : 'rgba(255,255,255,0.03)', border: `1px solid ${h ? accent + '60' : 'rgba(255,255,255,0.08)'}`, borderBottom: `2px solid ${h ? accent : 'rgba(255,255,255,0.06)'}`, boxShadow: h ? `0 6px 30px ${glow}` : 'none', padding: '16px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, background 0.2s, border 0.2s, box-shadow 0.2s` }}>
      {h && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}0a 50%, transparent 60%)`, animation: 'shimmer-card 0.7s ease forwards', pointerEvents: 'none' }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accent}12`, border: `1px solid ${accent}20`, transition: 'transform 0.25s, box-shadow 0.25s', transform: h ? 'scale(1.08)' : 'scale(1)', boxShadow: h ? `0 0 16px ${glow}` : 'none', animation: h ? 'float-icon 2s ease-in-out infinite' : 'none' }}>
          {icon}
        </div>
        <ChevronRight size={16} color={h ? accent : 'rgba(255,255,255,0.18)'} style={{ transition: 'all 0.2s', transform: h ? 'translateX(3px)' : 'none' }} />
      </div>
      <div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', letterSpacing: '2px', color: '#fff', lineHeight: 1, marginBottom: '4px', textShadow: h ? `0 0 14px ${accent}50` : 'none', transition: 'text-shadow 0.25s' }}>{label}</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: '0.72rem', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)' }}>{desc}</div>
        {children}
      </div>
    </div>
  )
}
