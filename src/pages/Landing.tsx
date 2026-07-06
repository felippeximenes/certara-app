import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  BookOpen, Brain, TrendingUp,
  Zap, MessageSquare, Clock, BarChart2, Globe,
  Check, X, Menu,
} from 'lucide-react'

const QUIZ_OPTIONS = ['Amazon S3', 'Amazon CloudFront', 'AWS Direct Connect', 'Amazon Route 53']
import { motion } from 'motion/react'
import { Logo } from '../components/Logo'
import { TestimonialsColumn } from '../components/ui/testimonials-columns-1'
import { HeroSection } from '../components/ui/hero-section-dark'
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
  { icon: Zap, title: 'Questões com IA', desc: 'Geradas dinamicamente pelo Amazon Bedrock, nunca repetidas.' },
  { icon: MessageSquare, title: 'Feedback instantâneo', desc: 'Explicação detalhada em cada resposta com tópicos de estudo.' },
  { icon: Clock, title: 'Modo Simulado', desc: 'Simule a prova real com timer e 65 questões cronometradas.' },
  { icon: BarChart2, title: 'Histórico completo', desc: 'Veja sua evolução, pontos fortes e fraquezas ao longo do tempo.' },
  { icon: Brain, title: 'Plano de estudos', desc: 'Personalizado com base nos seus erros e desempenho por domínio.' },
  { icon: Globe, title: 'Multi-certificações', desc: 'AWS CLF-C02, SAA-C03, DVA-C02. Mais em breve.' },
]

const STEPS = [
  { icon: BookOpen, num: '01', title: 'Escolha sua certificação', desc: 'Selecione entre CLF-C02, SAA-C03 ou DVA-C02 e defina a dificuldade desejada.' },
  { icon: Brain, num: '02', title: 'Pratique com IA', desc: 'Responda questões geradas em tempo real com feedback instantâneo após cada resposta.' },
  { icon: TrendingUp, num: '03', title: 'Acompanhe sua evolução', desc: 'Analise gráficos de desempenho e receba um plano de estudos personalizado.' },
]

const FREE_FEATURES = [
  { label: '5 quizzes por dia', ok: true },
  { label: 'Feedback básico', ok: true },
  { label: 'Modo simulado', ok: false },
  { label: 'Histórico completo', ok: false },
  { label: 'Plano de estudos', ok: false },
]

const PREMIUM_FEATURES = [
  { label: 'Quizzes ilimitados', ok: true },
  { label: 'Feedback completo com IA', ok: true },
  { label: 'Modo simulado', ok: true },
  { label: 'Histórico completo', ok: true },
  { label: 'Plano de estudos personalizado', ok: true },
]


