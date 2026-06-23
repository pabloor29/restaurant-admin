import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { Resend } from 'resend'

function getAdminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const resend = new Resend(process.env.RESEND_API_KEY)

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { reservation_id, action = 'accepted', admin_message = '' } = await request.json()
  const adminMessage = typeof admin_message === 'string' ? admin_message.trim() : ''
  const admin = getAdminClient()

  const { data: reservation } = await admin
    .from('reservations')
    .select('*, restaurants(name, phone, address)')
    .eq('id', reservation_id)
    .single()

  if (!reservation) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
  if (!reservation.email) return NextResponse.json({ success: true, skipped: true })

  const restaurant = reservation.restaurants as { name: string; phone: string | null; address: string | null }
  const from = process.env.RESEND_FROM_EMAIL!
  const isAccepted = action === 'accepted'

  const detailsTable = `
    <div style="background: #FFFFFF; border: 1px solid #E5DED0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <p style="margin: 0 0 16px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; color: #9A9587;">VOTRE DEMANDE</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EADD; color: #9A9587; font-size: 0.8rem; width: 40%;">Nom</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EADD; color: #16201B; font-size: 0.875rem; font-weight: 500;">${reservation.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EADD; color: #9A9587; font-size: 0.8rem;">Date</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EADD; color: #16201B; font-size: 0.875rem; font-weight: 500; text-transform: capitalize;">${fmtDate(reservation.date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EADD; color: #9A9587; font-size: 0.8rem;">Heure</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EADD; color: #16201B; font-size: 0.875rem; font-weight: 500;">${reservation.time_slot}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #9A9587; font-size: 0.8rem;">Couverts</td>
          <td style="padding: 8px 0; color: #16201B; font-size: 0.875rem; font-weight: 500;">${reservation.covers} personne${reservation.covers > 1 ? 's' : ''}</td>
        </tr>
        ${reservation.notes ? `
        <tr>
          <td style="padding: 8px 0; border-top: 1px solid #F0EADD; color: #9A9587; font-size: 0.8rem;">Notes</td>
          <td style="padding: 8px 0; border-top: 1px solid #F0EADD; color: #16201B; font-size: 0.875rem;">${reservation.notes}</td>
        </tr>` : ''}
      </table>
    </div>`

  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

  const adminMessageBlock = adminMessage ? `
    <div style="background: #FFFFFF; border: 1px solid #E5DED0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <p style="margin: 0 0 12px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; color: #9A9587;">MESSAGE DU RESTAURANT</p>
      <p style="margin: 0; font-size: 0.9rem; color: #16201B; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(adminMessage)}</p>
    </div>` : ''

  const footer = `
    <p style="margin: 0 0 16px; text-align: center; font-size: 0.78rem; color: #9A9587;">
      En cas de question, contactez directement le restaurant.
    </p>
    <div style="text-align: center; padding-top: 16px; border-top: 1px solid #E5DED0;">
      <p style="margin: 0; font-size: 0.72rem; color: #9A9587;">
        Réservations gérées avec <strong style="color: #13503B;">RESA</strong> —
        <a href="https://resa-service.com" style="color: #13503B; text-decoration: none;">resa-service.com</a>
      </p>
    </div>`

  const html = isAccepted
    ? `<div style="font-family: 'Helvetica Neue', sans-serif; max-width: 560px; margin: 0 auto; color: #16201B; background: #F5F1E9; padding: 32px 24px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 1.3rem; font-weight: 800; color: #16201B; letter-spacing: -0.03em;">${restaurant.name}</span>
        </div>
        <div style="background: #E4F1EA; border: 1px solid rgba(30,122,82,0.2); border-radius: 12px; padding: 20px 24px; text-align: center; margin-bottom: 28px;">
          <p style="margin: 0 0 4px; font-size: 1.1rem; font-weight: 700; color: #1E7A52;">✓ Réservation confirmée</p>
          <p style="margin: 0; font-size: 0.875rem; color: #5E665E;">Votre demande a été acceptée par le restaurant.</p>
        </div>
        ${detailsTable}
        ${adminMessageBlock}
        ${(restaurant.address || restaurant.phone) ? `
        <div style="background: #FFFFFF; border: 1px solid #E5DED0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 16px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; color: #9A9587;">LE RESTAURANT</p>
          <p style="margin: 0 0 6px; font-size: 0.95rem; font-weight: 700; color: #16201B;">${restaurant.name}</p>
          ${restaurant.address ? `<p style="margin: 0 0 4px; font-size: 0.875rem; color: #5E665E;">${restaurant.address}</p>` : ''}
          ${restaurant.phone ? `<p style="margin: 0; font-size: 0.875rem; color: #5E665E;">${restaurant.phone}</p>` : ''}
        </div>` : ''}
        ${footer}
      </div>`
    : `<div style="font-family: 'Helvetica Neue', sans-serif; max-width: 560px; margin: 0 auto; color: #16201B; background: #F5F1E9; padding: 32px 24px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 1.3rem; font-weight: 800; color: #16201B; letter-spacing: -0.03em;">${restaurant.name}</span>
        </div>
        <div style="background: #F4E2DD; border: 1px solid rgba(168,71,58,0.2); border-radius: 12px; padding: 20px 24px; text-align: center; margin-bottom: 28px;">
          <p style="margin: 0 0 4px; font-size: 1.1rem; font-weight: 700; color: #A8473A;">Réservation non disponible</p>
          <p style="margin: 0; font-size: 0.875rem; color: #5E665E;">Le restaurant ne peut malheureusement pas honorer votre demande.</p>
        </div>
        ${detailsTable}
        ${adminMessageBlock}
        ${(restaurant.address || restaurant.phone) ? `
        <div style="background: #FFFFFF; border: 1px solid #E5DED0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 16px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; color: #9A9587;">LE RESTAURANT</p>
          <p style="margin: 0 0 6px; font-size: 0.95rem; font-weight: 700; color: #16201B;">${restaurant.name}</p>
          ${restaurant.address ? `<p style="margin: 0 0 4px; font-size: 0.875rem; color: #5E665E;">${restaurant.address}</p>` : ''}
          ${restaurant.phone ? `<p style="margin: 0; font-size: 0.875rem; color: #5E665E;">${restaurant.phone}</p>` : ''}
        </div>` : ''}
        ${footer}
      </div>`

  const { error } = await resend.emails.send({
    from,
    to: reservation.email,
    subject: isAccepted
      ? `Réservation confirmée — ${restaurant.name}`
      : `Réservation non disponible — ${restaurant.name}`,
    html,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
