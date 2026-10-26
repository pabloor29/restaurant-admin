"use client"

import { useEffect, useState } from 'react'
import {
  isPushSupported,
  isStandalone,
  registerServiceWorker,
  getExistingSubscription,
  enablePush,
} from '../../../../lib/push-client'

const SNOOZE_KEY = 'resa_push_prompt_snooze'
const SNOOZE_DAYS = 3

function snoozed(): boolean {
  try {
    const until = Number(localStorage.getItem(SNOOZE_KEY) || 0)
    return Date.now() < until
  } catch {
    return false
  }
}

function snooze() {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86400_000))
  } catch {
    // ignore storage errors (private mode)
  }
}

// First-run popup asking the restaurateur to turn on reservation alerts.
// Appears on their restaurant space when notifications aren't set up yet.
export default function PushPrompt() {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isPushSupported()) return
    // On iOS push only works from the installed PWA — don't nag in a browser tab.
    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (iOS && !isStandalone()) return
    if (Notification.permission !== 'default') return // granted or blocked → nothing to prompt
    if (snoozed()) return

    let cancelled = false
    ;(async () => {
      try {
        await registerServiceWorker()
        const existing = await getExistingSubscription()
        if (!cancelled && !existing) setOpen(true)
      } catch {
        // service worker unavailable → stay silent
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function accept() {
    setBusy(true)
    setError('')
    const res = await enablePush()
    setBusy(false)
    if (res.ok) {
      setOpen(false)
      return
    }
    if (res.reason === 'denied') {
      // Browser will not re-prompt; close and let them use Réglages later.
      setOpen(false)
      return
    }
    setError("Impossible d'activer les notifications. Réessayez depuis Réglages.")
  }

  function later() {
    snooze()
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        backgroundColor: 'rgba(22,32,27,0.45)', padding: 16,
      }}
      onClick={later}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 18, padding: 24, marginBottom: 'env(safe-area-inset-bottom, 8px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ fontSize: '2rem', lineHeight: 1, marginBottom: 12 }}>🔔</div>
        <p className="font-primary" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0 }}>
          Activer les notifications ?
        </p>
        <p className="font-secondary" style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6, margin: '8px 0 20px' }}>
          Recevez une alerte sur ce téléphone dès qu&apos;un client demande une réservation, même l&apos;application fermée.
        </p>

        {error && (
          <p className="font-secondary" style={{ fontSize: '0.8rem', color: 'var(--status-err-text)', backgroundColor: 'var(--status-err-bg, rgba(180,69,47,0.08))', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={accept}
            disabled={busy}
            className="font-secondary cursor-pointer"
            style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: '0.92rem', fontWeight: 700, opacity: busy ? 0.6 : 1 }}
          >
            {busy ? '…' : 'Activer les notifications'}
          </button>
          <button
            type="button"
            onClick={later}
            disabled={busy}
            className="font-secondary cursor-pointer"
            style={{ background: 'none', color: 'var(--muted)', border: 'none', fontSize: '0.85rem', fontWeight: 600, padding: '4px' }}
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  )
}
