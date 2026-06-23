import { NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { getStripe } from '../../../../../lib/stripe'
import { computeTrialEnd, isTrialExpired } from '../../../../../lib/trial'

function getAdmin() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const url = new URL(req.url)
    const restaurantIdParam = url.searchParams.get('restaurant_id')

    const { data: viewer } = await supabase
      .from('profiles')
      .select('is_admin, restaurant_id')
      .eq('id', user.id)
      .single()

    let targetUserId = user.id
    let targetFallbackCreatedAt: string | undefined = user.created_at

    if (viewer?.is_admin && restaurantIdParam && restaurantIdParam !== viewer.restaurant_id) {
      const admin = getAdmin()
      const { data: owner } = await admin
        .from('profiles')
        .select('id, created_at')
        .eq('restaurant_id', restaurantIdParam)
        .eq('is_admin', false)
        .limit(1)
        .single()
      if (owner) {
        targetUserId = owner.id as string
        targetFallbackCreatedAt = owner.created_at as string
      } else {
        return NextResponse.json({ error: 'Aucun propriétaire pour ce restaurant' }, { status: 404 })
      }
    }

    const readClient = targetUserId === user.id ? supabase : getAdmin()
    const { data: profile } = await readClient
      .from('profiles')
      .select('stripe_customer_id, subscription_status, created_at')
      .eq('id', targetUserId)
      .single()

    let status = profile?.subscription_status ?? null
    const createdAt = (profile?.created_at as string | undefined) ?? targetFallbackCreatedAt
    const trialEndIso = createdAt ? computeTrialEnd(createdAt).toISOString() : null

    if (status === 'trialing' && createdAt && isTrialExpired(createdAt)) {
      await getAdmin()
        .from('profiles')
        .update({ subscription_status: 'pending' })
        .eq('id', targetUserId)
      status = 'pending'
    }

    if (!profile?.stripe_customer_id || status === 'free') {
      return NextResponse.json({ status, cancelAt: null, stripeStatus: null, trialEnd: trialEndIso })
    }

    const stripe = getStripe()

    try {
      const existing = await stripe.customers.retrieve(profile.stripe_customer_id)
      if ((existing as { deleted?: boolean }).deleted) {
        return NextResponse.json({ status, cancelAt: null, stripeStatus: null, trialEnd: trialEndIso })
      }
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === 'resource_missing') {
        return NextResponse.json({ status, cancelAt: null, stripeStatus: null, trialEnd: trialEndIso })
      }
      throw err
    }

    const subs = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 5,
    })

    if (subs.data.length === 0) {
      return NextResponse.json({ status, cancelAt: null, stripeStatus: null, trialEnd: trialEndIso })
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
      trialEnd: trialEndIso,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('stripe info failed', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
