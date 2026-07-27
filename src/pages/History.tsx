import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell, LabelList,
} from 'recharts'
import { listHistory, deleteHistoryItem, clearAllHistory } from '../services/api'
import type { QuizHistoryItem } from '../types/quiz'

const FM = "'Manrope', system-ui, sans-serif"
const FG = "'Space Grotesk', system-ui, sans-serif"

function pctHex(pct: number) {
  if (pct >= 80) return '#22C55E'
  if (pct >= 50) return '#F59E0B'
  return '#EF4444'
}

function barFill(pct: number) {
  if (pct >= 80) return '#22C55E'
  if (pct >= 50) return '#F59E0B'
  return '#EF4444'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function toTitleCase(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface ScoreTooltipProps { active?: boolean; payload?: Array<{ value: number }>; label?: string }
function ScoreTooltip({ active, payload, label }: ScoreTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ borderRadius: 10, border: '1px solid rgba(12,16,36,.08)', background: '#fff', padding: '8px 14px', boxShadow: '0 4px 16px rgba(12,16,36,.08)', fontFamily: FM }}>
      <p style={{ fontSize: 11, color: '#9aa0bb', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#3B39E8' }}>Score: {payload[0].value}%</p>
    </div>
  )
}

interface DomainTooltipProps { active?: boolean; payload?: Array<{ payload: { domain: string; pct: number; correct: number; total: number } }> }
function DomainTooltip({ active, payload }: DomainTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ borderRadius: 10, border: '1px solid rgba(12,16,36,.08)', background: '#fff', padding: '8px 14px', boxShadow: '0 4px 16px rgba(12,16,36,.08)', fontFamily: FM }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#0C1024', marginBottom: 2 }}>{d.domain}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#3B39E8' }}>{d.pct}%</p>
      <p style={{ fontSize: 11, color: '#9aa0bb' }}>({d.correct}/{d.total} questões)</p>
    </div>
  )
}

