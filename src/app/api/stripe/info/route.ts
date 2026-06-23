import { NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { getStripe } from '../../../../../lib/stripe'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('id', user.id)
      .single()

    const status = profile?.subscription_status ?? null

    if (!profile?.stripe_customer_id || status === 'free') {
      return NextResponse.json({ status, cancelAt: null, stripeStatus: null })
    }

    const stripe = getStripe()

    try {
      const existing = await stripe.customers.retrieve(profile.stripe_customer_id)
      if ((existing as { deleted?: boolean }).deleted) {
        return NextResponse.json({ status, cancelAt: null, stripeStatus: null })
      }
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === 'resource_missing') {
        return NextResponse.json({ status, cancelAt: null, stripeStatus: null })
      }
      throw err
    }

    const subs = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 5,
    })

    if (subs.data.length === 0) {
      return NextResponse.json({ status, cancelAt: null, stripeStatus: null })
    }

    const priority: Record<string, number> = {
      active: 0, trialing: 0, past_due: 1, unpaid: 1, incomplete: 2,
      paused: 3, canceled: 4, incomplete_expired: 5,
    }
    const sub = [...subs.data].sort(
      (a, b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9)
    )[0]

    return NextResponse.json({
      status,
      stripeStatus: sub.status,
      cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
      cancellationRequestedAt: sub.metadata?.cancellation_requested_at ?? null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('stripe info failed', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
