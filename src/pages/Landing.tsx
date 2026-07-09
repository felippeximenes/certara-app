import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  BookOpen, Brain, TrendingUp,
  Zap, MessageSquare, Clock, BarChart2, Globe,
  Check, X, Menu,
} from 'lucide-react'

import { motion, useReducedMotion } from 'motion/react'
import { Logo } from '../components/Logo'
import { TestimonialsColumn } from '../components/ui/testimonials-columns-1'
import { HeroSection } from '../components/ui/hero-section-dark'
import { HeroScene } from '../components/HeroScene'
import { GlowCard } from '../components/ui/spotlight-card'
import { cn } from '@/lib/utils'

// ── Depoimentos de estudantes aprovados em certificações AWS ──────────────────
const TESTIMONIALS = [
  {
    text: 'Passei no CLF-C02 na primeira tentativa após 3 semanas usando o Certara. O feedback instantâneo da IA fez toda a diferença na minha preparação.',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    name: 'Gabriela Alves',
    role: 'Analista de TI · Aprovada CLF-C02',
  },
  {
    text: 'Nunca tinha estudado para certificação antes. O plano de estudos personalizado me guiou exatamente onde precisava focar. Resultado: aprovado!',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    name: 'Rafael Mendes',
    role: 'Desenvolvedor Backend · Aprovado CLF-C02',
  },
  {
    text: 'O modo simulado é excelente. Fiz o SAA-C03 sentindo que já conhecia o formato da prova. Aprovado com 850 pontos!',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    name: 'Carolina Santos',
    role: 'Arquiteta de Soluções · Aprovada SAA-C03',
  },
  {
    text: 'As questões geradas por IA são muito próximas das reais. O Certara foi fundamental para conquistar a certificação AWS em tempo recorde.',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    name: 'Lucas Ferreira',
    role: 'Engenheiro de Cloud · Aprovado SAA-C03',
  },
  {
    text: 'Tentei outras plataformas antes, mas o Certara se destacou pelo feedback detalhado em cada questão. Entendi o porquê dos meus erros.',
    image: 'https://randomuser.me/api/portraits/women/5.jpg',
    name: 'Amanda Costa',
    role: 'DevOps Engineer · Aprovada DVA-C02',
  },
  {
    text: 'O histórico de desempenho me mostrou exatamente meus pontos fracos em Segurança e IAM. Focei nisso e passei no DVA-C02 com folga!',
    image: 'https://randomuser.me/api/portraits/men/6.jpg',
    name: 'Thiago Oliveira',
    role: 'Developer · Aprovado DVA-C02',
  },
  {
    text: 'Em apenas 5 semanas saí do zero e passei no Cloud Practitioner. A sequência de estudos gamificada me manteve motivado até o fim.',
    image: 'https://randomuser.me/api/portraits/women/7.jpg',
    name: 'Mariana Lima',
    role: 'Product Manager · Aprovada CLF-C02',
  },
  {
    text: 'O modo simulado com 65 questões cronometradas me preparou mentalmente para a pressão do exame real. Senti muita confiança no dia da prova.',
    image: 'https://randomuser.me/api/portraits/men/8.jpg',
    name: 'Pedro Souza',
    role: 'SRE Engineer · Aprovado SAA-C03',
  },
  {
    text: 'O Certara tornou o estudo de AWS dinâmico e eficiente. Os flashcards de revisão rápida me ajudaram muito nos dias anteriores ao exame.',
    image: 'https://randomuser.me/api/portraits/women/9.jpg',
    name: 'Juliana Nunes',
    role: 'Analista de Cloud · Aprovada CLF-C02',
  },
]

const firstColumn  = TESTIMONIALS.slice(0, 3)
const secondColumn = TESTIMONIALS.slice(3, 6)
const thirdColumn  = TESTIMONIALS.slice(6, 9)

const FEATURES = [
  { icon: Zap,         title: 'Questões com IA',      desc: 'Geradas dinamicamente pelo Amazon Bedrock, nunca repetidas.' },
  { icon: MessageSquare, title: 'Feedback instantâneo', desc: 'Explicação detalhada em cada resposta com tópicos de estudo.' },
  { icon: Clock,       title: 'Modo Simulado',         desc: 'Simule a prova real com timer e 65 questões cronometradas.' },
  { icon: BarChart2,   title: 'Histórico completo',    desc: 'Veja sua evolução, pontos fortes e fraquezas ao longo do tempo.' },
  { icon: Brain,       title: 'Plano de estudos',      desc: 'Personalizado com base nos seus erros e desempenho por domínio.' },
  { icon: Globe,       title: 'Multi-certificações',   desc: 'AWS CLF-C02, SAA-C03, DVA-C02. Mais em breve.' },
]

