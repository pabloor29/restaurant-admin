import { NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { getStripe } from '../../../../../lib/stripe'
import { computeCancellation, MONTHLY_PRICE_EUR } from '../../../../../lib/cancellation'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    if (body.confirm !== true) {
      return NextResponse.json({ error: 'Confirmation requise' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'Aucun abonnement' }, { status: 404 })
    }

    const stripe = getStripe()
    const subs = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 1,
    })
    const sub = subs.data[0]
    if (!sub || ['canceled', 'incomplete_expired'].includes(sub.status)) {
      return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 404 })
    }

    const preview = computeCancellation(sub)

    if (preview.withinCommitment && preview.monthsLeft > 0) {
      const amountCents = preview.monthsLeft * MONTHLY_PRICE_EUR * 100

      await stripe.invoiceItems.create({
        customer: profile.stripe_customer_id,
        amount: amountCents,
        currency: 'eur',
        description: `Indemnité de résiliation anticipée — ${preview.monthsLeft} mois × ${MONTHLY_PRICE_EUR} €`,
        metadata: {
          subscription_id: sub.id,
          months_left: String(preview.monthsLeft),
          reason: 'early_cancellation',
        },
      })

      const invoice = await stripe.invoices.create({
        customer: profile.stripe_customer_id,
        auto_advance: true,
        collection_method: 'charge_automatically',
        description: `Résiliation anticipée du contrat RESA (engagement 12 mois)`,
      })

      if (invoice.id) {
        await stripe.invoices.finalizeInvoice(invoice.id)
      }

      await stripe.subscriptions.cancel(sub.id, {
        invoice_now: false,
        prorate: false,
      })

      return NextResponse.json({
        mode: 'early_cancellation',
        monthsLeft: preview.monthsLeft,
        indemnityEur: preview.indemnityEur,
        invoiceId: invoice.id,
        effectiveAt: new Date().toISOString(),
      })
    }

    const cancelAtUnix = Math.floor(new Date(preview.noticeEndsAt).getTime() / 1000)
    const updated = await stripe.subscriptions.update(sub.id, {
      cancel_at: cancelAtUnix,
      metadata: {
        ...sub.metadata,
        cancellation_requested_at: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      mode: 'notice_period',
      effectiveAt: new Date(updated.cancel_at! * 1000).toISOString(),
      indemnityEur: 0,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('cancel failed', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
