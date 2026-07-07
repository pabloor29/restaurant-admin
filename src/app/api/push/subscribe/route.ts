import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function getAdminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.restaurant_id) {
    return NextResponse.json({ error: 'Aucun restaurant associé' }, { status: 400 })
  }

  const { subscription, userAgent } = await request.json()
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: 'Abonnement invalide' }, { status: 400 })
  }

  const admin = getAdminClient()
  const { error } = await admin
    .from('push_subscriptions')
    .upsert(
      {
        restaurant_id: profile.restaurant_id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: typeof userAgent === 'string' ? userAgent.slice(0, 400) : null,
      },
      { onConflict: 'endpoint' },
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
