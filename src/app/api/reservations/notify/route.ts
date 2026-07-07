import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { getWebPush } from '../../../../../lib/webpush'

function getAdminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

type ReservationRecord = {
  id: string
  restaurant_id: string
  name: string
  covers: number
  date: string
  time_slot: string
  status: string
}

// Called by the Supabase Database Webhook on INSERT into `reservations`.
// Secured with a shared secret header (no user session).
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (!secret || secret !== process.env.RESERVATION_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)
  const record: ReservationRecord | undefined = payload?.record ?? payload
  if (!record?.restaurant_id || !record?.id) {
    return NextResponse.json({ ok: true, skipped: 'no_record' })
  }

  // Only alert for genuine new customer requests, not manual admin entries.
  if (record.status && record.status !== 'pending') {
    return NextResponse.json({ ok: true, skipped: 'not_pending' })
  }

  const admin = getAdminClient()
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('restaurant_id', record.restaurant_id)

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, skipped: 'no_subscriptions' })
  }

  const covers = Number(record.covers) || 0
  const body = `${record.name} · ${covers} couvert${covers > 1 ? 's' : ''} · ${fmtDate(record.date)} à ${record.time_slot}`
  const notifPayload = JSON.stringify({
    title: 'Nouvelle demande de réservation',
    body,
    url: `/restaurant/${record.restaurant_id}/reservations`,
    tag: `resa-${record.id}`,
  })

  const wp = getWebPush()
  const results = await Promise.allSettled(
    subs.map((s) =>
      wp.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        notifPayload,
      ),
    ),
  )

  // Prune subscriptions the push service reports as gone (404/410).
  const dead: string[] = []
  results.forEach((r, i) => {
    if (
      r.status === 'rejected' &&
      (r.reason?.statusCode === 404 || r.reason?.statusCode === 410)
    ) {
      dead.push(subs[i].endpoint)
    }
  })
  if (dead.length) {
    await admin.from('push_subscriptions').delete().in('endpoint', dead)
  }

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return NextResponse.json({ ok: true, sent, pruned: dead.length })
}
