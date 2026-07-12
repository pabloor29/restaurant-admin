"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type SubscriptionStatus = 'pending' | 'active' | 'trialing' | 'canceled' | 'past_due' | 'free'

type User = {
  id: string
  email: string
  restaurant_id: string | null
  restaurant_name: string | null
  is_admin: boolean
  subscription_status: SubscriptionStatus
}

type ReservationMode = 'simple' | 'advanced'
type Restaurant = { id: string; name: string; reservation_mode: ReservationMode }

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  pending: 'En attente',
  active: 'Actif',
  trialing: 'Essai',
  canceled: 'Annulé',
  past_due: 'Impayé',
  free: 'Gratuit',
}

const STATUS_COLORS: Record<SubscriptionStatus, { text: string; bg: string }> = {
  pending:  { text: 'var(--muted)',             bg: 'transparent' },
  active:   { text: 'var(--status-ok-text)',    bg: 'var(--status-ok-bg)' },
  trialing: { text: 'var(--status-warn-text)',  bg: 'var(--status-warn-bg)' },
  canceled: { text: 'var(--status-err-text)',   bg: 'var(--status-err-bg)' },
  past_due: { text: 'var(--status-err-text)',   bg: 'var(--status-err-bg)' },
  free:     { text: 'var(--status-info-text)',  bg: 'var(--status-info-bg)' },
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
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [restaurantId, setRestaurantId] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const loadData = useCallback(async () => {
    setLoading(true)
    const [usersRes, { data: restData }] = await Promise.all([
      fetch('/api/admin/users'),
      supabase.from('restaurants').select('id, name, reservation_mode').order('name'),
    ])
    if (usersRes.ok) setUsers(await usersRes.json())
    if (restData) setRestaurants(restData)
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')
    setSuccess('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, restaurant_id: restaurantId || null }),
    })
    if (res.ok) {
      setSuccess(`Compte créé pour ${email}`)
      setEmail('')
      setPassword('')
      setRestaurantId('')
      loadData()
    } else {
      const data = await res.json()
      setError(data.error || 'Erreur lors de la création')
    }
    setCreating(false)
  }

  async function handleAssign(userId: string, newRestaurantId: string) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, restaurant_id: newRestaurantId || null }),
    })
    loadData()
  }

  async function handleModeChange(restaurantId: string, mode: ReservationMode) {
    await fetch('/api/admin/restaurants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurant_id: restaurantId, reservation_mode: mode }),
    })
    loadData()
  }

  async function handleStatusChange(userId: string, newStatus: SubscriptionStatus) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, subscription_status: newStatus }),
    })
    loadData()
  }

  const selectStyle = {
    border: '1.5px solid var(--border)',
    borderRadius: 8,
    padding: '7px 10px',
    fontSize: '0.8rem',
    color: 'var(--ink)',
    backgroundColor: 'var(--surface)',
    outline: 'none',
    cursor: 'pointer',
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-primary" style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1 }}>
              RESA<span style={{ color: 'var(--amber)' }}>.</span>
            </h1>
            <p className="font-secondary mt-1" style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
              ADMINISTRATION
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/prospects"
              className="font-secondary"
              style={{ color: 'var(--pine)', backgroundColor: 'var(--pine-light)', border: 'none', borderRadius: 99, padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}
            >
              Prospection →
            </Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
              className="font-secondary cursor-pointer"
              style={{ color: 'var(--muted)', background: 'none', border: 'none', fontSize: '0.85rem' }}
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Accès restaurants — recherche */}
        {restaurants.length > 0 && (() => {
          const q = search.trim().toLowerCase()
          const filtered = q ? restaurants.filter(r => r.name.toLowerCase().includes(q)) : []
          return (
            <div className="mb-8">
              <p className="font-secondary mb-3" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
                RESTAURANTS ({restaurants.length})
              </p>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un restaurant…"
                className="font-secondary"
                style={inputStyle}
              />
              {q && (
                <div className="flex flex-col gap-3 mt-3">
                  {filtered.length === 0 ? (
                    <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                      Aucun restaurant ne correspond.
                    </p>
                  ) : filtered.map(r => (
                    <div key={r.id} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        <span className="font-secondary" style={{ fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 500 }}>{r.name}</span>
                        <Link href={`/restaurant/${r.id}`} className="font-secondary" style={{ fontSize: '0.8rem', color: 'var(--pine)', textDecoration: 'none' }}>Accéder →</Link>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
                        <p className="font-secondary" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em' }}>MODE RÉSERVATION</p>
                        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
                          {(['simple', 'advanced'] as ReservationMode[]).map(m => {
                            const active = (r.reservation_mode ?? 'simple') === m
                            return (
                              <button
                                key={m}
                                onClick={() => handleModeChange(r.id, m)}
                                className="font-secondary cursor-pointer transition-all"
                                style={{ border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: '0.78rem', fontWeight: active ? 600 : 400, color: active ? 'var(--pine)' : 'var(--slate)', backgroundColor: active ? 'var(--pine-light)' : 'transparent' }}
                              >
                                {m === 'simple' ? 'Simple' : 'Avancé'}
                              </button>
                            )
                          })}
                        </div>
                        <p className="font-secondary" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          {(r.reservation_mode ?? 'simple') === 'simple'
                            ? 'Accepter / Refuser uniquement'
                            : 'Gestion complète + ajout manuel + suivi arrivée'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()}

        {/* Créer un compte */}
        <div className="mb-8" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px' }}>
          <p className="font-secondary mb-4" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
            CRÉER UN COMPTE
          </p>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="font-secondary" style={inputStyle} />
            <input type="password" placeholder="Mot de passe temporaire" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="font-secondary" style={inputStyle} />
            <select value={restaurantId} onChange={e => setRestaurantId(e.target.value)} className="font-secondary" style={{ ...inputStyle, color: restaurantId ? 'var(--ink)' : 'var(--muted)' }}>
              <option value="">Restaurant (optionnel)</option>
              {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>

            {error && <p className="font-secondary text-sm" style={{ color: 'var(--status-err-text)', backgroundColor: 'var(--status-err-bg)', borderRadius: 8, padding: '8px 12px' }}>{error}</p>}
            {success && <p className="font-secondary text-sm" style={{ color: 'var(--status-ok-text)', backgroundColor: 'var(--status-ok-bg)', borderRadius: 8, padding: '8px 12px' }}>{success}</p>}

            <button type="submit" disabled={creating} className="font-secondary cursor-pointer transition-all" style={{ backgroundColor: 'var(--pine)', color: 'var(--paper)', borderRadius: 10, padding: '12px', fontSize: '0.875rem', fontWeight: 600, border: 'none', opacity: creating ? 0.6 : 1 }}>
              {creating ? '...' : 'Créer le compte'}
            </button>
          </form>
        </div>

        {/* Liste utilisateurs */}
        <div>
          <p className="font-secondary mb-3" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
            UTILISATEURS {!loading && `(${users.length})`}
          </p>
          {loading ? (
            <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Chargement...</p>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map(u => {
                const sc = STATUS_COLORS[u.subscription_status]
                return (
                  <div
                    key={u.id}
                    className="admin-user-row flex items-center gap-3 p-4"
                    style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-secondary truncate" style={{ fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500 }}>
                        {u.email}
                        {u.is_admin && (
                          <span className="ml-2 font-secondary" style={{ fontSize: '0.72rem', color: 'var(--pine)', fontWeight: 600, backgroundColor: 'var(--pine-light)', padding: '2px 7px', borderRadius: 99 }}>admin</span>
                        )}
                      </p>
                      {!u.is_admin && (
                        <span
                          className="font-secondary inline-flex items-center mt-1"
                          style={{ fontSize: '0.72rem', fontWeight: 600, color: sc.text, backgroundColor: sc.bg, padding: '2px 8px', borderRadius: 99 }}
                        >
                          {STATUS_LABELS[u.subscription_status]}
                        </span>
                      )}
                    </div>
                    {!u.is_admin && (
                      <div className="admin-user-selects flex items-center gap-2 flex-shrink-0">
                        <select
                          value={u.subscription_status}
                          onChange={e => handleStatusChange(u.id, e.target.value as SubscriptionStatus)}
                          className="font-secondary"
                          style={selectStyle}
                        >
                          {(Object.keys(STATUS_LABELS) as SubscriptionStatus[]).map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                        <select
                          value={u.restaurant_id ?? ''}
                          onChange={e => handleAssign(u.id, e.target.value)}
                          className="font-secondary"
                          style={{ ...selectStyle, color: u.restaurant_id ? 'var(--ink)' : 'var(--muted)' }}
                        >
                          <option value="">Aucun restaurant</option>
                          {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                )
              })}
              {users.length === 0 && (
                <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Aucun utilisateur.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
