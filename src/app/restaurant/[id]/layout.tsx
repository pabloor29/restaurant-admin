import { createClient } from '../../../../lib/supabase/server'
import Link from 'next/link'
import RestaurantNav from './RestaurantNav'
import LogoutButton from './LogoutButton'

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

  const ALL_SECTION_KEYS = ['horaires', 'fermetures', 'conges', 'formules', 'menus', 'evenements']
  const initialEnabled: Record<string, boolean> = Object.fromEntries(ALL_SECTION_KEYS.map(k => [k, true]))

  const { data: sectionRows } = await supabase
    .from('restaurant_sections')
    .select('section, enabled')
    .eq('restaurant_id', id)
  sectionRows?.forEach(row => { initialEnabled[row.section] = row.enabled })

  return (
    <div className="min-h-screen bg-secondary">
      <header style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 16px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: 'var(--pine)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <span className="font-primary" style={{ fontSize: '1.1rem', color: 'var(--paper)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>R</span>
              </div>
              <h1 className="font-primary" style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1 }}>
                {restaurant?.name ?? '—'}
              </h1>
            </div>
            {isAdmin ? (
              <Link
                href="/admin"
                className="font-secondary"
                style={{ color: 'var(--slate)', fontSize: '0.85rem', textDecoration: 'none' }}
              >
                ← Admin
              </Link>
            ) : (
              <LogoutButton />
            )}
          </div>
          <RestaurantNav restaurantId={id} isAdmin={isAdmin} initialEnabled={initialEnabled} />
        </div>
      </header>
      <main style={{ padding: 'clamp(20px,4vw,32px) clamp(16px,3vw,24px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
