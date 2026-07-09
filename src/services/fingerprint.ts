import FingerprintJS from '@fingerprintjs/fingerprintjs'

let cached: string | null = null

export async function getFingerprint(): Promise<string> {
  if (cached) return cached
  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    cached = result.visitorId
    return cached
  } catch {
    // Fallback: stable-ish key from available browser signals
    const ua = navigator.userAgent + navigator.language + screen.width + screen.height
    cached = btoa(ua).slice(0, 32)
    return cached
  }
}
