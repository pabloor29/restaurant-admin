"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type User = {
  id: string
  email: string
  restaurant_id: string | null
  restaurant_name: string | null
  is_admin: boolean
}

type Restaurant = {
  id: string
  name: string
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
  const router = useRouter()
  const supabase = createClient()

  const loadData = useCallback(async () => {
    setLoading(true)
    const [usersRes, { data: restData }] = await Promise.all([
      fetch('/api/admin/users'),
      supabase.from('restaurants').select('id, name').order('name'),
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

  return (
    <div className="min-h-screen bg-secondary px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-primary text-neutral" style={{ fontSize: '3rem', lineHeight: 1 }}>
              ADMIN
            </h1>
            <p className="font-secondary text-neutral mt-1" style={{ opacity: 0.4, fontSize: '0.8rem', letterSpacing: '0.15em' }}>
              GESTION DES UTILISATEURS
            </p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            className="font-secondary text-sm cursor-pointer"
            style={{ color: 'rgba(252,238,239,0.3)', background: 'none', border: 'none' }}
          >
            Se déconnecter
          </button>
        </div>

        {/* Accès aux restaurants */}
        {restaurants.length > 0 && (
          <div className="mb-10">
            <h2 className="font-secondary text-neutral mb-4" style={{ fontSize: '0.8rem', letterSpacing: '0.12em', opacity: 0.6 }}>
              RESTAURANTS
            </h2>
            <div className="flex flex-col gap-2">
              {restaurants.map(r => (
                <Link
                  key={r.id}
                  href={`/restaurant/${r.id}`}
                  className="flex items-center justify-between p-4 rounded-lg transition-opacity hover:opacity-80"
                  style={{ backgroundColor: 'rgba(252,238,239,0.05)', border: '1px solid rgba(252,238,239,0.1)', textDecoration: 'none' }}
                >
                  <span className="font-secondary text-sm" style={{ color: 'var(--neutral)' }}>{r.name}</span>
                  <span className="font-secondary text-xs" style={{ color: 'rgba(252,238,239,0.3)' }}>Accéder →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Créer un compte */}
        <div className="mb-10 p-6 rounded-xl" style={{ backgroundColor: 'rgba(252,238,239,0.05)', border: '1px solid rgba(252,238,239,0.1)' }}>
          <h2 className="font-secondary text-neutral mb-4" style={{ fontSize: '0.8rem', letterSpacing: '0.12em', opacity: 0.6 }}>
            CRÉER UN COMPTE
          </h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="font-secondary rounded-lg px-4 py-3 outline-none text-sm"
              style={{ backgroundColor: 'rgba(252,238,239,0.07)', border: '1px solid rgba(252,238,239,0.15)', color: 'var(--neutral)' }}
            />
            <input
              type="password"
              placeholder="Mot de passe temporaire"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="font-secondary rounded-lg px-4 py-3 outline-none text-sm"
              style={{ backgroundColor: 'rgba(252,238,239,0.07)', border: '1px solid rgba(252,238,239,0.15)', color: 'var(--neutral)' }}
            />
            <select
              value={restaurantId}
              onChange={e => setRestaurantId(e.target.value)}
              className="font-secondary rounded-lg px-4 py-3 outline-none text-sm cursor-pointer"
              style={{ backgroundColor: 'rgba(252,238,239,0.07)', border: '1px solid rgba(252,238,239,0.15)', color: restaurantId ? 'var(--neutral)' : 'rgba(252,238,239,0.4)' }}
            >
              <option value="" style={{ backgroundColor: '#180607' }}>Restaurant (optionnel)</option>
              {restaurants.map(r => (
                <option key={r.id} value={r.id} style={{ backgroundColor: '#180607', color: '#FCEEEF' }}>{r.name}</option>
              ))}
            </select>

            {error && <p className="font-secondary text-sm text-center" style={{ color: 'var(--primary)' }}>{error}</p>}
            {success && <p className="font-secondary text-sm text-center" style={{ color: 'var(--neutral)', opacity: 0.7 }}>{success}</p>}

            <button
              type="submit"
              disabled={creating}
              className="font-secondary py-3 rounded-lg transition-opacity cursor-pointer"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--neutral)', opacity: creating ? 0.5 : 1 }}
            >
              {creating ? '...' : 'Créer le compte'}
            </button>
          </form>
        </div>

        {/* Liste des utilisateurs */}
        <div>
          <h2 className="font-secondary text-neutral mb-4" style={{ fontSize: '0.8rem', letterSpacing: '0.12em', opacity: 0.6 }}>
            UTILISATEURS {!loading && `(${users.length})`}
          </h2>
          {loading ? (
            <p className="font-secondary text-sm" style={{ color: 'rgba(252,238,239,0.4)' }}>Chargement...</p>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map(u => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-4 rounded-lg"
                  style={{ backgroundColor: 'rgba(252,238,239,0.05)', border: '1px solid rgba(252,238,239,0.1)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-secondary text-sm truncate" style={{ color: 'var(--neutral)' }}>
                      {u.email}
                      {u.is_admin && (
                        <span className="ml-2 text-xs" style={{ color: 'var(--primary)', opacity: 0.8 }}>admin</span>
                      )}
                    </p>
                  </div>
                  {!u.is_admin && (
                    <select
                      value={u.restaurant_id ?? ''}
                      onChange={e => handleAssign(u.id, e.target.value)}
                      className="font-secondary text-sm rounded-lg px-3 py-2 outline-none cursor-pointer"
                      style={{ backgroundColor: 'rgba(252,238,239,0.07)', border: '1px solid rgba(252,238,239,0.15)', color: u.restaurant_id ? 'var(--neutral)' : 'rgba(252,238,239,0.4)' }}
                    >
                      <option value="" style={{ backgroundColor: '#180607' }}>Aucun restaurant</option>
                      {restaurants.map(r => (
                        <option key={r.id} value={r.id} style={{ backgroundColor: '#180607', color: '#FCEEEF' }}>{r.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
              {users.length === 0 && (
                <p className="font-secondary text-sm" style={{ color: 'rgba(252,238,239,0.4)' }}>Aucun utilisateur.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
