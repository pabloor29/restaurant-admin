"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '../../../../lib/supabase/client'

const supabase = createClient()

const ALL_SECTIONS = [
  { path: '/horaires', label: 'Horaires', key: 'horaires' },
  { path: '/fermetures', label: 'Fermetures', key: 'fermetures' },
  { path: '/conges', label: 'Congés', key: 'conges' },
  { path: '/formules', label: 'Formules', key: 'formules' },
  { path: '/menus', label: 'Menus', key: 'menus' },
  { path: '/evenements', label: 'Évènements', key: 'evenements' },
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
      <nav className="flex overflow-x-auto" style={{ marginBottom: isAdmin ? '6px' : '-1px' }}>
        {visibleSections.map(({ path, label, key }) => {
          const href = `/restaurant/${restaurantId}${path}`
          const isActive = pathname.startsWith(href)
          const isDisabled = isAdmin && !enabled[key]
          return (
            <Link
              key={path}
              href={href}
              className="font-secondary text-sm whitespace-nowrap px-4 py-3 transition-colors"
              style={{
                color: isActive ? 'var(--neutral)' : 'rgba(252,238,239,0.4)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                opacity: isDisabled ? 0.35 : 1,
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
                className="flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-all flex-shrink-0"
                style={{
                  backgroundColor: isOn ? 'rgba(252,238,239,0.08)' : 'rgba(252,238,239,0.03)',
                  border: `1px solid ${isOn ? 'rgba(252,238,239,0.18)' : 'rgba(252,238,239,0.07)'}`,
                }}
              >
                {/* Toggle switch */}
                <span
                  className="relative flex-shrink-0 rounded-full transition-colors"
                  style={{
                    width: '24px',
                    height: '13px',
                    backgroundColor: isOn ? 'var(--primary)' : 'rgba(252,238,239,0.12)',
                  }}
                >
                  <span
                    className="absolute top-0.5 rounded-full transition-all"
                    style={{
                      width: '9px',
                      height: '9px',
                      backgroundColor: 'white',
                      left: isOn ? '12px' : '2px',
                    }}
                  />
                </span>
                <span
                  className="font-secondary whitespace-nowrap"
                  style={{
                    fontSize: '0.65rem',
                    color: isOn ? 'rgba(252,238,239,0.6)' : 'rgba(252,238,239,0.2)',
                  }}
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
