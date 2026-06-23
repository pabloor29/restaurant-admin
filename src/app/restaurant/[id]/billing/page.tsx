"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '../../../../../lib/supabase/client'

type Status = 'active' | 'trialing' | 'canceled' | 'past_due' | 'pending' | 'free'

const STATUS_LABELS: Record<Status, string> = {
  active:   'Actif',
  trialing: "Période d'essai",
  free:     'Accès gratuit',
  past_due: 'Paiement en retard',
  canceled: 'Annulé',
  pending:  'En attente',
}

const STATUS_COLORS: Record<Status, { text: string; bg: string }> = {
  active:   { text: 'var(--status-ok-text)',   bg: 'var(--status-ok-bg)' },
  trialing: { text: 'var(--status-warn-text)', bg: 'var(--status-warn-bg)' },
  free:     { text: 'var(--status-info-text)', bg: 'var(--status-info-bg)' },
  past_due: { text: 'var(--status-err-text)',  bg: 'var(--status-err-bg)' },
  canceled: { text: 'var(--status-err-text)',  bg: 'var(--status-err-bg)' },
  pending:  { text: 'var(--muted)',            bg: 'var(--surface-alt)' },
}

export default function BillingPage() {
  const params = useParams<{ id: string }>()
  const restaurantId = params?.id
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('subscription_status').eq('id', user.id).single()
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

  const info = status ? STATUS_COLORS[status] : null

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 className="font-secondary mb-8" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
        ABONNEMENT
      </h2>

      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="font-secondary mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--muted)', fontWeight: 600 }}>
          STATUT
        </p>
        {loading ? (
          <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Chargement...</p>
        ) : (
          <span
            className="font-secondary inline-flex items-center gap-2"
            style={{ fontSize: '0.875rem', fontWeight: 600, color: info?.text, backgroundColor: info?.bg, padding: '6px 14px', borderRadius: 99 }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
            {status ? STATUS_LABELS[status] : '—'}
          </span>
        )}
      </div>

      {status && !['free', 'pending', 'canceled'].includes(status) && (
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="w-full font-secondary cursor-pointer transition-all"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 10,
              padding: '12px 20px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--ink)',
              opacity: portalLoading ? 0.5 : 1,
            }}
          >
            {portalLoading ? '...' : 'Mettre à jour mes infos de paiement →'}
          </button>

          {restaurantId && (
            <Link
              href={`/restaurant/${restaurantId}/billing/resiliation`}
              className="w-full font-secondary text-center transition-all"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '12px 20px',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--slate)',
                textDecoration: 'none',
              }}
            >
              Résilier mon abonnement
            </Link>
          )}
        </div>
      )}

      {status === 'free' && (
        <p className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--slate)' }}>
          Vous bénéficiez d&apos;un accès gratuit.
        </p>
      )}
    </div>
  )
}
