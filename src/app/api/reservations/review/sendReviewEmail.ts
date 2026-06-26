import { Resend } from 'resend'
import { createClient as createAdmin, SupabaseClient } from '@supabase/supabase-js'

type ReservationRow = {
  id: string
  name: string
  email: string | null
  date: string
  time_slot: string
  covers: number
  status: string
  review_email_sent_at: string | null
  restaurant_id: string
}

type RestaurantRow = {
  id: string
  name: string
  google_review_url: string | null
}

const resend = new Resend(process.env.RESEND_API_KEY)

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export type SendReviewResult =
  | { ok: true; skipped?: 'no_email' | 'no_url' | 'already_sent' | 'bad_status' }
  | { ok: false; error: string }

export async function sendReviewEmail(
  admin: SupabaseClient,
  reservation: ReservationRow,
  restaurant: RestaurantRow,
): Promise<SendReviewResult> {
  if (!reservation.email) return { ok: true, skipped: 'no_email' }
  if (!restaurant.google_review_url) return { ok: true, skipped: 'no_url' }
  if (reservation.review_email_sent_at) return { ok: true, skipped: 'already_sent' }
  if (reservation.status !== 'accepted' && reservation.status !== 'arrived') {
    return { ok: true, skipped: 'bad_status' }
  }

  const from = process.env.RESEND_FROM_EMAIL!
  const reviewUrl = restaurant.google_review_url
  const restaurantName = restaurant.name

  const html = `<div style="font-family: 'Helvetica Neue', sans-serif; max-width: 560px; margin: 0 auto; color: #16201B; background: #F5F1E9; padding: 32px 24px; border-radius: 16px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <span style="font-size: 1.3rem; font-weight: 800; color: #16201B; letter-spacing: -0.03em;">${escapeHtml(restaurantName)}</span>
    </div>
    <div style="background: #FFFFFF; border: 1px solid #E5DED0; border-radius: 12px; padding: 28px 24px; text-align: center; margin-bottom: 24px;">
      <p style="margin: 0 0 10px; font-size: 1.15rem; font-weight: 700; color: #16201B;">Merci de votre visite !</p>
      <p style="margin: 0 0 18px; font-size: 0.9rem; color: #5E665E; line-height: 1.5;">
        Nous espérons que vous avez passé un agréable moment chez nous le
        <span style="text-transform: capitalize;">${escapeHtml(fmtDate(reservation.date))}</span> à ${escapeHtml(reservation.time_slot)}.
      </p>
      <p style="margin: 0 0 22px; font-size: 0.9rem; color: #5E665E; line-height: 1.5;">
        Votre avis nous aiderait beaucoup. Prendriez-vous une minute pour le partager sur Google ?
      </p>
      <a href="${reviewUrl}" target="_blank" rel="noopener" style="display: inline-block; background: #13503B; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 0.95rem; padding: 12px 28px; border-radius: 10px;">
        Laisser un avis
      </a>
    </div>
    <p style="margin: 0 0 16px; text-align: center; font-size: 0.78rem; color: #9A9587;">
      Merci pour votre soutien.
    </p>
    <div style="text-align: center; padding-top: 16px; border-top: 1px solid #E5DED0;">
      <p style="margin: 0; font-size: 0.72rem; color: #9A9587;">
        Réservations gérées avec <strong style="color: #13503B;">RESA</strong> —
        <a href="https://resa-service.com" style="color: #13503B; text-decoration: none;">resa-service.com</a>
      </p>
    </div>
  </div>`

  const { error } = await resend.emails.send({
    from,
    to: reservation.email,
    subject: `Votre avis sur ${restaurantName} ?`,
    html,
  })

  if (error) return { ok: false, error: error.message }

  await admin
    .from('reservations')
    .update({ review_email_sent_at: new Date().toISOString() })
    .eq('id', reservation.id)

  return { ok: true }
}

export function getAdminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
