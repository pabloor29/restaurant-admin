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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function BillingPage() {
  const params = useParams<{ id: string }>()
  const restaurantId = params?.id
  const [status, setStatus] = useState<Status | null>(null)
  const [cancelAt, setCancelAt] = useState<string | null>(null)
  const [trialEnd, setTrialEnd] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const supabase = createClient()

  async function refreshStatus() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single()
    setStatus((data?.subscription_status as Status) ?? 'pending')
  }

  async function refreshStripeInfo() {
    try {
      const url = restaurantId
        ? `/api/stripe/info?restaurant_id=${encodeURIComponent(restaurantId)}`
        : '/api/stripe/info'
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      setCancelAt(data.cancelAt ?? null)
      setTrialEnd(data.trialEnd ?? null)
      if (data.status) setStatus(data.status as Status)
    } catch {
      // silent
    }
  }

  useEffect(() => {
    Promise.all([refreshStatus(), refreshStripeInfo()]).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePortal() {
    setPortalLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setPortalLoading(false)
  }

  async function handleSync() {
    setSyncLoading(true)
    setSyncMessage('')
    try {
      const res = await fetch('/api/stripe/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setSyncMessage(data.error ?? 'Erreur de synchronisation')
      } else {
        await refreshStatus()
        setSyncMessage(
          data.changed
            ? `Statut mis à jour : ${data.previous ?? '—'} → ${data.status}`
            : `Déjà à jour (${data.status})`
        )
      }
    } catch (e) {
      setSyncMessage(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setSyncLoading(false)
    }
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
          <div className="flex flex-col gap-2">
            <span
              className="font-secondary inline-flex items-center gap-2 self-start"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: info?.text, backgroundColor: info?.bg, padding: '6px 14px', borderRadius: 99 }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
              {status ? STATUS_LABELS[status] : '—'}
            </span>
            {cancelAt && status === 'active' && (
              <span
                className="font-secondary inline-flex items-center gap-2 self-start"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--status-warn-text)',
                  backgroundColor: 'var(--status-warn-bg)',
                  padding: '5px 12px',
                  borderRadius: 99,
                }}
              >
                Résiliation programmée — fin du service le {fmtDate(cancelAt)}
              </span>
            )}
            {status === 'trialing' && trialEnd && (
              <span
                className="font-secondary inline-flex items-center gap-2 self-start"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--status-warn-text)',
                  backgroundColor: 'var(--status-warn-bg)',
                  padding: '5px 12px',
                  borderRadius: 99,
                }}
              >
                Période d&apos;essai jusqu&apos;au {fmtDate(trialEnd)}
              </span>
            )}
          </div>
        )}
      </div>

      {status === 'trialing' && (
        <p className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--slate)' }}>
          Aucun abonnement actif. Vous bénéficiez d&apos;une période d&apos;essai gratuite.
        </p>
      )}

      {status && !['free', 'trialing'].includes(status) && (
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSync}
            disabled={syncLoading}
            className="w-full font-secondary cursor-pointer transition-all"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 10,
              padding: '12px 20px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--ink)',
              opacity: syncLoading ? 0.5 : 1,
            }}
          >
            {syncLoading ? '...' : 'Synchroniser avec Stripe'}
          </button>

          {syncMessage && (
            <p className="font-secondary" style={{ fontSize: '0.8rem', color: 'var(--slate)', textAlign: 'center' }}>
              {syncMessage}
            </p>
          )}

          {!['pending', 'canceled'].includes(status) && (
            <>
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

              {restaurantId && !cancelAt && (
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
            </>
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