const STEPS = [
  { icon: BookOpen,    num: '01', title: 'Escolha sua certificação', desc: 'Selecione entre CLF-C02, SAA-C03 ou DVA-C02 e defina a dificuldade desejada.' },
  { icon: Brain,       num: '02', title: 'Pratique com IA',           desc: 'Responda questões geradas em tempo real com feedback instantâneo após cada resposta.' },
  { icon: TrendingUp,  num: '03', title: 'Acompanhe sua evolução',    desc: 'Analise gráficos de desempenho e receba um plano de estudos personalizado.' },
]

const FREE_FEATURES = [
  { label: '5 quizzes por dia',   ok: true  },
  { label: 'Feedback básico',     ok: true  },
  { label: 'Modo simulado',       ok: false },
  { label: 'Histórico completo',  ok: false },
  { label: 'Plano de estudos',    ok: false },
]

const PREMIUM_FEATURES = [
  { label: 'Quizzes ilimitados',            ok: true },
  { label: 'Feedback completo com IA',      ok: true },
  { label: 'Modo simulado',                 ok: true },
  { label: 'Histórico completo',            ok: true },
  { label: 'Plano de estudos personalizado',ok: true },
]

// ── Animation helpers (transform + opacity only, ease-out, prefers-reduced-motion) ──
const EASE = [0.16, 1, 0.3, 1] as const
const VP   = { once: true, margin: '-80px' } as const

