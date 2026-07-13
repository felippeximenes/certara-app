import { lazy, Suspense, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { Quiz } from './pages/Quiz'
import { Result } from './pages/Result'
import { Login } from './pages/Login'
import { Landing } from './pages/Landing'
import { Subscription } from './pages/Subscription'
import { PaymentSuccess } from './pages/PaymentSuccess'
import { Terms } from './pages/Terms'
import { Privacy } from './pages/Privacy'
import { ProtectedRoute } from './components/ProtectedRoute'
import { CookieBanner } from './components/CookieBanner'
import { useAuthStore } from './store/authStore'
import { trackEvent } from './services/analytics'

const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })))
const Simulation = lazy(() => import('./pages/Simulation').then(m => ({ default: m.Simulation })))
const Flashcards = lazy(() => import('./pages/Flashcards').then(m => ({ default: m.Flashcards })))
const StudyPlan = lazy(() => import('./pages/StudyPlan').then(m => ({ default: m.StudyPlan })))

const TITLE_MAP: Record<string, string> = {
  '/': 'Certara',
  '/login': 'Entrar — Certara',
  '/app': 'Início — Certara',
  '/quiz': 'Quiz — Certara',
  '/resultado': 'Resultado — Certara',
  '/historico': 'Histórico — Certara',
  '/assinatura': 'Assinatura — Certara',
  '/pagamento-sucesso': 'Pagamento — Certara',
  '/simulado': 'Simulado — Certara',
  '/flashcards': 'Flashcards — Certara',
  '/plano-de-estudos': 'Plano de Estudos — Certara',
  '/termos': 'Termos de Uso — Certara',
  '/privacidade': 'Política de Privacidade — Certara',
}

function PageFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

function RouteTracker() {
  const location = useLocation()
  useEffect(() => {
    trackEvent('page_view', { page: location.pathname })
    document.title = TITLE_MAP[location.pathname] ?? 'Certara'
  }, [location.pathname])
  return null
}

function OAuthRedirectHandler() {
  const navigate = useNavigate()
  const email   = useAuthStore((s) => s.email)
  const loading = useAuthStore((s) => s.loading)

  // Capture on first render — Amplify wipes ?code=&state= before the effect re-runs
  const isOAuthCallback = useRef(
    (() => {
      const p = new URLSearchParams(window.location.search)
      return p.has('code') && p.has('state')
    })()
  )

  useEffect(() => {
    if (isOAuthCallback.current && !loading) {
      navigate(email ? '/app' : '/login', { replace: true })
    }
  }, [email, loading, navigate])


  return null
}

export function App() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => { init() }, [init])

  return (
    <BrowserRouter>
      <OAuthRedirectHandler />
      <RouteTracker />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/app" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/resultado" element={<ProtectedRoute><Result /></ProtectedRoute>} />
          <Route path="/historico" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/assinatura" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
          <Route path="/pagamento-sucesso" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/simulado" element={<ProtectedRoute><Simulation /></ProtectedRoute>} />
          <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
          <Route path="/plano-de-estudos" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Suspense>
      <CookieBanner />
    </BrowserRouter>
  )
}
