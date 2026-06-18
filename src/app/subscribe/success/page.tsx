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

  // Si l'abonnement est déjà actif (webhook reçu), rediriger directement
  if (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing') {
    redirect(`/restaurant/${profile.restaurant_id}`)
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'rgba(252,238,239,0.08)', border: '1px solid rgba(252,238,239,0.15)' }}
      >
        <span style={{ fontSize: '1.8rem' }}>✓</span>
      </div>

      <h1 className="font-primary text-neutral mb-3" style={{ fontSize: '2.5rem' }}>
        Merci !
      </h1>
      <p className="font-secondary mb-2" style={{ color: 'rgba(252,238,239,0.7)', fontSize: '0.95rem' }}>
        Votre abonnement est en cours d&apos;activation.
      </p>
      <p className="font-secondary mb-10" style={{ color: 'rgba(252,238,239,0.35)', fontSize: '0.8rem' }}>
        Cela peut prendre quelques secondes.
      </p>

      {profile?.restaurant_id && (
        <Link
          href={`/restaurant/${profile.restaurant_id}`}
          className="font-secondary py-3 px-8 rounded-xl"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--neutral)',
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            textDecoration: 'none',
          }}
        >
          ACCÉDER À MON ESPACE
        </Link>
      )}
    </div>
  )
}
