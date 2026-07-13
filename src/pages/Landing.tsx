import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Brain, TrendingUp, Sparkles, Crown,
  Zap, MessageSquare, Clock, BarChart2, Globe,
  Check, X, Menu,
} from 'lucide-react'

import { motion, useReducedMotion } from 'motion/react'
import { Logo } from '../components/Logo'
import { TestimonialsColumn } from '../components/ui/testimonials-columns-1'
import { HeroSection } from '../components/ui/hero-section-dark'
import { HeroScene } from '../components/HeroScene'
import { FooterSection } from '../components/ui/footer-section'
import { BorderBeam } from '../components/ui/border-beam'
import { cn } from '@/lib/utils'

// ── Depoimentos ───────────────────────────────────────────────────────────────
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

// ── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Zap,
    title: 'Questões com IA',
    desc: 'Geradas dinamicamente pelo Amazon Bedrock, nunca repetidas.',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    icon: MessageSquare,
    title: 'Feedback instantâneo',
    desc: 'Explicação detalhada em cada resposta com tópicos de estudo.',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-600',
  },
  {
    icon: Clock,
    title: 'Modo Simulado',
    desc: 'Simule a prova real com timer e 65 questões cronometradas.',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
  },
  {
    icon: BarChart2,
    title: 'Histórico completo',
    desc: 'Veja sua evolução, pontos fortes e fraquezas ao longo do tempo.',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
  },
  {
    icon: Brain,
    title: 'Plano de estudos',
    desc: 'Personalizado com base nos seus erros e desempenho por domínio.',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600',
  },
  {
    icon: Globe,
    title: 'Multi-certificações',
    desc: 'AWS CLF-C02, SAA-C03, DVA-C02. Mais certificações em breve.',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-600',
    badge: 'Em breve',
  },
]

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { icon: BookOpen,   num: '01', title: 'Escolha sua certificação', desc: 'Selecione entre CLF-C02, SAA-C03 ou DVA-C02 e defina a dificuldade desejada.' },
  { icon: Sparkles,   num: '02', title: 'Pratique com IA',           desc: 'Responda questões geradas em tempo real com feedback instantâneo após cada resposta.' },
  { icon: TrendingUp, num: '03', title: 'Acompanhe sua evolução',    desc: 'Analise gráficos de desempenho e receba um plano de estudos personalizado.' },
]

// ── Planos ────────────────────────────────────────────────────────────────────
const FREE_FEATURES    = ['5 quizzes por dia', 'Feedback básico']
const FREE_MISSING     = ['Modo simulado', 'Histórico completo', 'Plano de estudos']
const PREMIUM_FEATURES = ['Quizzes ilimitados', 'Feedback completo com IA', 'Modo simulado', 'Histórico completo', 'Plano de estudos personalizado']

// ── Trust avatars ─────────────────────────────────────────────────────────────
const TRUST_AVATARS = [
  { i: 'GA', bg: 'linear-gradient(145deg,#3B39E8,#2D2BC5)' },
  { i: 'RM', bg: 'linear-gradient(145deg,#0D9488,#0F766E)' },
  { i: 'CS', bg: 'linear-gradient(145deg,#F59E0B,#D97706)' },
  { i: 'LF', bg: 'linear-gradient(145deg,#2563EB,#1D4ED8)' },
]

// ── Animações ─────────────────────────────────────────────────────────────────
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
    initial:     { opacity: 0, x: -24 },
    whileInView: { opacity: 1, x: 0 },
    transition:  { duration: 0.9, ease: EASE, delay },
    viewport:    VP,
  }
}

function scaleIn(delay = 0, reduced = false) {
  if (reduced) return {}
  return {
    initial:     { opacity: 0, scale: 0.95 },
    whileInView: { opacity: 1, scale: 1 },
    transition:  { duration: 0.9, ease: EASE, delay },
    viewport:    VP,
  }
}

