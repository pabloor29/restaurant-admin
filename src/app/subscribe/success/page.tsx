import { createClient } from '../../../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SubscribeSuccessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id, subscription_status')
    .eq('id', user.id)
    .single()

  if (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing') {
    redirect(`/restaurant/${profile.restaurant_id}`)
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: 'var(--pine-light)' }}
      >
        <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
          <path d="M2 11L10 19L26 2" stroke="#13503B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 className="font-primary mb-3" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
        Merci !
      </h1>
      <p className="font-secondary mb-2" style={{ color: 'var(--ink)', fontSize: '0.95rem' }}>
        Votre abonnement est en cours d&apos;activation.
      </p>
      <p className="font-secondary mb-10" style={{ color: 'var(--slate)', fontSize: '0.85rem' }}>
        Cela peut prendre quelques secondes.
      </p>

      {profile?.restaurant_id && (
        <Link
          href={`/restaurant/${profile.restaurant_id}`}
          className="font-secondary"
          style={{
            backgroundColor: 'var(--pine)',
            color: 'var(--paper)',
            borderRadius: 10,
            padding: '12px 28px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Accéder à mon espace →
        </Link>
      )}
    </div>
  )
}
