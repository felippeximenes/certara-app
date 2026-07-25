import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, Zap, Star, Trophy, Crown, Flame, Target, Layers, BookOpen,
  LayoutDashboard, BarChart3, Sparkles, Play, Menu, Check, Brain,
  TrendingUp, ChevronRight, ChevronDown, Settings,
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { Onboarding } from '../components/Onboarding'
import { NotificationBell, seedNotifications } from '../components/NotificationBell'
import { useQuizStore } from '../store/quizStore'
import { useAuthStore } from '../store/authStore'
import { CERTIFICATIONS } from '../data/certifications'
import { getSubscription, listHistory } from '../services/api'
import { cn } from '@/lib/utils'
import type { SubscriptionStatus, QuizHistoryItem } from '../types/quiz'

// ── Font shorthands ───────────────────────────────────────────────────────────
const FG = "'Space Grotesk', system-ui, sans-serif"
const FM = "'Manrope', system-ui, sans-serif"
const FI = "'Instrument Serif', Georgia, serif"

// ── Constants ─────────────────────────────────────────────────────────────────

const DIFFICULTIES = [
  { label: 'Fácil',   icon: Zap,    colorClass: 'text-accent',  bg: 'bg-accent/10 hover:bg-accent/20',  border: 'hover:border-accent/50',  desc: 'Conceitos fundamentais' },
  { label: 'Médio',   icon: Star,   colorClass: 'text-warning', bg: 'bg-warning/10 hover:bg-warning/20', border: 'hover:border-warning/50', desc: 'Cenários práticos' },
  { label: 'Difícil', icon: Trophy, colorClass: 'text-danger',  bg: 'bg-danger/10 hover:bg-danger/20',   border: 'hover:border-danger/50',  desc: 'Trade-offs arquiteturais' },
]

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',        path: '/app' },
  { icon: Target,          label: 'Simulados',        path: '/simulado' },
  { icon: Layers,          label: 'Flashcards',       path: '/flashcards' },
  { icon: BookOpen,        label: 'Plano de estudos', path: '/plano-de-estudos' },
  { icon: BarChart3,       label: 'Histórico',        path: '/historico' },
]

const CERT_GRADIENT: Record<string, string> = {
  'clf-c02': 'linear-gradient(150deg,#f59e0b,#f97316)',
  'saa-c03': 'linear-gradient(150deg,#2563eb,#3B39E8)',
  'dva-c02': 'linear-gradient(150deg,#10b981,#059669)',
}

const CERT_SHORT: Record<string, string> = {
  'clf-c02': 'CLF',
  'saa-c03': 'SAA',
  'dva-c02': 'DVA',
}

const CERT_TIER: Record<string, string> = {
  'clf-c02': 'FOUND.',
  'saa-c03': 'ASSOC.',
  'dva-c02': 'ASSOC.',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, '0') }
