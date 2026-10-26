// Client-side push helpers shared by the settings toggle (PushNotifications)
// and the first-run prompt (PushPrompt), so the subscribe flow stays identical.

export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

// iOS/iPadOS only deliver web push when the site runs as an installed PWA
// (launched from the home-screen icon, i.e. display-mode: standalone).
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari exposes this non-standard flag on navigator.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export async function registerServiceWorker() {
  return navigator.serviceWorker.register('/sw.js')
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null
  const reg = await navigator.serviceWorker.ready
  return reg.pushManager.getSubscription()
}

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: 'denied' | 'missing_key' | 'save_failed' | 'error' }

// Request permission (must run inside a user gesture), subscribe with the VAPID
// key, and persist the subscription server-side. Caller handles UI/state.
export async function enablePush(): Promise<SubscribeResult> {
  try {
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return { ok: false, reason: 'denied' }

    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!key) return { ok: false, reason: 'missing_key' }

    await registerServiceWorker()
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    })

    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), userAgent: navigator.userAgent }),
    })
    if (!res.ok) return { ok: false, reason: 'save_failed' }

    return { ok: true }
  } catch {
    return { ok: false, reason: 'error' }
  }
}
