"use client"

import { use, useEffect, useState } from 'react'
import Link from 'next/link'

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

const inputStyle = {
  border: '1.5px solid var(--border)',
  borderRadius: 10,
  padding: '11px 14px',
  fontSize: '0.875rem',
  color: 'var(--ink)',
  backgroundColor: 'var(--surface)',
  outline: 'none',
  width: '100%',
  fontFamily: 'var(--font-secondary)',
}

export default function InfosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: restaurantId } = use(params)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('pending')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(`/api/restaurant/${restaurantId}/infos`)
      .then(r => r.json())
      .then(data => {
        setName(data.name ?? '')
        setPhone(data.phone ?? '')
        setAddress(data.address ?? '')
        setEmail(data.email ?? '')
        setStatus((data.subscription_status as Status) ?? 'pending')
        setLoading(false)
      })
  }, [restaurantId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await fetch(`/api/restaurant/${restaurantId}/infos`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, address, email }),
    })
    setMessage(res.ok ? 'Informations enregistrées.' : 'Erreur lors de la sauvegarde.')
    setSaving(false)
  }

  if (loading) return <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Chargement…</p>

  const sc = STATUS_COLORS[status]

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 className="font-secondary mb-6" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
        INFORMATIONS DU RESTAURANT
      </h2>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Identité */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px' }}>
          <p className="font-secondary mb-4" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--muted)' }}>IDENTITÉ</p>
          <div className="flex flex-col gap-1.5">
            <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em' }}>NOM DU RESTAURANT</label>
            <input
              value={name}
              disabled
              className="font-secondary"
              style={{ ...inputStyle, backgroundColor: 'var(--surface-alt)', color: 'var(--slate)', cursor: 'not-allowed' }}
            />
            <p className="font-secondary" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Le nom est géré par l&apos;administrateur.</p>
          </div>
        </div>

        {/* Coordonnées */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px' }}>
          <p className="font-secondary mb-4" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--muted)' }}>COORDONNÉES</p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em' }}>TÉLÉPHONE</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01 23 45 67 89"
                className="font-secondary"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--pine)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em' }}>ADRESSE POSTALE</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder={'12 rue de la Paix\n75001 Paris'}
                rows={3}
                className="font-secondary"
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => { e.target.style.borderColor = 'var(--pine)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em' }}>ADRESSE MAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@monrestaurant.fr"
                className="font-secondary"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--pine)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
              />
            </div>
          </div>
        </div>

        {message && (
          <p className="font-secondary" style={{
            fontSize: '0.875rem',
            color: message.includes('Erreur') ? 'var(--status-err-text)' : 'var(--status-ok-text)',
            backgroundColor: message.includes('Erreur') ? 'var(--status-err-bg)' : 'var(--status-ok-bg)',
            borderRadius: 8, padding: '8px 12px',
          }}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="font-secondary cursor-pointer"
          style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: '0.875rem', fontWeight: 600, opacity: saving ? 0.6 : 1, alignSelf: 'flex-start' }}
        >
          {saving ? '…' : 'Enregistrer'}
        </button>
      </form>

      {/* Abonnement */}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 32, paddingTop: 28 }}>
        <p className="font-secondary mb-4" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--muted)' }}>ABONNEMENT</p>
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
          <p className="font-secondary mb-2" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--muted)' }}>STATUT</p>
          <span
            className="font-secondary inline-flex items-center gap-2"
            style={{ fontSize: '0.875rem', fontWeight: 600, color: sc.text, backgroundColor: sc.bg, padding: '6px 14px', borderRadius: 99 }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
            {STATUS_LABELS[status]}
          </span>
        </div>
        {!['free'].includes(status) && (
          <Link
            href={`/restaurant/${restaurantId}/billing`}
            className="font-secondary inline-block"
            style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 20px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)', textDecoration: 'none' }}
          >
            Gérer mon abonnement →
          </Link>
        )}
        {status === 'free' && (
          <p className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--slate)' }}>Vous bénéficiez d&apos;un accès gratuit.</p>
        )}
      </div>
    </div>
  )
}
