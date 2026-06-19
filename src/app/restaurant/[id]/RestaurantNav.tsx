"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '../../../../lib/supabase/client'

const supabase = createClient()

const ALL_SECTIONS = [
  { path: '/reservations', label: 'Réservations', key: 'reservations' },
  { path: '/horaires',     label: 'Horaires',     key: 'horaires' },
  { path: '/fermetures',   label: 'Fermetures',   key: 'fermetures' },
  { path: '/conges',       label: 'Congés',       key: 'conges' },
  { path: '/formules',     label: 'Formules',     key: 'formules' },
  { path: '/menus',        label: 'Menus',        key: 'menus' },
  { path: '/evenements',   label: 'Évènements',   key: 'evenements' },
]

const STATIC_SECTIONS = [
  { path: '/infos', label: 'Infos' },
]

export default function RestaurantNav({
  restaurantId,
  isAdmin,
  initialEnabled,
}: {
  restaurantId: string
  isAdmin: boolean
  initialEnabled: Record<string, boolean>
}) {
  const pathname = usePathname()
  const [enabled, setEnabled] = useState(initialEnabled)

  const toggle = async (key: string) => {
    const newVal = !enabled[key]
    setEnabled(prev => ({ ...prev, [key]: newVal }))
    await supabase.from('restaurant_sections').upsert(
      { restaurant_id: restaurantId, section: key, enabled: newVal },
      { onConflict: 'restaurant_id,section' }
    )
  }

  const visibleSections = isAdmin
    ? ALL_SECTIONS
    : ALL_SECTIONS.filter(s => enabled[s.key] !== false)

  return (
    <div>
      <nav className="flex overflow-x-auto" style={{ marginBottom: isAdmin ? '6px' : 0, gap: 2 }}>
        {visibleSections.map(({ path, label, key }) => {
          const href = `/restaurant/${restaurantId}${path}`
          const isActive = pathname.startsWith(href)
          const isDisabled = isAdmin && !enabled[key]
          return (
            <Link
              key={path}
              href={href}
              className="font-secondary whitespace-nowrap transition-colors"
              style={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--pine)' : 'var(--slate)',
                borderBottom: isActive ? '2px solid var(--pine)' : '2px solid transparent',
                padding: '10px 14px',
                textDecoration: 'none',
                opacity: isDisabled ? 0.35 : 1,
              }}
            >
              {label}
            </Link>
          )
        })}
        {STATIC_SECTIONS.map(({ path, label }) => {
          const href = `/restaurant/${restaurantId}${path}`
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={path}
              href={href}
              className="font-secondary whitespace-nowrap transition-colors"
              style={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--pine)' : 'var(--slate)',
                borderBottom: isActive ? '2px solid var(--pine)' : '2px solid transparent',
                padding: '10px 14px',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {isAdmin && (
        <div className="flex overflow-x-auto pb-3 gap-2">
          {ALL_SECTIONS.map(({ key, label }) => {
            const isOn = enabled[key] !== false
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                className="flex items-center gap-2 flex-shrink-0 cursor-pointer transition-all"
                style={{
                  padding: '5px 10px',
                  borderRadius: 99,
                  backgroundColor: isOn ? 'var(--pine-light)' : 'rgba(22,32,27,0.04)',
                  border: `1px solid ${isOn ? 'rgba(19,80,59,0.2)' : 'var(--border)'}`,
                }}
              >
                <span
                  className="relative flex-shrink-0 rounded-full transition-colors"
                  style={{
                    width: 24,
                    height: 13,
                    backgroundColor: isOn ? 'var(--pine)' : 'var(--border)',
                  }}
                >
                  <span
                    className="absolute top-0.5 rounded-full transition-all"
                    style={{
                      width: 9,
                      height: 9,
                      backgroundColor: 'white',
                      left: isOn ? 12 : 2,
                    }}
                  />
                </span>
                <span
                  className="font-secondary whitespace-nowrap"
                  style={{ fontSize: '0.72rem', fontWeight: 500, color: isOn ? 'var(--pine)' : 'var(--muted)' }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
