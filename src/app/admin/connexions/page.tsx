"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../../../../lib/supabase/client'
import Link from 'next/link'

type EventType = 'visit' | 'contact'

type SiteEvent = {
  id: string
  type: EventType
  path: string | null
  ip: string | null
  country: string | null
  region: string | null
  city: string | null
  device: string | null
  is_bot: boolean
  referer: string | null
  name: string | null
  email: string | null
  restaurant: string | null
  message: string | null
  email_valid: boolean | null
  email_reason: string | null
  created_at: string
}

const REASON_LABEL: Record<string, string> = {
  syntaxe: 'syntaxe invalide',
  jetable: 'adresse jetable',
  domaine_inexistant: 'domaine inexistant',
}

function fmt(ts: string) {
  return new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function geoOf(e: SiteEvent) {
  return [e.city, e.region, e.country].filter(Boolean).join(', ') || 'localisation inconnue'
}

export default function ConnexionsPage() {
  const supabase = createClient()
  const [filter, setFilter] = useState<EventType>('contact')
  const [events, setEvents] = useState<SiteEvent[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('site_events')
      .select('*')
      .eq('type', filter)
      .order('created_at', { ascending: false })
      .limit(200)
    setEvents((data as SiteEvent[]) ?? [])
    setLoading(false)
  }, [supabase, filter])

  useEffect(() => { load() }, [load])

  const suspectCount = events.filter(e => e.is_bot || e.email_valid === false).length

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-primary" style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1 }}>
              Connexions
            </h1>
            <p className="font-secondary mt-1" style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--muted)', fontWeight: 600 }}>
              QUI SE CONNECTE AU SITE
            </p>
          </div>
          <Link
            href="/admin"
            className="font-secondary"
            style={{ color: 'var(--pine)', backgroundColor: 'var(--pine-light)', border: 'none', borderRadius: 99, padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}
          >
            ← Admin
          </Link>
        </div>

        {/* Filter toggle */}
        <div className="flex items-center gap-2 mb-6">
          {(['contact', 'visit'] as EventType[]).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="font-secondary cursor-pointer"
              style={{
                borderRadius: 99, padding: '7px 16px', fontSize: '0.82rem', fontWeight: 600, border: 'none',
                backgroundColor: filter === t ? 'var(--pine)' : 'var(--pine-light)',
                color: filter === t ? 'var(--paper)' : 'var(--pine)',
              }}
            >
              {t === 'contact' ? 'Formulaire de contact' : 'Visites landing'}
            </button>
          ))}
          <button onClick={load} className="font-secondary cursor-pointer" style={{ marginLeft: 'auto', color: 'var(--muted)', background: 'none', border: 'none', fontSize: '0.82rem' }}>
            ↻ Rafraîchir
          </button>
        </div>

        {filter === 'contact' && !loading && events.length > 0 && (
          <p className="font-secondary" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 14 }}>
            {events.length} demande{events.length > 1 ? 's' : ''} · <span style={{ color: suspectCount ? '#B4452F' : 'var(--muted)', fontWeight: 600 }}>{suspectCount} suspecte{suspectCount > 1 ? 's' : ''}</span>
          </p>
        )}

        {loading ? (
          <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Chargement…</p>
        ) : events.length === 0 ? (
          <p className="font-secondary" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Aucune donnée pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map(e => {
              const suspect = e.is_bot || e.email_valid === false
              return (
                <div
                  key={e.id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: `1px solid ${suspect ? 'rgba(180,69,47,0.35)' : 'var(--border)'}`,
                    borderRadius: 12,
                    padding: '14px 16px',
                  }}
                >
                  <div className="flex justify-between items-start" style={{ gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      {e.type === 'contact' ? (
                        <p className="font-secondary" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                          {e.name || '—'}{e.restaurant ? ` · ${e.restaurant}` : ''}
                        </p>
                      ) : (
                        <p className="font-secondary" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                          {geoOf(e)}
                        </p>
                      )}
                      {e.type === 'contact' && e.email && (
                        <p className="font-secondary" style={{ fontSize: '0.85rem', margin: '2px 0 0', color: e.email_valid === false ? '#B4452F' : 'var(--pine)' }}>
                          {e.email}
                          {e.email_valid === false && (
                            <span style={{ fontWeight: 600 }}> ⚠ {REASON_LABEL[e.email_reason ?? ''] ?? e.email_reason}</span>
                          )}
                        </p>
                      )}
                    </div>
                    <span className="font-secondary" style={{ fontSize: '0.72rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{fmt(e.created_at)}</span>
                  </div>

                  {e.type === 'contact' && e.message && (
                    <p className="font-secondary" style={{ fontSize: '0.85rem', color: 'var(--ink)', margin: '8px 0 0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{e.message}</p>
                  )}

                  <div className="font-secondary" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {e.type === 'contact' && <span>📍 {geoOf(e)}</span>}
                    <span style={{ color: e.is_bot ? '#B4452F' : 'var(--muted)' }}>💻 {e.device || 'inconnu'}{e.is_bot ? ' ⚠' : ''}</span>
                    {e.ip && <span>🔌 {e.ip}</span>}
                    {e.referer && <span>↩ {e.referer}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
