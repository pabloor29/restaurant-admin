"use client"

import { useState } from 'react'

const inputStyle = {
  width: '100%',
  border: '1.5px solid rgba(245,241,233,0.2)',
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: '0.9rem',
  color: 'var(--paper)',
  backgroundColor: 'rgba(245,241,233,0.08)',
  outline: 'none',
  fontFamily: 'var(--font-secondary)',
  transition: 'border-color 0.15s',
}

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [restaurant, setRestaurant] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, restaurant, message }),
    })

    if (res.ok) {
      setSent(true)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Une erreur est survenue.')
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'rgba(245,241,233,0.12)', border: '1px solid rgba(245,241,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
            <path d="M1.5 9L8 15.5L20.5 2" stroke="#F5F1E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="font-primary" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--paper)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Message envoyé !
        </p>
        <p className="font-secondary" style={{ fontSize: '0.9rem', color: 'rgba(245,241,233,0.6)', lineHeight: 1.6 }}>
          Je vous recontacterai dans les plus brefs délais.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="lp-grid-2" style={{ gap: 12 }}>
        <div>
          <label className="font-secondary" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(245,241,233,0.5)', letterSpacing: '0.1em', marginBottom: 6 }}>
            NOM *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jean Dupont"
            required
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'rgba(245,241,233,0.5)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(245,241,233,0.2)' }}
          />
        </div>
        <div>
          <label className="font-secondary" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(245,241,233,0.5)', letterSpacing: '0.1em', marginBottom: 6 }}>
            EMAIL *
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="vous@email.com"
            required
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'rgba(245,241,233,0.5)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(245,241,233,0.2)' }}
          />
        </div>
      </div>

      <div>
        <label className="font-secondary" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(245,241,233,0.5)', letterSpacing: '0.1em', marginBottom: 6 }}>
          NOM DU RESTAURANT
        </label>
        <input
          type="text"
          value={restaurant}
          onChange={e => setRestaurant(e.target.value)}
          placeholder="Le Bistrot du coin (optionnel)"
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = 'rgba(245,241,233,0.5)' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(245,241,233,0.2)' }}
        />
      </div>

      <div>
        <label className="font-secondary" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(245,241,233,0.5)', letterSpacing: '0.1em', marginBottom: 6 }}>
          MESSAGE *
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Décrivez votre projet, vos besoins, vos questions…"
          required
          rows={5}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
          onFocus={e => { e.target.style.borderColor = 'rgba(245,241,233,0.5)' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(245,241,233,0.2)' }}
        />
      </div>

      {error && (
        <p className="font-secondary" style={{ fontSize: '0.85rem', color: '#F4A4A0', backgroundColor: 'rgba(244,164,160,0.1)', border: '1px solid rgba(244,164,160,0.2)', borderRadius: 8, padding: '8px 12px' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="font-secondary"
        style={{
          backgroundColor: 'var(--paper)',
          color: 'var(--pine)',
          border: 'none',
          borderRadius: 10,
          padding: '13px 28px',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          transition: 'opacity 0.15s',
          alignSelf: 'flex-start',
        }}
      >
        {loading ? 'Envoi en cours…' : 'Envoyer le message →'}
      </button>
    </form>
  )
}
