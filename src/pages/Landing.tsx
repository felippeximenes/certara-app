import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Menu, X as CloseIcon, Crown } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { HeroScene } from '../components/HeroScene'
import { Logo } from '../components/Logo'
import { CookieBanner } from '../components/CookieBanner'
import { BorderBeam } from '../components/ui/border-beam'
import { cn } from '@/lib/utils'

// ── Animation helpers ─────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const
const VP   = { once: true, margin: '-60px' } as const

function fadeUp(delay = 0, reduced = false) {
  if (reduced) return {}
  return { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.9, ease: EASE, delay }, viewport: VP }
}
function slideLeft(delay = 0, reduced = false) {
  if (reduced) return {}
  return { initial: { opacity: 0, x: -40 }, whileInView: { opacity: 1, x: 0 }, transition: { duration: 0.9, ease: EASE, delay }, viewport: VP }
}
function scaleIn(delay = 0, reduced = false) {
  if (reduced) return {}
  return { initial: { opacity: 0, scale: 0.93 }, whileInView: { opacity: 1, scale: 1 }, transition: { duration: 0.9, ease: EASE, delay }, viewport: VP }
}

// ── Font shorthands ───────────────────────────────────────────────────────────
const FG = "'Space Grotesk', system-ui, sans-serif"
const FM = "'Manrope', system-ui, sans-serif"
const FI = "'Instrument Serif', Georgia, serif"

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { num: '12k+', label: 'questões geradas por IA' },
  { num: '94%',  label: 'taxa de aprovação' },
  { num: '3',    label: 'certificações AWS' },
  { num: '4.9',  label: 'avaliação média' },
]

const STEPS = [
  { num: '01', title: 'Escolha sua certificação', body: 'Do CLF-C02 ao DVA-C02. A Certara monta a trilha certa para o seu objetivo e nível atual.' },
  { num: '02', title: 'Pratique com IA', body: 'Questões inéditas geradas pelo Amazon Bedrock, com explicações claras e referência a cada serviço AWS.' },
  { num: '03', title: 'Acompanhe sua evolução', body: 'O plano se reajusta aos seus pontos fracos. Você chega no dia da prova sabendo exatamente onde está.' },
]

const FEATURES = [
  { icon: '⚡', title: 'Questões com IA', body: 'Geradas pelo Amazon Bedrock em tempo real — nunca a mesma questão duas vezes.' },
  { icon: '💬', title: 'Feedback instantâneo', body: 'Errou? A IA explica o motivo na hora com referência ao serviço AWS correto.' },
  { icon: '◎',  title: 'Plano adaptativo', body: 'O cronograma se reorganiza a cada sessão, priorizando o que você ainda erra.' },
  { icon: '⏱',  title: 'Simulados cronometrados', body: 'Reproduza a pressão real do exame antes do dia da prova com 65 questões.' },
  { icon: '📖', title: 'Histórico completo', body: 'Veja sua evolução, pontos fortes e fraquezas ao longo do tempo de estudo.' },
  { icon: '📊', title: 'Análise por domínio', body: 'Painéis em tempo real mostram se você já está pronto para a certificação.', dark: true },
]

const TESTIMONIALS = [
  { quote: 'Passei no CLF-C02 na primeira tentativa após 3 semanas. O feedback instantâneo fez toda a diferença.', name: 'Gabriela Alves', cert: 'CLF-C02 · Aprovada', initials: 'GA', gradient: 'linear-gradient(145deg,#3B39E8,#2D2BC5)' },
  { quote: 'O modo simulado é excelente. Fiz o SAA-C03 sentindo que já conhecia o formato da prova. Aprovado com 850!', name: 'Carolina Santos', cert: 'SAA-C03 · Aprovada', initials: 'CS', gradient: 'linear-gradient(145deg,#7C3AED,#6D28D9)' },
  { quote: 'Em 5 semanas saí do zero e passei no Cloud Practitioner. O plano personalizado me guiou perfeitamente.', name: 'Mariana Lima', cert: 'CLF-C02 · Aprovada', initials: 'ML', gradient: 'linear-gradient(145deg,#DB2777,#BE185D)' },
  { quote: 'Nunca tinha estudado para certificação. O feedback detalhado me ajudou a entender o porquê de cada erro.', name: 'Rafael Mendes', cert: 'CLF-C02 · Aprovado', initials: 'RM', gradient: 'linear-gradient(145deg,#0D9488,#0F766E)' },
  { quote: 'As questões geradas por IA são muito próximas das reais. Certara foi fundamental para minha aprovação.', name: 'Lucas Ferreira', cert: 'SAA-C03 · Aprovado', initials: 'LF', gradient: 'linear-gradient(145deg,#D97706,#B45309)' },
  { quote: 'O histórico de desempenho me mostrou exatamente meus pontos fracos. Focei nisso e passei com folga!', name: 'Thiago Oliveira', cert: 'DVA-C02 · Aprovado', initials: 'TO', gradient: 'linear-gradient(145deg,#4F46E5,#3730A3)' },
  { quote: 'O plano adaptativo focou nos domínios que eu ignorava. Economizei semanas de estudo desnecessário.', name: 'Amanda Costa', cert: 'DVA-C02 · Aprovada', initials: 'AC', gradient: 'linear-gradient(145deg,#E11D48,#BE123C)' },
  { quote: 'Simulados cronometrados acabaram com meu nervosismo. No dia da prova já era rotina para mim.', name: 'Pedro Souza', cert: 'SAA-C03 · Aprovado', initials: 'PS', gradient: 'linear-gradient(145deg,#0EA5E9,#0284C7)' },
  { quote: 'O Certara tornou o estudo de AWS dinâmico e eficiente. Aprovada de primeira no Cloud Practitioner!', name: 'Juliana Nunes', cert: 'CLF-C02 · Aprovada', initials: 'JN', gradient: 'linear-gradient(145deg,#10B981,#059669)' },
]