export function History() {
  const navigate = useNavigate()
  const [items, setItems] = useState<QuizHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [clearConfirm, setClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [certFilter, setCertFilter] = useState<string | null>(null)

  useEffect(() => {
    listHistory()
      .then(setItems)
      .catch(() => setError('Não foi possível carregar o histórico.'))
      .finally(() => setLoading(false))
  }, [])

  const avgPct = items.length
    ? Math.round(items.reduce((s, i) => s + i.pct, 0) / items.length)
    : 0

  const lineData = [...items].reverse().map(item => ({
    date: formatShortDate(item.date),
    score: item.pct,
  }))

  const domainData = (() => {
    const agg: Record<string, { correct: number; total: number }> = {}
    items.forEach(item => {
      Object.entries(item.domains).forEach(([domain, stats]) => {
        if (!agg[domain]) agg[domain] = { correct: 0, total: 0 }
        agg[domain].correct += stats.correct
        agg[domain].total += stats.total
      })
    })
    return Object.entries(agg)
      .map(([domain, stats]) => ({
        domain: toTitleCase(domain),
        pct: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        correct: stats.correct,
        total: stats.total,
      }))
      .sort((a, b) => b.pct - a.pct)
  })()

  const DIFFS = [
    { label: 'Fácil', color: '#22C55E', bg: 'rgba(34,197,94,.08)', border: 'rgba(34,197,94,.2)' },
    { label: 'Médio', color: '#F59E0B', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.2)' },
    { label: 'Difícil', color: '#EF4444', bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.2)' },
  ]

  const diffStats = DIFFS.map(d => {
    const group = items.filter(i =>
      i.difficulty === d.label || i.difficulty.toLowerCase() === d.label.toLowerCase()
    )
    const avg = group.length ? Math.round(group.reduce((s, i) => s + i.pct, 0) / group.length) : 0
    return { ...d, count: group.length, avg }
  })

  const availableCerts = [...new Set(items.map(i => i.certification).filter(Boolean))] as string[]
  const filteredItems = certFilter ? items.filter(i => i.certification === certFilter) : items

  async function handleDelete(quizId: string) {
    if (confirmId !== quizId) { setConfirmId(quizId); return }
    setConfirmId(null)
    setDeletingIds((prev) => new Set(prev).add(quizId))
    const snapshot = items
    setItems((prev) => prev.filter((i) => i.quizId !== quizId))
    try {
      await deleteHistoryItem(quizId)
    } catch {
      setItems(snapshot)
    } finally {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(quizId); return next })
    }
  }

  async function handleClearAll() {
    setClearConfirm(false); setClearing(true)
    const snapshot = items; setItems([])
    try { await clearAllHistory() } catch { setItems(snapshot) } finally { setClearing(false) }
  }

  const CARD: React.CSSProperties = {
    background: '#fff',
    border: '1px solid rgba(12,16,36,.07)',
    borderRadius: 20,
    padding: '20px 22px',
  }

  return (
    <div className="flex min-h-svh flex-col" style={{ background: '#f6f6fb' }} onClick={() => setConfirmId(null)}>
      {/* Header */}
      <header className="sticky top-0 z-10" style={{ background: 'rgba(246,246,251,.8)', backdropFilter: 'saturate(160%) blur(14px)', WebkitBackdropFilter: 'saturate(160%) blur(14px)', borderBottom: '1px solid rgba(12,16,36,.05)' }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/app')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid rgba(12,16,36,.08)', borderRadius: 10, padding: '8px 14px', font: `600 13px/1 ${FM}`, color: '#4b5170', cursor: 'pointer' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Início
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ font: `700 24px/1.2 ${FG}`, color: '#0C1024', margin: 0 }}>
              Seu <span style={{ color: '#3B39E8' }}>Histórico</span>
            </h2>
            <p style={{ font: `400 14px/1 ${FM}`, color: '#9aa0bb', marginTop: 6 }}>Acompanhe sua evolução nos quizzes</p>
          </div>
          {items.length > 0 && (
            <div style={{ flexShrink: 0 }}>
              {clearConfirm ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  <span style={{ font: `400 12px/1 ${FM}`, color: '#9aa0bb' }}>Apagar tudo?</span>
                  <button onClick={handleClearAll} disabled={clearing} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', font: `600 12px/1 ${FM}`, cursor: 'pointer', opacity: clearing ? 0.6 : 1 }}>Confirmar</button>
                  <button onClick={() => setClearConfirm(false)} style={{ background: '#fff', color: '#4b5170', border: '1px solid rgba(12,16,36,.08)', borderRadius: 8, padding: '8px 12px', font: `600 12px/1 ${FM}`, cursor: 'pointer' }}>Cancelar</button>
                </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); setClearConfirm(true) }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid rgba(12,16,36,.08)', borderRadius: 10, padding: '8px 12px', font: `500 12px/1 ${FM}`, color: '#9aa0bb', cursor: 'pointer' }}>
                  <Trash2 className="h-3.5 w-3.5" /> Limpar tudo
                </button>
              )}
            </div>
          )}
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#3B39E8', borderTopColor: 'transparent' }} />
          </div>
        )}

        {error && (
          <div style={{ borderRadius: 14, border: '1px solid rgba(239,68,68,.2)', background: 'rgba(239,68,68,.05)', padding: '12px 16px', font: `400 13px/1 ${FM}`, color: '#EF4444' }}>
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '64px 0', textAlign: 'center' }}>
            <p style={{ font: `400 14px/1 ${FM}`, color: '#9aa0bb' }}>Você ainda não completou nenhum quiz.</p>
            <button onClick={() => navigate('/app')} style={{ background: '#3B39E8', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 22px', font: `600 14px/1 ${FM}`, cursor: 'pointer' }}>
              Fazer primeiro quiz
            </button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Quizzes feitos', value: String(items.length), color: '#0C1024' },
                { label: 'Média geral', value: `${avgPct}%`, color: pctHex(avgPct) },
                { label: 'Último quiz', value: `${items[0].pct}%`, color: pctHex(items[0].pct) },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ ...CARD, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ font: `800 24px/1 ${FG}`, color }}>{value}</span>
                  <span style={{ font: `400 11px/1 ${FM}`, color: '#9aa0bb' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Chart 1 — Score evolution */}
            <div style={CARD}>
              <p style={{ font: `600 13px/1 ${FG}`, color: '#0C1024', marginBottom: 16 }}>Sua evolução</p>
              {lineData.length < 2 ? (
                <p style={{ padding: '24px 0', textAlign: 'center', font: `400 12px/1 ${FM}`, color: '#9aa0bb' }}>
                  Complete pelo menos 2 quizzes para ver sua evolução.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={lineData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B39E8" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#3B39E8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(12,16,36,.06)" />
                    <XAxis dataKey="date" tick={{ fill: '#9aa0bb', fontSize: 11, fontFamily: FM }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#9aa0bb', fontSize: 11, fontFamily: FM }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<ScoreTooltip />} />
                    <ReferenceLine y={70} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Meta 70%', fill: '#F59E0B', fontSize: 10, position: 'right' }} />
                    <Area type="monotone" dataKey="score" stroke="#3B39E8" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: '#3B39E8', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Charts 2+3 */}
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: domainData.length > 0 ? '1fr' : '1fr' }}>
              <div style={{ display: 'grid', gap: 16 }} className="md:grid-cols-3">
                {domainData.length > 0 && (
                  <div style={{ ...CARD, gridColumn: 'span 2' }} className="md:col-span-2">
                    <p style={{ font: `600 13px/1 ${FG}`, color: '#0C1024', marginBottom: 16 }}>Desempenho por domínio</p>
                    <ResponsiveContainer width="100%" height={Math.max(160, domainData.length * 36)}>
                      <BarChart data={domainData} layout="vertical" margin={{ top: 0, right: 44, left: 0, bottom: 0 }}>
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9aa0bb', fontSize: 10, fontFamily: FM }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                        <YAxis type="category" dataKey="domain" width={110} tick={{ fill: '#9aa0bb', fontSize: 10, fontFamily: FM }} axisLine={false} tickLine={false} />
                        <Tooltip content={<DomainTooltip />} />
                        <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={14}>
                          {domainData.map((entry) => (
                            <Cell key={entry.domain} fill={barFill(entry.pct)} />
                          ))}
                          <LabelList dataKey="pct" position="right" formatter={(v: unknown) => `${v}%`} style={{ fill: '#9aa0bb', fontSize: 10, fontFamily: FM }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div style={CARD}>
                  <p style={{ font: `600 13px/1 ${FG}`, color: '#0C1024', marginBottom: 14 }}>Por dificuldade</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {diffStats.map(({ label, color, bg, border, count, avg }) => (
                      <div key={label} style={{ borderRadius: 12, border: `1px solid ${border}`, background: bg, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ font: `600 12px/1 ${FM}`, color }}>{label}</span>
                          <span style={{ font: `400 11px/1 ${FM}`, color: '#9aa0bb' }}>{count} {count === 1 ? 'quiz' : 'quizzes'}</span>
                        </div>
                        {count > 0
                          ? <p style={{ font: `800 20px/1 ${FG}`, color }}>{avg}%</p>
                          : <p style={{ font: `400 11px/1 ${FM}`, color: '#9aa0bb' }}>Nenhum quiz ainda</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cert filter chips */}
            {availableCerts.length > 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[null, ...availableCerts].map((cert) => (
                  <button
                    key={cert ?? '__all'}
                    onClick={() => setCertFilter(cert)}
                    style={{
                      borderRadius: 100, padding: '6px 14px', font: `600 12px/1 ${FM}`, cursor: 'pointer',
                      border: certFilter === cert ? '1px solid #3B39E8' : '1px solid rgba(12,16,36,.08)',
                      background: certFilter === cert ? 'rgba(59,57,232,.08)' : '#fff',
                      color: certFilter === cert ? '#3B39E8' : '#9aa0bb',
                    }}
                  >
                    {cert ?? 'Todas'}
                  </button>
                ))}
              </div>
            )}

            {/* Quiz list */}
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredItems.map((item) => {
                const isConfirming = confirmId === item.quizId
                const isDeleting = deletingIds.has(item.quizId)
                return (
                  <li
                    key={item.quizId}
                    style={{
                      background: isConfirming ? 'rgba(239,68,68,.04)' : '#fff',
                      border: isConfirming ? '1px solid rgba(239,68,68,.3)' : '1px solid rgba(12,16,36,.07)',
                      borderRadius: 16, padding: '16px 18px',
                      display: 'flex', flexDirection: 'column', gap: 12,
                      opacity: isDeleting ? 0.4 : 1,
                      pointerEvents: isDeleting ? 'none' : undefined,
                      transition: 'opacity .2s, border-color .15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ font: `400 11px/1 ${FM}`, color: '#9aa0bb' }}>{formatDate(item.date)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                        <span style={{ borderRadius: 100, border: '1px solid rgba(12,16,36,.08)', padding: '4px 10px', font: `500 11px/1 ${FM}`, color: '#9aa0bb' }}>
                          {item.difficulty}
                        </span>
                        {isConfirming ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertTriangle className="h-3.5 w-3.5" style={{ color: '#EF4444', flexShrink: 0 }} />
                            <button onClick={() => handleDelete(item.quizId)} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', font: `600 11px/1 ${FM}`, cursor: 'pointer' }}>Apagar</button>
                            <button onClick={() => setConfirmId(null)} style={{ background: '#fff', color: '#4b5170', border: '1px solid rgba(12,16,36,.08)', borderRadius: 8, padding: '6px 10px', font: `500 11px/1 ${FM}`, cursor: 'pointer' }}>Não</button>
                          </div>
                        ) : (
                          <button onClick={() => handleDelete(item.quizId)} title="Apagar este quiz" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#9aa0bb' }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ font: `700 18px/1 ${FG}`, color: pctHex(item.pct), minWidth: 40, fontVariantNumeric: 'tabular-nums' }}>
                        {item.score}/{item.total}
                      </span>
                      <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'rgba(12,16,36,.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: pctHex(item.pct), width: `${item.pct}%`, transition: 'width .5s' }} />
                      </div>
                      <span style={{ font: `700 13px/1 ${FG}`, color: pctHex(item.pct), minWidth: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {item.pct}%
                      </span>
                    </div>

                    {Object.keys(item.domains).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {Object.entries(item.domains).map(([d, v]) => (
                          <span key={d} style={{ borderRadius: 8, border: '1px solid rgba(12,16,36,.07)', background: 'rgba(12,16,36,.03)', padding: '3px 8px', font: `400 11px/1 ${FM}`, color: '#9aa0bb' }}>
                            {toTitleCase(d)}: {v.correct}/{v.total}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}
