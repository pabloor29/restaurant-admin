"use client"

import { useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect.')
    } else {
      router.push('/')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-4">
      <h1 className="font-primary text-neutral mb-2" style={{ fontSize: '8rem', lineHeight: 1 }}>
        RESA
      </h1>
      <p className="font-secondary text-neutral mb-12" style={{ opacity: 0.4, fontSize: '0.85rem', letterSpacing: '0.15em' }}>
        GESTION DES RÉSERVATIONS
      </p>

      <div className="w-full" style={{ maxWidth: '360px' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="font-secondary rounded-lg px-4 py-3 outline-none text-sm"
            style={{
              backgroundColor: 'rgba(252,238,239,0.07)',
              border: '1px solid rgba(252,238,239,0.15)',
              color: 'var(--neutral)',
            }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="font-secondary rounded-lg px-4 py-3 outline-none text-sm"
            style={{
              backgroundColor: 'rgba(252,238,239,0.07)',
              border: '1px solid rgba(252,238,239,0.15)',
              color: 'var(--neutral)',
            }}
          />

          {error && (
            <p className="font-secondary text-sm text-center" style={{ color: 'var(--primary)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-secondary py-3 rounded-lg transition-opacity cursor-pointer mt-1"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--neutral)',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? '...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
