import { useEffect, useRef, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuizHistoryItem } from '../types/quiz'

interface AppNotification {
  id: string
  type: 'streak' | 'inactivity' | 'weak_domain' | 'milestone'
  message: string
  read: boolean
  dismissed: boolean
  createdAt: string
}

const STORAGE_KEY = 'certara_notifications'
const MILESTONES = [5, 10, 25, 50, 100]

function loadNotifications(): AppNotification[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveNotifications(ns: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ns))
}

function todayStr() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function toTitleCase(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function weakestDomain(items: QuizHistoryItem[]): string | null {
  const agg: Record<string, { correct: number; total: number }> = {}
  items.forEach((item) =>
    Object.entries(item.domains).forEach(([d, stats]) => {
      if (!agg[d]) agg[d] = { correct: 0, total: 0 }
      agg[d].correct += stats.correct
      agg[d].total += stats.total
    }),
  )
  const entries = Object.entries(agg).filter(([, s]) => s.total > 0)
  if (!entries.length) return null
  return toTitleCase(
    entries.reduce((w, c) => (c[1].correct / c[1].total < w[1].correct / w[1].total ? c : w))[0],
  )
}

export function seedNotifications(history: QuizHistoryItem[], streak: number) {
  const today = todayStr()
  const existing = loadNotifications()
  const todayTypes = new Set(
    existing.filter((n) => n.createdAt.startsWith(today)).map((n) => n.type),
  )
  const notifiedMilestoneMessages = new Set(
    existing.filter((n) => n.type === 'milestone').map((n) => n.message),
  )

  const newOnes: AppNotification[] = []

  if (streak > 1 && !todayTypes.has('streak')) {
    newOnes.push({
      id: `streak-${today}`,
      type: 'streak',
      message: `Você está há ${streak} dias em sequência! Continue assim! 🔥`,
      read: false,
      dismissed: false,
      createdAt: new Date().toISOString(),
    })
  }

  if (streak === 0 && history.length > 0 && !todayTypes.has('inactivity')) {
    const dates = history.map((i) => i.date.slice(0, 10)).sort().reverse()
    const daysDiff = Math.floor(
      (Date.now() - new Date(`${dates[0]}T12:00:00`).getTime()) / 86400000,
    )
    if (daysDiff >= 2) {
      newOnes.push({
        id: `inactivity-${today}`,
        type: 'inactivity',
        message: `Faz ${daysDiff} ${daysDiff === 1 ? 'dia' : 'dias'} que você não estuda. Que tal um quiz rápido?`,
        read: false,
        dismissed: false,
        createdAt: new Date().toISOString(),
      })
    }
  }

  if (!todayTypes.has('weak_domain')) {
    const weak = weakestDomain(history)
    if (weak) {
      newOnes.push({
        id: `weak_domain-${today}`,
        type: 'weak_domain',
        message: `Seu domínio mais fraco é "${weak}". Foque nele hoje para melhorar!`,
        read: false,
        dismissed: false,
        createdAt: new Date().toISOString(),
      })
    }
  }

  for (const m of MILESTONES) {
    if (history.length >= m) {
      const msg = `Parabéns! Você completou ${m} quizzes! 🎉`
      if (!notifiedMilestoneMessages.has(msg)) {
        newOnes.push({
          id: `milestone-${m}`,
          type: 'milestone',
          message: msg,
          read: false,
          dismissed: false,
          createdAt: new Date().toISOString(),
        })
      }
    }
  }

  if (newOnes.length > 0) {
    saveNotifications([...newOnes, ...existing])
  }
}

const TYPE_ICON: Record<AppNotification['type'], string> = {
  streak: '🔥',
  inactivity: '📚',
  weak_domain: '⚠️',
  milestone: '🏆',
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  function refresh() {
    setNotifications(loadNotifications().filter((n) => !n.dismissed))
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function markRead(id: string) {
    saveNotifications(loadNotifications().map((n) => (n.id === id ? { ...n, read: true } : n)))
    refresh()
  }

  function dismiss(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    saveNotifications(loadNotifications().map((n) => (n.id === id ? { ...n, dismissed: true } : n)))
    refresh()
  }

  function markAllRead() {
    saveNotifications(loadNotifications().map((n) => ({ ...n, read: true })))
    refresh()
  }

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => {
          setOpen((o) => !o)
          refresh()
        }}
        aria-label="Abrir notificações"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold leading-none text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-sans text-sm font-semibold text-foreground">Notificações</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                      !n.read && 'bg-primary/5',
                    )}
                  >
                    <span className="mt-0.5 flex-shrink-0 text-base leading-none">
                      {TYPE_ICON[n.type]}
                    </span>
                    <p className="flex-1 text-xs leading-relaxed text-foreground">{n.message}</p>
                    <button
                      onClick={(e) => dismiss(e, n.id)}
                      className="flex-shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
