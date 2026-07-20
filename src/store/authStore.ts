import { create } from 'zustand'
import { fetchAuthSession } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { getCurrentEmail, getAvatarUrl, logout } from '../services/auth'

interface AuthState {
  email: string | null
  avatar: string | null
  loading: boolean
  setEmail: (email: string | null) => void
  init: () => Promise<void>
  signOut: () => Promise<void>
}

// Prevents StrictMode double-invocation from racing on the OAuth code exchange
let _initPromise: Promise<void> | null = null

// Hub listener: catches OAuth exchange that completes after URL was already cleaned
Hub.listen('auth', async ({ payload }) => {
  if (payload.event === 'signInWithRedirect') {
    try {
      const [email, avatar] = await Promise.all([getCurrentEmail(), getAvatarUrl()])
      useAuthStore.setState({ email, avatar, loading: false })
    } catch {
      useAuthStore.setState({ loading: false })
    }
  } else if (payload.event === 'signInWithRedirect_failure') {
    useAuthStore.setState({ loading: false })
  }
})

export const useAuthStore = create<AuthState>((set) => ({
  email: null,
  avatar: null,
  loading: true,

  setEmail: (email) => set({ email }),

  init: () => {
    if (_initPromise) return _initPromise
    _initPromise = _doInit(set).finally(() => { _initPromise = null })
    return _initPromise
  },

  signOut: async () => {
    await logout()
    set({ email: null })
  },
}))

async function _doInit(set: (s: Partial<{ email: string | null; avatar: string | null; loading: boolean }>) => void) {
  const params = new URLSearchParams(window.location.search)

  if (params.has('error')) {
    set({ email: null, loading: false })
    return
  }

  if (params.has('code') && params.has('state')) {
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 200))
      try {
        const session = await fetchAuthSession()
        const idToken = session.tokens?.idToken?.toString()
        if (idToken) {
          const [email, avatar] = await Promise.all([getCurrentEmail(), getAvatarUrl()])
          set({ email, avatar, loading: false })
          return
        }
      } catch {
        // retry
      }
    }
    set({ email: null, loading: false })
    return
  }

  const [email, avatar] = await Promise.all([getCurrentEmail(), getAvatarUrl()])
  set({ email, avatar, loading: false })
}