function fadeUp(delay = 0, reduced = false) {
  if (reduced) return {}
  return {
    initial:     { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition:  { duration: 1.0, ease: EASE, delay },
    viewport:    VP,
  }
}

function slideLeft(delay = 0, reduced = false) {
  if (reduced) return {}
  return {
    initial:     { opacity: 0, x: -28 },
    whileInView: { opacity: 1, x: 0 },
    transition:  { duration: 0.95, ease: EASE, delay },
    viewport:    VP,
  }
}

function slideRight(delay = 0, reduced = false) {
  if (reduced) return {}
  return {
    initial:     { opacity: 0, x: 28 },
    whileInView: { opacity: 1, x: 0 },
    transition:  { duration: 0.95, ease: EASE, delay },
    viewport:    VP,
  }
}

function scaleIn(delay = 0, reduced = false) {
  if (reduced) return {}
  return {
    initial:     { opacity: 0, scale: 0.94 },
    whileInView: { opacity: 1, scale: 1 },
    transition:  { duration: 0.9, ease: EASE, delay },
    viewport:    VP,
  }
}

export function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled]           = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const shouldReduce = useReducedMotion() ?? false

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-svh bg-background text-foreground">

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="mx-auto max-w-5xl px-4 pt-4 pointer-events-auto">
          <div className={cn(
            'flex items-center justify-between rounded-2xl border px-5 py-[13px]',
            'backdrop-blur-[18px] transition-all duration-300',
            scrolled
              ? 'bg-white/92 border-[#E2E8FF]/80 shadow-[0_8px_32px_-6px_rgba(59,57,232,0.14)]'
              : 'bg-white/70 border-white/50 shadow-[0_4px_20px_-4px_rgba(59,57,232,0.06)]',
          )}>
            <Logo size="md" />

            <nav className="hidden items-center gap-3 md:flex">
              <button
                onClick={() => navigate('/login')}
                className="rounded-[10px] border border-[#E4E1F2] px-4 py-2 text-sm font-semibold text-[#1A1626] hover:border-primary/40 hover:text-primary transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate('/login')}
                className="rounded-[11px] bg-primary px-4 py-[9px] text-sm font-bold text-white hover:bg-primary-hover transition-all shadow-[0_4px_14px_-4px_rgba(59,57,232,0.55)]"
              >
                Começar grátis
              </button>
            </nav>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5 text-[#6B6780]" />
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="mt-2 rounded-2xl border border-[#E4E1F2]/70 bg-white/95 backdrop-blur-[18px] px-4 py-3 space-y-2 md:hidden shadow-[0_8px_32px_-8px_rgba(59,57,232,0.12)]">
              <button onClick={() => navigate('/login')}
                className="w-full rounded-[11px] border border-[#E4E1F2] py-2.5 text-sm font-semibold text-[#1A1626]">
                Entrar
              </button>
              <button onClick={() => navigate('/login')}
                className="w-full rounded-[11px] bg-primary py-2.5 text-sm font-bold text-white">
                Começar grátis
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <HeroSection
        title="Powered by Amazon Bedrock AI"
        subtitle={{
          regular: 'A forma mais inteligente de se preparar para ',
          gradient: 'certificações AWS',
        }}
        description="Questões geradas por IA com feedback personalizado e plano de estudos sob medida. Estude no seu ritmo e chegue preparado para o exame."
        ctaText="Começar grátis"
        ctaHref="/login"
        secondaryCtaText="Ver como funciona"
        onSecondaryCtaClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
        gridOptions={{ angle: 65, opacity: 0.4, cellSize: 55 }}
        rightContent={<HeroScene />}
      />

      {/* ── Social proof — fade-up staggered por stat ───────────── */}
      <section className="bg-primary py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { num: '10.000+', label: 'questões praticadas' },
              { num: '3',       label: 'certificações AWS'   },
              { num: '98%',     label: 'de aprovação'        },
            ].map(({ num, label }, i) => (
              <motion.div key={label} className="text-center" {...fadeUp(i * 0.1, shouldReduce)}>
                <p className="font-sans text-4xl font-extrabold text-white">{num}</p>
                <p className="mt-1 text-sm font-medium text-white/70">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona — cards deslizam da esquerda ──────────── */}
      <section id="como-funciona" className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <motion.div className="mb-12 text-center" {...fadeUp(0, shouldReduce)}>
          <h2 className="font-sans text-3xl font-extrabold text-foreground">Simples assim</h2>
          <p className="mt-2 text-muted-foreground">Do zero à aprovação em 3 passos</p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, num, title, desc }, i) => (
            <motion.div key={title} {...slideLeft(i * 0.12, shouldReduce)}>
              <GlowCard className="p-6 flex flex-col gap-4 h-full">
                <div className="flex items-center gap-3">
                  <span className="font-sans text-3xl font-extrabold text-primary/20">{num}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Funcionalidades — scale-in staggered grid ───────────── */}
      <section className="bg-card py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div className="mb-12 text-center" {...fadeUp(0, shouldReduce)}>
            <h2 className="font-sans text-3xl font-extrabold text-foreground">Tudo que você precisa para passar</h2>
            <p className="mt-2 text-muted-foreground">Ferramentas pensadas para quem estuda de verdade</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} {...scaleIn(i * 0.07, shouldReduce)}>
                <GlowCard className="p-5 flex flex-col gap-3 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-bold text-foreground">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ─────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center mb-12"
          >
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
              Depoimentos
            </span>
            <h2 className="font-sans text-3xl font-extrabold text-foreground">
              Quem já se certificou com o Certara
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md">
              Veja o que dizem os estudantes que passaram nas certificações AWS usando nossa plataforma.
            </p>
          </motion.div>

          <div className="flex justify-center gap-5 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[640px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn}  duration={18} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={22} />
            <TestimonialsColumn testimonials={thirdColumn}  className="hidden lg:block" duration={20} />
          </div>
        </div>
      </section>

      {/* ── Planos — Free da esquerda, Premium da direita ───────── */}
      <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <motion.div className="mb-12 text-center" {...fadeUp(0, shouldReduce)}>
          <h2 className="font-sans text-3xl font-extrabold text-foreground">Invista no seu futuro</h2>
          <p className="mt-2 text-muted-foreground">Comece grátis, evolua quando quiser</p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 md:max-w-2xl md:mx-auto">

          {/* Free — slide da esquerda */}
          <motion.div
            className="rounded-2xl border border-border bg-card p-6 space-y-6"
            {...slideLeft(0, shouldReduce)}
          >
            <div>
              <p className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide">Gratuito</p>
              <p className="font-sans text-4xl font-extrabold text-foreground mt-1">R$ 0</p>
            </div>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map(({ label, ok }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm">
                  {ok
                    ? <Check className="h-4 w-4 flex-shrink-0 text-success" />
                    : <X     className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />}
                  <span className={ok ? 'text-foreground' : 'text-muted-foreground/60 line-through'}>{label}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/login')}
              className="w-full rounded-[10px] border border-border py-3 text-sm font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              Começar grátis
            </button>
          </motion.div>

          {/* Premium — slide da direita */}
          <motion.div
            className="relative rounded-2xl border-2 border-primary bg-primary/5 p-6 space-y-6"
            {...slideRight(0.08, shouldReduce)}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">Mais popular</span>
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-primary uppercase tracking-wide">Premium</p>
              <div className="mt-1 flex items-end gap-1">
                <p className="font-sans text-4xl font-extrabold text-foreground">R$ 14,90</p>
                <p className="mb-1 text-sm text-muted-foreground">/mês</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {PREMIUM_FEATURES.map(({ label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm">
                  <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="text-foreground">{label}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/login')}
              className="w-full rounded-[10px] bg-primary py-3 text-sm font-bold text-white hover:bg-primary-hover transition-colors"
            >
              Assinar Premium
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── CTA final — scale + fade centralizado ───────────────── */}
      <section className="bg-primary py-16">
        <motion.div
          className="mx-auto max-w-2xl px-4 text-center space-y-6"
          {...scaleIn(0, shouldReduce)}
        >
          <h2 className="font-sans text-3xl font-extrabold text-white">Pronto para se certificar?</h2>
          <p className="text-base text-white/70">Comece grátis hoje. Sem cartão de crédito.</p>
          <button
            onClick={() => navigate('/login')}
            className="rounded-[10px] bg-white px-8 py-3 text-sm font-bold text-primary hover:bg-white/90 transition-colors"
          >
            Criar conta gratuita
          </button>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">© 2025 Certara. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/termos"      className="hover:text-primary transition-colors">Termos de uso</Link>
            <Link to="/privacidade" className="hover:text-primary transition-colors">Política de privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
