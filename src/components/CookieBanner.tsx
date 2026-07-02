import { useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'certara_cookies'

export function CookieBanner() {
  const [visible, setVisible] = useState(() => localStorage.getItem(STORAGE_KEY) === null)

  if (!visible) return null

  function accept(value: 'accepted' | 'essential') {
    localStorage.setItem(STORAGE_KEY, value)
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Usamos cookies para melhorar sua experiência e analisar o uso da plataforma. Ao
          continuar, você concorda com nossa{' '}
          <Link to="/privacidade" className="text-primary hover:underline font-medium">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex flex-shrink-0 gap-2">
          <button
            onClick={() => accept('essential')}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            Apenas essenciais
          </button>
          <button
            onClick={() => accept('accepted')}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  )
}
