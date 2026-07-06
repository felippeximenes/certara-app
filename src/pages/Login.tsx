import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Check, AlertCircle, Loader2, Eye, EyeOff,
  User, Mail, Lock, Shield, ArrowRight,
} from 'lucide-react'
import { register, confirmEmail, login, resendCode } from '../services/auth'
import { useAuthStore } from '../store/authStore'
import { Logo } from '../components/Logo'
import { trackEvent } from '../services/analytics'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'register' | 'confirm'

const BULLETS = [
  'Questões de certificações AWS com IA',
  'Feedback detalhado em cada resposta',
  'Plano de estudos personalizado',
]

const AVATARS = [
  { initials: 'AM', bg: '#3B39E8' },
  { initials: 'JS', bg: '#22C55E' },
  { initials: 'RK', bg: '#F59E0B' },
]

// ── Password strength ─────────────────────────────────────────────────────────

function calcStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4
}

const STRENGTH_LABEL = ['', 'Fraca', 'Razoável', 'Boa', 'Forte']
const STRENGTH_COLOR = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E']

function PasswordBar({ pw }: { pw: string }) {
  const s = calcStrength(pw)
  if (!pw) return null
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= s ? STRENGTH_COLOR[s] : '#E2E8F0' }}
          />
        ))}
      </div>
      <p className="text-[11px] font-semibold" style={{ color: STRENGTH_COLOR[s] }}>
        {STRENGTH_LABEL[s]}
      </p>
    </div>
  )
}

// ── Social icons (SVG inline) ─────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}

// ── Input field with left icon ────────────────────────────────────────────────

