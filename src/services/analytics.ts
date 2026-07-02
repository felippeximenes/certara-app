type EventName =
  | 'page_view'
  | 'quiz_started'
  | 'quiz_completed'
  | 'subscription_clicked'
  | 'checkout_started'
  | 'login'
  | 'register'

interface EventProperties {
  page?: string
  certification?: string
  difficulty?: string
  score?: number
  pct?: number
  plan?: string
  method?: string
}

interface AnalyticsEvent {
  name: EventName
  properties?: EventProperties
  timestamp: string
  sessionId: string
}

const DEBUG_KEY = 'certara_analytics_debug'
const MAX_STORED = 100

function getSessionId(): string {
  const KEY = 'certara_session_id'
  let id = sessionStorage.getItem(KEY)
  if (!id) {
    id = Math.random().toString(36).slice(2)
    sessionStorage.setItem(KEY, id)
  }
  return id
}

export function trackEvent(name: EventName, properties?: EventProperties) {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  }

  console.log('[Analytics]', JSON.stringify(event))

  try {
    const stored = JSON.parse(localStorage.getItem(DEBUG_KEY) ?? '[]') as AnalyticsEvent[]
    localStorage.setItem(DEBUG_KEY, JSON.stringify([...stored, event].slice(-MAX_STORED)))
  } catch {
    // storage full or disabled — analytics is non-critical
  }

  // Drop-in replacement: swap this body for PostHog or Mixpanel:
  // posthog.capture(name, { ...properties, $session_id: event.sessionId })
}
