"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  { path: '/horaires', label: 'Horaires' },
  { path: '/fermetures', label: 'Fermetures' },
  { path: '/conges', label: 'Congés' },
  { path: '/formules', label: 'Formules' },
  { path: '/menus', label: 'Menus' },
]

export default function RestaurantNav({ restaurantId }: { restaurantId: string }) {
  const pathname = usePathname()

  return (
    <nav className="flex overflow-x-auto" style={{ marginBottom: '-1px' }}>
      {sections.map(({ path, label }) => {
        const href = `/restaurant/${restaurantId}${path}`
        const isActive = pathname.startsWith(href)
        return (
          <Link
            key={path}
            href={href}
            className="font-secondary text-sm whitespace-nowrap px-4 py-3 transition-colors"
            style={{
              color: isActive ? 'var(--neutral)' : 'rgba(252,238,239,0.4)',
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
