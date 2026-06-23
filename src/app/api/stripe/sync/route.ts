import { NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { getStripe } from '../../../../../lib/stripe'
import type Stripe from 'stripe'

function stripeStatusToLocal(status: Stripe.Subscription.Status): string {
  const map: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    canceled: 'canceled',
    past_due: 'past_due',
    unpaid: 'past_due',
    incomplete: 'pending',
    incomplete_expired: 'canceled',
    paused: 'canceled',
  }
  return map[status] ?? 'pending'
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'Aucun client Stripe lié' }, { status: 404 })
    }

    if (profile.subscription_status === 'free') {
      return NextResponse.json({ status: 'free', message: 'Compte en accès libre, pas de sync' })
    }

    const stripe = getStripe()

    try {
      const existing = await stripe.customers.retrieve(profile.stripe_customer_id)
      if ((existing as { deleted?: boolean }).deleted) {
        return NextResponse.json({ error: 'Client Stripe supprimé' }, { status: 404 })
      }
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === 'resource_missing') {
        return NextResponse.json(
          { error: 'Client Stripe introuvable (mauvais mode test/live ?)' },
          { status: 404 }
        )
      }
      throw err
    }

    const subs = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 5,
    })

    if (subs.data.length === 0) {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'pending' })
        .eq('id', user.id)
      return NextResponse.json({
        status: 'pending',
        message: 'Aucun abonnement Stripe trouvé',
      })
    }

    const priority: Record<string, number> = {
      active: 0,
      trialing: 0,
      past_due: 1,
      unpaid: 1,
      incomplete: 2,
      paused: 3,
      canceled: 4,
      incomplete_expired: 5,
    }
    const sub = [...subs.data].sort(
      (a, b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9)
    )[0]

    const newStatus = stripeStatusToLocal(sub.status)

    await supabase
      .from('profiles')
      .update({ subscription_status: newStatus })
      .eq('id', user.id)

    return NextResponse.json({
      status: newStatus,
      stripeStatus: sub.status,
      subscriptionId: sub.id,
      previous: profile.subscription_status,
      changed: profile.subscription_status !== newStatus,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('stripe sync failed', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
