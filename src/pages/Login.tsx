import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Check, AlertCircle, Loader2, Eye, EyeOff,
  Sparkles, MessageSquareText, Route,
  Mail, Lock, LockKeyhole, User,
  CheckCircle2, LogIn, UserPlus, ShieldCheck,
} from 'lucide-react'
import { register, confirmEmail, login, loginWithGoogle, resendCode } from '../services/auth'
import { useAuthStore } from '../store/authStore'
import { FloatingHex } from '../components/FloatingHex'
import { useParallax } from '../hooks/useParallax'
import { trackEvent } from '../services/analytics'
import { cn } from '@/lib/utils'
import '../styles/login3d.css'

type Mode = 'login' | 'register' | 'confirm'

const BULLETS = [
  { Icon: Sparkles,         text: 'Questões AWS geradas por IA em tempo real' },
  { Icon: MessageSquareText,text: 'Feedback detalhado em cada resposta' },
  { Icon: Route,            text: 'Plano de estudos adaptado ao seu nível' },
]

const AVATARS = [
  { initials: 'AM', bg: 'from-primary to-primary-700' },
  { initials: 'JS', bg: 'from-accent to-accent-700' },
  { initials: 'RK', bg: 'from-warning to-orange-600' },
]

// ── Password strength ─────────────────────────────────────────────────────────

function calcStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(s, 4) as 0 | 1 | 2 | 3 | 4
}

const STRENGTH_COLORS = ['', '#EF4444', '#F59E0B', '#EAB308', '#16A34A']
const STRENGTH_LABELS = ['', 'Fraca', 'Razoável', 'Boa', 'Forte']

// ── Input shell ───────────────────────────────────────────────────────────────

function InputShell({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="relative flex items-center">
      <Icon className="pointer-events-none absolute left-3.5 z-10 h-[18px] w-[18px] text-[#A0A8C0]" />
      {children}
    </div>
  )
}

// ── Checkbox ──────────────────────────────────────────────────────────────────

function Checkbox({ checked, onToggle, children }: {
  checked: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div
      onClick={onToggle}
      className="flex cursor-pointer select-none items-center gap-[9px] text-[13px] text-[#6B6780] mb-5"
    >
      <span className={cn(
        'flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-md border-[1.5px] transition',
        checked ? 'bg-primary border-primary' : 'border-[#E2E8FF] bg-[#F7F8FF]',
      )}>
        <Check className={cn('h-[13px] w-[13px] text-white transition', checked ? 'opacity-100' : 'opacity-0')} />
      </span>
      {children}
    </div>
  )
}

