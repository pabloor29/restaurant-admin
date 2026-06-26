import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { getAdminClient, sendReviewEmail } from './sendReviewEmail'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { reservation_id } = await request.json()
  if (!reservation_id) return NextResponse.json({ error: 'reservation_id requis' }, { status: 400 })

  const admin = getAdminClient()

  const { data: reservation } = await admin
    .from('reservations')
    .select('id, name, email, date, time_slot, covers, status, review_email_sent_at, restaurant_id')
    .eq('id', reservation_id)
    .single()

  if (!reservation) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })

  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin, restaurant_id')
    .eq('id', user.id)
    .single()

  const isOwner = profile?.restaurant_id === reservation.restaurant_id
  if (!profile?.is_admin && !isOwner) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { data: restaurant } = await admin
    .from('restaurants')
    .select('id, name, google_review_url')
    .eq('id', reservation.restaurant_id)
    .single()

  if (!restaurant) return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 })
  if (!restaurant.google_review_url) {
    return NextResponse.json({ error: 'Lien Google avis non configuré' }, { status: 400 })
  }

  const result = await sendReviewEmail(admin, reservation, restaurant)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 })
  if (result.skipped) return NextResponse.json({ success: true, skipped: result.skipped })
  return NextResponse.json({ success: true })
}