function InputField({
  icon: Icon, label, children, hint,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {children}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

const inputCls = cn(
  'w-full rounded-[12px] border border-[#E2E8FF] bg-[#F7F8FF] pl-10 pr-4 py-3',
  'text-sm text-foreground placeholder:text-muted-foreground/60',
  'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15',
  'transition-colors duration-150',
)
const passInputCls = cn(inputCls, 'pr-10')

export function Login() {
  const navigate = useNavigate()
  const setEmail = useAuthStore((s) => s.setEmail)

  const [mode, setMode]                     = useState<Mode>('login')
  const [name, setName]                     = useState('')
  const [email, setEmailInput]              = useState('')
  const [password, setPassword]             = useState('')
  const [confirm, setConfirm]               = useState('')
  const [code, setCode]                     = useState('')
  const [error, setError]                   = useState('')
  const [loading, setLoading]               = useState(false)
  const [showPass, setShowPass]             = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [acceptedTerms, setAcceptedTerms]   = useState(false)
  const [socialMsg, setSocialMsg]           = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await login(email, password)
      setEmail(email)
      trackEvent('login', { method: 'email' })
      navigate('/app')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally { setLoading(false) }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (password !== confirm) { setError('As senhas não coincidem'); return }
    if (!acceptedTerms) { setError('Aceite os Termos para continuar'); return }
    setLoading(true)
    try {
      await register(email, password)
      trackEvent('register')
      setMode('confirm')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally { setLoading(false) }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await confirmEmail(email, code)
      await login(email, password)
      setEmail(email)
      navigate('/app')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Código inválido')
    } finally { setLoading(false) }
  }

  async function handleResend() {
    try {
      await resendCode(email)
      setError('Novo código enviado para o seu e-mail.')
    } catch { setError('Não foi possível reenviar o código.') }
  }

  function handleSocial(provider: string) {
    setSocialMsg(`Login com ${provider} em breve.`)
    setTimeout(() => setSocialMsg(''), 3000)
  }

  const switchMode = (m: Mode) => { setMode(m); setError(''); setSocialMsg('') }

  return (
    <div className="flex min-h-svh">

      {/* ── Left panel — desktop only ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10"
        style={{ background: 'linear-gradient(135deg, #3B39E8 0%, #0F0E2E 100%)' }}
      >
        <Logo variant="light" size="lg" />
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="font-sans text-3xl font-extrabold leading-tight text-white">
              Estude com inteligência.<br />Certifique-se com confiança.
            </h1>
            <p className="text-base leading-relaxed text-white/70">
              Questões geradas por IA, feedback personalizado e plano de estudos sob medida.
            </p>
          </div>
          <ul className="space-y-3">
            {BULLETS.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E]/20">
                  <Check className="h-3 w-3 text-[#22C55E]" />
                </div>
                <span className="text-sm text-white/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {AVATARS.map(({ initials, bg }) => (
              <div key={initials}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white"
                style={{ backgroundColor: bg }}>
                {initials}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/60">Mais de 500 questões praticadas essa semana</p>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────── */}
      <div className="relative flex w-full flex-col items-center justify-center bg-background px-6 py-10 lg:w-1/2">

        {/* Mobile logo */}
        <div className="mb-6 lg:hidden">
          <Logo size="lg" />
        </div>

        <div className="w-full max-w-sm space-y-5">

          {/* Title */}
          {mode !== 'confirm' && (
            <div className="text-center space-y-1">
              <h2 className="font-sans text-2xl font-extrabold text-foreground">
                {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'login'
                  ? 'Entre na sua conta Certara'
                  : 'Comece a estudar com IA em menos de um minuto.'}
              </p>
            </div>
          )}

          {/* Tab toggle */}
          {mode !== 'confirm' && (
            <div className="relative flex p-1 rounded-full border border-border bg-muted/40 gap-1">
              <div
                className={cn(
                  'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-sm transition-all duration-200',
                  mode === 'login' ? 'left-1' : 'left-[calc(50%+3px)]',
                )}
              />
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={cn(
                    'relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors duration-200',
                    mode === m ? 'text-white' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {m === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>
          )}

          {/* Social buttons */}
          {mode !== 'confirm' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocial('Google')}
                className="flex items-center justify-center gap-2 rounded-[12px] border border-border bg-background py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
              >
                <GoogleIcon /> Google
              </button>
              <button
                type="button"
                onClick={() => handleSocial('GitHub')}
                className="flex items-center justify-center gap-2 rounded-[12px] border border-border bg-background py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
              >
                <GitHubIcon /> GitHub
              </button>
            </div>
          )}

          {/* Social message */}
          {socialMsg && (
            <p className="text-center text-xs text-muted-foreground">{socialMsg}</p>
          )}

          {/* Divider */}
          {mode !== 'confirm' && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                ou com e-mail
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}

          {/* Error / success */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className={cn(
                'flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-sm',
                error.includes('enviado')
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-danger/10 text-danger border border-danger/20',
              )}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Login form ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <InputField icon={Mail} label="E-mail">
                <input
                  type="email" value={email}
                  onChange={e => setEmailInput(e.target.value)}
                  required autoFocus className={inputCls}
                  placeholder="voce@email.com"
                />
              </InputField>

              <InputField icon={Lock} label="Senha">
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required className={cn(passInputCls)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass
                    ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                    : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </InputField>

              <div className="flex justify-end">
                <button type="button" className="text-xs text-primary hover:underline">
                  Esqueci a senha
                </button>
              </div>

              <button
                type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-40 transition-colors"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Entrando…</>
                  : <><ArrowRight className="h-4 w-4" /> Entrar</>}
              </button>
            </form>
          )}

          {/* ── Register form ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <InputField icon={User} label="Nome completo">
                <input
                  type="text" value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus className={inputCls}
                  placeholder="Seu nome"
                />
              </InputField>

              <InputField icon={Mail} label="E-mail">
                <input
                  type="email" value={email}
                  onChange={e => setEmailInput(e.target.value)}
                  required className={inputCls}
                  placeholder="voce@email.com"
                />
              </InputField>

              <InputField icon={Lock} label="Senha (mín. 8 caracteres)" hint="Use letras, números e símbolos">
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required minLength={8} className={passInputCls}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass
                    ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                    : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
                <PasswordBar pw={password} />
              </InputField>

              <InputField icon={Lock} label="Confirmar senha">
                <input
                  type={showConfirmPass ? 'text' : 'password'} value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required minLength={8} className={passInputCls}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(v => !v)}
                  aria-label={showConfirmPass ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPass
                    ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                    : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </InputField>

              {/* Terms checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox" checked={acceptedTerms}
                    onChange={e => setAcceptedTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={cn(
                    'h-4 w-4 rounded-[4px] border-2 flex items-center justify-center transition-colors',
                    acceptedTerms ? 'bg-primary border-primary' : 'bg-background border-border',
                  )}>
                    {acceptedTerms && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                  </div>
                </div>
                <span className="text-[13px] text-muted-foreground leading-snug">
                  Li e aceito os{' '}
                  <Link to="/termos" className="text-primary hover:underline font-semibold">Termos</Link>
                  {' '}e a{' '}
                  <Link to="/privacidade" className="text-primary hover:underline font-semibold">Política de Privacidade</Link>
                </span>
              </label>

              <button
                type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-40 transition-colors"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Criando conta…</>
                  : <><ArrowRight className="h-4 w-4" /> Criar conta</>}
              </button>
            </form>
          )}

          {/* ── Confirm email form ── */}
          {mode === 'confirm' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-sans text-xl font-extrabold text-foreground">Verifique seu e-mail</h2>
                <p className="text-sm text-muted-foreground">
                  Enviamos um código para{' '}
                  <strong className="text-foreground">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleConfirm} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Código de verificação
                  </label>
                  <input
                    type="text" value={code}
                    onChange={e => setCode(e.target.value)}
                    required autoFocus inputMode="numeric" maxLength={6}
                    className={cn(inputCls, 'text-center text-xl tracking-[0.5em] font-bold pl-4')}
                    placeholder="000000"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-40 transition-colors"
                >
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Verificando…</>
                    : <><ArrowRight className="h-4 w-4" /> Confirmar e-mail</>}
                </button>
                <button
                  type="button" onClick={handleResend}
                  className="w-full text-sm text-primary hover:underline"
                >
                  Reenviar código
                </button>
              </form>
            </div>
          )}

          {/* Security badge */}
          {mode !== 'confirm' && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Login protegido por AWS Cognito
            </div>
          )}

          {/* Legal footer */}
          {mode !== 'confirm' && (
            <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
              Ao continuar, você concorda com os{' '}
              <Link to="/termos" className="text-primary hover:underline">Termos</Link>
              {' '}e a{' '}
              <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