// ── Google SSO icon ───────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/>
    </svg>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function Login() {
  const navigate  = useNavigate()
  const setEmail  = useAuthStore((s) => s.setEmail)
  const sideRef   = useRef<HTMLDivElement>(null)
  const stageRef  = useRef<HTMLDivElement>(null)
  useParallax(sideRef, stageRef)

  const [mode, setMode]                       = useState<Mode>('login')
  const [name, setName]                       = useState('')
  const [email, setEmailInput]                = useState('')
  const [password, setPassword]               = useState('')
  const [confirm, setConfirm]                 = useState('')
  const [code, setCode]                       = useState('')
  const [error, setError]                     = useState('')
  const [loading, setLoading]                 = useState(false)
  const [showPass, setShowPass]               = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [acceptedTerms, setAcceptedTerms]     = useState(false)
  const [remember, setRemember]               = useState(true)
  const [socialMsg, setSocialMsg]             = useState('')

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

  async function handleSocial() {
    try {
      await loginWithGoogle()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[Google Login]', msg)
      setSocialMsg(msg || 'Erro ao iniciar login com Google.')
      setTimeout(() => setSocialMsg(''), 8000)
    }
  }

  function switchMode(m: Mode) { setMode(m); setError(''); setSocialMsg('') }

  const sc      = calcStrength(password)
  const matches = mode === 'register' && confirm.length > 0 && password === confirm

  return (
    <div className="flex min-h-svh">

      {/* ── Left panel — 3D scene ─────────────────────────────────── */}
      <div
        ref={sideRef}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(150deg, #0F0E2E 0%, #2D2BC5 55%, #3B39E8 100%)' }}
      >
        {/* Grid bg + glows */}
        <div className="login-gridbg" />
        <div className="absolute -right-[120px] -top-[100px] w-[360px] h-[360px] rounded-full blur-[80px]
          bg-[radial-gradient(circle,rgba(255,255,255,.15),transparent_70%)] pointer-events-none" />
        <div className="absolute right-[40px] -bottom-[160px] w-[320px] h-[320px] rounded-full blur-[80px]
          bg-[radial-gradient(circle,rgba(13,148,136,.4),transparent_70%)] pointer-events-none" />

        {/* 3D floating hexes */}
        <div className="scene">
          <div className="stage" ref={stageRef}>
            <FloatingHex id="f1" size="big"  variant="saa" label="SAA" />
            <FloatingHex id="f2" size="mid"  variant="clf" label="CLF" />
            <FloatingHex id="f3" size="sm"   variant="dva" label="DVA" />
            <FloatingHex id="f4" size="tiny" variant="vio" />
            <div className="orb o1" />
            <div className="orb o2" />
          </div>
        </div>

        {/* Content above the scene */}
        <div className="relative z-[2] flex flex-1 flex-col justify-between p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6.5A8 8 0 1 0 20 12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M9 12l2.2 2.2L18 7.5" stroke="#BBBDFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-sans text-[21px] font-extrabold tracking-tight text-white">Certara</span>
          </div>

          {/* Headline + bullets */}
          <div className="max-w-[460px]">
            <h2 className="font-sans text-[38px] leading-[1.1] font-extrabold text-white">
              Estude com inteligência.<br />Certifique-se com confiança.
            </h2>
            <p className="mt-4 mb-8 text-base leading-relaxed text-white/70 max-w-[420px]">
              Questões geradas por IA, feedback personalizado em cada resposta e um plano de estudos sob medida.
            </p>
            <div className="flex flex-col gap-4">
              {BULLETS.map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-[15px] font-medium text-white/85">
                  <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-white/15 border border-white/20">
                    <Icon className="h-[15px] w-[15px] text-white" />
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex">
              {AVATARS.map(({ initials, bg }, i) => (
                <span
                  key={initials}
                  style={{ marginLeft: i ? -9 : 0 }}
                  className={cn(
                    'flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-primary-800',
                    'text-[11px] font-bold text-white bg-gradient-to-br',
                    bg,
                  )}
                >
                  {initials}
                </span>
              ))}
              <span
                style={{ marginLeft: -9 }}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-primary-800 bg-gradient-to-br from-blue-500 to-blue-700 text-[11px] font-bold text-white"
              >
                +
              </span>
            </div>
            <div className="text-[13px] text-white/80 leading-tight">
              <span className="text-yellow-300 text-xs tracking-wide">★★★★★</span><br />
              <strong className="font-bold text-white">+2.400 aprovados</strong> estudaram no Certara este ano
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────── */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-10 lg:w-1/2">

        {/* Mobile logo */}
        <div className="mb-6 lg:hidden flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6.5A8 8 0 1 0 20 12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M9 12l2.2 2.2L18 7.5" stroke="#BBBDFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-sans text-xl font-extrabold text-foreground">Certara</span>
        </div>

        <div className="w-full max-w-[392px]">

          {/* Title */}
          {mode !== 'confirm' && (
            <div className="mb-6">
              <h1 className="font-sans text-[27px] font-extrabold text-[#1A1626]">
                {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </h1>
              <p className="mt-1.5 text-[14.5px] text-[#6B6780]">
                {mode === 'login'
                  ? 'Acesse sua conta e continue de onde parou.'
                  : 'Comece a estudar com IA em menos de um minuto.'}
              </p>
            </div>
          )}

          {/* Tab toggle */}
          {mode !== 'confirm' && (
            <div className="flex gap-[3px] rounded-xl border border-[#E8E8FF] bg-[#F4F3FB] p-1 mb-6">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={cn(
                    'flex-1 rounded-[9px] py-2.5 font-sans text-sm font-bold transition',
                    mode === m
                      ? 'bg-primary text-white shadow-[0_4px_12px_-4px_rgba(59,57,232,.5)]'
                      : 'text-[#6B6780] hover:text-[#1A1626]',
                  )}
                >
                  {m === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>
          )}

          {/* Google SSO */}
          {mode !== 'confirm' && (
            <button
              type="button"
              onClick={handleSocial}
              className="mb-1 flex w-full items-center justify-center gap-2.5 rounded-[11px] border border-[#E4E1F2] bg-white py-[11px] text-[13.5px] font-semibold text-[#1A1626] hover:bg-[#F7F6FD] hover:border-[#C4C0E8] transition"
            >
              <GoogleIcon /> Continuar com Google
            </button>
          )}
          {socialMsg && (
            <p className="mb-3 text-center text-xs text-[#9B98AD]">{socialMsg}</p>
          )}

          {/* Divider */}
          {mode !== 'confirm' && (
            <div className="my-5 flex items-center gap-3 text-[11px] font-bold tracking-widest text-[#9B98AD] uppercase">
              <div className="flex-1 h-px bg-[#EBE9F5]" />
              ou com e-mail
              <div className="flex-1 h-px bg-[#EBE9F5]" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              role="alert" aria-live="assertive"
              className={cn(
                'mb-4 flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-sm border',
                error.includes('enviado')
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200',
              )}
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          {/* ── Login form ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-[17px]">
              <div>
                <label className="mb-2 block text-[11.5px] font-bold uppercase tracking-wider text-[#6B6780]">
                  E-mail
                </label>
                <InputShell icon={Mail}>
                  <input
                    type="email" value={email}
                    onChange={e => setEmailInput(e.target.value)}
                    required autoFocus placeholder="voce@email.com"
                    className="cinp"
                  />
                </InputShell>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[11.5px] font-bold uppercase tracking-wider text-[#6B6780]">Senha</label>
                  <button type="button" className="text-[12.5px] font-semibold text-primary hover:underline">
                    Esqueci a senha
                  </button>
                </div>
                <InputShell icon={Lock}>
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    required placeholder="••••••••"
                    className="cinp"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="ceye"
                    aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}>
                    {showPass ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </InputShell>
              </div>

              <Checkbox checked={remember} onToggle={() => setRemember(v => !v)}>
                Manter conectado neste dispositivo
              </Checkbox>

              <button
                type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-sans text-[15px] font-bold text-white transition hover:-translate-y-px disabled:opacity-40 disabled:transform-none bg-[linear-gradient(135deg,#3B39E8,#2D2BC5)] shadow-[0_10px_24px_-8px_rgba(59,57,232,.5)]"
              >
                {loading
                  ? <><Loader2 className="h-[18px] w-[18px] animate-spin" /> Entrando…</>
                  : <><LogIn className="h-[18px] w-[18px]" /> Entrar na conta</>}
              </button>
            </form>
          )}

          {/* ── Register form ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-[17px]">
              <div>
                <label className="mb-2 block text-[11.5px] font-bold uppercase tracking-wider text-[#6B6780]">
                  Nome completo
                </label>
                <InputShell icon={User}>
                  <input
                    type="text" value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus placeholder="Seu nome"
                    className="cinp"
                  />
                </InputShell>
              </div>

              <div>
                <label className="mb-2 block text-[11.5px] font-bold uppercase tracking-wider text-[#6B6780]">
                  E-mail
                </label>
                <InputShell icon={Mail}>
                  <input
                    type="email" value={email}
                    onChange={e => setEmailInput(e.target.value)}
                    required placeholder="voce@email.com"
                    className="cinp"
                  />
                </InputShell>
              </div>

              <div>
                <label className="mb-2 block text-[11.5px] font-bold uppercase tracking-wider text-[#6B6780]">
                  Senha (mín. 8 caracteres)
                </label>
                <InputShell icon={Lock}>
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    required minLength={8} placeholder="••••••••"
                    className="cinp"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="ceye"
                    aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}>
                    {showPass ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </InputShell>
                {/* Strength bar */}
                {password && (
                  <>
                    <div className="mt-2.5 flex gap-[5px]">
                      {[1, 2, 3, 4].map(n => (
                        <span key={n} className="h-1 flex-1 rounded-[3px] transition-all"
                          style={{ background: n <= sc ? STRENGTH_COLORS[sc] : '#E4E1F2' }} />
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11.5px] font-semibold" style={{ color: STRENGTH_COLORS[sc] }}>
                      Força da senha: {STRENGTH_LABELS[sc]}
                    </p>
                  </>
                )}
                {!password && (
                  <p className="mt-1.5 text-[11.5px] text-[#9B98AD]">Use letras, números e símbolos</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-[11.5px] font-bold uppercase tracking-wider text-[#6B6780]">
                  Confirmar senha
                </label>
                <InputShell icon={LockKeyhole}>
                  <input
                    type={showConfirmPass ? 'text' : 'password'} value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required minLength={8} placeholder="••••••••"
                    className="cinp"
                  />
                  <button type="button" onClick={() => setShowConfirmPass(v => !v)} className="ceye"
                    aria-label={showConfirmPass ? 'Ocultar' : 'Mostrar'}>
                    {showConfirmPass ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </InputShell>
                {matches && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-green-600">
                    <CheckCircle2 className="h-[13px] w-[13px]" /> As senhas conferem
                  </div>
                )}
              </div>

              <Checkbox checked={acceptedTerms} onToggle={() => setAcceptedTerms(v => !v)}>
                Li e aceito os{' '}
                <Link to="/termos" className="font-semibold text-primary hover:underline" onClick={e => e.stopPropagation()}>
                  Termos
                </Link>
                {' '}e a{' '}
                <Link to="/privacidade" className="font-semibold text-primary hover:underline" onClick={e => e.stopPropagation()}>
                  Política de Privacidade
                </Link>
              </Checkbox>

              <button
                type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-sans text-[15px] font-bold text-white transition hover:-translate-y-px disabled:opacity-40 disabled:transform-none bg-[linear-gradient(135deg,#3B39E8,#2D2BC5)] shadow-[0_10px_24px_-8px_rgba(59,57,232,.5)]"
              >
                {loading
                  ? <><Loader2 className="h-[18px] w-[18px] animate-spin" /> Criando conta…</>
                  : <><UserPlus className="h-[18px] w-[18px]" /> Criar conta</>}
              </button>
            </form>
          )}

          {/* ── Confirm form ── */}
          {mode === 'confirm' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-sans text-xl font-extrabold text-[#1A1626]">Verifique seu e-mail</h2>
                <p className="text-sm text-[#6B6780]">
                  Enviamos um código para <strong className="text-[#1A1626]">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleConfirm} className="space-y-4">
                <div>
                  <label className="mb-2 block text-[11.5px] font-bold uppercase tracking-wider text-[#6B6780]">
                    Código de verificação
                  </label>
                  <input
                    type="text" value={code}
                    onChange={e => setCode(e.target.value)}
                    required autoFocus inputMode="numeric" maxLength={6}
                    className="cinp text-center text-xl tracking-[0.5em] font-bold !pl-4"
                    placeholder="000000"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-sans text-[15px] font-bold text-white transition hover:-translate-y-px disabled:opacity-40 bg-[linear-gradient(135deg,#3B39E8,#2D2BC5)] shadow-[0_10px_24px_-8px_rgba(59,57,232,.5)]"
                >
                  {loading
                    ? <><Loader2 className="h-[18px] w-[18px] animate-spin" /> Verificando…</>
                    : 'Confirmar e-mail'}
                </button>
                <button type="button" onClick={handleResend} className="w-full text-sm font-semibold text-primary hover:underline">
                  Reenviar código
                </button>
              </form>
            </div>
          )}

          {/* Security + legal */}
          {mode !== 'confirm' && (
            <>
              <div className="mt-5 flex items-center justify-center gap-[7px] text-xs text-[#9B98AD] font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Login protegido por AWS Cognito
              </div>
              <p className="mt-4 text-center text-xs leading-relaxed text-[#9B98AD]">
                Ao continuar, você concorda com os{' '}
                <Link to="/termos" className="font-semibold text-[#6B6780] hover:text-primary">Termos</Link>
                {' '}e a{' '}
                <Link to="/privacidade" className="font-semibold text-[#6B6780] hover:text-primary">Política de Privacidade</Link>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
