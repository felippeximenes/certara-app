import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Crown, Timer, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { Logo } from '../components/Logo'
import { ProgressBar } from '../components/ProgressBar'
import { CERTIFICATIONS, getCertification } from '../data/certifications'
import { generateQuestion, evaluateAnswer, saveQuiz, getSubscription } from '../services/api'
import { useSimulationStore, SIM_TOTAL, diffForIndex } from '../store/simulationStore'
import type { ApiFeedback, QuizAnswer } from '../types/quiz'

const FM = "'Manrope', system-ui, sans-serif"
const FG = "'Space Grotesk', system-ui, sans-serif"
const LETTERS = ['A', 'B', 'C', 'D']

function getCorrectIndex(answer: string) { return LETTERS.indexOf(answer.charAt(0).toUpperCase()) }
function stripLetter(o: string) { return o.replace(/^[A-D]\)\s*/i, '') }
function formatTime(s: number) {
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const CARD: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(12,16,36,.07)',
  borderRadius: 20,
}

// ─── Config phase ───────────────────────────────────────────────────────────

function SimConfig() {
  const navigate = useNavigate()
  const startSim = useSimulationStore((s) => s.startSim)
  const [selectedCert, setSelectedCert] = useState('')
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    getSubscription().then(sub => setIsPremium(sub.plan === 'premium')).catch(() => setIsPremium(false))
  }, [])

  function handleStart() {
    if (!selectedCert) return
    setStarting(true)
    startSim(selectedCert)
  }

  return (
    <div className="flex min-h-svh flex-col" style={{ background: '#f6f6fb' }}>
      <header className="sticky top-0 z-10" style={{ background: 'rgba(246,246,251,.8)', backdropFilter: 'saturate(160%) blur(14px)', WebkitBackdropFilter: 'saturate(160%) blur(14px)', borderBottom: '1px solid rgba(12,16,36,.05)' }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/app')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid rgba(12,16,36,.08)', borderRadius: 10, padding: '8px 14px', font: `600 13px/1 ${FM}`, color: '#4b5170', cursor: 'pointer' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Início
          </button>
          <Logo size="sm" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h1 style={{ font: `700 24px/1.2 ${FG}`, color: '#0C1024', margin: 0 }}>
            Modo <span style={{ color: '#3B39E8' }}>Simulado</span>
          </h1>
          <p style={{ font: `400 14px/1 ${FM}`, color: '#9aa0bb', marginTop: 6 }}>Simule a prova real da AWS</p>
        </div>

        {/* Info banner */}
        <div style={{ ...CARD, padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: 16, borderRadius: 14 }}>
          {[
            { icon: '📋', text: '65 questões' },
            { icon: '⏱', text: '130 minutos' },
            { icon: '🚫', text: 'Sem feedback durante a prova' },
          ].map(({ icon, text }) => (
            <span key={text} style={{ font: `500 13px/1 ${FM}`, color: '#4b5170', display: 'flex', alignItems: 'center', gap: 6 }}>
              {icon} {text}
            </span>
          ))}
        </div>

        {/* Cert selection */}
        <section>
          <p style={{ font: `600 11px/1 ${FM}`, color: '#9aa0bb', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            Selecione a certificação
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CERTIFICATIONS.map((cert) => (
              <button
                key={cert.id}
                onClick={() => setSelectedCert(cert.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  background: selectedCert === cert.id ? 'rgba(59,57,232,.05)' : '#fff',
                  border: selectedCert === cert.id ? '1.5px solid #3B39E8' : '1px solid rgba(12,16,36,.08)',
                  borderRadius: 14, padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                  transition: 'border-color .15s, background .15s',
                  boxShadow: selectedCert === cert.id ? '0 0 0 3px rgba(59,57,232,.08)' : 'none',
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: cert.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ font: `700 13px/1 ${FG}`, color: cert.color }}>{cert.code}</span>
                    <span style={{ font: `600 13px/1 ${FM}`, color: '#0C1024', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.name}</span>
                  </div>
                </div>
                <span style={{ borderRadius: 100, border: '1px solid rgba(12,16,36,.08)', padding: '4px 10px', font: `400 11px/1 ${FM}`, color: '#9aa0bb', flexShrink: 0 }}>
                  {cert.level}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* CTA / Paywall */}
        {isPremium === null ? (
          <div style={{ height: 48, borderRadius: 14, background: 'rgba(12,16,36,.06)' }} className="animate-pulse" />
        ) : isPremium ? (
          <button
            onClick={handleStart}
            disabled={!selectedCert || starting}
            style={{
              width: '100%', background: '#3B39E8', color: '#fff', border: 'none',
              borderRadius: 14, padding: '16px 0', font: `700 15px/1 ${FM}`, cursor: 'pointer',
              opacity: !selectedCert || starting ? 0.4 : 1, transition: 'opacity .15s',
            }}
          >
            {starting ? 'Iniciando…' : 'Iniciar Simulado'}
          </button>
        ) : (
          <div style={{ ...CARD, padding: '28px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, borderRadius: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(59,57,232,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B39E8' }}>
              <Crown className="h-7 w-7" />
            </div>
            <div>
              <p style={{ font: `700 16px/1.3 ${FG}`, color: '#0C1024', margin: '0 0 6px' }}>Funcionalidade Premium</p>
              <p style={{ font: `400 13px/1.5 ${FM}`, color: '#9aa0bb' }}>O Modo Simulado está disponível apenas para assinantes Premium.</p>
            </div>
            <button onClick={() => navigate('/assinatura')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#3B39E8', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 22px', font: `600 14px/1 ${FM}`, cursor: 'pointer' }}>
              <Crown className="h-4 w-4" /> Ver planos
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Running phase ───────────────────────────────────────────────────────────

function SimRunning() {
  const {
    certification, questions, selectedAnswers, currentIndex,
    timeRemaining, setQuestion, setAnswer, goTo, tick, finish, reset,
  } = useSimulationStore()

  const cert = getCertification(certification)
  const fetchingRef = useRef<Set<number>>(new Set())
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [loadingQ, setLoadingQ] = useState(false)

  const [tabViolation, setTabViolation] = useState(false)
  const violationCount = useRef(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    function onVisibilityChange() {
      if (!document.hidden) return
      violationCount.current++; setCountdown(30); setTabViolation(true)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  useEffect(() => {
    if (!tabViolation) return
    countdownRef.current = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { finish(); return 0 } return c - 1 })
    }, 1000)
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [tabViolation]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setInterval(() => { if (tick()) clearInterval(id) }, 1000)
    return () => clearInterval(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function loadQ(index: number) {
    if (index < 0 || index >= SIM_TOTAL) return
    if (questions[index] !== null) return
    if (fetchingRef.current.has(index)) return
    fetchingRef.current.add(index)
    const domain = cert.domains[index % cert.domains.length]
    const recentQuestions = questions.filter((q): q is NonNullable<typeof q> => q !== null).map(q => q.question).slice(-20)
    generateQuestion(domain, diffForIndex(index), certification, recentQuestions)
      .then(q => { setQuestion(index, q); fetchingRef.current.delete(index) })
      .catch(() => fetchingRef.current.delete(index))
  }

  useEffect(() => {
    setLoadingQ(questions[currentIndex] === null)
    loadQ(currentIndex)
    loadQ(currentIndex + 1)
  }, [currentIndex, questions[currentIndex]]) // eslint-disable-line react-hooks/exhaustive-deps

  const question = questions[currentIndex]
  const answered = selectedAnswers.filter(a => a !== null).length
  const isLast = currentIndex === SIM_TOTAL - 1
  const isWarning = timeRemaining < 600

  function handleSelect(i: number) { setAnswer(currentIndex, i) }
  function handlePrev() { if (currentIndex > 0) goTo(currentIndex - 1) }
  function handleNext() { if (currentIndex < SIM_TOTAL - 1) goTo(currentIndex + 1) }
  function handleFinalize() {
    if (isLast || confirmFinish) { finish(); return }
    setConfirmFinish(true)
  }

  return (
    <div className="flex min-h-svh flex-col" style={{ background: '#f6f6fb' }}>
      {/* Header */}
      <header className="sticky top-0 z-10" style={{ background: 'rgba(246,246,251,.8)', backdropFilter: 'saturate(160%) blur(14px)', WebkitBackdropFilter: 'saturate(160%) blur(14px)', borderBottom: '1px solid rgba(12,16,36,.05)' }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ borderRadius: 100, border: '1px solid rgba(12,16,36,.1)', padding: '5px 12px', font: `700 12px/1 ${FG}`, color: cert.color, background: '#fff' }}>
              {cert.code}
            </span>
            <span style={{ font: `500 12px/1 ${FM}`, color: '#9aa0bb' }}>{answered}/{SIM_TOTAL} respondidas</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: `700 16px/1 'ui-monospace','Courier New',monospace`, color: isWarning ? '#EF4444' : '#0C1024', fontVariantNumeric: 'tabular-nums' }}>
            <Timer className="h-4 w-4" />
            {formatTime(timeRemaining)}
          </div>
        </div>
        <div className="px-4 pb-2">
          <ProgressBar current={answered} total={SIM_TOTAL} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 lg:grid lg:grid-cols-[1fr_200px]" style={{ gap: 24 }}>
        {/* Question area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ font: `600 11px/1 ${FM}`, color: '#9aa0bb', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Questão {currentIndex + 1} de {SIM_TOTAL}
          </p>

          <div style={{ ...CARD, padding: '20px 24px', minHeight: 120 }}>
            {loadingQ || !question ? (
              <div className="space-y-3">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-5/6 rounded" />
                <p style={{ marginTop: 12, font: `400 12px/1 ${FM}`, color: '#9aa0bb' }} className="animate-pulse">Gerando questão…</p>
              </div>
            ) : (
              <p style={{ font: `500 15px/1.6 ${FM}`, color: '#0C1024' }}>{question.question}</p>
            )}
          </div>

          {question && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {question.options.map((opt, i) => {
                const isSelected = selectedAnswers[currentIndex] === i
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      background: isSelected ? 'rgba(59,57,232,.06)' : '#fff',
                      border: isSelected ? '1.5px solid #3B39E8' : '1px solid rgba(12,16,36,.08)',
                      borderRadius: 12, padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                      transition: 'border-color .15s, background .15s',
                    }}
                  >
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isSelected ? '#3B39E8' : '#fff',
                      border: isSelected ? '1.5px solid #3B39E8' : '1.5px solid rgba(12,16,36,.15)',
                      font: `700 11px/1 ${FG}`, color: isSelected ? '#fff' : '#9aa0bb',
                    }}>
                      {LETTERS[i]}
                    </span>
                    <span style={{ font: `500 14px/1.5 ${FM}`, color: '#0C1024' }}>{stripLetter(opt)}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8 }}>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid rgba(12,16,36,.08)', borderRadius: 12, padding: '12px 18px', font: `600 13px/1 ${FM}`, color: '#4b5170', cursor: 'pointer', opacity: currentIndex === 0 ? 0.4 : 1, transition: 'opacity .15s' }}
            >
              <ArrowLeft className="h-4 w-4" /> Anterior
            </button>
            {!isLast && (
              <button
                onClick={handleNext}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#3B39E8', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 18px', font: `700 13px/1 ${FM}`, cursor: 'pointer' }}
              >
                Próxima <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleFinalize}
              style={{
                ...(isLast
                  ? { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C1024', color: '#fff' }
                  : { background: '#fff', color: '#9aa0bb' }),
                border: isLast ? 'none' : '1px solid rgba(12,16,36,.08)',
                borderRadius: 12, padding: '12px 18px', font: `700 13px/1 ${FM}`, cursor: 'pointer',
              }}
            >
              Finalizar
            </button>
          </div>
        </div>

        {/* Question map */}
        <div style={{ marginTop: 0 }} className="mt-6 lg:mt-0">
          <p style={{ font: `600 11px/1 ${FM}`, color: '#9aa0bb', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Mapa</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }} className="lg:grid-cols-5">
            {Array.from({ length: SIM_TOTAL }, (_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                title={`Questão ${i + 1}`}
                style={{
                  height: 28, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 6, font: `700 11px/1 ${FG}`, cursor: 'pointer', border: 'none',
                  background: selectedAnswers[i] !== null ? '#3B39E8' : 'rgba(12,16,36,.06)',
                  color: selectedAnswers[i] !== null ? '#fff' : '#9aa0bb',
                  outline: currentIndex === i ? '2px solid #3B39E8' : 'none',
                  outlineOffset: 2,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#3B39E8' }} />
            <span style={{ font: `400 11px/1 ${FM}`, color: '#9aa0bb' }}>Respondida</span>
          </div>
        </div>
      </main>

      {/* Tab-switch violation modal */}
      {tabViolation && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 380, ...CARD, padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,.3)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>⚠️</span>
              <div>
                <p style={{ font: `700 17px/1.2 ${FG}`, color: '#0C1024', margin: 0 }}>Violação detectada</p>
                <p style={{ font: `400 11px/1 ${FM}`, color: '#9aa0bb', marginTop: 3 }}>Saída nº {violationCount.current}</p>
              </div>
            </div>
            <p style={{ font: `400 13px/1.6 ${FM}`, color: '#4b5170' }}>
              Você saiu da aba durante o simulado. Em um ambiente de prova presencial isso não seria permitido.
            </p>
            <div style={{ borderRadius: 12, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', padding: '12px 16px', textAlign: 'center' }}>
              <p style={{ font: `500 12px/1 ${FM}`, color: '#EF4444' }}>
                Encerramento automático em <span style={{ font: `700 18px/1 ${FG}` }}>{countdown}s</span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { if (countdownRef.current) clearInterval(countdownRef.current); reset() }} style={{ flex: 1, background: '#fff', border: '1px solid rgba(12,16,36,.08)', borderRadius: 12, padding: '12px 0', font: `600 13px/1 ${FM}`, color: '#4b5170', cursor: 'pointer' }}>
                Reiniciar
              </button>
              <button onClick={() => { if (countdownRef.current) clearInterval(countdownRef.current); finish() }} style={{ flex: 1, background: '#EF4444', border: 'none', borderRadius: 12, padding: '12px 0', font: `700 13px/1 ${FM}`, color: '#fff', cursor: 'pointer' }}>
                Encerrar agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm finish modal */}
      {confirmFinish && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.4)', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 360, ...CARD, padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ font: `700 17px/1.2 ${FG}`, color: '#0C1024', margin: 0 }}>Finalizar simulado?</p>
            <p style={{ font: `400 13px/1.6 ${FM}`, color: '#4b5170' }}>
              Você ainda tem questões sem resposta. Deseja finalizar assim mesmo?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmFinish(false)} style={{ flex: 1, background: '#fff', border: '1px solid rgba(12,16,36,.08)', borderRadius: 12, padding: '12px 0', font: `600 13px/1 ${FM}`, color: '#4b5170', cursor: 'pointer' }}>
                Continuar
              </button>
              <button onClick={() => { setConfirmFinish(false); finish() }} style={{ flex: 1, background: '#3B39E8', border: 'none', borderRadius: 12, padding: '12px 0', font: `700 13px/1 ${FM}`, color: '#fff', cursor: 'pointer' }}>
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Results phase ───────────────────────────────────────────────────────────

function SimResults() {
  const navigate = useNavigate()
  const { certification, questions, selectedAnswers, reset } = useSimulationStore()
  const cert = getCertification(certification)

  const [evals, setEvals] = useState<Record<number, ApiFeedback>>({})
  const [evalProgress, setEvalProgress] = useState(0)
  const [evalTotal, setEvalTotal] = useState(0)
  const [saved, setSaved] = useState(false)

  const results = questions.map((q, i) => {
    if (!q || selectedAnswers[i] === null) return null
    const correctIdx = getCorrectIndex(q.answer)
    const userIdx = selectedAnswers[i]!
    return { q, i, correctIdx, userIdx, correct: userIdx === correctIdx }
  }).filter(Boolean) as Array<{ q: NonNullable<typeof questions[0]>; i: number; correctIdx: number; userIdx: number; correct: boolean }>

  const score = results.filter(r => r.correct).length
  const pct = Math.round((score / SIM_TOTAL) * 100)
  const passed = pct >= 70

  const domainMap: Record<string, { correct: number; total: number }> = {}
  results.forEach(({ q, correct }) => {
    if (!domainMap[q.domain]) domainMap[q.domain] = { correct: 0, total: 0 }
    domainMap[q.domain].total++
    if (correct) domainMap[q.domain].correct++
  })

  useEffect(() => {
    if (saved) return; setSaved(true)
    const answers: QuizAnswer[] = results.map(r => ({ domain: r.q.domain, difficulty: r.q.difficulty, correct: r.correct }))
    saveQuiz(score, SIM_TOTAL, 'Simulado', answers, certification).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const wrong = results.filter(r => !r.correct)
    setEvalTotal(wrong.length)
    if (!wrong.length) return
    const BATCH = 5; let done = 0
    async function run() {
      for (let b = 0; b < wrong.length; b += BATCH) {
        const batch = wrong.slice(b, b + BATCH)
        const settled = await Promise.allSettled(
          batch.map(({ q, userIdx }) => evaluateAnswer({ question: q.question, options: q.options, correct_answer: q.answer, selected_answer: LETTERS[userIdx], domain: q.domain, explanation: q.explanation, certification }))
        )
        setEvals(prev => {
          const next = { ...prev }
          settled.forEach((r, j) => { if (r.status === 'fulfilled') next[batch[j].i] = r.value })
          return next
        })
        done += batch.length; setEvalProgress(done)
      }
    }
    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function toTitleCase(s: string) { return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }

  return (
    <div className="flex min-h-svh flex-col" style={{ background: '#f6f6fb' }}>
      <header className="sticky top-0 z-10" style={{ background: 'rgba(246,246,251,.8)', backdropFilter: 'saturate(160%) blur(14px)', WebkitBackdropFilter: 'saturate(160%) blur(14px)', borderBottom: '1px solid rgba(12,16,36,.05)' }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Logo size="sm" />
          <span style={{ borderRadius: 100, border: '1px solid rgba(12,16,36,.1)', padding: '5px 12px', font: `700 12px/1 ${FG}`, color: cert.color, background: '#fff' }}>{cert.code}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Score card */}
        <div style={{
          ...CARD, padding: '28px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          background: passed ? 'rgba(34,197,94,.05)' : 'rgba(239,68,68,.05)',
          border: passed ? '1px solid rgba(34,197,94,.2)' : '1px solid rgba(239,68,68,.2)',
        }}>
          <div style={{ display: 'inline-flex', borderRadius: 100, padding: '8px 20px', font: `800 13px/1 ${FG}`, letterSpacing: '.08em', background: passed ? '#22C55E' : '#EF4444', color: '#fff' }}>
            {passed ? '✓ APROVADO' : '✗ REPROVADO'}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
            <span style={{ font: `800 64px/1 ${FG}`, color: passed ? '#22C55E' : '#EF4444', lineHeight: 1 }}>{score}</span>
            <span style={{ font: `600 24px/1.4 ${FG}`, color: '#9aa0bb', marginBottom: 6 }}>/{SIM_TOTAL}</span>
          </div>
          <p style={{ font: `700 24px/1 ${FG}`, color: passed ? '#22C55E' : '#EF4444' }}>{pct}%</p>
          <p style={{ font: `400 12px/1 ${FM}`, color: '#9aa0bb' }}>Mínimo para aprovação: 70%</p>
        </div>

        {/* Domain breakdown */}
        <div style={{ ...CARD, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ font: `600 13px/1 ${FG}`, color: '#0C1024', margin: 0 }}>Desempenho por domínio</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(domainMap).map(([domain, stats]) => {
              const dpct = Math.round((stats.correct / stats.total) * 100)
              const color = dpct >= 70 ? '#22C55E' : '#EF4444'
              return (
                <div key={domain}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ font: `500 13px/1 ${FM}`, color: '#0C1024' }}>{toTitleCase(domain)}</span>
                    <span style={{ font: `700 13px/1 ${FG}`, color }}>{dpct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: 'rgba(12,16,36,.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: color, width: `${dpct}%`, transition: 'width .5s' }} />
                  </div>
                  <p style={{ font: `400 11px/1 ${FM}`, color: '#9aa0bb', marginTop: 4 }}>{stats.correct}/{stats.total} questões</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Eval progress */}
        {evalTotal > 0 && evalProgress < evalTotal && (
          <div style={{ ...CARD, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0" style={{ borderColor: '#3B39E8', borderTopColor: 'transparent' }} />
            <p style={{ font: `400 13px/1 ${FM}`, color: '#4b5170' }}>Analisando questões erradas com IA… {evalProgress}/{evalTotal}</p>
          </div>
        )}

        {/* Question review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ font: `600 13px/1 ${FG}`, color: '#0C1024' }}>Revisão completa ({results.length} questões respondidas)</p>
          {results.map(({ q, i, correctIdx, userIdx, correct }) => (
            <div key={i} style={{
              borderRadius: 16, padding: '16px 20px',
              background: correct ? 'rgba(34,197,94,.04)' : 'rgba(239,68,68,.04)',
              border: correct ? '1px solid rgba(34,197,94,.2)' : '1px solid rgba(239,68,68,.2)',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                {correct
                  ? <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
                  : <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />}
                <p style={{ font: `500 14px/1.5 ${FM}`, color: '#0C1024' }}>{q.question}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ font: `400 12px/1 ${FM}` }}>
                  <span style={{ color: '#9aa0bb' }}>Sua resposta: </span>
                  <span style={{ fontWeight: 600, color: correct ? '#22C55E' : '#EF4444' }}>
                    {LETTERS[userIdx]}) {stripLetter(q.options[userIdx])}
                  </span>
                </p>
                {!correct && (
                  <p style={{ font: `400 12px/1 ${FM}` }}>
                    <span style={{ color: '#9aa0bb' }}>Resposta correta: </span>
                    <span style={{ fontWeight: 600, color: '#22C55E' }}>
                      {LETTERS[correctIdx]}) {stripLetter(q.options[correctIdx])}
                    </span>
                  </p>
                )}
              </div>
              <p style={{ font: `400 12px/1.6 ${FM}`, color: '#4b5170', paddingTop: 10, borderTop: '1px solid rgba(12,16,36,.06)' }}>
                {evals[i]?.feedback ?? q.explanation}
              </p>
              {evals[i]?.study_tips && evals[i].study_tips.length > 0 && (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {evals[i].study_tips.map((tip, ti) => (
                    <li key={ti} style={{ display: 'flex', gap: 8, font: `400 12px/1.5 ${FM}`, color: '#4b5170' }}>
                      <span style={{ color: '#3B39E8', marginTop: 1 }}>›</span>{tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingBottom: 32 }}>
          <button
            onClick={() => reset()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid rgba(12,16,36,.08)', borderRadius: 14, padding: '14px 0', font: `600 14px/1 ${FM}`, color: '#4b5170', cursor: 'pointer' }}
          >
            <RotateCcw className="h-4 w-4" /> Tentar novamente
          </button>
          <button
            onClick={() => navigate('/app')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3B39E8', border: 'none', borderRadius: 14, padding: '14px 0', font: `700 14px/1 ${FM}`, color: '#fff', cursor: 'pointer' }}
          >
            Voltar ao início
          </button>
        </div>
      </main>
    </div>
  )
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export function Simulation() {
  const phase = useSimulationStore((s) => s.phase)
  if (phase === 'running') return <SimRunning />
  if (phase === 'results') return <SimResults />
  return <SimConfig />
}
