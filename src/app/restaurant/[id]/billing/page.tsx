"use client"

import { useState, useEffect } from 'react'
import { createClient } from '../../../../../lib/supabase/client'

type Status = 'active' | 'trialing' | 'canceled' | 'past_due' | 'pending' | 'free'

const STATUS_LABELS: Record<Status, { label: string; color: string }> = {
  active: { label: 'Actif', color: '#4ade80' },
  trialing: { label: 'Période d\'essai', color: '#facc15' },
  free: { label: 'Accès gratuit', color: '#a78bfa' },
  past_due: { label: 'Paiement en retard', color: '#f87171' },
  canceled: { label: 'Annulé', color: '#f87171' },
  pending: { label: 'En attente', color: 'rgba(252,238,239,0.4)' },
}

export default function BillingPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setStatus((data?.subscription_status as Status) ?? 'pending')
          setLoading(false)
        })
    })
  }, [supabase])

  async function handlePortal() {
    setPortalLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setPortalLoading(false)
  }

  const info = status ? STATUS_LABELS[status] : null

  return (
    <div className="max-w-md">
      <h2 className="font-secondary text-neutral mb-8" style={{ fontSize: '0.8rem', letterSpacing: '0.12em', opacity: 0.6 }}>
        ABONNEMENT
      </h2>

      <div
        className="rounded-xl p-6 mb-6"
        style={{ backgroundColor: 'rgba(252,238,239,0.05)', border: '1px solid rgba(252,238,239,0.1)' }}
      >
        <p className="font-secondary mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: 'rgba(252,238,239,0.4)' }}>
          STATUT
        </p>
        {loading ? (
          <p className="font-secondary" style={{ color: 'rgba(252,238,239,0.4)', fontSize: '0.9rem' }}>Chargement...</p>
        ) : (
          <p className="font-secondary" style={{ color: info?.color, fontSize: '1rem' }}>
            {info?.label ?? '—'}
          </p>
        )}
      </div>

      {status && !['free', 'pending'].includes(status) && (
        <button
          onClick={handlePortal}
          disabled={portalLoading}
          className="w-full font-secondary py-3 rounded-xl transition-opacity cursor-pointer"
          style={{
            backgroundColor: 'rgba(252,238,239,0.07)',
            border: '1px solid rgba(252,238,239,0.15)',
            color: 'var(--neutral)',
            opacity: portalLoading ? 0.5 : 1,
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
          }}
        >
          {portalLoading ? '...' : 'GÉRER MON ABONNEMENT'}
        </button>
      )}

      {status === 'free' && (
        <p className="font-secondary text-center" style={{ color: 'rgba(252,238,239,0.35)', fontSize: '0.8rem' }}>
          Vous bénéficiez d&apos;un accès gratuit.
        </p>
      )}
    </div>
  )
}
