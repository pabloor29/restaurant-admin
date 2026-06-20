import type { Metadata } from 'next'
import { createClient } from '../../../../lib/supabase/server'
import RestaurantNav from './RestaurantNav'

export const metadata: Metadata = {
  title: 'Espace restaurant',
  robots: { index: false, follow: false, nocache: true },
}

export default async function RestaurantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name')
    .eq('id', id)
    .single()

  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = !!profile?.is_admin
  }

  const ALL_SECTION_KEYS = ['reservations', 'horaires', 'creneaux', 'fermetures', 'conges', 'formules', 'menus', 'evenements']
  const initialEnabled: Record<string, boolean> = Object.fromEntries(ALL_SECTION_KEYS.map(k => [k, true]))

  const { data: sectionRows } = await supabase
    .from('restaurant_sections')
    .select('section, enabled')
    .eq('restaurant_id', id)
  sectionRows?.forEach(row => { initialEnabled[row.section] = row.enabled })

  return (
    <div
      className="flex"
      style={{ minHeight: '100vh', backgroundColor: 'var(--paper)' }}
    >
      <RestaurantNav
        restaurantId={id}
        restaurantName={restaurant?.name ?? ''}
        isAdmin={isAdmin}
        initialEnabled={initialEnabled}
      />

      {/* Contenu principal */}
      <div className="flex-1 min-w-0">
        {/* Espace pour la top bar mobile fixe */}
        <div className="lg:hidden" style={{ height: 56 }} />
        <main style={{ padding: 'clamp(20px,4vw,32px) clamp(16px,3vw,24px)' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
