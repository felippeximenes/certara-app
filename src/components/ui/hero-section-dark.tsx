import * as React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
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
      bottomImage,
      gridOptions,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn('relative', className)} ref={ref} {...props}>
        {/* Brilho radial de fundo com a cor primária do projeto */}
        <div className="absolute top-0 z-0 h-screen w-screen bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(59,57,232,0.12),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(59,57,232,0.25),transparent)]" />

        <section className="relative mx-auto z-[1]">
          <RetroGrid {...gridOptions} />

          <div className="max-w-5xl z-10 mx-auto px-4 py-28 md:py-36 md:px-8">
            <div className="space-y-6 max-w-3xl mx-auto text-center">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary group cursor-default">
                {title}
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </div>

              {/* Título com gradiente */}
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-sans bg-clip-text text-transparent bg-[linear-gradient(180deg,_hsl(var(--foreground))_0%,_hsl(var(--foreground)/0.7)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,255,255,0.65)_100%)]">
                {subtitle.regular}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-400 dark:from-primary-300 dark:to-blue-300">
                  {subtitle.gradient}
                </span>
              </h1>

              {/* Descrição */}
              <p className="max-w-xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
                {description}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* CTA principal — borda animada giratória */}
                <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                  <span className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#DDDEFF_0%,#3B39E8_50%,#DDDEFF_100%)]" />
                  <div className="inline-flex h-full w-full items-center justify-center rounded-full bg-background text-xs font-medium backdrop-blur-3xl">
                    <Link
                      to={ctaHref ?? '/login'}
                      className="inline-flex rounded-full items-center justify-center gap-2 bg-gradient-to-tr from-primary/15 via-primary/10 to-transparent border border-primary/20 hover:from-primary/25 hover:via-primary/15 text-foreground font-bold text-sm transition-all py-3.5 px-8"
                    >
                      {ctaText}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </span>

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
            </div>

            {/* Imagem inferior (opcional) */}
            {bottomImage && (
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
