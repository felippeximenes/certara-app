import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Crown, RotateCcw } from 'lucide-react'
import { ProgressBar } from '../components/ProgressBar'
import { useQuizStore } from '../store/quizStore'
import { generateQuestion, evaluateAnswer, ApiError } from '../services/api'
import { getCertification } from '../data/certifications'
import { trackEvent } from '../services/analytics'
import type { ApiQuestion, ApiFeedback } from '../types/quiz'

const FM = "'Manrope', system-ui, sans-serif"
const FG = "'Space Grotesk', system-ui, sans-serif"

const TOTAL = 10
const LETTERS = ['A', 'B', 'C', 'D']
const DIFFICULTY_MAP: Record<string, string> = { 'Fácil': 'easy', 'Médio': 'medium', 'Difícil': 'hard' }
type Phase = 'loading' | 'selecting' | 'evaluating' | 'feedback'

function getCorrectIndex(answer: string) { return LETTERS.indexOf(answer.charAt(0).toUpperCase()) }
function stripLetter(option: string) { return option.replace(/^[A-D]\)\s*/i, '') }

export function Quiz() {
  const navigate = useNavigate()
  const subject = useQuizStore((s) => s.subject)
  const certification = useQuizStore((s) => s.certification)
  const storeSetScore = useQuizStore((s) => s.setScore)
  const addAnswer = useQuizStore((s) => s.addAnswer)

  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [localScore, setLocalScore] = useState(0)
  const [question, setQuestion] = useState<ApiQuestion | null>(null)
  const [feedback, setFeedback] = useState<ApiFeedback | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [trialExhausted, setTrialExhausted] = useState(false)
  const sessionQuestionsRef = useRef<string[]>([])

  const cert = getCertification(certification)
  const difficulty = DIFFICULTY_MAP[subject] ?? 'easy'
  const isLastQuestion = currentQ === TOTAL - 1

  const fetchQuestion = useCallback(async (index: number) => {
    setPhase('loading'); setQuestion(null); setSelected(null); setFeedback(null); setError(null); setTrialExhausted(false)
    try {
      const domain = cert.domains[index % cert.domains.length]
      const q = await generateQuestion(domain, difficulty, certification, sessionQuestionsRef.current)
      sessionQuestionsRef.current = [...sessionQuestionsRef.current, q.question].slice(-20)
      setQuestion(q); setPhase('selecting')
    } catch (err) {
      if (err instanceof ApiError && err.code === 'trial_exhausted') {
        setTrialExhausted(true)
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao gerar pergunta. Tente novamente.')
      }
    }
  }, [difficulty, certification, cert.domains])

  useEffect(() => {
    if (!subject || !certification) { navigate('/app'); return }
    trackEvent('quiz_started', { certification, difficulty })
    fetchQuestion(0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const actionsRef = useRef({ handleAnswer: () => {}, handleNext: () => {} } as { handleAnswer: () => void; handleNext: () => void })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const key = e.key.toUpperCase()
      if (phase === 'selecting') {
        const byLetter = ['A', 'B', 'C', 'D'].indexOf(key)
        const byNumber = ['1', '2', '3', '4'].indexOf(key)
        const idx = byLetter !== -1 ? byLetter : byNumber
        if (idx !== -1 && question?.options[idx] !== undefined) { setSelected(idx); return }
        if (e.key === 'Enter' && selected !== null) { actionsRef.current.handleAnswer(); return }
      }
      if (phase === 'feedback' && e.key === 'Enter') actionsRef.current.handleNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, selected, question])

  async function handleAnswer() {
    if (selected === null || !question) return
    setPhase('evaluating')
    const correctIndex = getCorrectIndex(question.answer)
    const isCorrect = selected === correctIndex
    if (isCorrect) setLocalScore((s) => s + 1)
    addAnswer({ domain: question.domain, difficulty: question.difficulty, correct: isCorrect })
    try {
      const fb = await evaluateAnswer({ question: question.question, options: question.options, correct_answer: question.answer, selected_answer: LETTERS[selected], domain: question.domain, explanation: question.explanation, certification })
      setFeedback(fb)
    } catch {
      setFeedback({ correct: selected === correctIndex, feedback: question.explanation, study_tips: [], aws_docs_topic: question.domain })
    }
    setPhase('feedback')
  }

  function handleNext() {
    if (isLastQuestion) {
      trackEvent('quiz_completed', { certification, difficulty, score: localScore, pct: Math.round((localScore / TOTAL) * 100) })
      storeSetScore(localScore)
      navigate('/resultado')
    } else {
      const next = currentQ + 1
      setCurrentQ(next)
      fetchQuestion(next)
    }
  }

  actionsRef.current = { handleAnswer, handleNext }

  const correctIndex = question ? getCorrectIndex(question.answer) : -1
  const isAnswered = phase === 'feedback'

  function optionState(i: number) {
    if (phase !== 'feedback') return selected === i ? 'selected' : 'idle'
    if (i === correctIndex) return 'correct'
    if (i === selected) return 'wrong'
    return 'idle'
  }

  if (trialExhausted) return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 p-6 text-center" style={{ background: '#f6f6fb' }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(59,57,232,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B39E8', margin: '0 auto' }}>
        <Crown className="h-7 w-7" />
      </div>
      <div>
        <p style={{ font: `700 18px/1.3 ${FG}`, color: '#0C1024', margin: '0 0 6px' }}>Teste gratuito utilizado</p>
        <p style={{ font: `400 14px/1.6 ${FM}`, color: '#6b708c' }}>
          Você já realizou seu quiz gratuito.<br />Assine o Premium para continuar estudando.
        </p>
      </div>
      <button
        onClick={() => navigate('/assinatura')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#3B39E8', color: '#fff', font: `600 14px/1 ${FM}`, padding: '14px 24px', borderRadius: 12, border: 'none', cursor: 'pointer' }}
      >
        <Crown className="h-4 w-4" /> Ver planos Premium
      </button>
    </div>
  )

  if (error) return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4" style={{ background: '#f6f6fb' }}>
      <p role="alert" className="text-sm text-muted-foreground">{error}</p>
      <button onClick={() => fetchQuestion(currentQ)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#3B39E8', color: '#fff', font: `600 13px/1 ${FM}`, padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
        <RotateCcw className="h-4 w-4" /> Tentar novamente
      </button>
    </div>
  )

  return (
    <div className="flex min-h-svh flex-col" style={{ background: '#f6f6fb' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: 'rgba(246,246,251,.8)',
          backdropFilter: 'saturate(160%) blur(14px)',
          WebkitBackdropFilter: 'saturate(160%) blur(14px)',
          borderBottom: '1px solid rgba(12,16,36,.05)',
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 100, border: '1px solid rgba(12,16,36,.1)', font: `700 12px/1 ${FG}`, color: cert.color, background: '#fff' }}>
              {cert.code}
            </span>
            <span style={{ font: `500 12px/1 ${FM}`, color: '#9aa0bb' }}>{subject}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', font: `500 12px/1 ${FM}`, color: '#9aa0bb' }}>
            <span>Questão {currentQ + 1} de {TOTAL}</span>
            <span>{Math.round(((currentQ + 1) / TOTAL) * 100)}%</span>
          </div>
          <ProgressBar current={currentQ + 1} total={TOTAL} />
        </div>

        {/* Question card */}
        <div style={{ background: '#fff', border: '1px solid rgba(12,16,36,.07)', borderRadius: 20, padding: '24px 28px', minHeight: 120 }}>
          {phase === 'loading' ? (
            <div className="space-y-3">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-5/6 rounded" />
              <p style={{ marginTop: 16, font: `500 12px/1 ${FM}`, color: '#9aa0bb' }}>Gerando questão com IA...</p>
            </div>
          ) : (
            <p style={{ font: `500 16px/1.6 ${FM}`, color: '#0C1024' }}>{question?.question}</p>
          )}
        </div>

        {/* Options */}
        {phase !== 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {question?.options.map((option, i) => {
              const state = optionState(i)
              const bgMap = {
                idle: '#fff',
                selected: 'rgba(59,57,232,.07)',
                correct: 'rgba(34,197,94,.08)',
                wrong: 'rgba(239,68,68,.07)',
              }
              const borderMap = {
                idle: 'rgba(12,16,36,.08)',
                selected: '#3B39E8',
                correct: '#22C55E',
                wrong: '#EF4444',
              }
              const badgeBg = {
                idle: '#fff',
                selected: '#3B39E8',
                correct: '#22C55E',
                wrong: '#EF4444',
              }
              const badgeBorder = {
                idle: 'rgba(12,16,36,.15)',
                selected: '#3B39E8',
                correct: '#22C55E',
                wrong: '#EF4444',
              }
              const badgeColor = {
                idle: '#9aa0bb',
                selected: '#fff',
                correct: '#fff',
                wrong: '#fff',
              }
              return (
                <button
                  key={i}
                  onClick={() => { if (phase === 'selecting') setSelected(i) }}
                  disabled={phase === 'evaluating' || phase === 'feedback'}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    background: bgMap[state],
                    border: `1.5px solid ${borderMap[state]}`,
                    borderRadius: 14, padding: '14px 18px', textAlign: 'left', cursor: phase === 'feedback' ? 'default' : 'pointer',
                    transition: 'border-color .15s, background .15s',
                  }}
                >
                  <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: badgeBg[state], border: `1.5px solid ${badgeBorder[state]}`, font: `700 12px/1 ${FG}`, color: badgeColor[state] }}>
                    {LETTERS[i]}
                  </span>
                  <span style={{ font: `500 14px/1.5 ${FM}`, color: state === 'wrong' ? '#EF4444' : state === 'correct' ? '#22C55E' : '#0C1024' }}>
                    {stripLetter(option)}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Feedback */}
        {isAnswered && feedback && (
          <div style={{
            borderRadius: 16, padding: '20px 24px',
            background: feedback.correct ? 'rgba(34,197,94,.06)' : 'rgba(239,68,68,.06)',
            border: `1px solid ${feedback.correct ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`,
            borderLeft: `4px solid ${feedback.correct ? '#22C55E' : '#EF4444'}`,
          }}>
            <p style={{ font: `700 14px/1 ${FG}`, color: feedback.correct ? '#22C55E' : '#EF4444', marginBottom: 10 }}>
              {feedback.correct ? '✓ Correto!' : '✗ Incorreto'}
            </p>
            <p style={{ font: `400 14px/1.6 ${FM}`, color: '#0C1024' }}>{feedback.feedback}</p>
            {feedback.study_tips.length > 0 && (
              <ul style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {feedback.study_tips.map((tip, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, font: `400 12px/1.5 ${FM}`, color: '#6b708c' }}>
                    <span style={{ color: '#3B39E8', marginTop: 1 }}>›</span>{tip}
                  </li>
                ))}
              </ul>
            )}
            {feedback.aws_docs_topic && (
              <p style={{ marginTop: 10, font: `500 12px/1 ${FM}`, color: '#9aa0bb' }}>
                Tópico: <span style={{ color: '#4b5170', fontWeight: 600 }}>{feedback.aws_docs_topic}</span>
              </p>
            )}
          </div>
        )}

        {/* Action button */}
        {phase !== 'loading' && (
          <button
            onClick={isAnswered ? handleNext : handleAnswer}
            disabled={(phase === 'selecting' && selected === null) || phase === 'evaluating'}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#3B39E8', color: '#fff', font: `600 15px/1 ${FM}`,
              padding: '16px 24px', borderRadius: 14, border: 'none', cursor: 'pointer',
              opacity: (phase === 'selecting' && selected === null) || phase === 'evaluating' ? 0.4 : 1,
              transition: 'opacity .15s',
            }}
          >
            {phase === 'evaluating' ? (
              <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Analisando...</>
            ) : isAnswered ? (
              <>{isLastQuestion ? 'Ver resultado' : 'Próxima questão'} <ChevronRight className="h-4 w-4" /></>
            ) : 'Confirmar resposta'}
          </button>
        )}
      </main>
    </div>
  )
}
