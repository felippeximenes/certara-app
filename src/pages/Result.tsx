import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import html2canvas from 'html2canvas'
import { RotateCcw, History, Image, ClipboardCopy, MessageCircle, ExternalLink } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { SubjectBadge } from '../components/SubjectBadge'
import { useQuizStore } from '../store/quizStore'
import { generateSummary, saveQuiz } from '../services/api'
import { cn } from '@/lib/utils'
import type { ApiSummary } from '../types/quiz'

const TOTAL = 10

export function Result() {
  const navigate = useNavigate()
  const subject = useQuizStore((s) => s.subject)
  const score = useQuizStore((s) => s.score)
  const answers = useQuizStore((s) => s.answers)
  const reset = useQuizStore((s) => s.reset)
  const certification = useQuizStore((s) => s.certification)

  const [summary, setSummary] = useState<ApiSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)
  const [copied, setCopied] = useState<'image' | 'text' | null>(null)
  const shareCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!subject) { navigate('/app'); return }
    Promise.all([
      generateSummary(score, TOTAL, answers),
      saveQuiz(score, TOTAL, subject, answers),
    ])
      .then(([s]) => setSummary(s))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!subject) return null

  function handlePlayAgain() { reset(); navigate('/app') }

  const pct = Math.round((score / TOTAL) * 100)
  const scoreColor = pct >= 80 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-danger'
  const scoreBorder = pct >= 80 ? 'border-success/20 bg-success/5' : pct >= 50 ? 'border-warning/20 bg-warning/5' : 'border-danger/20 bg-danger/5'
  const pctBadge = pct >= 80 ? 'bg-success/15 text-success' : pct >= 50 ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger'

  const shareText = `Acabei de completar um quiz no Certara! 🎯\n✅ Score: ${score}/${TOTAL} (${pct}%)\n📚 Certificação: ${certification || 'AWS'}\n\nEstude em: https://certara.com.br`
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://certara.com.br')}`

  async function copyImage() {
    if (!shareCardRef.current) return
    setCopying(true)
    try {
      const canvas = await html2canvas(shareCardRef.current, { scale: 2 })
      canvas.toBlob(async (blob) => {
        if (!blob) { setCopying(false); return }
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          setCopied('image')
        } catch {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'certara-resultado.png'
          a.click()
          URL.revokeObjectURL(url)
        }
        setCopying(false)
        setTimeout(() => setCopied(null), 2500)
      })
    } catch {
      setCopying(false)
    }
  }

  async function copyText() {
    await navigator.clipboard.writeText(shareText)
    setCopied('text')
    setTimeout(() => setCopied(null), 2500)
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <SubjectBadge subject={subject} />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8">
        <div className="text-center space-y-1">
          <h2 className="font-sans text-2xl font-bold text-foreground">
            Quiz <span className="text-primary">Concluído!</span>
          </h2>
          <p className="text-sm text-muted-foreground">Veja seu desempenho abaixo</p>
        </div>

        {/* Score card */}
        <div className={cn('rounded-2xl border p-6 text-center space-y-3', scoreBorder)}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pontuação</p>
          <div className="flex items-end justify-center gap-1">
            <span className={cn('font-sans text-7xl font-extrabold leading-none', scoreColor)}>{score}</span>
            <span className="mb-2 font-sans text-2xl font-semibold text-muted-foreground">/{TOTAL}</span>
          </div>
          <span className={cn('inline-block rounded-full px-3 py-1 text-sm font-semibold', pctBadge)}>
            {pct}%
          </span>
        </div>

        {/* AI Summary */}
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Analisando seu desempenho com IA…</p>
            </div>
            <div className="space-y-2 pt-1">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-5/6 rounded" />
              <div className="skeleton h-3 w-4/6 rounded" />
            </div>
          </div>
        ) : summary ? (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 animate-fade-in">
            <p className="font-body text-sm leading-relaxed text-foreground">{summary.encouragement}</p>

            {summary.strong_areas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-success">Pontos fortes</p>
                <ul className="space-y-1.5">
                  {summary.strong_areas.map((area, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <span className="flex-shrink-0 font-bold text-success">✓</span>{area}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.weak_areas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-danger">Pontos a melhorar</p>
                <ul className="space-y-1.5">
                  {summary.weak_areas.map((area, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <span className="flex-shrink-0 font-bold text-danger">✗</span>{area}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.study_plan.length > 0 && (
              <div className="rounded-lg border border-primary/15 bg-primary/5 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Plano de estudo</p>
                <ol className="space-y-1.5">
                  {summary.study_plan.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <span className="flex-shrink-0 font-semibold text-primary">{i + 1}.</span>{tip}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {summary.next_step && (
              <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Próximo passo: </span>
                {summary.next_step}
              </p>
            )}
          </div>
        ) : null}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePlayAgain}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-sans text-sm font-semibold text-white hover:bg-primary-hover transition-colors duration-150"
          >
            <RotateCcw className="h-4 w-4" />
            Jogar Novamente
          </button>
          <button
            onClick={() => navigate('/historico')}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 font-sans text-sm font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors duration-150"
          >
            <History className="h-4 w-4" />
            Ver Histórico
          </button>
        </div>

        {/* Share section */}
        <div className="space-y-3">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Compartilhar resultado
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copyImage}
              disabled={copying}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 font-sans text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
            >
              {copying ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Image className="h-4 w-4" />
              )}
              {copied === 'image' ? 'Copiado!' : 'Copiar imagem'}
            </button>
            <button
              onClick={copyText}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 font-sans text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <ClipboardCopy className="h-4 w-4" />
              {copied === 'text' ? 'Copiado!' : 'Copiar texto'}
            </button>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 font-sans text-sm font-semibold text-foreground transition-colors hover:border-[#25D366]/50 hover:text-[#25D366]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={liUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 font-sans text-sm font-semibold text-foreground transition-colors hover:border-[#0A66C2]/50 hover:text-[#0A66C2]"
            >
              <ExternalLink className="h-4 w-4" />
              LinkedIn
            </a>
          </div>
        </div>
      </main>

      {/* Hidden share card captured by html2canvas */}
      <div
        ref={shareCardRef}
        style={{
          position: 'absolute',
          left: -9999,
          top: -9999,
          width: 480,
          height: 252,
          background: 'linear-gradient(135deg, #3B39E8 0%, #0F0E2E 100%)',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'system-ui, sans-serif',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="0" y="14.4" width="6" height="9.6" rx="3" fill="rgba(255,255,255,0.7)" />
            <rect x="9" y="7.2" width="6" height="16.8" rx="3" fill="rgba(255,255,255,0.9)" />
            <rect x="18" y="0" width="6" height="24" rx="3" fill="#22C55E" />
          </svg>
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Certara</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ color: '#fff', fontSize: 64, fontWeight: 900, lineHeight: 1 }}>{score}</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 24, fontWeight: 600 }}>/{TOTAL}</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.2)', width: '100%' }}>
            <div style={{ height: '100%', borderRadius: 4, background: '#22C55E', width: `${pct}%` }} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 20,
              }}
            >
              {certification || 'AWS'}
            </span>
            <span style={{ color: '#22C55E', fontSize: 14, fontWeight: 700 }}>{pct}%</span>
          </div>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Estude no certara.com.br</div>
      </div>
    </div>
  )
}
