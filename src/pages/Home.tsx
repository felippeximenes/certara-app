import { useState, useEffect } from 'react'
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

// ── Constants ────────────────────────────────────────────────────────────────

// Trial system: 1 free quiz per account, ever

const DIFFICULTIES = [
  { label: 'Fácil',   icon: Zap,    colorClass: 'text-accent',  bg: 'bg-accent/10 hover:bg-accent/20',  border: 'hover:border-accent/50',  desc: 'Conceitos fundamentais' },
  { label: 'Médio',   icon: Star,   colorClass: 'text-warning', bg: 'bg-warning/10 hover:bg-warning/20', border: 'hover:border-warning/50', desc: 'Cenários práticos' },
  { label: 'Difícil', icon: Trophy, colorClass: 'text-danger',  bg: 'bg-danger/10 hover:bg-danger/20',   border: 'hover:border-danger/50',  desc: 'Trade-offs arquiteturais' },
]

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',       path: '/app' },
  { icon: Target,          label: 'Simulados',       path: '/simulado' },
  { icon: Layers,          label: 'Flashcards',      path: '/flashcards' },
  { icon: BookOpen,        label: 'Plano de estudos',path: '/plano-de-estudos' },
  { icon: BarChart3,       label: 'Histórico',       path: '/historico' },
]

const TONE_BG: Record<string, string> = {
  p: 'bg-primary/10 text-primary',
  a: 'bg-accent/10 text-accent',
  o: 'bg-warning/10 text-warning',
  r: 'bg-danger/10 text-danger',
}

const HEX_GRAD: Record<string, [string, string]> = {
  'clf-c02': ['#FF9900', '#E65C00'],
  'saa-c03': ['#3B82F6', '#1D4ED8'],
  'dva-c02': ['#22C55E', '#15803D'],
}

const CERT_TIER: Record<string, string> = {
  'clf-c02': 'FOUNDATIONAL',
  'saa-c03': 'ASSOCIATE',
  'dva-c02': 'ASSOCIATE',
}

// ── HexBadge ─────────────────────────────────────────────────────────────────

function HexBadge({ certId, code, locked = false }: { certId: string; code: string; locked?: boolean }) {
  const [from, to] = HEX_GRAD[certId] ?? ['#6366F1', '#4338CA']
  const tier = CERT_TIER[certId] ?? 'ASSOCIATE'
  const gid = `hx-${certId}`
  return (
    <div
      className="w-[52px] h-[52px] shrink-0 relative flex items-center justify-center"
      style={locked ? { opacity: 0.5, filter: 'grayscale(.35)' } : undefined}
    >
      <svg viewBox="0 0 100 108" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
        <path d="M50 2 95 28 95 80 50 106 5 80 5 28Z" fill={`url(#${gid})`} />
        {!locked && (
          <path d="M50 2 95 28 95 80 50 106 5 80 5 28Z"
            fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
        )}
        <path d="M50 12 86 33 86 75 50 96 14 75 14 33Z"
          fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" />
      </svg>
      <span className="relative z-10 font-sans font-extrabold text-[11px] text-white tracking-wide leading-none">
        {code}
      </span>
      <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 z-20 text-[6.5px] font-extrabold
        tracking-wider bg-card border border-border text-muted-foreground px-1.5 py-px rounded-full whitespace-nowrap">
        {tier}
      </span>
    </div>
  )
}

// ── TrackEmptyState ───────────────────────────────────────────────────────────

function TrackEmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-9 mt-1
      border-[1.5px] border-dashed border-border rounded-[18px] bg-muted/20">
      <svg width="132" height="96" viewBox="0 0 132 96" fill="none" aria-hidden="true">
        <rect x="18" y="26" width="96" height="60" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="2" />
        <rect x="18" y="26" width="96" height="16" rx="8" fill="#EEF0FF" />
        <circle cx="28" cy="34" r="2.4" fill="#3B39E8" />
        <circle cx="36" cy="34" r="2.4" fill="#E2E8F0" />
        <rect x="30" y="52" width="46" height="7" rx="3.5" fill="#E2E8F0" />
        <rect x="30" y="64" width="72" height="6" rx="3" fill="#EEF0FF" />
        <rect x="30" y="74" width="58" height="6" rx="3" fill="#EEF0FF" />
        <circle cx="98" cy="30" r="22" fill="#3B39E8" fillOpacity="0.1" />
        <circle cx="98" cy="30" r="15" fill="none" stroke="#3B39E8" strokeWidth="2.4" strokeDasharray="4 5" />
        <path d="M92 30l4 4 9-9" stroke="#3B39E8" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h4 className="font-sans text-base font-bold text-foreground mt-4 mb-1">
        Pronto para uma nova trilha?
      </h4>
      <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed mb-5">
        Gere um plano de estudos personalizado por IA para a sua próxima certificação e comece do seu nível atual.
      </p>
      <button
        onClick={onGenerate}
        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover
          text-white font-bold text-sm px-5 py-2.5 rounded-[10px] transition-colors active:scale-95"
      >
        <Sparkles className="w-4 h-4" /> Gerar plano com IA
      </button>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  open: boolean
  onClose: () => void
  name: string
  isPremium: boolean
  onLogout: () => void
}

