import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notificações do sistema"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const TYPE_CONFIG: Record<
  ToastType,
  { Icon: typeof CheckCircle; color: string; bg: string; border: string; text: string }
> = {
  success: {
    Icon: CheckCircle,
    color: '#22C55E',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    text: '#166534',
  },
  error: {
    Icon: AlertCircle,
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#991B1B',
  },
  warning: {
    Icon: AlertTriangle,
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
  },
  info: {
    Icon: Info,
    color: '#3B39E8',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    text: '#312E81',
  },
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: () => void
}) {
  const { Icon, color, bg, border, text } = TYPE_CONFIG[toast.type]
  return (
    <div
      className="pointer-events-auto flex min-w-[280px] max-w-sm animate-toast-in items-start gap-3 rounded-xl border px-4 py-3 shadow-lg"
      style={{ background: bg, borderColor: border, color: text }}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color }} />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 opacity-60 transition-opacity hover:opacity-100"
        style={{ color: text }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
