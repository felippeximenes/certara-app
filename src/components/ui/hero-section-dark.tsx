import * as React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── RetroGrid ────────────────────────────────────────────────────────────────

interface RetroGridProps {
  angle?: number
  cellSize?: number
  opacity?: number
  lightLineColor?: string
  darkLineColor?: string
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = 'hsl(233 100% 87%)',   // --border light
  darkLineColor  = 'hsl(243 47% 30%)',    // --border dark
}: RetroGridProps) => {
  const gridStyles = {
    '--grid-angle': `${angle}deg`,
    '--cell-size':  `${cellSize}px`,
    '--opacity':    opacity,
    '--light-line': lightLineColor,
    '--dark-line':  darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        'pointer-events-none absolute size-full overflow-hidden [perspective:200px]',
        'opacity-[var(--opacity)]',
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className={cn(
          'animate-grid',
          '[background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)]',
          '[background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)]',
          '[height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]',
          'dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]',
        )} />
      </div>
      {/* Fade para o fundo na parte de baixo */}
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent to-90%" />
    </div>
  )
}

// ── HeroSection ──────────────────────────────────────────────────────────────

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: {
    regular: string
    gradient: string
  }
  description?: string
  ctaText?: string
  ctaHref?: string
  secondaryCtaText?: string
  onSecondaryCtaClick?: () => void
  /** Conteúdo extra abaixo dos botões CTA (ex: trust section) */
  belowCtaContent?: React.ReactNode
  /** Conteúdo exibido à direita em telas lg+ (ativa layout 2 colunas) */
  rightContent?: React.ReactNode
  bottomImage?: {
    light: string
    dark: string
  }
  gridOptions?: RetroGridProps
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = 'Build products for everyone',
      subtitle = {
        regular: 'Designing your projects faster with ',
        gradient: 'the largest UI kit.',
      },
      description = 'Ferramentas inteligentes para você estudar melhor e se certificar com confiança.',
      ctaText = 'Começar grátis',
      ctaHref = '/login',
      secondaryCtaText,
      onSecondaryCtaClick,
      belowCtaContent,
      rightContent,
      bottomImage,
      gridOptions,
      ...props
    },
    ref,
  ) => {
    const hasTwoCols = Boolean(rightContent)

    return (
      <div className={cn('relative', className)} ref={ref} {...props}>
        {/* Brilho radial de fundo com a cor primária do projeto */}
        <div className="absolute top-0 z-0 h-screen w-screen bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(59,57,232,0.12),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(59,57,232,0.25),transparent)]" />

        <section className="relative mx-auto z-[1] min-h-dvh flex flex-col justify-center">
          <RetroGrid {...gridOptions} />

          <div className="max-w-7xl z-10 mx-auto px-6 pt-[96px] pb-16 md:pt-[100px] md:pb-20 md:px-12 w-full">

            {/* Layout: 2 colunas quando rightContent fornecido, 1 coluna centralizada sem */}
            <div className={cn(
              hasTwoCols
                ? 'grid gap-12 lg:grid-cols-2 lg:items-center'
                : 'flex flex-col items-center text-center',
            )}>

              {/* ── Coluna de texto ── */}
              <div className={cn('space-y-6', !hasTwoCols && 'max-w-3xl')}>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary group cursor-default">
                  <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                  {title}
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>

                {/* Título com gradiente */}
                <h1 className={cn(
                  'font-extrabold tracking-tight font-sans bg-clip-text text-transparent',
                  'bg-[linear-gradient(180deg,_hsl(var(--foreground))_0%,_hsl(var(--foreground)/0.7)_100%)]',
                  'dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,255,255,0.65)_100%)]',
                  hasTwoCols ? 'text-4xl md:text-5xl leading-tight' : 'text-4xl md:text-6xl',
                )}>
                  {subtitle.regular}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-400 dark:from-primary-300 dark:to-blue-300">
                    {subtitle.gradient}
                  </span>
                </h1>

                {/* Descrição */}
                <p className={cn(
                  'text-base md:text-lg text-muted-foreground leading-relaxed',
                  !hasTwoCols && 'max-w-xl mx-auto',
                )}>
                  {description}
                </p>

                {/* CTAs */}
                <div className={cn(
                  'flex flex-col sm:flex-row gap-3',
                  !hasTwoCols && 'items-center justify-center',
                )}>
                  {/* CTA principal — borda animada giratória */}
                  <div className="relative inline-flex overflow-hidden rounded-full p-[1.5px] isolate">
                    <div className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#DDDEFF_0%,#3B39E8_50%,#DDDEFF_100%)]" />
                    <Link
                      to={ctaHref ?? '/login'}
                      className="relative z-10 inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-3.5 text-sm font-bold text-foreground bg-gradient-to-tr from-primary/15 via-primary/10 to-transparent border border-primary/20 hover:from-primary/25 hover:via-primary/15 transition-all"
                    >
                      {ctaText}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* CTA secundário (opcional) */}
                  {secondaryCtaText && (
                    <button
                      onClick={onSecondaryCtaClick}
                      className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      {secondaryCtaText}
                    </button>
                  )}
                </div>

                {/* Conteúdo abaixo dos CTAs (trust section, etc.) */}
                {belowCtaContent}
              </div>

              {/* ── Conteúdo direito (quiz mockup, imagem, etc.) ── */}
              {hasTwoCols && (
                <div className="relative">
                  {rightContent}
                </div>
              )}
            </div>

            {/* Imagem inferior (opcional, só no modo centralizado) */}
            {bottomImage && !hasTwoCols && (
              <div className="mt-24 mx-4 md:mx-10 relative z-10">
                <img
                  src={bottomImage.light}
                  className="w-full rounded-2xl shadow-2xl shadow-primary/10 border border-border dark:hidden"
                  alt="Preview da plataforma"
                />
                <img
                  src={bottomImage.dark}
                  className="hidden w-full rounded-2xl shadow-2xl shadow-primary/20 border border-border dark:block"
                  alt="Preview da plataforma"
                />
              </div>
            )}
          </div>
        </section>
      </div>
    )
  },
)

HeroSection.displayName = 'HeroSection'

export { HeroSection }
