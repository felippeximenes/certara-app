import type { ApiQuestion, ApiFeedback, ApiSummary, QuizAnswer, QuizHistoryItem, SubscriptionStatus } from '../types/quiz'
import { getIdToken } from './auth'
import { getFingerprint } from './fingerprint'

const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL ?? '')
const TIMEOUT_MS = 30_000

const HTTP_MESSAGES: Record<number, string> = {
  503: 'Serviço temporariamente indisponível.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Acesso negado.',
  500: 'Erro interno do servidor. Tente novamente.',
}

// Typed error that carries the backend error code (e.g. "trial_exhausted")
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getIdToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function apiFetch(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    if (!res.ok) {
      // Try to parse structured error from backend (e.g. trial_exhausted)
      try {
        const errBody = await res.clone().json() as { error?: string; message?: string }
        if (errBody.error) {
          throw new ApiError(errBody.error, errBody.message ?? errBody.error)
        }
      } catch (inner) {
        if (inner instanceof ApiError) throw inner
      }
      const msg = HTTP_MESSAGES[res.status] ?? `Erro ${res.status}. Tente novamente.`
      throw new ApiError('http_error', msg)
    }
    return res
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('timeout', 'Servidor demorou a responder. Tente novamente.')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export async function generateQuestion(
  domain: string,
  difficulty: string,
  certification = 'clf-c02',
  recentQuestions: string[] = [],
): Promise<ApiQuestion> {
  const fingerprint = await getFingerprint()
  const res = await apiFetch(`${API_URL}/generate-question`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ domain, difficulty, certification, fingerprint, recentQuestions }),
  })
  return res.json() as Promise<ApiQuestion>
}

interface EvaluatePayload {
  question: string
  options: string[]
  correct_answer: string
  selected_answer: string
  domain: string
  explanation: string
  certification?: string
}

export async function evaluateAnswer(payload: EvaluatePayload): Promise<ApiFeedback> {
  const res = await apiFetch(`${API_URL}/evaluate-answer`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  })
  return res.json() as Promise<ApiFeedback>
}

export async function generateSummary(
  score: number,
  total: number,
  answers: QuizAnswer[],
): Promise<ApiSummary> {
  const res = await apiFetch(`${API_URL}/generate-summary`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ score, total, answers }),
  })
  return res.json() as Promise<ApiSummary>
}

export async function saveQuiz(
  score: number,
  total: number,
  difficulty: string,
  answers: QuizAnswer[],
): Promise<void> {
  const fingerprint = await getFingerprint()
  await apiFetch(`${API_URL}/save-quiz`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ score, total, difficulty, answers, fingerprint }),
  })
}

export async function listHistory(): Promise<QuizHistoryItem[]> {
  const res = await apiFetch(`${API_URL}/history`, {
    method: 'GET',
    headers: await authHeaders(),
  })
  const data = await res.json() as { items: QuizHistoryItem[] }
  return data.items
}

export async function getSubscription(): Promise<SubscriptionStatus> {
  const res = await apiFetch(`${API_URL}/subscription`, {
    method: 'GET',
    headers: await authHeaders(),
  })
  return res.json() as Promise<SubscriptionStatus>
}

export async function createPortalSession(): Promise<string> {
  const res = await apiFetch(`${API_URL}/customer-portal`, {
    method: 'POST',
    headers: await authHeaders(),
  })
  const data = await res.json() as { portalUrl: string }
  return data.portalUrl
}

export async function cancelSubscription(): Promise<void> {
  await apiFetch(`${API_URL}/cancel-subscription`, {
    method: 'POST',
    headers: await authHeaders(),
  })
}

export async function createCheckoutSession(): Promise<string> {
  const res = await apiFetch(`${API_URL}/create-checkout-session`, {
    method: 'POST',
    headers: await authHeaders(),
  })
  const data = await res.json() as { checkoutUrl: string }
  return data.checkoutUrl
}
