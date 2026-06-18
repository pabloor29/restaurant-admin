import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '../../../../../lib/stripe'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import Stripe from 'stripe'

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const admin = getAdminClient()

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const newStatus = stripeStatusToLocal(subscription.status)

    const { data: profile } = await admin
      .from('profiles')
      .select('id, subscription_status')
      .eq('stripe_customer_id', customerId)
      .single()

    if (profile && profile.subscription_status !== 'free') {
      await admin
        .from('profiles')
        .update({ subscription_status: newStatus })
        .eq('stripe_customer_id', customerId)
    }
  }

  return NextResponse.json({ received: true })
}
