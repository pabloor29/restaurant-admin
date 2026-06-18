"use client"

import { useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SubscribeActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubscribe() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Une erreur est survenue')
      setLoading(false)
      return
    }
    window.location.href = data.url
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p
          className="font-secondary text-sm text-center"
          style={{ color: 'var(--status-err-text)', backgroundColor: 'var(--status-err-bg)', borderRadius: 8, padding: '8px 12px' }}
        >
          {error}
        </p>
      )}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full font-secondary cursor-pointer transition-all"
        style={{
          backgroundColor: 'var(--pine)',
          color: 'var(--paper)',
          borderRadius: 10,
          padding: '13px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          border: 'none',
          opacity: loading ? 0.6 : 1,
          letterSpacing: '0.02em',
        }}
      >
        {loading ? '...' : "S'abonner"}
      </button>
      <button
        onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
        className="w-full font-secondary cursor-pointer"
        style={{ color: 'var(--muted)', background: 'none', border: 'none', fontSize: '0.85rem', padding: '4px' }}
      >
        Se déconnecter
      </button>
    </div>
  )
}
