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
      {/* Logo */}
      <div className="flex items-center gap-4 mb-12">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'var(--pine)' }}
        >
          <span className="font-primary" style={{ fontSize: '1.7rem', color: 'var(--paper)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>R</span>
        </div>
        <span className="font-primary" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          RESA<span style={{ color: 'var(--amber)' }}>.</span>
        </span>
      </div>

      {/* Card */}
      <div
        className="w-full"
        style={{ maxWidth: 380, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '32px 28px' }}
      >
        <h1 className="font-primary mb-1" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
          Connexion
        </h1>
        <p className="font-secondary mb-6" style={{ fontSize: '0.85rem', color: 'var(--slate)' }}>
          Accédez à votre espace de gestion.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-secondary" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)' }}>Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="font-secondary outline-none transition-all"
              style={{
                border: '1.5px solid var(--border)',
                borderRadius: 10,
                padding: '11px 14px',
                fontSize: '0.9rem',
                color: 'var(--ink)',
                backgroundColor: 'var(--surface)',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--pine)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-secondary" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)' }}>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="font-secondary outline-none transition-all"
              style={{
                border: '1.5px solid var(--border)',
                borderRadius: 10,
                padding: '11px 14px',
                fontSize: '0.9rem',
                color: 'var(--ink)',
                backgroundColor: 'var(--surface)',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--pine)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />
          </div>

          {error && (
            <p className="font-secondary text-sm" style={{ color: 'var(--status-err-text)', backgroundColor: 'var(--status-err-bg)', borderRadius: 8, padding: '8px 12px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-secondary cursor-pointer transition-all mt-1"
            style={{
              backgroundColor: loading ? 'var(--pine-dark)' : 'var(--pine)',
              color: 'var(--paper)',
              borderRadius: 10,
              padding: '12px 20px',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '...' : 'Se connecter'}
          </button>
        </form>
      </div>

      <p className="font-secondary mt-8" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
        resa-service.com
      </p>
    </div>
  )
}