function dateStr(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
function toTitleCase(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function calcStreak(items: QuizHistoryItem[]): number {
  if (!items.length) return 0
  const days = [...new Set(items.map((i) => i.date.slice(0, 10)))].sort().reverse()
  const cursor = new Date()
  let streak = 0
  for (const day of days) {
    if (day === dateStr(cursor)) { streak++; cursor.setDate(cursor.getDate() - 1) }
    else break
  }
  return streak
}

function getDomainStats(items: QuizHistoryItem[]) {
  const agg: Record<string, { correct: number; total: number }> = {}
  items.forEach((item) =>
    Object.entries(item.domains).forEach(([d, s]) => {
      if (!agg[d]) agg[d] = { correct: 0, total: 0 }
      agg[d].correct += s.correct
      agg[d].total += s.total
    }),
  )
  return Object.entries(agg)
    .filter(([, s]) => s.total > 0)
    .map(([domain, s]) => ({ domain: toTitleCase(domain), pct: Math.round((s.correct / s.total) * 100) }))
    .sort((a, b) => a.pct - b.pct)
}

// ── Mini Performance Chart ─────────────────────────────────────────────────────

function MiniChart({ data }: { data: { score: number; label: string }[] }) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p style={{ font: `500 14px/1.6 ${FM}`, color: '#9aa0bb', textAlign: 'center' }}>
          Complete pelo menos 2 quizzes<br />para ver sua evolução.
        </p>
      </div>
    )
  }
  const W = 600; const H = 150
  const p = { t: 16, r: 16, b: 28, l: 28 }
  const iW = W - p.l - p.r; const iH = H - p.t - p.b
  const xs = data.map((_, i) => p.l + (i / (data.length - 1)) * iW)
  const ys = data.map((d) => p.t + (1 - d.score / 100) * iH)
  const y70 = p.t + (1 - 0.7) * iH
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ')
  const area = `${line} L ${xs[xs.length - 1].toFixed(1)} ${(H - p.b).toFixed(1)} L ${p.l} ${(H - p.b).toFixed(1)} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[140px]" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="ch-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B39E8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3B39E8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 50, 100].map((v) => {
        const y = p.t + (1 - v / 100) * iH
        return <line key={v} x1={p.l} y1={y} x2={W - p.r} y2={y} stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" />
      })}
      <line x1={p.l} y1={y70} x2={W - p.r} y2={y70} stroke="#F59E0B" strokeDasharray="5 5" strokeWidth="1.5" opacity="0.6" />
      <path d={area} fill="url(#ch-grad)" />
      <path d={line} fill="none" stroke="#3B39E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="4.5" fill="#3B39E8" stroke="white" strokeWidth="2" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={xs[i]} y={H - 6} textAnchor="middle" fill="currentColor" fillOpacity="0.4" fontSize="11">{d.label}</text>
      ))}
    </svg>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  open: boolean
  onClose: () => void
  name: string
  isPremium: boolean
  onLogout: () => void
}

function Sidebar({ open, onClose, name, isPremium, onLogout }: SidebarProps) {
  const navigate = useNavigate()
  const avatar   = useAuthStore((s) => s.avatar)

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-transform duration-300',
          'lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto lg:flex-shrink-0 lg:overflow-y-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ width: 248, height: '100svh', background: '#fff', borderRight: '1px solid rgba(12,16,36,.07)', padding: '22px 18px' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2">
          <Logo size="sm" />
          <button
            className="ml-auto lg:hidden"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#4b5170', fontSize: 18, lineHeight: 1, cursor: 'pointer' }}
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>

        {/* Section label */}
        <div style={{ margin: '30px 0 10px', padding: '0 10px', font: `600 11px/1 ${FG}`, letterSpacing: '.2em', textTransform: 'uppercase', color: '#9aa0bb' }}>
          Principal
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const active = path === '/app'
            return (
              <button
                key={path}
                onClick={() => { navigate(path); onClose() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 12px', borderRadius: 11, border: 'none', cursor: 'pointer',
                  background: active ? 'rgba(59,57,232,.09)' : 'transparent',
                  color: active ? '#3B39E8' : '#4b5170',
                  font: active ? `600 14px/1 ${FM}` : `500 14px/1 ${FM}`,
                }}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Premium upsell */}
          {!isPremium && (
            <div style={{ position: 'relative', borderRadius: 18, background: 'linear-gradient(155deg,#3B39E8,#2422b6)', padding: 20, overflow: 'hidden', boxShadow: '0 14px 30px rgba(59,57,232,.32)' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'radial-gradient(circle,rgba(255,255,255,.25),transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, font: `600 15px/1 ${FG}`, color: '#fff' }}>
                <Crown className="h-3.5 w-3.5 text-yellow-300" /> Certara Premium
              </div>
              <p style={{ position: 'relative', margin: '9px 0 16px', font: `500 12px/1.5 ${FM}`, color: 'rgba(255,255,255,.82)' }}>
                Quizzes ilimitados e análises com IA.
              </p>
              <button
                onClick={() => { navigate('/assinatura'); onClose() }}
                style={{ position: 'relative', width: '100%', background: '#fff', color: '#3B39E8', font: `600 13px/1 ${FM}`, padding: '11px 0', borderRadius: 11, border: 'none', cursor: 'pointer' }}
              >
                Assinar Premium
              </button>
            </div>
          )}

          {/* User footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 6px', borderTop: '1px solid rgba(12,16,36,.07)' }}>
            {avatar ? (
              <img src={avatar} alt={name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#3B39E8,#7C6BFF)', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: `600 14px/1.2 ${FM}`, color: '#0C1024', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ font: `500 12px/1.2 ${FM}`, color: '#9aa0bb' }}>{isPremium ? 'Plano Premium' : 'Plano Gratuito'}</div>
            </div>
            <button onClick={() => { navigate('/conta'); onClose() }} title="Configurações" style={{ all: 'unset', cursor: 'pointer', color: '#9aa0bb', padding: 4 }}>
              <Settings className="h-3.5 w-3.5" />
            </button>
            <button onClick={onLogout} title="Sair" style={{ all: 'unset', cursor: 'pointer', color: '#9aa0bb', padding: 4 }}>
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function Home() {
  const navigate = useNavigate()
  const { setCertification, setSubject } = useQuizStore()
  const { email, signOut } = useAuthStore()

  const [selectedCert, setSelectedCert] = useState('')
  const [sub, setSub] = useState<SubscriptionStatus | null>(null)
  const [history, setHistory] = useState<QuizHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem('certara_onboarding_done') === null,
  )

  const glowRef   = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getSubscription().then(setSub).catch(() => null)
    listHistory()
      .then((items) => { setHistory(items); seedNotifications(items, calcStreak(items)) })
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [])

  useEffect(() => {
    const glow   = glowRef.current
    const banner = bannerRef.current
    if (!glow || !banner) return
    const move  = (e: MouseEvent) => {
      const r  = banner.getBoundingClientRect()
      const cx = (e.clientX - r.left - r.width / 2) / r.width
      const cy = (e.clientY - r.top - r.height / 2) / r.height
      glow.style.transform = `translate(${cx * 40}px, ${cy * 30}px)`
    }
    const leave = () => { glow.style.transform = '' }
    banner.addEventListener('mousemove', move)
    banner.addEventListener('mouseleave', leave)
    return () => {
      banner.removeEventListener('mousemove', move)
      banner.removeEventListener('mouseleave', leave)
    }
  }, [])

  async function handleLogout() { await signOut(); navigate('/login') }

  function handleSelectDifficulty(label: string) {
    setCertification(selectedCert); setSubject(label); navigate('/quiz')
  }

  const isPremium      = sub?.plan === 'premium'
  const trialExhausted = !isPremium && sub !== null && sub.trialUsed === true
  const name           = email?.split('@')[0] ?? 'estudante'
  const streak         = calcStreak(history)
  const avgPct         = history.length ? Math.round(history.reduce((s, i) => s + i.pct, 0) / history.length) : 0
  const bestScore      = history.length ? Math.max(...history.map((i) => i.pct)) : 0
  const domainStats    = getDomainStats(history)
  const weakDomains    = domainStats.slice(0, 4)
  const perfData       = [...history].reverse().slice(-7).map((item) => ({ score: item.pct, label: fmtShort(item.date) }))
  const aiPlan         = domainStats.slice(0, 3).map(({ domain, pct }) => ({
    title: `Reforçar: ${domain}`,
    desc:  `${pct}% de aproveitamento · Quiz rápido recomendado`,
  }))

  const statCards = [
    { icon: Star,       tint: 'rgba(59,57,232,.1)',   color: '#3B39E8', value: String(history.length), label: 'Quizzes feitos',   hint: history.length > 0 ? `Último: ${history[0].pct}%` : 'Faça o primeiro!', dur: 11 },
    { icon: TrendingUp, tint: 'rgba(16,185,129,.12)', color: '#10b981', value: `${avgPct}%`,           label: 'Média geral',      hint: avgPct >= 70 ? 'Acima da meta ✓' : 'Meta: 70%',                        dur: 12 },
    { icon: Trophy,     tint: 'rgba(245,158,11,.14)', color: '#f59e0b', value: `${bestScore}%`,        label: 'Melhor score',     hint: bestScore >= 80 ? 'Excelente!' : bestScore > 0 ? 'Continue assim' : '—', dur: 13 },
    { icon: Flame,      tint: 'rgba(239,68,68,.1)',   color: '#ef4444', value: streak > 0 ? `${streak}d` : '—', label: 'Sequência atual', hint: streak > 0 ? `🔥 ${streak} ${streak === 1 ? 'dia' : 'dias'}` : 'Estude hoje!', dur: 14 },
  ]

  return (
    <div className="min-h-svh flex" style={{ background: '#f6f6fb' }}>
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        name={name}
        isPremium={isPremium}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3"
          style={{
            padding: '16px 34px',
            background: 'rgba(246,246,251,.8)',
            backdropFilter: 'saturate(160%) blur(14px)',
            WebkitBackdropFilter: 'saturate(160%) blur(14px)',
            borderBottom: '1px solid rgba(12,16,36,.05)',
          }}
        >
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: '#4b5170', cursor: 'pointer', padding: 4, marginRight: 'auto' }}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block" style={{ flex: 1 }} />

          {streak > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: `600 12px/1 ${FM}`, color: '#ea580c', background: 'rgba(234,88,12,.08)', padding: '8px 13px', borderRadius: 100 }}>
              <Flame className="h-3.5 w-3.5" /> {streak} dias
            </div>
          )}

          {sub !== null && (
            <button
              onClick={() => navigate('/assinatura')}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                font: `600 12px/1 ${FM}`,
                color: isPremium ? '#3B39E8' : trialExhausted ? '#ef4444' : '#3B39E8',
                background: isPremium ? 'rgba(59,57,232,.09)' : trialExhausted ? 'rgba(239,68,68,.08)' : 'rgba(59,57,232,.09)',
                padding: '8px 13px', borderRadius: 100,
              }}
            >
              {isPremium
                ? <><Crown className="h-3.5 w-3.5" /> Premium</>
                : trialExhausted
                  ? <><Zap className="h-3.5 w-3.5" /> Trial usado</>
                  : <>✦ 1 teste grátis</>}
            </button>
          )}

          <div style={{ width: 38, height: 38, borderRadius: 11, background: '#fff', border: '1px solid rgba(12,16,36,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5170' }}>
            <NotificationBell />
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div style={{ padding: '26px 34px 60px', width: '100%' }}>

          {/* Greeting */}
          <div>
            <h1 style={{ margin: 0, fontFamily: FG, fontWeight: 600, fontSize: 32, letterSpacing: '-.02em', color: '#0C1024' }}>
              Olá, {name} <span style={{ fontFamily: FM }}>👋</span>
            </h1>
            <p style={{ margin: '8px 0 0', font: `400 15px/1.5 ${FM}`, color: '#6b708c' }}>
              {history.length === 0
                ? 'Bem-vindo ao Certara! Comece seu primeiro quiz abaixo.'
                : streak > 0
                  ? `${streak} ${streak === 1 ? 'dia' : 'dias'} em sequência 🔥 Continue assim!`
                  : 'Retome sua sequência de estudos hoje.'}
            </p>
          </div>

          {/* ── Hero Banner ─────────────────────────────────────────────── */}
          <section
            ref={bannerRef}
            style={{
              position: 'relative', marginTop: 22, borderRadius: 24, overflow: 'hidden',
              background: 'linear-gradient(115deg,#3B39E8 0%,#2422b6 55%,#171585 100%)',
              padding: '40px 44px', minHeight: 220,
            }}
          >
            {/* Dot pattern */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.10) 1px,transparent 1px)', backgroundSize: '24px 24px', opacity: 0.6, pointerEvents: 'none' }} />

            {/* Parallax glow */}
            <div
              ref={glowRef}
              style={{ position: 'absolute', top: '-40%', right: '6%', width: 520, height: 520, background: 'radial-gradient(circle,rgba(124,107,255,.55),transparent 65%)', pointerEvents: 'none', transition: 'transform .1s ease-out' }}
            />

            {/* Perspective grid */}
            <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '55%', overflow: 'hidden', pointerEvents: 'none', perspective: '300px', opacity: 0.35, WebkitMaskImage: 'linear-gradient(to top,#000,transparent)', maskImage: 'linear-gradient(to top,#000,transparent)' }}>
              <div style={{ position: 'absolute', inset: '-100% 0', transform: 'rotateX(60deg)', backgroundImage: 'linear-gradient(to right,rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '40px 40px', animation: 'gridmove 2.4s linear infinite' }} />
            </div>

            {/* Banner content */}
            <div style={{ position: 'relative' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 13px', borderRadius: 100, background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.2)', font: `600 12px/1 ${FM}`, color: '#fff' }}>
                <Sparkles className="h-3.5 w-3.5" /> Powered by Amazon Bedrock AI
              </span>
              <h2 style={{ margin: '20px 0 0', fontFamily: FG, fontWeight: 600, fontSize: 'clamp(22px,2.6vw,34px)', letterSpacing: '-.025em', color: '#fff' }}>
                {history.length === 0
                  ? <>Comece sua <span style={{ fontFamily: FI, fontStyle: 'italic', fontWeight: 400, color: '#c9c3ff' }}>preparação</span> agora!</>
                  : <>Continue praticando para sua <span style={{ fontFamily: FI, fontStyle: 'italic', fontWeight: 400, color: '#c9c3ff' }}>certificação</span></>}
              </h2>
              <p style={{ margin: '12px 0 0', maxWidth: '52ch', font: `400 15px/1.5 ${FM}`, color: 'rgba(255,255,255,.78)' }}>
                {history.length === 0
                  ? 'Questões geradas por IA, feedback personalizado e plano de estudos sob medida.'
                  : `Você já fez ${history.length} quiz${history.length === 1 ? '' : 'zes'}. Foco nos domínios mais fracos para garantir a aprovação.`}
              </p>
              <div style={{ margin: '26px 0 0', display: 'flex', gap: 13, flexWrap: 'wrap' }}>
                {/* Primary CTA with spinning ring */}
                <div style={{ position: 'relative', borderRadius: 13, padding: 2, overflow: 'hidden' }}>
                  <span className="cta-ring" style={{ background: 'conic-gradient(from var(--beam,0deg),transparent 0 62%,#c9c3ff 78%,#fff 90%,transparent 100%)' }} />
                  <button
                    onClick={() => document.getElementById('cert-selection')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, background: '#fff', color: '#3B39E8', font: `600 15px/1 ${FM}`, padding: '14px 22px', borderRadius: 11, border: 'none', cursor: 'pointer' }}
                  >
                    <Play className="h-4 w-4" /> Iniciar quiz
                  </button>
                </div>
                <button
                  onClick={() => navigate('/simulado')}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.22)', color: '#fff', font: `600 15px/1 ${FM}`, padding: '14px 22px', borderRadius: 13, cursor: 'pointer' }}
                >
                  <Target className="h-4 w-4" /> Simulado
                </button>
              </div>
            </div>
          </section>

          {/* ── Stat Cards ──────────────────────────────────────────────── */}
          <section style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
            {historyLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: 18, background: '#fff', border: '1px solid rgba(12,16,36,.07)', padding: 24 }}>
                    <div className="skeleton h-10 w-10 rounded-[12px] mb-4" />
                    <div className="skeleton h-8 w-16 rounded mb-2" />
                    <div className="skeleton h-3 w-24 rounded" />
                  </div>
                ))
              : statCards.map(({ icon: Icon, tint, color, value, label, hint, dur }) => (
                  <div key={label} style={{ position: 'relative', borderRadius: 18, background: '#fff', border: '1px solid rgba(12,16,36,.07)', padding: 24 }}>
                    <span className="beam" style={{ borderRadius: 18, animationDuration: `${dur}s` }} />
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    <div style={{ marginTop: 18, font: `600 34px/1 ${FG}`, letterSpacing: '-.02em', color: '#0C1024' }}>{value}</div>
                    <div style={{ marginTop: 6, font: `600 13px/1.3 ${FM}`, color: '#4b5170' }}>{label}</div>
                    <div style={{ marginTop: 2, font: `500 12px/1.3 ${FM}`, color: '#9aa0bb' }}>{hint}</div>
                  </div>
                ))}
          </section>

          {/* ── Performance + Domains ───────────────────────────────────── */}
          <section style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 18 }}>
            <div style={{ borderRadius: 20, background: '#fff', border: '1px solid rgba(12,16,36,.07)', padding: 28, minHeight: 230, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div>
                  <h3 style={{ margin: 0, font: `600 18px/1.2 ${FG}`, letterSpacing: '-.01em', color: '#0C1024' }}>Evolução do desempenho</h3>
                  <p style={{ margin: '6px 0 0', font: `500 13px/1.3 ${FM}`, color: '#9aa0bb' }}>Score médio por sessão</p>
                </div>
                <button onClick={() => navigate('/historico')} style={{ all: 'unset', cursor: 'pointer', font: `600 13px/1 ${FM}`, color: '#3B39E8' }}>
                  Ver tudo <ChevronRight className="h-3 w-3 inline" />
                </button>
              </div>
              <div style={{ flex: 1 }}>
                <MiniChart data={perfData} />
              </div>
              <div style={{ display: 'flex', gap: 18, font: `500 12px/1 ${FM}`, color: '#9aa0bb' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#3B39E8', display: 'inline-block' }} /> Seu score
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 16, height: 2, background: '#f59e0b', borderRadius: 2, display: 'inline-block' }} /> Meta 70%
                </span>
              </div>
            </div>

            <div style={{ borderRadius: 20, background: '#fff', border: '1px solid rgba(12,16,36,.07)', padding: 28, minHeight: 230, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, font: `600 18px/1.2 ${FG}`, letterSpacing: '-.01em', color: '#0C1024' }}>Domínios a reforçar</h3>
                <ChevronRight className="h-4 w-4" style={{ color: '#c3c7db' }} />
              </div>
              {historyLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="skeleton h-3 w-32 rounded" />
                      <div className="skeleton h-2 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : weakDomains.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <p style={{ font: `500 14px/1.6 ${FM}`, color: '#9aa0bb' }}>Complete quizzes para ver<br />seus pontos fracos.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {weakDomains.map(({ domain, pct }) => {
                    const color = pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444'
                    return (
                      <div key={domain}>
                        <div className="flex justify-between mb-1.5">
                          <span style={{ font: `500 13px/1 ${FM}`, color: '#0C1024' }} className="truncate pr-2">{domain}</span>
                          <span style={{ font: `700 13px/1 ${FM}`, color, flexShrink: 0 }}>{pct}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 100, background: 'rgba(12,16,36,.07)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 100, backgroundColor: color, width: `${pct}%`, transition: 'width .5s ease' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ── AI Plan + Tools ─────────────────────────────────────────── */}
          <section style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 18 }}>
            {/* AI Plan */}
            <div style={{ position: 'relative', borderRadius: 20, background: 'linear-gradient(160deg,#f3fff9,#eef1ff)', border: '1px solid rgba(59,57,232,.1)', padding: 28, overflow: 'hidden' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 100, background: 'rgba(16,185,129,.14)', font: `600 11px/1 ${FG}`, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0f9d6f' }}>
                <Sparkles className="h-3 w-3" /> Plano IA
              </span>
              <h3 style={{ margin: '16px 0 0', font: `600 20px/1.2 ${FG}`, letterSpacing: '-.02em', color: '#0C1024' }}>Foco para os próximos dias</h3>
              <p style={{ margin: '8px 0 22px', font: `500 14px/1.4 ${FM}`, color: '#6b708c' }}>
                {aiPlan.length > 0
                  ? 'Baseado no seu histórico, recomendamos focar nesses tópicos prioritários.'
                  : 'Complete alguns quizzes para receber seu plano personalizado com IA.'}
              </p>
              {aiPlan.length > 0 ? (
                <div className="space-y-2.5">
                  {aiPlan.map(({ title, desc }) => (
                    <div
                      key={title}
                      onClick={() => document.getElementById('cert-selection')?.scrollIntoView({ behavior: 'smooth' })}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255,255,255,.7)', border: '1px solid rgba(59,57,232,.12)', borderRadius: 14, cursor: 'pointer' }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(59,57,232,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B39E8', flexShrink: 0 }}>
                        <Brain className="h-4 w-4" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, font: `600 14px/1.2 ${FM}`, color: '#0C1024' }} className="truncate">{title}</p>
                        <p style={{ margin: '2px 0 0', font: `500 12px/1.2 ${FM}`, color: '#9aa0bb' }}>{desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4" style={{ color: '#9aa0bb', flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => document.getElementById('cert-selection')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ display: 'block', width: '100%', textAlign: 'center', background: 'rgba(255,255,255,.7)', border: '1px dashed rgba(59,57,232,.35)', color: '#3B39E8', font: `600 14px/1 ${FM}`, padding: 16, borderRadius: 14, cursor: 'pointer' }}
                >
                  Fazer primeiro quiz →
                </button>
              )}
            </div>

            {/* Tools */}
            <div style={{ borderRadius: 20, background: '#fff', border: '1px solid rgba(12,16,36,.07)', padding: 28 }}>
              <h3 style={{ margin: '0 0 18px', font: `600 18px/1.2 ${FG}`, letterSpacing: '-.01em', color: '#0C1024' }}>Ferramentas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {([
                  { icon: Target,    tint: 'rgba(59,57,232,.1)',   color: '#3B39E8', label: 'Simulado',   desc: '65 questões',   path: '/simulado' },
                  { icon: Layers,    tint: 'rgba(16,185,129,.12)', color: '#10b981', label: 'Flashcards', desc: 'Revisão rápida', path: '/flashcards' },
                  { icon: BookOpen,  tint: 'rgba(245,158,11,.14)', color: '#f59e0b', label: 'Plano',      desc: 'Personalizado',  path: '/plano-de-estudos' },
                  { icon: BarChart3, tint: 'rgba(239,68,68,.1)',   color: '#ef4444', label: 'Histórico',  desc: 'Evolução',       path: '/historico' },
                ] as const).map(({ icon: Icon, tint, color, label, desc, path }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 18px 40px rgba(59,57,232,.12)' }}
                    onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '' }}
                    style={{ borderRadius: 14, border: '1px solid rgba(12,16,36,.08)', padding: 16, background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'transform .2s,box-shadow .2s' }}
                  >
                    <span style={{ width: 34, height: 34, borderRadius: 10, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div style={{ marginTop: 12, font: `600 14px/1.2 ${FM}`, color: '#0C1024' }}>{label}</div>
                    <div style={{ marginTop: 3, font: `500 12px/1.2 ${FM}`, color: '#9aa0bb' }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Cert Selection ──────────────────────────────────────────── */}
          <section id="cert-selection" style={{ marginTop: 44 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontFamily: FG, fontWeight: 600, fontSize: 22, letterSpacing: '-.02em', color: '#0C1024' }}>
                {history.length > 0 ? 'Suas certificações' : 'Selecione a certificação'}
              </h2>
              <span style={{ font: `600 11px/1 ${FG}`, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9aa0bb' }}>Passo 1 · Escolha a trilha</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CERTIFICATIONS.map((cert) => {
                const isSelected = selectedCert === cert.id
                const gradient   = CERT_GRADIENT[cert.id] ?? 'linear-gradient(150deg,#6366F1,#4338CA)'
                const short      = CERT_SHORT[cert.id] ?? cert.code.split('-')[0]
                const tier       = CERT_TIER[cert.id] ?? 'ASSOC.'

                return (
                  <div
                    key={cert.id}
                    style={{ background: '#fff', border: `1px solid ${isSelected ? '#3B39E8' : 'rgba(12,16,36,.07)'}`, borderRadius: 16, overflow: 'hidden', boxShadow: isSelected ? '0 4px 20px rgba(59,57,232,.12)' : 'none', transition: 'border-color .2s,box-shadow .2s' }}
                  >
                    <button
                      onClick={() => setSelectedCert(isSelected ? '' : cert.id)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 18, background: isSelected ? 'rgba(59,57,232,.03)' : 'transparent', padding: '18px 22px', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <span style={{ width: 46, height: 46, borderRadius: 12, background: gradient, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                        <span style={{ font: `700 13px/1 ${FG}` }}>{short}</span>
                        <span style={{ font: `600 6px/1 ${FG}`, letterSpacing: '.1em', marginTop: 2 }}>{tier}</span>
                      </span>
                      <span style={{ flex: 1 }}>
                        <strong style={{ font: `700 15px/1 ${FG}`, color: cert.color }}>{cert.code}</strong>{' '}
                        <span style={{ font: `500 15px/1 ${FM}`, color: '#0C1024' }}>{cert.name}</span>
                        {isSelected && <div style={{ font: `500 12px/1 ${FM}`, color: '#3B39E8', marginTop: 4 }}>Escolha a dificuldade abaixo ↓</div>}
                      </span>
                      <span style={{ font: `600 12px/1 ${FM}`, color: '#6b708c', border: '1px solid rgba(12,16,36,.12)', borderRadius: 100, padding: '7px 13px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {cert.level} {isSelected ? <Check className="h-3 w-3" style={{ color: '#3B39E8' }} /> : <ChevronDown className="h-3 w-3" />}
                      </span>
                    </button>

                    {/* Difficulty panel */}
                    {isSelected && (
                      <div style={{ padding: '0 22px 22px', background: 'linear-gradient(to bottom,rgba(59,57,232,.04),transparent)' }}>
                        <div style={{ height: 1, background: 'rgba(59,57,232,.1)', margin: '0 0 18px' }} />
                        {trialExhausted ? (
                          <div style={{ borderRadius: 14, border: '1px solid rgba(59,57,232,.15)', background: '#fff', padding: '28px 20px', textAlign: 'center' }}>
                            <div style={{ width: 40, height: 40, margin: '0 auto 14px', borderRadius: '50%', background: 'rgba(59,57,232,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B39E8' }}>
                              <Crown className="h-5 w-5" />
                            </div>
                            <p style={{ margin: '0 0 4px', font: `600 14px/1 ${FM}`, color: '#0C1024' }}>Teste gratuito utilizado</p>
                            <p style={{ margin: '0 0 18px', font: `500 12px/1.5 ${FM}`, color: '#9aa0bb' }}>
                              Você já realizou seu quiz gratuito.<br />Assine o Premium para continuar estudando.
                            </p>
                            <button
                              onClick={() => navigate('/assinatura')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3B39E8', color: '#fff', font: `600 13px/1 ${FM}`, padding: '12px 20px', borderRadius: 11, border: 'none', cursor: 'pointer' }}
                            >
                              <Crown className="h-4 w-4" /> Ver planos
                            </button>
                          </div>
                        ) : (
                          <>
                            <p style={{ margin: '0 0 14px', font: `600 11px/1 ${FG}`, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(59,57,232,.6)' }}>
                              Passo 2 · Escolha a dificuldade
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                              {DIFFICULTIES.map(({ label, icon: Icon, colorClass, bg, border, desc }) => (
                                <button
                                  key={label}
                                  onClick={() => handleSelectDifficulty(label)}
                                  className={cn('flex flex-col items-center gap-2 rounded-[14px] border border-border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95', bg, border)}
                                  style={{ background: '#fff', cursor: 'pointer' }}
                                >
                                  <div className={cn('rounded-xl p-2.5', bg)}>
                                    <Icon className={cn('h-5 w-5', colorClass)} />
                                  </div>
                                  <span style={{ font: `600 14px/1 ${FM}`, color: '#0C1024' }}>{label}</span>
                                  <span style={{ font: `500 12px/1.3 ${FM}`, color: '#9aa0bb', textAlign: 'center' }}>{desc}</span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── Empty state / AI plan CTA ──────────────────────────── */}
            <div style={{ marginTop: 26, border: '1px solid rgba(12,16,36,.07)', borderRadius: 20, background: '#fff', padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, margin: '0 auto', borderRadius: 18, background: 'rgba(59,57,232,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B39E8' }}>
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 style={{ margin: '22px 0 0', fontFamily: FG, fontWeight: 600, fontSize: 22, letterSpacing: '-.02em', color: '#0C1024' }}>
                Pronto para uma{' '}
                <span style={{ fontFamily: FI, fontStyle: 'italic', fontWeight: 400, color: '#3B39E8' }}>nova trilha</span>?
              </h3>
              <p style={{ margin: '12px auto 26px', maxWidth: '46ch', font: `400 15px/1.6 ${FM}`, color: '#6b708c' }}>
                Gere um plano de estudos personalizado por IA para a sua próxima certificação e comece do seu nível atual.
              </p>
              <div style={{ display: 'inline-block', position: 'relative', borderRadius: 13, padding: 2, overflow: 'hidden' }}>
                <span className="cta-ring" style={{ background: 'conic-gradient(from var(--beam,0deg),transparent 0 62%,#6D6BF0 78%,#a78bfa 90%,transparent 100%)', animationDuration: '2.6s' }} />
                <button
                  onClick={() => navigate('/plano-de-estudos')}
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, background: '#3B39E8', color: '#fff', font: `600 15px/1 ${FM}`, padding: '15px 26px', borderRadius: 11, border: 'none', cursor: 'pointer', boxShadow: '0 12px 30px rgba(59,57,232,.32)' }}
                >
                  <Sparkles className="h-4 w-4" /> Gerar plano com IA
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
