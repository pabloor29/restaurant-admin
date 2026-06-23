import { NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { getStripe } from '../../../../../lib/stripe'
import { computeCancellation } from '../../../../../lib/cancellation'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'Aucun abonnement trouvé' }, { status: 404 })
    }

    const subs = await getStripe().subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 1,
    })
    const sub = subs.data[0]
    if (!sub || ['canceled', 'incomplete_expired'].includes(sub.status)) {
      return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 404 })
    }

    return NextResponse.json(computeCancellation(sub))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('cancel-preview failed', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