function Sidebar({ open, onClose, name, isPremium, onLogout }: SidebarProps) {
  const navigate = useNavigate()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-[240px] flex flex-col',
          'bg-card border-r border-border shadow-xl',
          'transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:h-full lg:translate-x-0 lg:z-auto lg:overflow-y-auto lg:shadow-none lg:flex-shrink-0',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-[22px] border-b border-border flex-shrink-0">
          <Logo size="sm" />
          <button
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase px-3 mb-2">
            Principal
          </p>
          <div className="space-y-0.5">
            {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                onClick={() => { navigate(path); onClose() }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold transition-colors',
                  path === '/app'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Premium upsell */}
        {!isPremium && (
          <div className="mx-3 mb-3 rounded-[14px] p-4 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B39E8 0%, #1F1D9E 100%)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Crown className="h-3.5 w-3.5 text-yellow-300" />
              <h4 className="font-sans text-sm font-bold text-white">Certara Premium</h4>
            </div>
            <p className="text-xs text-white/70 mb-3 leading-snug">
              Quizzes ilimitados e análises com IA.
            </p>
            <button
              onClick={() => { navigate('/assinatura'); onClose() }}
              className="w-full bg-white text-primary text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 hover:bg-white/90 transition-colors"
            >
              <Crown className="h-3 w-3" /> Assinar Premium
            </button>
          </div>
        )}

        {/* User footer */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-t border-border flex-shrink-0">
          <div
            className="h-8 w-8 rounded-[10px] flex items-center justify-center text-white text-xs font-bold font-sans flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B39E8 0%, #2D2BC5 100%)' }}
          >
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{name}</p>
            <p className="text-[10px] text-muted-foreground">{isPremium ? 'Plano Premium' : 'Plano Gratuito'}</p>
          </div>
          <button
            onClick={() => { navigate('/conta'); onClose() }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title="Configurações da conta"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onLogout}
            className="text-muted-foreground hover:text-danger transition-colors p-1"
            title="Sair"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Readiness Ring ───────────────────────────────────────────────────────────

function ReadinessRing({ pct }: { pct: number }) {
  const r = 46
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(pct, 100) / 100)
  return (
    <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0 relative z-10">
      <svg width="116" height="116" viewBox="0 0 116 116">
        <circle cx="58" cy="58" r={r} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="10" />
        <circle
          cx="58" cy="58" r={r} fill="none" stroke="white" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 58 58)"
        />
        <text x="58" y="54" textAnchor="middle" fill="white" fontSize="26" fontWeight="800"
          fontFamily="'Plus Jakarta Sans', sans-serif">{pct}%</text>
        <text x="58" y="72" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="10">
          prontidão
        </text>
      </svg>
      <p className="text-xs text-white/60 font-medium mt-1">Meta: 70%</p>
    </div>
  )
}

// ── Mini Performance Chart ───────────────────────────────────────────────────

function MiniChart({ data }: { data: { score: number; label: string }[] }) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-[140px]">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Complete pelo menos 2 quizzes<br />para ver sua evolução.
        </p>
      </div>
    )
  }

  const W = 600; const H = 150
  const pad = { t: 16, r: 16, b: 28, l: 28 }
  const iW = W - pad.l - pad.r; const iH = H - pad.t - pad.b
  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * iW)
  const ys = data.map((d) => pad.t + (1 - d.score / 100) * iH)
  const y70 = pad.t + (1 - 0.7) * iH
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ')
  const area = `${line} L ${xs[xs.length - 1].toFixed(1)} ${(H - pad.b).toFixed(1)} L ${pad.l} ${(H - pad.b).toFixed(1)} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[140px]" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="ch-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B39E8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3B39E8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 50, 100].map((v) => {
        const y = pad.t + (1 - v / 100) * iH
        return <line key={v} x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" />
      })}
      <line x1={pad.l} y1={y70} x2={W - pad.r} y2={y70}
        stroke="#F59E0B" strokeDasharray="5 5" strokeWidth="1.5" opacity="0.6" />
      <path d={area} fill="url(#ch-grad)" />
      <path d={line} fill="none" stroke="#3B39E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="4.5" fill="#3B39E8" stroke="white" strokeWidth="2" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={xs[i]} y={H - 6} textAnchor="middle" fill="currentColor" fillOpacity="0.4" fontSize="11">
          {d.label}
        </text>
      ))}
    </svg>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

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

  useEffect(() => {
    getSubscription().then(setSub).catch(() => null)
    listHistory()
      .then((items) => { setHistory(items); seedNotifications(items, calcStreak(items)) })
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [])

  async function handleLogout() { await signOut(); navigate('/login') }

  function handleSelectDifficulty(label: string) {
    setCertification(selectedCert); setSubject(label); navigate('/quiz')
  }

  const isPremium = sub?.plan === 'premium'
  const trialExhausted = !isPremium && sub !== null && sub.trialUsed === true
  const name = email?.split('@')[0] ?? 'estudante'
  const streak = calcStreak(history)
  const avgPct = history.length ? Math.round(history.reduce((s, i) => s + i.pct, 0) / history.length) : 0
  const bestScore = history.length ? Math.max(...history.map((i) => i.pct)) : 0
  const domainStats = getDomainStats(history)
  const weakDomains = domainStats.slice(0, 4)
  const perfData = [...history].reverse().slice(-7).map((item) => ({ score: item.pct, label: fmtShort(item.date) }))
  const aiPlan = domainStats.slice(0, 3).map(({ domain, pct }) => ({
    title: `Reforçar: ${domain}`,
    desc: `${pct}% de aproveitamento · Quiz rápido recomendado`,
  }))

  const statCards = [
    { icon: Star, tone: 'p', value: String(history.length), label: 'Quizzes feitos',
      trend: history.length > 0 ? `Último: ${history[0].pct}%` : 'Faça o primeiro!', up: null as boolean | null },
    { icon: TrendingUp, tone: 'a', value: `${avgPct}%`, label: 'Média geral',
      trend: avgPct >= 70 ? 'Acima da meta ✓' : 'Meta: 70%', up: avgPct >= 70 ? true : (avgPct > 0 ? false : null) },
    { icon: Trophy, tone: 'o', value: `${bestScore}%`, label: 'Melhor score',
      trend: bestScore >= 80 ? 'Excelente!' : bestScore > 0 ? 'Continue assim' : '—', up: bestScore >= 80 ? true : null },
    { icon: Flame, tone: 'r', value: streak > 0 ? `${streak}d` : '—', label: 'Sequência atual',
      trend: streak > 0 ? `🔥 ${streak} ${streak === 1 ? 'dia' : 'dias'}` : 'Estude hoje!', up: null },
  ]

  return (
    <div className="h-svh flex overflow-hidden bg-background text-foreground">
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        name={name}
        isPremium={isPremium}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 lg:px-6 border-b border-border bg-card/80 backdrop-blur-sm">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          {streak > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] font-bold text-sm text-orange-600 bg-orange-50 border border-orange-200">
              <Flame className="h-4 w-4" /> {streak} dias
            </div>
          )}

          {sub !== null && (
            <button
              onClick={() => navigate('/assinatura')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
                isPremium
                  ? 'bg-primary/15 text-primary hover:bg-primary/25'
                  : trialExhausted
                    ? 'bg-danger/10 text-danger hover:bg-danger/20'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {isPremium
                ? <><Crown className="h-3 w-3" /> Premium</>
                : trialExhausted
                  ? <><Zap className="h-3 w-3" /> Trial usado</>
                  : <><Zap className="h-3 w-3" /> 1 teste grátis</>}
            </button>
          )}

          <NotificationBell />
        </header>

        {/* Content */}
        <main className="flex-1">
          <div className="w-full px-5 lg:px-8 py-6 pb-16 space-y-5">

            {/* Page heading */}
            <div>
              <h1 className="font-sans text-2xl font-extrabold text-foreground">Olá, {name} 👋</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {history.length === 0
                  ? 'Bem-vindo ao Certara! Comece seu primeiro quiz abaixo.'
                  : streak > 0
                    ? `${streak} ${streak === 1 ? 'dia' : 'dias'} em sequência 🔥 Continue assim!`
                    : 'Retome sua sequência de estudos hoje.'}
              </p>
            </div>

            {/* Hero banner */}
            <div
              className="rounded-[18px] p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              style={{ background: 'linear-gradient(135deg, #3B39E8 0%, #1F1D9E 100%)' }}
            >
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
              <div className="relative z-10 max-w-lg">
                <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold text-white mb-3.5">
                  <Sparkles className="h-3.5 w-3.5" /> Powered by Amazon Bedrock AI
                </span>
                <h2 className="font-sans text-xl md:text-[22px] font-extrabold text-white leading-tight">
                  {history.length === 0 ? 'Comece sua preparação agora!' : 'Continue praticando para sua certificação'}
                </h2>
                <p className="text-white/70 text-sm mt-2 mb-5 leading-relaxed">
                  {history.length === 0
                    ? 'Questões geradas por IA, feedback personalizado e plano de estudos sob medida.'
                    : `Você já fez ${history.length} quiz${history.length === 1 ? '' : 'zes'}. Foco nos domínios mais fracos para garantir a aprovação.`}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => document.getElementById('cert-selection')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 bg-white text-primary font-bold text-sm px-5 py-2.5 rounded-[11px] hover:bg-white/90 transition-colors active:scale-95"
                  >
                    <Play className="h-4 w-4" /> Iniciar quiz
                  </button>
                  <button
                    onClick={() => navigate('/simulado')}
                    className="flex items-center gap-2 bg-white/10 border border-white/25 text-white font-bold text-sm px-5 py-2.5 rounded-[11px] hover:bg-white/20 transition-colors active:scale-95"
                  >
                    <Target className="h-4 w-4" /> Simulado
                  </button>
                </div>
              </div>
              {history.length > 0 && <ReadinessRing pct={avgPct} />}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {historyLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-[14px] border border-border bg-card p-4 space-y-3">
                      <div className="skeleton h-8 w-8 rounded-[10px]" />
                      <div className="skeleton h-6 w-14 rounded" />
                      <div className="skeleton h-3 w-20 rounded" />
                    </div>
                  ))
                : statCards.map(({ icon: Icon, tone, value, label, trend, up }) => (
                    <div key={label} className="rounded-[14px] border border-border bg-card p-4 shadow-sm">
                      <div className={cn('w-8 h-8 rounded-[10px] flex items-center justify-center mb-3', TONE_BG[tone])}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="font-sans text-2xl font-extrabold text-foreground leading-none">{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                      {trend && (
                        <p className={cn(
                          'text-xs font-semibold mt-2 flex items-center gap-1',
                          up === true ? 'text-success' : up === false ? 'text-danger' : 'text-muted-foreground',
                        )}>
                          {up === true && <TrendingUp className="h-3 w-3" />}
                          {trend}
                        </p>
                      )}
                    </div>
                  ))}
            </div>

            {/* Performance + Weak domains */}
            <div className="grid lg:grid-cols-[3fr_2fr] gap-4">
              <div className="rounded-[14px] border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="font-sans text-base font-bold text-foreground">Evolução do desempenho</h3>
                    <p className="text-xs text-muted-foreground">Score médio por sessão</p>
                  </div>
                  <button
                    onClick={() => navigate('/historico')}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                  >
                    Ver tudo <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <MiniChart data={perfData} />
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/80 inline-block" /> Seu score
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="inline-block w-5 border-t-2 border-dashed border-warning" /> Meta 70%
                  </span>
                </div>
              </div>

              <div className="rounded-[14px] border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-sans text-base font-bold text-foreground">Domínios a reforçar</h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                  <p className="text-xs text-muted-foreground text-center py-6 leading-relaxed">
                    Complete quizzes para ver<br />seus pontos fracos.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {weakDomains.map(({ domain, pct }) => {
                      const color = pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444'
                      return (
                        <div key={domain}>
                          <div className="flex justify-between mb-1.5">
                            <span className="text-sm font-medium text-foreground truncate pr-2">{domain}</span>
                            <span className="text-sm font-bold flex-shrink-0" style={{ color }}>{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* AI Plan + Tools */}
            <div className="grid lg:grid-cols-[3fr_2fr] gap-4">
              <div className="rounded-[14px] border border-border bg-gradient-to-br from-accent/5 to-card p-5 shadow-sm">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" /> PLANO IA
                </span>
                <h3 className="font-sans text-base font-bold text-foreground mt-3 mb-1">Foco para os próximos dias</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  {aiPlan.length > 0
                    ? 'Baseado no seu histórico, recomendamos focar nesses tópicos prioritários.'
                    : 'Complete alguns quizzes para receber seu plano personalizado com IA.'}
                </p>
                {aiPlan.length > 0 ? (
                  <div className="space-y-2.5">
                    {aiPlan.map(({ title, desc }) => (
                      <div
                        key={title}
                        className="flex items-center gap-3 p-3 bg-card border border-border rounded-[11px] hover:border-primary/30 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('cert-selection')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        <div className="w-8 h-8 rounded-[9px] bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <Brain className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => document.getElementById('cert-selection')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full rounded-[11px] border border-primary/20 bg-primary/5 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    Fazer primeiro quiz →
                  </button>
                )}
              </div>

              <div className="rounded-[14px] border border-border bg-card p-5 shadow-sm">
                <h3 className="font-sans text-base font-bold text-foreground mb-4">Ferramentas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Target,   label: 'Simulado',  desc: '65 questões',   path: '/simulado',        tone: 'p' },
                    { icon: Layers,   label: 'Flashcards',desc: 'Revisão rápida', path: '/flashcards',      tone: 'a' },
                    { icon: BookOpen, label: 'Plano',     desc: 'Personalizado',  path: '/plano-de-estudos',tone: 'o' },
                    { icon: BarChart3,label: 'Histórico', desc: 'Evolução',       path: '/historico',       tone: 'r' },
                  ].map(({ icon: Icon, label, desc, path, tone }) => (
                    <button
                      key={path}
                      onClick={() => navigate(path)}
                      className="flex flex-col items-start gap-2.5 p-3.5 rounded-[14px] border border-border bg-background hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', TONE_BG[tone])}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-sans text-sm font-bold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cert selection + inline difficulty */}
            <section id="cert-selection" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-base font-bold text-foreground">
                  {history.length > 0 ? 'Suas certificações' : 'Selecione a certificação'}
                </h3>
                <span className="text-[10.5px] font-bold tracking-widest text-muted-foreground uppercase">
                  Passo 1 · escolha a trilha
                </span>
              </div>

              <div className="space-y-2.5">
                {CERTIFICATIONS.map((cert) => {
                  const isSelected = selectedCert === cert.id
                  return (
                    <div
                      key={cert.id}
                      className={cn(
                        'rounded-[14px] border bg-card shadow-sm transition-all duration-200 overflow-hidden',
                        isSelected
                          ? 'border-primary shadow-md shadow-primary/10 ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/30 hover:shadow-md',
                      )}
                    >
                      {/* Cert header row */}
                      <button
                        className={cn(
                          'w-full flex items-center gap-4 px-5 py-4 text-left transition-colors',
                          isSelected ? 'bg-primary/5' : 'hover:bg-muted/20',
                        )}
                        onClick={() => setSelectedCert(isSelected ? '' : cert.id)}
                      >
                        <div className="pb-1">
                          <HexBadge certId={cert.id} code={cert.code.split('-')[0]} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-sm font-extrabold" style={{ color: cert.color }}>{cert.code}</span>
                            <span className="font-sans text-sm font-semibold text-foreground truncate">{cert.name}</span>
                          </div>
                          {isSelected && (
                            <p className="text-xs text-primary/80 font-medium mt-0.5">Escolha a dificuldade abaixo ↓</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                            {cert.level}
                          </span>
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200',
                            isSelected ? 'bg-primary rotate-180' : 'bg-muted/50',
                          )}>
                            {isSelected
                              ? <Check className="h-3.5 w-3.5 text-white" />
                              : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            }
                          </div>
                        </div>
                      </button>

                      {/* Inline difficulty panel */}
                      {isSelected && (
                        <div className="px-5 pb-5 animate-fade-in" style={{ background: 'linear-gradient(to bottom, rgba(59,57,232,0.04), transparent)' }}>
                          <div className="h-px bg-primary/12 mb-4" />
                          {trialExhausted ? (
                            <div className="rounded-[14px] border border-primary/20 bg-card p-5 text-center space-y-3">
                              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                                <Crown className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-sans text-sm font-bold text-foreground">Teste gratuito utilizado</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Você já realizou seu quiz gratuito.<br />
                                  Assine o Premium para continuar estudando.
                                </p>
                              </div>
                              <button
                                onClick={() => navigate('/assinatura')}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 font-sans text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
                              >
                                <Crown className="h-4 w-4" /> Ver planos
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="text-[11px] font-bold text-primary/60 uppercase tracking-widest mb-3">
                                Passo 2 · Escolha a dificuldade
                              </p>
                              <div className="grid grid-cols-3 gap-3">
                                {DIFFICULTIES.map(({ label, icon: Icon, colorClass, bg, border, desc }) => (
                                  <button
                                    key={label}
                                    onClick={() => handleSelectDifficulty(label)}
                                    className={cn(
                                      'flex flex-col items-center gap-2 rounded-[14px] border border-border bg-card p-4',
                                      'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95',
                                      bg, border,
                                    )}
                                  >
                                    <div className={cn('rounded-xl p-2.5', bg)}>
                                      <Icon className={cn('h-5 w-5', colorClass)} />
                                    </div>
                                    <span className="font-sans text-sm font-semibold text-foreground">{label}</span>
                                    <span className="text-center text-xs text-muted-foreground leading-tight">{desc}</span>
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
            </section>

            {/* Study plan track */}
            <TrackEmptyState onGenerate={() => navigate('/plano-de-estudos')} />
          </div>
        </main>
      </div>
    </div>
  )
}