export function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-svh bg-background text-foreground">

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-border bg-background/90 backdrop-blur-sm shadow-sm' : 'bg-transparent',
      )}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Logo size="md" />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => navigate('/login')}
              className="rounded-[10px] border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/login')}
              className="rounded-[10px] bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover transition-colors"
            >
              Começar grátis
            </button>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-4 py-4 space-y-2 md:hidden">
            <button onClick={() => navigate('/login')}
              className="w-full rounded-[10px] border border-border py-2.5 text-sm font-semibold text-foreground">
              Entrar
            </button>
            <button onClick={() => navigate('/login')}
              className="w-full rounded-[10px] bg-primary py-2.5 text-sm font-bold text-white">
              Começar grátis
            </button>
          </div>
        )}
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
        rightContent={
          <div className="relative">
            {/* Brilho de fundo atrás do card */}
            <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />
            <div className="relative rounded-2xl border border-border bg-card p-5 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-[#FF9900]">CLF-C02</span>
                <span className="text-xs text-muted-foreground">Questão 1 de 10 · 10%</span>
              </div>
              <div className="mb-4 h-1.5 rounded-full bg-muted">
                <div className="h-full w-[10%] rounded-full bg-primary transition-all duration-700" />
              </div>
              <p className="mb-4 text-sm font-medium leading-relaxed text-foreground">
                Qual serviço AWS fornece uma CDN globalmente distribuída para servir conteúdo com baixa latência?
              </p>
              <div className="space-y-2">
                {QUIZ_OPTIONS.map((opt, i) => (
                  <div
                    key={opt}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors duration-200',
                      i === 1
                        ? 'border-[#22C55E] bg-[#22C55E]/10 text-foreground'
                        : 'border-border text-muted-foreground',
                    )}
                  >
                    <span className={cn(
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      i === 1 ? 'bg-[#22C55E] text-white' : 'bg-muted text-muted-foreground',
                    )}>
                      {['A', 'B', 'C', 'D'][i]}
                    </span>
                    {opt}
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/10 p-3">
                <p className="text-xs font-semibold text-[#22C55E]">✓ Correto!</p>
                <p className="mt-0.5 text-xs text-foreground">
                  CloudFront distribui conteúdo via edge locations com baixa latência.
                </p>
              </div>
            </div>
          </div>
        }
      />

      {/* ── Social proof ────────────────────────────────────────── */}
      <section className="bg-primary py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { num: '10.000+', label: 'questões praticadas' },
              { num: '3', label: 'certificações AWS' },
              { num: '98%', label: 'de aprovação' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="font-sans text-4xl font-extrabold text-white">{num}</p>
                <p className="mt-1 text-sm font-medium text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ───────────────────────────────────────── */}
      <section id="como-funciona" className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="font-sans text-3xl font-extrabold text-foreground">Simples assim</h2>
          <p className="mt-2 text-muted-foreground">Do zero à aprovação em 3 passos</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, num, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 space-y-4">
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
            </div>
          ))}
        </div>
      </section>

      {/* ── Funcionalidades ─────────────────────────────────────── */}
      <section className="bg-card py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <h2 className="font-sans text-3xl font-extrabold text-foreground">Tudo que você precisa para passar</h2>
            <p className="mt-2 text-muted-foreground">Ferramentas pensadas para quem estuda de verdade</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-background p-5 space-y-3 hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-bold text-foreground">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ─────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4">

          {/* Cabeçalho animado */}
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

          {/* Colunas com scroll automático */}
          <div className="flex justify-center gap-5 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[640px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn} duration={18} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={22} />
            <TestimonialsColumn testimonials={thirdColumn}  className="hidden lg:block" duration={20} />
          </div>
        </div>
      </section>

      {/* ── Planos ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="font-sans text-3xl font-extrabold text-foreground">Invista no seu futuro</h2>
          <p className="mt-2 text-muted-foreground">Comece grátis, evolua quando quiser</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 md:max-w-2xl md:mx-auto">

          {/* Free */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div>
              <p className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide">Gratuito</p>
              <p className="font-sans text-4xl font-extrabold text-foreground mt-1">R$ 0</p>
            </div>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map(({ label, ok }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm">
                  {ok
                    ? <Check className="h-4 w-4 flex-shrink-0 text-success" />
                    : <X className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />}
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
          </div>

          {/* Premium */}
          <div className="relative rounded-2xl border-2 border-primary bg-primary/5 p-6 space-y-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">Mais popular</span>
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-primary uppercase tracking-wide">Premium</p>
              <div className="mt-1 flex items-end gap-1">
                <p className="font-sans text-4xl font-extrabold text-foreground">R$ 29,90</p>
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
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────── */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-2xl px-4 text-center space-y-6">
          <h2 className="font-sans text-3xl font-extrabold text-white">Pronto para se certificar?</h2>
          <p className="text-base text-white/70">Comece grátis hoje. Sem cartão de crédito.</p>
          <button
            onClick={() => navigate('/login')}
            className="rounded-[10px] bg-white px-8 py-3 text-sm font-bold text-primary hover:bg-white/90 transition-colors"
          >
            Criar conta gratuita
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">© 2025 Certara. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/termos" className="hover:text-primary transition-colors">Termos de uso</Link>
            <Link to="/privacidade" className="hover:text-primary transition-colors">Política de privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