const COL_A = [TESTIMONIALS[0], TESTIMONIALS[3], TESTIMONIALS[6]]
const COL_B = [TESTIMONIALS[1], TESTIMONIALS[4], TESTIMONIALS[7]]
const COL_C = [TESTIMONIALS[2], TESTIMONIALS[5], TESTIMONIALS[8]]

const NAV_SECTIONS = [
  { id: 'hero',        label: 'Início' },
  { id: 'como',        label: 'Como funciona' },
  { id: 'features',    label: 'Recursos' },
  { id: 'depoimentos', label: 'Alunos' },
  { id: 'planos',      label: 'Planos' },
]

const FREE_FEATURES = ['5 quizzes por dia', 'Feedback básico', '1 simulado por semana']
const FREE_MISSING  = ['Plano adaptativo', 'Histórico completo']
const PREMIUM_FEATURES = [
  'Quizzes ilimitados',
  'Feedback completo com IA',
  'Modo simulado',
  'Histórico completo',
  'Plano de estudos personalizado',
]

// ── Testimonial card ──────────────────────────────────────────────────────────
function TestiCard({ t, variant }: { t: typeof TESTIMONIALS[0]; variant: number }) {
  const avatarGrad = ['linear-gradient(135deg,#3B39E8,#7C6BFF)', 'linear-gradient(135deg,#7C6BFF,#3B39E8)', 'linear-gradient(135deg,#3B39E8,#9d8fff)'][variant]
  return (
    <figure style={{ margin: 0, background: '#fff', border: '1px solid rgba(59,57,232,.1)', borderRadius: 20, padding: 28, boxShadow: '0 1px 3px rgba(12,16,36,.04)' }}>
      <blockquote style={{ margin: 0, fontFamily: FM, fontSize: 15, lineHeight: 1.65, color: '#232842' }}>
        "{t.quote}"
      </blockquote>
      <figcaption style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: t.gradient ?? avatarGrad, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: FG }}>
          {t.initials}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontFamily: FG, fontSize: 14, fontWeight: 600, color: '#0C1024' }}>{t.name}</span>
          <span style={{ fontFamily: FM, fontSize: 12, fontWeight: 500, color: '#3B39E8' }}>{t.cert}</span>
        </span>
      </figcaption>
    </figure>
  )
}

