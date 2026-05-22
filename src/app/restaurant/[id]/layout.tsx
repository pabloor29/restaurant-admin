import { createClient } from '../../../../lib/supabase/server'
import Link from 'next/link'
import RestaurantNav from './RestaurantNav'

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

  return (
    <div className="min-h-screen bg-secondary">
      <header className="px-6 pt-6" style={{ borderBottom: '1px solid rgba(252,238,239,0.08)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h1 className="font-primary text-neutral" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
              {restaurant?.name ?? '—'}
            </h1>
            {isAdmin && (
              <Link
                href="/admin"
                className="font-secondary text-sm"
                style={{ color: 'rgba(252,238,239,0.35)' }}
              >
                ← Admin
              </Link>
            )}
          </div>
          <RestaurantNav restaurantId={id} />
        </div>
      </header>
      <main className="px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
