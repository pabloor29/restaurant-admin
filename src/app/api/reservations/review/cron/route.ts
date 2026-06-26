import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, sendReviewEmail } from '../sendReviewEmail'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function parisOffsetMs(epochMs: number) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const parts = Object.fromEntries(dtf.formatToParts(new Date(epochMs)).map(p => [p.type, p.value]))
  const asUTC = Date.UTC(
    +parts.year, +parts.month - 1, +parts.day,
    +parts.hour === 24 ? 0 : +parts.hour, +parts.minute, +parts.second,
  )
  return asUTC - epochMs
}

function reservationEndUtc(date: string, time_slot: string) {
  // Reservation stored in Europe/Paris local time. Convert to UTC ms, add 12h.
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time_slot.split(':').map(Number)
  const naiveUtc = Date.UTC(y, m - 1, d, hh, mm)
  const offset = parisOffsetMs(naiveUtc)
  return naiveUtc - offset + 12 * 3600 * 1000
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = getAdminClient()

  const { data: restaurants } = await admin
    .from('restaurants')
    .select('id, name, google_review_url, review_email_auto')
    .eq('review_email_auto', true)
    .not('google_review_url', 'is', null)

  if (!restaurants || restaurants.length === 0) {
    return NextResponse.json({ success: true, processed: 0 })
  }

  const nowMs = Date.now()
  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const restaurant of restaurants) {
    const { data: reservations } = await admin
      .from('reservations')
      .select('id, name, email, date, time_slot, covers, status, review_email_sent_at, restaurant_id')
      .eq('restaurant_id', restaurant.id)
      .in('status', ['accepted', 'arrived'])
      .is('review_email_sent_at', null)
      .not('email', 'is', null)
      .lte('date', new Date().toISOString().split('T')[0])

    if (!reservations) continue

    for (const r of reservations) {
      if (reservationEndUtc(r.date, r.time_slot) > nowMs) {
        skipped++
        continue
      }
      const result = await sendReviewEmail(admin, r, restaurant)
      if (result.ok) {
        if (result.skipped) skipped++
        else sent++
      } else {
        errors.push(`${r.id}: ${result.error}`)
      }
    }
  }

  return NextResponse.json({ success: true, sent, skipped, errors })
}