// ── Auto-scroll testimonial column ───────────────────────────────────────────
function TestiColumn({ items, duration, className }: { items: typeof TESTIMONIALS; duration: number; className?: string }) {
  const doubled = [...items, ...items]
  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        animate={{ translateY: '-50%' }}
        transition={{ duration, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 20 }}
      >
        {doubled.map((t, i) => <TestiCard key={i} t={t} variant={i % 3} />)}
      </motion.div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function Landing() {
  const navigate      = useNavigate()
  const email         = useAuthStore(s => s.email)
  const loading       = useAuthStore(s => s.loading)
  const reduced       = useReducedMotion() ?? false
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [scrolled,    setScrolled]    = useState(false)
  const [railPct,     setRailPct]     = useState(0)
  const [activeId,    setActiveId]    = useState('hero')
  const glowRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Scroll → rail fill + navbar + grid parallax
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const h = document.documentElement.scrollHeight - window.innerHeight
      setScrolled(y > 40)
      setRailPct(h > 0 ? (y / h) * 100 : 0)
      if (gridRef.current) gridRef.current.style.transform = `rotateX(62deg) translateY(${y * 0.15}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // IntersectionObserver → active dot
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) }) },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    NAV_SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  // Hero glow follows mouse
  useEffect(() => {
    const hero = document.getElementById('hero')
    const glow = glowRef.current
    if (!hero || !glow) return
    const move = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect()
      const cx = (e.clientX - r.width / 2) / r.width
      const cy = (e.clientY - r.height / 2) / r.height
      glow.style.transform = `translateX(-50%) translate(${cx * 40}px,${cy * 26}px)`
    }
    const reset = () => { glow.style.transform = 'translateX(-50%)' }
    hero.addEventListener('mousemove', move)
    hero.addEventListener('mouseleave', reset)
    return () => { hero.removeEventListener('mousemove', move); hero.removeEventListener('mouseleave', reset) }
  }, [])

  const goTo = (id: string) => {
    setMobileOpen(false)
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 72, behavior: 'smooth' })
  }

  return (
    <div style={{ position: 'relative', background: '#FBFBFE', color: '#0C1024', overflowX: 'hidden', fontFamily: FM }}>

      {/* ── Progress rail ─────────────────────────────────── */}
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 3, background: 'rgba(12,16,36,.06)', zIndex: 70, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${railPct}%`, background: 'linear-gradient(180deg,#3B39E8,#7C6BFF)', boxShadow: '0 0 14px rgba(59,57,232,.6)', transition: 'height .1s linear' }} />
      </div>

      {/* ── Section dot nav ───────────────────────────────── */}
      <nav className="hidden lg:flex" style={{ position: 'fixed', right: 22, top: '50%', transform: 'translateY(-50%)', zIndex: 70, flexDirection: 'column', gap: 20, alignItems: 'flex-end' }}>
        {NAV_SECTIONS.map(({ id, label }) => {
          const on = activeId === id
          return (
            <button key={id} onClick={() => goTo(id)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: FG, fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: on ? '#3B39E8' : '#0C1024', opacity: on ? 1 : 0, transition: '.3s' }}>
                {label}
              </span>
              <span style={{ width: on ? 40 : 24, height: 2, background: on ? '#3B39E8' : 'rgba(12,16,36,.25)', borderRadius: 2, transition: '.3s' }} />
            </button>
          )
        })}
      </nav>

      {/* ── Navbar ────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        transition: '.4s cubic-bezier(.16,1,.3,1)',
        background: scrolled ? 'rgba(251,251,254,.78)' : 'transparent',
        backdropFilter: scrolled ? 'saturate(180%) blur(18px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(18px)' : 'none',
        boxShadow: scrolled ? '0 1px 0 rgba(12,16,36,.06),0 8px 30px rgba(12,16,36,.05)' : 'none',
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: scrolled ? '14px 40px' : '22px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'padding .4s cubic-bezier(.16,1,.3,1)' }}>
          <Logo size="md" />

          <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 36 }}>
            {(['como', 'features', 'depoimentos', 'planos'] as const).map(id => (
              <button key={id} onClick={() => goTo(id)} style={{ all: 'unset', cursor: 'pointer', fontFamily: FM, fontSize: 14, fontWeight: 500, color: '#3a4060' }}>
                {id === 'como' ? 'Como funciona' : id === 'features' ? 'Recursos' : id === 'depoimentos' ? 'Depoimentos' : 'Planos'}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 12 }}>
            {!email && (
              <button onClick={() => navigate('/login')} style={{ all: 'unset', cursor: 'pointer', fontFamily: FM, fontSize: 14, fontWeight: 600, color: '#3a4060', padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(12,16,36,.12)' }}>
                Entrar
              </button>
            )}
            <div style={{ position: 'relative', borderRadius: 12, padding: 1.5, overflow: 'hidden' }}>
              <div className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#DDDEFF_0%,#3B39E8_50%,#DDDEFF_100%)]" />
              <button onClick={() => navigate(email ? '/app' : '/login')} style={{ position: 'relative', fontFamily: FM, fontSize: 14, fontWeight: 600, color: '#fff', background: '#3B39E8', padding: '10px 20px', borderRadius: 11, border: 'none', cursor: 'pointer' }}>
                {email ? 'Ir ao Dashboard' : 'Começar grátis'}
              </button>
            </div>
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(v => !v)} style={{ all: 'unset', cursor: 'pointer', padding: 4 }}>
            {mobileOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div style={{ background: 'rgba(251,251,254,.98)', backdropFilter: 'blur(12px)', padding: '12px 24px 20px', borderBottom: '1px solid rgba(12,16,36,.06)' }}>
            {(['como', 'features', 'depoimentos', 'planos'] as const).map((id, i, arr) => (
              <button key={id} onClick={() => goTo(id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 0', fontFamily: FM, fontSize: 15, fontWeight: 500, color: '#3a4060', background: 'none', border: 'none', borderBottom: i < arr.length - 1 ? '1px solid rgba(12,16,36,.05)' : 'none', cursor: 'pointer' }}>
                {id === 'como' ? 'Como funciona' : id === 'features' ? 'Recursos' : id === 'depoimentos' ? 'Depoimentos' : 'Planos'}
              </button>
            ))}
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              {!email && (
                <button onClick={() => navigate('/login')} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid rgba(12,16,36,.12)', background: 'transparent', fontFamily: FM, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Entrar
                </button>
              )}
              <button onClick={() => navigate(email ? '/app' : '/login')} style={{ flex: email ? undefined : 1, width: email ? '100%' : undefined, padding: '11px 0', borderRadius: 10, background: '#3B39E8', color: '#fff', border: 'none', fontFamily: FM, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {email ? 'Ir ao Dashboard' : 'Começar grátis'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '160px 40px 90px' }}>
        {/* Radial glow (follows mouse) */}
        <div ref={glowRef} style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 1100, height: 760, background: 'radial-gradient(ellipse at center,rgba(59,57,232,.22),rgba(124,107,255,.10) 42%,transparent 70%)', pointerEvents: 'none' }} />

        {/* Perspective grid — bottom 60% */}
        <div style={{ position: 'absolute', inset: 0, top: 'auto', height: '60%', bottom: 0, overflow: 'hidden', pointerEvents: 'none', perspective: '340px', opacity: 0.55, WebkitMaskImage: 'linear-gradient(to top,#000 20%,transparent)', maskImage: 'linear-gradient(to top,#000 20%,transparent)' }}>
          <div ref={gridRef} style={{ position: 'absolute', inset: '-100% 0', transform: 'rotateX(62deg)', backgroundImage: 'linear-gradient(to right,rgba(59,57,232,.35) 1px,transparent 1px),linear-gradient(to bottom,rgba(59,57,232,.35) 1px,transparent 1px)', backgroundSize: '44px 44px', animation: 'gridmove 2.4s linear infinite' }} />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center" style={{ position: 'relative', maxWidth: 1240, margin: '0 auto', width: '100%', zIndex: 2 }}>

          {/* Left: text + CTAs */}
          <div>
            {/* Badge */}
            <motion.div {...fadeUp(0, reduced)} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 15px', borderRadius: 100, background: 'rgba(59,57,232,.07)', border: '1px solid rgba(59,57,232,.16)', marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B39E8', animation: 'blink 1.8s ease-in-out infinite', flexShrink: 0 }} />
              <span style={{ fontFamily: FG, fontSize: 12, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: '#3B39E8' }}>
                Inteligência artificial · AWS
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1 {...fadeUp(0.08, reduced)} style={{ maxWidth: '14ch', margin: '0 0 28px', fontFamily: FG, fontWeight: 600, fontSize: 'clamp(44px,6.5vw,84px)', lineHeight: 0.98, letterSpacing: '-.035em', color: '#0C1024', textWrap: 'balance' }}>
              Sua aprovação na{' '}
              <span style={{ fontFamily: FI, fontWeight: 400, fontStyle: 'italic', letterSpacing: '-.01em', background: 'linear-gradient(180deg,#3B39E8,#7C6BFF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                certificação AWS
              </span>
              , guiada por IA.
            </motion.h1>

            {/* Description */}
            <motion.p {...fadeUp(0.16, reduced)} style={{ maxWidth: '50ch', margin: '0 0 40px', fontFamily: FM, fontSize: 'clamp(16px,1.4vw,19px)', fontWeight: 400, lineHeight: 1.65, color: '#4b5170' }}>
              Questões inéditas geradas por IA, feedback instantâneo e um plano de estudos que se molda a você —
              do <strong style={{ color: '#0C1024', fontWeight: 600 }}>Cloud Practitioner</strong> ao{' '}
              <strong style={{ color: '#0C1024', fontWeight: 600 }}>Solutions Architect</strong>.
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.24, reduced)} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
              {/* Primary */}
              <div style={{ position: 'relative', borderRadius: 15, padding: 2, overflow: 'hidden' }}>
                <div className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#DDDEFF_0%,#3B39E8_50%,#DDDEFF_100%)]" />
                <Link to="/login" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, background: '#3B39E8', color: '#fff', fontFamily: FM, fontSize: 16, fontWeight: 600, padding: '15px 26px', borderRadius: 13, boxShadow: '0 14px 34px rgba(59,57,232,.34)', textDecoration: 'none' }}>
                  Começar grátis <span style={{ fontSize: 18 }}>→</span>
                </Link>
              </div>
              {/* Secondary */}
              <button onClick={() => goTo('como')} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: FM, fontSize: 16, fontWeight: 600, color: '#0C1024', padding: '15px 20px', borderRadius: 13, border: '1px solid rgba(12,16,36,.12)', background: 'transparent', cursor: 'pointer' }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(59,57,232,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B39E8', fontSize: 12, flexShrink: 0 }}>▶</span>
                Ver como funciona
              </button>
            </motion.div>

            {/* Trust avatars */}
            <motion.div {...fadeUp(0.32, reduced)} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex' }}>
                {['#c7cbf7', '#a5abf2', '#8288ef'].map((c, i) => (
                  <span key={c} style={{ width: 34, height: 34, borderRadius: '50%', background: c, border: '2px solid #FBFBFE', marginLeft: i ? -11 : 0 }} />
                ))}
                <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#3B39E8', border: '2px solid #FBFBFE', marginLeft: -11, color: '#fff', fontFamily: FM, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+9k</span>
              </div>
              <p style={{ margin: 0, fontFamily: FM, fontSize: 13, fontWeight: 500, color: '#6b708c', lineHeight: 1.4 }}>
                Mais de <strong style={{ color: '#0C1024' }}>9.000 alunos</strong> estudando
                <br />para certificações AWS agora.
              </p>
            </motion.div>
          </div>

          {/* Right: HeroScene 3D */}
          <motion.div {...scaleIn(0.1, reduced)} className="hidden lg:flex justify-center items-center">
            <HeroScene />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section id="stats" style={{ position: 'relative', background: 'linear-gradient(120deg,#2422d6,#3B39E8 55%,#5a4df0)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.08) 1px,transparent 1px)', backgroundSize: '26px 26px', opacity: 0.5 }} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6" style={{ position: 'relative', maxWidth: 1240, margin: '0 auto', padding: '80px 40px' }}>
          {STATS.map(({ num, label }, i) => (
            <motion.div key={label} {...fadeUp(i * 0.08, reduced)} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: FG, fontSize: 'clamp(36px,5vw,60px)', fontWeight: 600, lineHeight: 1, letterSpacing: '-.03em', color: '#fff' }}>{num}</div>
              <div style={{ marginTop: 10, fontFamily: FM, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,.8)', lineHeight: 1.4 }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ─────────────────────────────────── */}
      <section id="como" style={{ position: 'relative', padding: '130px 40px' }}>
        <div className="grid gap-16 lg:gap-[70px] lg:grid-cols-[0.9fr_1.6fr] items-start" style={{ maxWidth: 1240, margin: '0 auto' }}>

          {/* Sticky left */}
          <div className="lg:sticky lg:top-[120px]">
            <motion.div {...fadeUp(0, reduced)} style={{ fontFamily: FG, fontSize: 12, fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: '#3B39E8', marginBottom: 20 }}>
              Como funciona
            </motion.div>
            <motion.h2 {...fadeUp(0.08, reduced)} style={{ margin: '0 0 24px', fontFamily: FG, fontWeight: 600, fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1.02, letterSpacing: '-.03em', color: '#0C1024' }}>
              Três passos<br />até a{' '}
              <span style={{ fontFamily: FI, fontStyle: 'italic', fontWeight: 400, color: '#3B39E8' }}>aprovação</span>.
            </motion.h2>
            <motion.p {...fadeUp(0.16, reduced)} style={{ margin: 0, fontFamily: FM, fontSize: 17, lineHeight: 1.6, color: '#4b5170', maxWidth: '34ch' }}>
              Sem cursos intermináveis. A Certara transforma seu tempo de estudo em prática dirigida por dados.
            </motion.p>
          </div>

          {/* Step cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                {...slideLeft(i * 0.12, reduced)}
                whileHover={reduced ? undefined : { y: -6, boxShadow: '0 24px 50px rgba(59,57,232,.16)', transition: { duration: 0.3 } }}
                style={{ position: 'relative', borderRadius: 22, background: '#fff', border: '1px solid rgba(12,16,36,.07)', boxShadow: '0 1px 3px rgba(12,16,36,.04)', padding: '38px 40px', overflow: 'hidden' }}
              >
                <BorderBeam size={180} duration={9 + i * 1.5} delay={i * 3} colorFrom="#3B39E8" colorTo="#7C6BFF" borderWidth={1.5} />
                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: FI, fontSize: 64, lineHeight: 0.8, color: '#3B39E8', flexShrink: 0 }}>{step.num}</span>
                  <div>
                    <h3 style={{ margin: '0 0 12px', fontFamily: FG, fontWeight: 600, fontSize: 22, lineHeight: 1.2, letterSpacing: '-.02em', color: '#0C1024' }}>{step.title}</h3>
                    <p style={{ margin: 0, fontFamily: FM, fontSize: 16, lineHeight: 1.65, color: '#4b5170' }}>{step.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ───────────────────────────────── */}
      <section id="features" style={{ position: 'relative', padding: '130px 40px', background: '#F4F4FB' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10" style={{ marginBottom: 64 }}>
            <div>
              <motion.div {...fadeUp(0, reduced)} style={{ fontFamily: FG, fontSize: 12, fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: '#3B39E8', marginBottom: 20 }}>
                Recursos
              </motion.div>
              <motion.h2 {...fadeUp(0.08, reduced)} style={{ margin: 0, fontFamily: FG, fontWeight: 600, fontSize: 'clamp(32px,4.4vw,56px)', lineHeight: 1, letterSpacing: '-.035em', color: '#0C1024', maxWidth: '16ch' }}>
                Tudo que a prova exige,{' '}
                <span style={{ fontFamily: FI, fontStyle: 'italic', fontWeight: 400, color: '#3B39E8' }}>nada</span>
                {' '}que ela não.
              </motion.h2>
            </div>
            <motion.p {...fadeUp(0.16, reduced)} style={{ margin: 0, fontFamily: FM, fontSize: 17, lineHeight: 1.6, color: '#4b5170', maxWidth: '36ch' }}>
              Uma plataforma inteira desenhada em torno de um objetivo só: você passar.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                {...scaleIn((i % 3) * 0.09, reduced)}
                whileHover={reduced || f.dark ? undefined : { y: -6, boxShadow: '0 24px 50px rgba(59,57,232,.16)', transition: { duration: 0.3 } }}
                style={{ position: 'relative', borderRadius: 22, background: f.dark ? '#0C1024' : '#fff', border: f.dark ? '1px solid #0C1024' : '1px solid rgba(12,16,36,.06)', padding: 34, overflow: 'hidden' }}
              >
                {f.dark && (
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle,rgba(124,107,255,.5),transparent 70%)', pointerEvents: 'none' }} />
                )}
                {!f.dark && <BorderBeam size={150} duration={10 + i} delay={i * 2} colorFrom="#3B39E8" colorTo="#7C6BFF" borderWidth={1.5} />}
                <div style={{ position: 'relative', width: 46, height: 46, borderRadius: 13, background: f.dark ? 'rgba(255,255,255,.1)' : 'rgba(59,57,232,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 22 }}>
                  {f.icon}
                </div>
                <h3 style={{ position: 'relative', margin: '0 0 10px', fontFamily: FG, fontWeight: 600, fontSize: 20, lineHeight: 1.2, letterSpacing: '-.02em', color: f.dark ? '#fff' : '#0C1024' }}>{f.title}</h3>
                <p style={{ position: 'relative', margin: 0, fontFamily: FM, fontSize: 15, lineHeight: 1.65, color: f.dark ? 'rgba(255,255,255,.72)' : '#4b5170' }}>{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ───────────────────────────────────── */}
      <section id="depoimentos" style={{ position: 'relative', padding: '130px 40px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 70 }}>
            <motion.div {...fadeUp(0, reduced)} style={{ fontFamily: FG, fontSize: 12, fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: '#3B39E8', marginBottom: 20 }}>
              Quem passou
            </motion.div>
            <motion.h2 {...fadeUp(0.08, reduced)} style={{ margin: '0 auto', fontFamily: FG, fontWeight: 600, fontSize: 'clamp(32px,4.4vw,56px)', lineHeight: 1.02, letterSpacing: '-.035em', color: '#0C1024', maxWidth: '18ch' }}>
              Aprovações reais,{' '}
              <span style={{ fontFamily: FI, fontStyle: 'italic', fontWeight: 400, color: '#3B39E8' }}>contadas</span>
              {' '}por quem viveu.
            </motion.h2>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            style={{ height: 640, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom,transparent,#000 16%,#000 84%,transparent)', maskImage: 'linear-gradient(to bottom,transparent,#000 16%,#000 84%,transparent)' }}
          >
            <TestiColumn items={COL_A} duration={26} />
            <TestiColumn items={COL_B} duration={32} className="hidden md:block" />
            <TestiColumn items={COL_C} duration={29} className="hidden lg:block" />
          </div>
        </div>
      </section>

      {/* ── Planos ────────────────────────────────────────── */}
      <section id="planos" style={{ position: 'relative', padding: '130px 40px', background: '#F4F4FB', overflow: 'hidden' }}>
        {/* Blobs decorativos */}
        {([
          { top: '6%',  left: '-6%', bg: 'rgba(59,57,232,.22)', size: 420 },
          { bottom: '0',left: '44%', bg: 'rgba(124,107,255,.2)', size: 380 },
          { top: '20%', right: '-4%',bg: 'rgba(59,57,232,.18)', size: 360 },
        ] as const).map((b, i) => (
          <div key={i} style={{ position: 'absolute', top: (b as any).top, bottom: (b as any).bottom, left: (b as any).left, right: (b as any).right, width: b.size, height: b.size, borderRadius: '50%', background: b.bg, filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0 }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <motion.div {...fadeUp(0, reduced)} style={{ fontFamily: FG, fontSize: 12, fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: '#3B39E8', marginBottom: 20 }}>
              Planos
            </motion.div>
            <motion.h2 {...fadeUp(0.08, reduced)} style={{ margin: '0 auto', fontFamily: FG, fontWeight: 600, fontSize: 'clamp(32px,4.4vw,56px)', lineHeight: 1.02, letterSpacing: '-.035em', color: '#0C1024', maxWidth: '16ch' }}>
              Comece grátis.{' '}
              <span style={{ fontFamily: FI, fontStyle: 'italic', fontWeight: 400, color: '#3B39E8' }}>Passe</span>
              {' '}quando quiser.
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Gratuito */}
            <motion.div
              {...slideLeft(0, reduced)}
              style={{ borderRadius: 26, background: 'rgba(255,255,255,.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.7)', padding: 44, boxShadow: '0 20px 50px rgba(12,16,36,.06)' }}
            >
              <div style={{ fontFamily: FG, fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#6b708c' }}>Gratuito</div>
              <div style={{ margin: '20px 0 4px', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: FG, fontSize: 'clamp(40px,5vw,56px)', fontWeight: 600, lineHeight: 1, letterSpacing: '-.03em', color: '#0C1024' }}>R$0</span>
                <span style={{ fontFamily: FM, fontSize: 15, fontWeight: 500, color: '#6b708c' }}>/ para sempre</span>
              </div>
              <p style={{ margin: '8px 0 28px', fontFamily: FM, fontSize: 15, lineHeight: 1.5, color: '#4b5170' }}>Para conhecer o método e começar a praticar.</p>
              <button onClick={() => navigate(email ? '/app' : '/login')} style={{ display: 'block', width: '100%', textAlign: 'center', fontFamily: FM, fontSize: 15, fontWeight: 600, color: '#0C1024', padding: 15, borderRadius: 13, border: '1px solid rgba(12,16,36,.16)', background: 'transparent', cursor: 'pointer' }}>
                Criar conta grátis
              </button>
              <ul style={{ listStyle: 'none', margin: '28px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {FREE_FEATURES.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 11, fontFamily: FM, fontSize: 15, color: '#232842' }}>
                    <span style={{ color: '#3B39E8', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
                {FREE_MISSING.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 11, fontFamily: FM, fontSize: 15, color: '#9aa0bb', textDecoration: 'line-through' }}>
                    <span style={{ color: '#c3c7db' }}>–</span> {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Premium */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 40, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: 'spring', damping: 22, stiffness: 180, delay: 0.1 }}
              whileHover={reduced ? undefined : { scale: 1.03, y: -6, transition: { type: 'spring', damping: 18, stiffness: 220 } }}
              whileTap={reduced ? undefined : { scale: 0.95, rotate: 1.7, transition: { duration: 0.15 } }}
              style={{ position: 'relative', borderRadius: 26, background: 'linear-gradient(160deg,#2422d6,#3B39E8 60%,#5a4df0)', padding: 44, boxShadow: '0 30px 70px rgba(59,57,232,.4)', overflow: 'hidden', cursor: 'default' }}
            >
              <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, background: 'radial-gradient(circle,rgba(255,255,255,.28),transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: FG, fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.85)' }}>Premium</div>
                <span style={{ fontFamily: FG, fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff', background: 'rgba(255,255,255,.18)', padding: '7px 12px', borderRadius: 100 }}>Mais popular</span>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <span style={{ fontFamily: FG, fontSize: 'clamp(40px,5vw,56px)', fontWeight: 600, lineHeight: 1, letterSpacing: '-.03em', color: '#fff' }}>R$14,90</span>
                <span style={{ fontFamily: FM, fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,.8)' }}>/ mês</span>
              </div>
              <p style={{ position: 'relative', margin: '8px 0 28px', fontFamily: FM, fontSize: 15, lineHeight: 1.5, color: 'rgba(255,255,255,.82)' }}>
                Prática ilimitada e IA adaptativa até você ser aprovado.
              </p>
              <button onClick={() => navigate(email ? '/app' : '/login')} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', fontFamily: FM, fontSize: 15, fontWeight: 600, color: '#3B39E8', background: '#fff', padding: 15, borderRadius: 13, boxShadow: '0 10px 26px rgba(0,0,0,.16)', border: 'none', cursor: 'pointer' }}>
                <Crown size={16} /> Assinar Premium
              </button>
              <ul style={{ position: 'relative', listStyle: 'none', margin: '28px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {PREMIUM_FEATURES.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 11, fontFamily: FM, fontSize: 15, color: '#fff' }}>
                    <span style={{ fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────── */}
      <section id="cta" style={{ position: 'relative', padding: '40px 40px 100px' }}>
        <motion.div
          {...scaleIn(0, reduced)}
          style={{ position: 'relative', maxWidth: 1160, margin: '0 auto', borderRadius: 34, background: 'linear-gradient(135deg,#0C1024,#1a1a4d 55%,#2422d6)', overflow: 'hidden', padding: 'clamp(56px,7vw,100px) 40px', textAlign: 'center' }}
        >
          {[{ top: '-20%', left: '8%', bg: 'rgba(124,107,255,.4)' }, { bottom: '-30%', right: '6%', bg: 'rgba(59,57,232,.5)' }].map((b, i) => (
            <div key={i} style={{ position: 'absolute', top: (b as any).top, bottom: (b as any).bottom, left: (b as any).left, right: (b as any).right, width: 420, height: 420, borderRadius: '50%', background: b.bg, filter: 'blur(100px)', pointerEvents: 'none' }} />
          ))}
          <h2 style={{ position: 'relative', margin: '0 auto 24px', maxWidth: '20ch', fontFamily: FG, fontWeight: 600, fontSize: 'clamp(32px,5vw,64px)', lineHeight: 1.02, letterSpacing: '-.035em', color: '#fff' }}>
            Sua certificação AWS começa{' '}
            <span style={{ fontFamily: FI, fontStyle: 'italic', fontWeight: 400, background: 'linear-gradient(180deg,#fff,#9d8fff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>agora</span>.
          </h2>
          <p style={{ position: 'relative', margin: '0 auto', maxWidth: '46ch', fontFamily: FM, fontSize: 'clamp(16px,1.4vw,19px)', color: 'rgba(255,255,255,.75)', lineHeight: 1.6 }}>
            Crie sua conta grátis em menos de um minuto e faça seu primeiro simulado gerado por IA hoje.
          </p>
          <div style={{ position: 'relative', margin: '40px 0 0', display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', borderRadius: 15, padding: 2, overflow: 'hidden' }}>
              <div className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(157,143,255,.6)_0%,#fff_50%,rgba(157,143,255,.6)_100%)]" />
              <Link to="/login" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, background: '#fff', color: '#0C1024', fontFamily: FM, fontSize: 16, fontWeight: 600, padding: '16px 30px', borderRadius: 13, textDecoration: 'none' }}>
                Começar grátis <span>→</span>
              </Link>
            </div>
            <button onClick={() => goTo('planos')} style={{ display: 'flex', alignItems: 'center', fontFamily: FM, fontSize: 16, fontWeight: 600, color: '#fff', padding: '16px 26px', borderRadius: 13, border: '1px solid rgba(255,255,255,.25)', background: 'transparent', cursor: 'pointer' }}>
              Ver planos
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(12,16,36,.08)', padding: '64px 40px 48px' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10" style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="md:col-span-1">
            <Logo size="md" />
            <p style={{ margin: '18px 0 0', maxWidth: '32ch', fontFamily: FM, fontSize: 14, lineHeight: 1.6, color: '#6b708c' }}>
              Certificações AWS com inteligência artificial. Estude com propósito, passe com confiança.
            </p>
          </div>
          {[
            { title: 'Produto',         links: [['Recursos', '#features'], ['Planos', '#planos'], ['Como funciona', '#como']] },
            { title: 'Certificações',   links: [['Cloud Practitioner', '/login'], ['Solutions Architect', '/login'], ['Developer Associate', '/login']] },
            { title: 'Empresa',         links: [['Termos de Uso', '/termos'], ['Privacidade', '/privacidade'], ['Contato', '#']] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: FG, fontSize: 12, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#0C1024', marginBottom: 16 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {col.links.map(([label, href]) => (
                  <a key={label} href={href} style={{ fontFamily: FM, fontSize: 14, fontWeight: 500, color: '#6b708c', textDecoration: 'none' }}>{label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1240, margin: '48px auto 0', paddingTop: 24, borderTop: '1px solid rgba(12,16,36,.06)', fontFamily: FM, fontSize: 13, fontWeight: 500, color: '#9aa0bb' }}>
          © 2026 Certara · Não afiliado à Amazon Web Services.
        </div>
      </footer>

      <CookieBanner />
    </div>
  )
}
