"use client"

import { useEffect, useState } from 'react'

type State = 'loading' | 'unsupported' | 'default' | 'denied' | 'subscribed' | 'error'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export default function PushNotifications() {
  const [state, setState] = useState<State>('loading')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      setState('unsupported')
      return
    }
    navigator.serviceWorker
      .register('/sw.js')
      .then(async (reg) => {
        const sub = await reg.pushManager.getSubscription()
        if (sub) setState('subscribed')
        else if (Notification.permission === 'denied') setState('denied')
        else setState('default')
      })
      .catch(() => setState('error'))
  }, [])

  async function enable() {
    setBusy(true)
    setMsg('')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setState('denied')
        setBusy(false)
        return
      }
      const reg = await navigator.serviceWorker.ready
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!key) throw new Error('missing_key')
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), userAgent: navigator.userAgent }),
      })
      if (!res.ok) throw new Error('save_failed')
      setState('subscribed')
      setMsg('Notifications activées sur cet appareil.')
    } catch {
      setState('error')
      setMsg("Impossible d'activer les notifications.")
    }
    setBusy(false)
  }

  async function disable() {
    setBusy(true)
    setMsg('')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setState('default')
      setMsg('Notifications désactivées.')
    } catch {
      setState('error')
    }
    setBusy(false)
  }

  return (
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 32, paddingTop: 28 }}>
      <p className="font-secondary mb-4" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--muted)' }}>
        NOTIFICATIONS
      </p>
      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }} className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div style={{ flex: 1 }}>
            <p className="font-secondary" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>
              Nouvelles demandes de réservation
            </p>
            <p className="font-secondary" style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
              Recevez une alerte sur cet appareil dès qu&apos;un client demande une réservation, même l&apos;application fermée.
            </p>
          </div>

          {state === 'subscribed' && (
            <span className="font-secondary" style={{ flexShrink: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-ok-text)', backgroundColor: 'var(--status-ok-bg)', borderRadius: 99, padding: '6px 12px' }}>
              ✓ Activées
            </span>
          )}
        </div>

        {state === 'loading' && (
          <p className="font-secondary" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>…</p>
        )}

        {state === 'default' && (
          <button
            type="button"
            onClick={enable}
            disabled={busy}
            className="font-secondary cursor-pointer"
            style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: '0.875rem', fontWeight: 600, opacity: busy ? 0.6 : 1, alignSelf: 'flex-start' }}
          >
            {busy ? '…' : '🔔 Activer les notifications'}
          </button>
        )}

        {state === 'subscribed' && (
          <button
            type="button"
            onClick={disable}
            disabled={busy}
            className="font-secondary cursor-pointer"
            style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--slate)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 20px', fontSize: '0.8rem', fontWeight: 600, opacity: busy ? 0.6 : 1, alignSelf: 'flex-start' }}
          >
            {busy ? '…' : 'Désactiver sur cet appareil'}
          </button>
        )}

        {state === 'denied' && (
          <p className="font-secondary" style={{ fontSize: '0.8rem', color: 'var(--status-warn-text)', backgroundColor: 'var(--status-warn-bg)', borderRadius: 8, padding: '10px 14px' }}>
            Notifications bloquées. Autorisez-les pour ce site dans les réglages de votre navigateur, puis rechargez la page.
          </p>
        )}

        {state === 'unsupported' && (
          <p className="font-secondary" style={{ fontSize: '0.8rem', color: 'var(--muted)', backgroundColor: 'var(--surface-alt)', borderRadius: 8, padding: '10px 14px' }}>
            Non disponible sur cet appareil. Sur iPhone/iPad, ajoutez d&apos;abord RESA à l&apos;écran d&apos;accueil (Partager → « Sur l&apos;écran d&apos;accueil »), puis rouvrez-le depuis l&apos;icône.
          </p>
        )}

        {msg && (
          <p className="font-secondary" style={{ fontSize: '0.8rem', color: state === 'error' ? 'var(--status-err-text)' : 'var(--status-ok-text)' }}>
            {msg}
          </p>
        )}
      </div>
    </div>
  )
}
