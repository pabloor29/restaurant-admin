"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Preview = {
  subscriptionId: string
  startedAt: string
  commitmentEndsAt: string
  withinCommitment: boolean
  monthsLeft: number
  indemnityEur: number
  noticeEndsAt: string
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function ResiliationPage() {
  const router = useRouter()
  const [preview, setPreview] = useState<Preview | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ mode: string; effectiveAt: string; indemnityEur: number } | null>(null)

  useEffect(() => {
    fetch('/api/stripe/cancel-preview')
      .then(async r => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error ?? 'Erreur de chargement')
        setPreview(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleConfirm() {
    if (!accepted) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur de résiliation')
      setSuccess({ mode: data.mode, effectiveAt: data.effectiveAt, indemnityEur: data.indemnityEur })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="font-secondary" style={{ color: 'var(--muted)' }}>Chargement...</p>
  }

  if (success) {
    return (
      <div style={{ maxWidth: 560 }}>
        <h2 className="font-primary mb-4" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)' }}>
          Résiliation enregistrée
        </h2>
        {success.mode === 'early_cancellation' ? (
          <p className="font-secondary mb-3" style={{ color: 'var(--ink)' }}>
            Votre abonnement est résilié immédiatement. Une facture d&apos;indemnité de{' '}
            <strong>{success.indemnityEur} €</strong> a été émise et sera prélevée sur votre carte
            enregistrée. Un reçu vous sera envoyé par e-mail.
          </p>
        ) : (
          <p className="font-secondary mb-3" style={{ color: 'var(--ink)' }}>
            Votre demande de résiliation est enregistrée. Le service prendra fin le{' '}
            <strong>{fmtDate(success.effectiveAt)}</strong> à l&apos;issue du préavis de 2 mois.
          </p>
        )}
        <button
          onClick={() => router.refresh()}
          className="font-secondary cursor-pointer mt-4"
          style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', borderRadius: 10, padding: '11px 18px', fontSize: '0.875rem', fontWeight: 600, border: 'none' }}
        >
          Retour
        </button>
      </div>
    )
  }

  if (!preview) {
    return (
      <div>
        <p className="font-secondary" style={{ color: 'var(--status-err-text)' }}>{error || 'Abonnement introuvable.'}</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 className="font-secondary mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
        RÉSILIATION DE L&apos;ABONNEMENT
      </h2>
      <h1 className="font-primary mb-6" style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
        {preview.withinCommitment ? 'Résiliation anticipée' : 'Résiliation avec préavis'}
      </h1>

      <div className="mb-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22 }}>
        <Row label="Abonnement débuté le" value={fmtDate(preview.startedAt)} />
        <Row label="Fin de l’engagement" value={fmtDate(preview.commitmentEndsAt)} />
        {preview.withinCommitment ? (
          <>
            <Row label="Mois restants" value={`${preview.monthsLeft} mois`} />
            <Row label="Indemnité due" value={`${preview.indemnityEur} €`} highlight />
            <Row label="Effet de la résiliation" value="Immédiate" />
          </>
        ) : (
          <>
            <Row label="Préavis" value="2 mois" />
            <Row label="Date d’effet" value={fmtDate(preview.noticeEndsAt)} highlight />
            <Row label="Indemnité due" value="Aucune" />
          </>
        )}
      </div>

      {preview.withinCommitment && (
        <div className="mb-4 font-secondary" style={{ backgroundColor: 'var(--status-warn-bg)', color: 'var(--status-warn-text)', padding: '12px 14px', borderRadius: 10, fontSize: '0.85rem', lineHeight: 1.55 }}>
          Conformément à l&apos;article 7.2 du <Link href="/contrat-abonnement" style={{ textDecoration: 'underline' }}>contrat d&apos;abonnement</Link>, une
          indemnité égale aux mois restants × 67 € est due. Elle sera prélevée automatiquement sur
          votre carte enregistrée.
        </div>
      )}

      {error && (
        <p className="font-secondary mb-3" style={{ color: 'var(--status-err-text)', backgroundColor: 'var(--status-err-bg)', padding: '8px 12px', borderRadius: 8, fontSize: '0.85rem' }}>
          {error}
        </p>
      )}

      <label className="font-secondary flex items-start gap-3 mb-4" style={{ fontSize: '0.875rem', color: 'var(--ink)', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={e => setAccepted(e.target.checked)}
          style={{ marginTop: 4 }}
        />
        <span>
          Je reconnais avoir pris connaissance des conditions ci-dessus et je confirme ma demande de
          résiliation.
        </span>
      </label>

      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="font-secondary cursor-pointer"
          style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 18px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)' }}
        >
          Annuler
        </button>
        <button
          onClick={handleConfirm}
          disabled={!accepted || submitting}
          className="font-secondary cursor-pointer"
          style={{
            backgroundColor: 'var(--status-err-text)',
            color: 'var(--paper)',
            borderRadius: 10,
            padding: '11px 18px',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: 'none',
            opacity: (!accepted || submitting) ? 0.5 : 1,
          }}
        >
          {submitting ? '...' : 'Confirmer la résiliation'}
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span className="font-secondary" style={{ fontSize: '0.85rem', color: 'var(--slate)' }}>{label}</span>
      <span className="font-secondary" style={{ fontSize: '0.95rem', fontWeight: highlight ? 700 : 500, color: highlight ? 'var(--status-err-text)' : 'var(--ink)' }}>
        {value}
      </span>
    </div>
  )
}
