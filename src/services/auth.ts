import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  signInWithRedirect,
  fetchAuthSession,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
} from 'aws-amplify/auth'

export async function register(email: string, password: string) {
  return signUp({ username: email, password, options: { userAttributes: { email } } })
}

export async function confirmEmail(email: string, code: string) {
  return confirmSignUp({ username: email, confirmationCode: code })
}

export async function resendCode(email: string) {
  return resendSignUpCode({ username: email })
}

export async function login(email: string, password: string) {
  try { await signOut() } catch {}
  return signIn({ username: email, password })
}

export async function loginWithGoogle() {
  try { await signOut() } catch {}
  return signInWithRedirect({ provider: 'Google' })
}

export async function logout() {
  return signOut()
}

export async function sendPasswordReset(email: string) {
  return resetPassword({ username: email })
}

export async function confirmPasswordReset(email: string, code: string, newPassword: string) {
  return confirmResetPassword({ username: email, confirmationCode: code, newPassword })
}

export async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString() ?? null
  } catch {
    return null
  }
}

export async function getCurrentEmail(): Promise<string | null> {
  try {
    // signInDetails.loginId is only populated for email/password users.
    // For federated (Google OAuth) users the email lives in the idToken claims.
    const session = await fetchAuthSession()
    const idToken = session.tokens?.idToken
    if (!idToken) return null
    const email = idToken.payload?.email
    return typeof email === 'string' ? email : null
  } catch {
    return null
  }
}
