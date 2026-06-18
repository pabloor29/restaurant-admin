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
    <>
      {error && (
        <p className="font-secondary text-sm text-center mb-4" style={{ color: 'var(--primary)' }}>
          {error}
        </p>
      )}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full font-secondary py-4 rounded-xl transition-opacity cursor-pointer"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--neutral)',
          opacity: loading ? 0.5 : 1,
          fontSize: '0.85rem',
          letterSpacing: '0.1em',
        }}
      >
        {loading ? '...' : "S'ABONNER"}
      </button>
      <button
        onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
        className="w-full font-secondary text-sm mt-4 cursor-pointer"
        style={{ color: 'rgba(252,238,239,0.25)', background: 'none', border: 'none' }}
      >
        Se déconnecter
      </button>
    </>
  )
}
