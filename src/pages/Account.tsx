import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, AlertTriangle, User, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { deleteAccount } from '../services/api'

const CONFIRM_WORD = 'DELETAR'

export function Account() {
  const navigate = useNavigate()
  const email = useAuthStore((s) => s.email)
  const signOut = useAuthStore((s) => s.signOut)

  const [showModal, setShowModal] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (input !== CONFIRM_WORD) return
    setLoading(true)
    setError(null)
    try {
      await deleteAccount()
      await signOut()
      navigate('/', { replace: true })
    } catch {
      setError('Não foi possível excluir a conta. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-[8px]"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-foreground font-sans">Configurações da conta</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Account info */}
        <section className="bg-card border border-border rounded-[16px] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="h-10 w-10 rounded-[12px] flex items-center justify-center text-white text-sm font-bold font-sans flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3B39E8 0%, #2D2BC5 100%)' }}
            >
              {(email ?? 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{email}</p>
              <p className="text-xs text-muted-foreground">Conta ativa</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-muted/50 rounded-[10px] px-3.5 py-3">
            <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Seus dados estão protegidos e nunca serão compartilhados com terceiros.
            </p>
          </div>
        </section>

        {/* Privacy */}
        <section className="bg-card border border-border rounded-[16px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Privacidade e dados</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Conforme a LGPD (Lei 13.709/2018), você tem o direito de solicitar a exclusão de todos os seus dados pessoais armazenados pela Certara.
          </p>
          <a
            href="/privacidade"
            className="text-xs text-primary hover:underline font-medium"
          >
            Ver Política de Privacidade →
          </a>
        </section>

        {/* Danger zone */}
        <section className="bg-card border border-danger/30 rounded-[16px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-danger" />
            <h2 className="text-sm font-bold text-danger">Zona de perigo</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Ao excluir sua conta, todos os seus dados serão permanentemente apagados — histórico de quizzes, progresso, assinatura e informações pessoais. Esta ação é <strong className="text-foreground">irreversível</strong>.
          </p>
          <button
            onClick={() => { setShowModal(true); setInput(''); setError(null) }}
            className="inline-flex items-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 text-sm font-semibold px-4 py-2.5 rounded-[10px] transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Excluir minha conta
          </button>
        </section>
      </main>

      {/* Confirmation modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget && !loading) setShowModal(false) }}
        >
          <div className="bg-card border border-border rounded-[20px] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-[10px] bg-danger/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-4.5 w-4.5 text-danger" />
              </div>
              <h3 className="text-base font-bold text-foreground">Confirmar exclusão</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-1">
              Para confirmar, digite <strong className="text-foreground font-mono">{CONFIRM_WORD}</strong> no campo abaixo:
            </p>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={CONFIRM_WORD}
              disabled={loading}
              className="w-full mt-3 mb-4 px-3.5 py-2.5 rounded-[10px] border border-border bg-background text-sm font-mono
                text-foreground placeholder-muted-foreground/50
                focus:outline-none focus:ring-2 focus:ring-danger/40 focus:border-danger/60
                disabled:opacity-50 transition"
              autoFocus
            />

            {error && (
              <p className="text-xs text-danger mb-3">{error}</p>
            )}

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-[10px] border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={input !== CONFIRM_WORD || loading}
                className="flex-1 py-2.5 rounded-[10px] bg-danger text-white text-sm font-bold transition-colors
                  hover:bg-danger/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Excluir conta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
