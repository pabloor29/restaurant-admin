import { NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { getStripe } from '../../../../../lib/stripe'

export async function POST() {
  try {
    if (!process.env.STRIPE_PRICE_ID || !process.env.NEXT_PUBLIC_APP_URL) {
      console.error('Stripe env missing', {
        hasPriceId: !!process.env.STRIPE_PRICE_ID,
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      })
      return NextResponse.json({ error: 'Configuration paiement manquante' }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, restaurant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.restaurant_id) {
      return NextResponse.json({ error: 'Aucun restaurant assigné' }, { status: 400 })
    }

    const stripe = getStripe()
    let customerId = profile.stripe_customer_id

    if (customerId) {
      try {
        const existing = await stripe.customers.retrieve(customerId)
        if ((existing as { deleted?: boolean }).deleted) customerId = null
      } catch (err) {
        const code = (err as { code?: string })?.code
        if (code === 'resource_missing') {
          console.warn(`Stale stripe_customer_id ${customerId} for user ${user.id} — recreating`)
          customerId = null
        } else {
          throw err
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/subscribe`,
      consent_collection: { terms_of_service: 'required' },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          commitment_months: '12',
          commitment_started_at: new Date().toISOString(),
        },
      },
      metadata: {
        supabase_user_id: user.id,
        commitment_months: '12',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('Stripe checkout failed', err)
    return NextResponse.json({ error: `Stripe: ${message}` }, { status: 500 })
  }
}
