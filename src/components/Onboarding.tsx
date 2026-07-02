import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    title: 'Bem-vindo ao Certara!',
    description:
      'Sua plataforma de preparação para certificações AWS. Vamos te mostrar como aproveitar ao máximo.',
  },
  {
    title: 'Escolha sua certificação',
    description:
      'Selecione entre CLF-C02, SAA-C03 ou DVA-C02 e pratique com questões específicas para cada exame.',
  },
  {
    title: 'Pratique com questões reais',
    description:
      'Questões geradas com IA nos níveis Fácil, Médio e Difícil — com feedback detalhado após cada resposta.',
  },
  {
    title: 'Acompanhe sua evolução',
    description:
      'Veja seu desempenho, streak de estudos e identifique seus pontos fracos para focar no que importa.',
  },
]

interface OnboardingProps {
  onDone: () => void
}

export function Onboarding({ onDone }: OnboardingProps) {
  const [step, setStep] = useState(0)

  const finish = useCallback(() => {
    localStorage.setItem('certara_onboarding_done', 'true')
    onDone()
  }, [onDone])

  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
        <button
          onClick={finish}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex min-h-[200px] items-center justify-center rounded-t-2xl bg-gradient-to-br from-primary/15 to-primary/5 p-8">
          <StepIllustration step={step} />
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-1.5">
            <h2 className="font-sans text-lg font-bold text-foreground">{STEPS[step].title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {STEPS[step].description}
            </p>
          </div>

          <div className="flex justify-center gap-2 py-1">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-200',
                  i === step
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50',
                )}
              />
            ))}
          </div>

          <div className={cn('flex gap-3', step === 0 ? 'justify-end' : 'justify-between')}>
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-xl border border-border px-4 py-2.5 font-sans text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                Anterior
              </button>
            )}
            <button
              onClick={isLast ? finish : () => setStep((s) => s + 1)}
              className="rounded-xl bg-primary px-5 py-2.5 font-sans text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              {isLast ? 'Começar' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepIllustration({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="flex flex-col items-center gap-3">
        <Logo size="lg" />
        <p className="text-sm font-medium text-primary/70">Preparação para certificações AWS</p>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="w-full max-w-xs space-y-2">
        {[
          { code: 'CLF-C02', name: 'Cloud Practitioner', color: '#22C55E', selected: true },
          { code: 'SAA-C03', name: 'Solutions Architect', color: '#3B39E8', selected: false },
        ].map((cert) => (
          <div
            key={cert.code}
            className={cn(
              'flex items-center gap-3 rounded-xl border bg-card/80 px-4 py-2.5',
              cert.selected ? 'border-primary shadow-sm' : 'border-border',
            )}
          >
            <div
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ background: cert.color }}
            />
            <span className="text-xs font-bold" style={{ color: cert.color }}>
              {cert.code}
            </span>
            <span className="truncate text-xs text-foreground">{cert.name}</span>
          </div>
        ))}
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="w-full max-w-xs space-y-2">
        <div className="rounded-xl border border-border bg-card/80 px-4 py-3 text-xs text-foreground">
          O que é o Amazon S3?
        </div>
        {[
          { label: 'Serviço de armazenamento de objetos', correct: true },
          { label: 'Banco de dados relacional gerenciado', correct: false },
        ].map((opt) => (
          <div
            key={opt.label}
            className={cn(
              'rounded-lg border px-3 py-2 text-xs',
              opt.correct
                ? 'border-primary/50 bg-primary/8 font-medium text-primary'
                : 'border-border text-muted-foreground',
            )}
          >
            {opt.label}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="flex items-center justify-between gap-2">
        {[
          { label: 'Quizzes', value: '12' },
          { label: 'Média', value: '78%' },
          { label: 'Streak', value: '3 🔥' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex-1 rounded-xl border border-border bg-card/80 p-2.5 text-center"
          >
            <p className="font-sans text-base font-extrabold text-primary">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 rounded-xl border border-border bg-card/80 p-3">
        {[
          { label: 'Cloud Concepts', pct: 80 },
          { label: 'Security', pct: 55 },
        ].map(({ label, pct }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{label}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
