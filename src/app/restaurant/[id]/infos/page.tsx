"use client"

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../../lib/supabase/client'
import PushNotifications from '../PushNotifications'

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
  const [googleReviewUrl, setGoogleReviewUrl] = useState('')
  const [reviewEmailAuto, setReviewEmailAuto] = useState(false)
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [status, setStatus] = useState<Status>('pending')
  const [trialEnd, setTrialEnd] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMessage, setPwdMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const supabase = createClient()

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdMessage(null)

    if (newPwd.length < 8) {
      setPwdMessage({ type: 'err', text: 'Le nouveau mot de passe doit faire au moins 8 caractères.' })
      return
    }
    if (newPwd !== confirmPwd) {
      setPwdMessage({ type: 'err', text: 'Les mots de passe ne correspondent pas.' })
      return
    }

    setPwdSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userEmail = userData.user?.email
      if (!userEmail) {
        setPwdMessage({ type: 'err', text: 'Session expirée. Reconnectez-vous.' })
        return
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPwd,
      })
      if (verifyError) {
        setPwdMessage({ type: 'err', text: 'Mot de passe actuel incorrect.' })
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPwd })
      if (updateError) {
        setPwdMessage({ type: 'err', text: updateError.message })
        return
      }

      setPwdMessage({ type: 'ok', text: 'Mot de passe mis à jour.' })
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
    } finally {
      setPwdSaving(false)
    }
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/restaurant/${restaurantId}/infos`).then(r => r.json()),
      fetch(`/api/stripe/info?restaurant_id=${encodeURIComponent(restaurantId)}`).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([infos, stripeInfo]) => {
      setName(infos.name ?? '')
      setPhone(infos.phone ?? '')
      setAddress(infos.address ?? '')
      setEmail(infos.email ?? '')
      setGoogleReviewUrl(infos.google_review_url ?? '')
      setReviewEmailAuto(!!infos.review_email_auto)
      setStatus(((stripeInfo?.status ?? infos.subscription_status) as Status) ?? 'pending')
      setTrialEnd(stripeInfo?.trialEnd ?? null)
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

  async function saveReviewSettings(nextAuto: boolean, nextUrl: string) {
    setReviewSaving(true)
    setReviewMessage('')
    const res = await fetch(`/api/restaurant/${restaurantId}/infos`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ google_review_url: nextUrl, review_email_auto: nextAuto }),
    })
    setReviewMessage(res.ok ? 'Enregistré.' : 'Erreur lors de la sauvegarde.')
    setReviewSaving(false)
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    await saveReviewSettings(reviewEmailAuto, googleReviewUrl)
  }

  async function handleToggleAuto() {
    if (reviewSaving) return
    const next = !reviewEmailAuto
    setReviewEmailAuto(next)
    await saveReviewSettings(next, googleReviewUrl)
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

      {/* Notifications push — nouvelles réservations */}
      <PushNotifications />

      {/* Demandes d'avis */}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 32, paddingTop: 28 }}>
        <p className="font-secondary mb-4" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--muted)' }}>DEMANDES D&apos;AVIS</p>
        <form onSubmit={handleReviewSubmit} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px' }} className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div style={{ flex: 1 }}>
              <p className="font-secondary" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>
                Envoi automatique
              </p>
              <p className="font-secondary" style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                Envoie un mail au client 12 h après sa réservation pour lui demander un avis Google.
                Si désactivé, un bouton apparaît sur chaque réservation passée pour envoyer manuellement.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleAuto}
              disabled={reviewSaving}
              aria-pressed={reviewEmailAuto}
              title={reviewEmailAuto ? 'Désactiver' : 'Activer'}
              style={{
                padding: 4,
                background: 'transparent',
                border: 'none',
                cursor: reviewSaving ? 'not-allowed' : 'pointer',
                opacity: reviewSaving ? 0.6 : 1,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: 40,
                  height: 22,
                  borderRadius: 99,
                  backgroundColor: reviewEmailAuto ? 'var(--pine)' : 'var(--border)',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: reviewEmailAuto ? 21 : 3,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                    transition: 'left 0.2s cubic-bezier(.25,.46,.45,.94)',
                  }}
                />
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em' }}>LIEN GOOGLE AVIS</label>
            <input
              type="url"
              value={googleReviewUrl}
              onChange={e => setGoogleReviewUrl(e.target.value)}
              placeholder="https://g.page/r/.../review"
              className="font-secondary"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--pine)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />
            <p className="font-secondary" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
              Récupérez ce lien depuis votre fiche Google Business (« Demander des avis »).
            </p>
          </div>

          {reviewMessage && (
            <p className="font-secondary text-sm" style={{
              color: reviewMessage.includes('Erreur') ? 'var(--status-err-text)' : 'var(--status-ok-text)',
              backgroundColor: reviewMessage.includes('Erreur') ? 'var(--status-err-bg)' : 'var(--status-ok-bg)',
              borderRadius: 8, padding: '8px 12px',
            }}>
              {reviewMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={reviewSaving}
            className="font-secondary cursor-pointer"
            style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: '0.875rem', fontWeight: 600, opacity: reviewSaving ? 0.6 : 1, alignSelf: 'flex-start' }}
          >
            {reviewSaving ? '…' : 'Enregistrer'}
          </button>
        </form>
      </div>

      {/* Sécurité — mot de passe */}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 32, paddingTop: 28 }}>
        <p className="font-secondary mb-4" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--muted)' }}>SÉCURITÉ</p>
        <form onSubmit={handleChangePassword} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px' }} className="flex flex-col gap-4">
          <p className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--muted)' }}>CHANGER LE MOT DE PASSE</p>

          <div className="flex flex-col gap-1.5">
            <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em' }}>MOT DE PASSE ACTUEL</label>
            <input
              type="password"
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              required
              autoComplete="current-password"
              className="font-secondary"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--pine)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em' }}>NOUVEAU MOT DE PASSE</label>
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="font-secondary"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--pine)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />
            <p className="font-secondary" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>8 caractères minimum.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em' }}>CONFIRMER LE NOUVEAU MOT DE PASSE</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              required
              autoComplete="new-password"
              className="font-secondary"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--pine)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />
          </div>

          {pwdMessage && (
            <p className="font-secondary text-sm" style={{
              color: pwdMessage.type === 'ok' ? 'var(--status-ok-text)' : 'var(--status-err-text)',
              backgroundColor: pwdMessage.type === 'ok' ? 'var(--status-ok-bg)' : 'var(--status-err-bg)',
              borderRadius: 8, padding: '8px 12px',
            }}>
              {pwdMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={pwdSaving || !currentPwd || !newPwd || !confirmPwd}
            className="font-secondary cursor-pointer"
            style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: '0.875rem', fontWeight: 600, opacity: (pwdSaving || !currentPwd || !newPwd || !confirmPwd) ? 0.5 : 1, alignSelf: 'flex-start' }}
          >
            {pwdSaving ? '…' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>

      {/* Abonnement */}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 32, paddingTop: 28 }}>
        <p className="font-secondary mb-4" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--muted)' }}>ABONNEMENT</p>
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
          <p className="font-secondary mb-2" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--muted)' }}>STATUT</p>
          <div className="flex flex-col gap-2">
            <span
              className="font-secondary inline-flex items-center gap-2 self-start"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: sc.text, backgroundColor: sc.bg, padding: '6px 14px', borderRadius: 99 }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
              {STATUS_LABELS[status]}
            </span>
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
                Période d&apos;essai jusqu&apos;au {new Date(trialEnd).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
        {!['free', 'trialing'].includes(status) && (
          <Link
            href={`/restaurant/${restaurantId}/billing`}
            className="font-secondary inline-block"
            style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '11px 20px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)', textDecoration: 'none' }}
          >
            Gérer mon abonnement →
          </Link>
        )}
        {status === 'trialing' && (
          <p className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--slate)' }}>
            Aucun abonnement actif. Vous bénéficiez d&apos;une période d&apos;essai gratuite.
          </p>
        )}
        {status === 'free' && (
          <p className="font-secondary" style={{ fontSize: '0.875rem', color: 'var(--slate)' }}>Vous bénéficiez d&apos;un accès gratuit.</p>
        )}
      </div>
    </div>
  )
}