// ── Componente ────────────────────────────────────────────────────────────────
export function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled]             = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const shouldReduce = useReducedMotion() ?? false

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Trust section passada para o hero ────────────────────────────────────
  const trustSection = (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex items-center">
        {TRUST_AVATARS.map(({ i, bg }, idx) => (
          <span
            key={i}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-[11px] font-bold text-white font-sans',
              idx !== 0 && '-ml-2',
            )}
            style={{ background: bg }}
          >
            {i}
          </span>
        ))}
      </div>
      <div>
        <div className="text-amber-400 text-xs tracking-wider">★★★★★</div>
        <p className="text-xs text-muted-foreground leading-snug">
          <b className="text-foreground font-bold">+2.400 aprovados</b> confiam no Certara
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-svh bg-background text-foreground">

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="mx-auto max-w-7xl px-6 pt-4 pointer-events-auto">
          <div className={cn(
            'flex items-center justify-between rounded-2xl border px-5 py-[13px]',
            'backdrop-blur-[18px] transition-all duration-300',
            scrolled
              ? 'bg-white/92 border-[#E2E8FF]/80 shadow-[0_8px_32px_-6px_rgba(59,57,232,0.14)]'
              : 'bg-white/70 border-white/50 shadow-[0_4px_20px_-4px_rgba(59,57,232,0.06)]',
          )}>
            <Logo size="md" />

            {/* Links de navegação */}
            <nav className="hidden items-center gap-7 md:flex">
              {[
                { label: 'Como funciona', href: '#como-funciona' },
                { label: 'Funcionalidades', href: '#funcionalidades' },
                { label: 'Preços', href: '#precos' },
                { label: 'Depoimentos', href: '#depoimentos' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-[14px] font-semibold text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
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
            </div>

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
              {[
                { label: 'Como funciona', href: '#como-funciona' },
                { label: 'Funcionalidades', href: '#funcionalidades' },
                { label: 'Preços', href: '#precos' },
              ].map(({ label, href }) => (
                <button
                  key={label}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold text-[#6B6780] hover:text-foreground transition-colors"
                >
                  {label}
                </button>
              ))}
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
        belowCtaContent={trustSection}
      />

      {/* ── Stats ───────────────────────────────────────────────── */}
      <section className="bg-primary py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-y-0 sm:divide-x divide-white/20">
            {[
              { num: '10.000+', label: 'questões praticadas' },
              { num: '3',       label: 'certificações AWS'   },
              { num: '98%',     label: 'de aprovação'        },
            ].map(({ num, label }, i) => (
              <motion.div key={label} className="py-6 text-center sm:py-0 sm:px-8" {...fadeUp(i * 0.1, shouldReduce)}>
                <p className="font-sans text-5xl font-extrabold text-white tracking-tight">{num}</p>
                <p className="mt-2 text-sm font-medium text-white/70">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ───────────────────────────────────────── */}
      <section id="como-funciona" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div className="mb-12 text-center" {...fadeUp(0, shouldReduce)}>
            <h2 className="font-sans text-3xl font-extrabold text-foreground">Simples assim</h2>
            <p className="mt-2 text-muted-foreground">Do zero à aprovação em 3 passos</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, num, title, desc }, i) => (
              <motion.div key={title} {...slideLeft(i * 0.12, shouldReduce)}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_44px_-20px_rgba(59,57,232,0.22)] hover:border-transparent">
                  <div className="mb-5 flex items-start justify-between">
                    <span className="font-sans text-4xl font-extrabold text-primary/15 leading-none">{num}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-sans text-[17px] font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  <BorderBeam
                    size={180}
                    duration={10}
                    delay={i * 3}
                    colorFrom="#3B39E8"
                    colorTo="#8B5CF6"
                    borderWidth={1.5}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ─────────────────────────────────────── */}
      <section id="funcionalidades" className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div className="mb-12 text-center" {...fadeUp(0, shouldReduce)}>
            <h2 className="font-sans text-3xl font-extrabold text-foreground">Tudo que você precisa para passar</h2>
            <p className="mt-2 text-muted-foreground">Ferramentas pensadas para quem estuda de verdade</p>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc, iconBg, iconColor, badge }, i) => (
              <motion.div key={title} {...scaleIn(i * 0.07, shouldReduce)}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_44px_-20px_rgba(59,57,232,0.18)] hover:border-transparent">
                  <div className={cn('mb-5 flex h-12 w-12 items-center justify-center rounded-2xl', iconBg)}>
                    <Icon className={cn('h-6 w-6', iconColor)} />
                  </div>
                  <h3 className="font-sans text-[17px] font-bold text-foreground flex items-center gap-2 flex-wrap">
                    {title}
                    {badge && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-500/10 px-2 py-0.5 rounded-full leading-tight">
                        {badge}
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  <BorderBeam
                    size={150}
                    duration={12}
                    delay={i * 2}
                    colorFrom="#3B39E8"
                    colorTo="#8B5CF6"
                    borderWidth={1.5}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ─────────────────────────────────────────── */}
      <section id="depoimentos" className="py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
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

      {/* ── Planos ──────────────────────────────────────────────── */}
      <section id="precos" className="py-16 md:py-24 relative overflow-hidden bg-muted/20">
        {/* Blobs decorativos para glassmorphism */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/4 -left-16 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-1/4 -right-16 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <motion.div className="mb-12 text-center" {...fadeUp(0, shouldReduce)}>
            <h2 className="font-sans text-3xl font-extrabold text-foreground">Invista no seu futuro</h2>
            <p className="mt-2 text-muted-foreground">Comece grátis, evolua quando quiser</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 md:max-w-2xl md:mx-auto">

            {/* Plano Gratuito */}
            <motion.div
              className="rounded-[18px] border border-border bg-card/80 p-8 backdrop-blur-sm"
              {...slideLeft(0, shouldReduce)}
            >
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">Gratuito</p>
              <p className="font-sans text-5xl font-extrabold text-foreground mt-2 tracking-tight">R$ 0</p>
              <p className="text-sm text-muted-foreground mt-1 mb-7">Para começar a estudar hoje.</p>
              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map((label) => (
                  <li key={label} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                    {label}
                  </li>
                ))}
                {FREE_MISSING.map((label) => (
                  <li key={label} className="flex items-center gap-2.5 text-sm text-muted-foreground/60 line-through">
                    <X className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                    {label}
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

            {/* Plano Premium — glassmorphism + spring */}
            <motion.div
              className="relative cursor-pointer"
              initial={shouldReduce ? false : { opacity: 0, y: 40, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: 'spring', damping: 22, stiffness: 180, delay: 0.1 }}
              whileHover={shouldReduce ? undefined : { scale: 1.03, y: -6, transition: { type: 'spring', damping: 18, stiffness: 220 } }}
              whileTap={shouldReduce ? undefined : { scale: 0.95, rotate: 1.7, transition: { duration: 0.15 } }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-[0_8px_18px_-6px_rgba(59,57,232,0.6)]">
                  Mais popular
                </span>
              </div>
              <div className="glass-card p-8">
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-primary">Premium</p>
                <div className="mt-2 flex items-end gap-1">
                  <p className="font-sans text-5xl font-extrabold text-foreground tracking-tight">R$ 14,90</p>
                  <span className="text-sm font-semibold text-muted-foreground mb-1">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 mb-7">Tudo que você precisa para passar.</p>
                <ul className="space-y-3 mb-8">
                  {PREMIUM_FEATURES.map((label) => (
                    <li key={label} className="flex items-center gap-2.5 text-sm text-foreground">
                      <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                      {label}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full rounded-[10px] bg-primary py-3 text-sm font-bold text-white hover:bg-primary-hover transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Assinar Premium
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────── */}
      <section className="bg-primary py-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none">
          <div className="absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-teal-500/25 blur-3xl" />
        </div>
        <motion.div
          className="relative mx-auto max-w-2xl px-4 text-center"
          {...scaleIn(0, shouldReduce)}
        >
          <h2 className="font-sans text-4xl font-extrabold text-white">Pronto para se certificar?</h2>
          <p className="mt-4 text-lg text-white/70">Comece grátis hoje. Sem cartão de crédito.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-primary hover:bg-white/90 hover:-translate-y-px transition-all shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)]"
          >
            Criar conta gratuita →
          </button>
        </motion.div>
      </section>

      <FooterSection />
    </div>
  )
}
