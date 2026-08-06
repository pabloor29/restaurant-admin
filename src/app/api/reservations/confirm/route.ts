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

// Guest-facing copy, per language. The guest's language is stored on the
// reservation by the public booking site (reservations.locale).
const T = {
  fr: {
    dateLocale: 'fr-FR',
    yourRequest: 'VOTRE DEMANDE',
    name: 'Nom', date: 'Date', time: 'Heure', covers: 'Couverts', notes: 'Notes',
    personSingular: 'personne', personPlural: 'personnes',
    restaurantMsg: 'MESSAGE DU RESTAURANT',
    theRestaurant: 'LE RESTAURANT',
    questionFooter: 'En cas de question, contactez directement le restaurant.',
    managedWith: 'Réservations gérées avec',
    acceptedTitle: '✓ Réservation confirmée',
    acceptedSub: 'Votre demande a été acceptée par le restaurant.',
    refusedTitle: 'Réservation non disponible',
    refusedSub: 'Le restaurant ne peut malheureusement pas honorer votre demande.',
    subjectAccepted: 'Réservation confirmée',
    subjectRefused: 'Réservation non disponible',
  },
  en: {
    dateLocale: 'en-GB',
    yourRequest: 'YOUR REQUEST',
    name: 'Name', date: 'Date', time: 'Time', covers: 'Guests', notes: 'Notes',
    personSingular: 'person', personPlural: 'people',
    restaurantMsg: 'MESSAGE FROM THE RESTAURANT',
    theRestaurant: 'THE RESTAURANT',
    questionFooter: 'If you have any questions, please contact the restaurant directly.',
    managedWith: 'Reservations managed with',
    acceptedTitle: '✓ Reservation confirmed',
    acceptedSub: 'Your request has been accepted by the restaurant.',
    refusedTitle: 'Reservation unavailable',
    refusedSub: 'Unfortunately, the restaurant cannot honour your request.',
    subjectAccepted: 'Reservation confirmed',
    subjectRefused: 'Reservation unavailable',
  },
  es: {
    dateLocale: 'es-ES',
    yourRequest: 'SU SOLICITUD',
    name: 'Nombre', date: 'Fecha', time: 'Hora', covers: 'Comensales', notes: 'Notas',
    personSingular: 'persona', personPlural: 'personas',
    restaurantMsg: 'MENSAJE DEL RESTAURANTE',
    theRestaurant: 'EL RESTAURANTE',
    questionFooter: 'Si tiene alguna pregunta, contacte directamente con el restaurante.',
    managedWith: 'Reservas gestionadas con',
    acceptedTitle: '✓ Reserva confirmada',
    acceptedSub: 'Su solicitud ha sido aceptada por el restaurante.',
    refusedTitle: 'Reserva no disponible',
    refusedSub: 'Lamentablemente, el restaurante no puede atender su solicitud.',
    subjectAccepted: 'Reserva confirmada',
    subjectRefused: 'Reserva no disponible',
  },
  it: {
    dateLocale: 'it-IT',
    yourRequest: 'LA TUA RICHIESTA',
    name: 'Nome', date: 'Data', time: 'Ora', covers: 'Coperti', notes: 'Note',
    personSingular: 'persona', personPlural: 'persone',
    restaurantMsg: 'MESSAGGIO DEL RISTORANTE',
    theRestaurant: 'IL RISTORANTE',
    questionFooter: 'Per qualsiasi domanda, contatta direttamente il ristorante.',
    managedWith: 'Prenotazioni gestite con',
    acceptedTitle: '✓ Prenotazione confermata',
    acceptedSub: 'La tua richiesta è stata accettata dal ristorante.',
    refusedTitle: 'Prenotazione non disponibile',
    refusedSub: 'Purtroppo il ristorante non può soddisfare la tua richiesta.',
    subjectAccepted: 'Prenotazione confermata',
    subjectRefused: 'Prenotazione non disponibile',
  },
} as const

type Lang = keyof typeof T

function fmtDate(dateStr: string, dateLocale: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
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
    .select('*, restaurants(name, phone, address, email)')
    .eq('id', reservation_id)
    .single()

  if (!reservation) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
  if (!reservation.email) return NextResponse.json({ success: true, skipped: true })

  const restaurant = reservation.restaurants as { name: string; phone: string | null; address: string | null; email: string | null }
  const from = process.env.RESEND_FROM_EMAIL!
  const isAccepted = action === 'accepted'

  // Guest language (falls back to French for older rows without a locale).
  const lang: Lang = (['fr', 'en', 'es', 'it'] as const).includes(reservation.locale)
    ? reservation.locale
    : 'fr'
  const tr = T[lang]
  const coversLabel = `${reservation.covers} ${reservation.covers > 1 ? tr.personPlural : tr.personSingular}`

  const detailsTable = `
    <div style="background: #FFFFFF; border: 1px solid #E5DED0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <p style="margin: 0 0 16px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; color: #9A9587;">${tr.yourRequest}</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EADD; color: #9A9587; font-size: 0.8rem; width: 40%;">${tr.name}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EADD; color: #16201B; font-size: 0.875rem; font-weight: 500;">${reservation.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EADD; color: #9A9587; font-size: 0.8rem;">${tr.date}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EADD; color: #16201B; font-size: 0.875rem; font-weight: 500; text-transform: capitalize;">${fmtDate(reservation.date, tr.dateLocale)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EADD; color: #9A9587; font-size: 0.8rem;">${tr.time}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #F0EADD; color: #16201B; font-size: 0.875rem; font-weight: 500;">${reservation.time_slot}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #9A9587; font-size: 0.8rem;">${tr.covers}</td>
          <td style="padding: 8px 0; color: #16201B; font-size: 0.875rem; font-weight: 500;">${coversLabel}</td>
        </tr>
        ${reservation.notes ? `
        <tr>
          <td style="padding: 8px 0; border-top: 1px solid #F0EADD; color: #9A9587; font-size: 0.8rem;">${tr.notes}</td>
          <td style="padding: 8px 0; border-top: 1px solid #F0EADD; color: #16201B; font-size: 0.875rem;">${reservation.notes}</td>
        </tr>` : ''}
      </table>
    </div>`

  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

  const adminMessageBlock = adminMessage ? `
    <div style="background: #FFFFFF; border: 1px solid #E5DED0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <p style="margin: 0 0 12px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; color: #9A9587;">${tr.restaurantMsg}</p>
      <p style="margin: 0; font-size: 0.9rem; color: #16201B; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(adminMessage)}</p>
    </div>` : ''

  const footer = `
    <p style="margin: 0 0 16px; text-align: center; font-size: 0.78rem; color: #9A9587;">
      ${tr.questionFooter}
    </p>
    <div style="text-align: center; padding-top: 16px; border-top: 1px solid #E5DED0;">
      <p style="margin: 0; font-size: 0.72rem; color: #9A9587;">
        ${tr.managedWith} <strong style="color: #13503B;">RESA</strong> —
        <a href="https://resa-service.com" style="color: #13503B; text-decoration: none;">resa-service.com</a>
      </p>
    </div>`

  const restaurantBlock = (restaurant.address || restaurant.phone) ? `
        <div style="background: #FFFFFF; border: 1px solid #E5DED0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 16px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; color: #9A9587;">${tr.theRestaurant}</p>
          <p style="margin: 0 0 6px; font-size: 0.95rem; font-weight: 700; color: #16201B;">${restaurant.name}</p>
          ${restaurant.address ? `<p style="margin: 0 0 4px; font-size: 0.875rem; color: #5E665E;">${restaurant.address}</p>` : ''}
          ${restaurant.phone ? `<p style="margin: 0; font-size: 0.875rem; color: #5E665E;">${restaurant.phone}</p>` : ''}
        </div>` : ''

  const bannerHtml = isAccepted
    ? `<div style="background: #E4F1EA; border: 1px solid rgba(30,122,82,0.2); border-radius: 12px; padding: 20px 24px; text-align: center; margin-bottom: 28px;">
          <p style="margin: 0 0 4px; font-size: 1.1rem; font-weight: 700; color: #1E7A52;">${tr.acceptedTitle}</p>
          <p style="margin: 0; font-size: 0.875rem; color: #5E665E;">${tr.acceptedSub}</p>
        </div>`
    : `<div style="background: #F4E2DD; border: 1px solid rgba(168,71,58,0.2); border-radius: 12px; padding: 20px 24px; text-align: center; margin-bottom: 28px;">
          <p style="margin: 0 0 4px; font-size: 1.1rem; font-weight: 700; color: #A8473A;">${tr.refusedTitle}</p>
          <p style="margin: 0; font-size: 0.875rem; color: #5E665E;">${tr.refusedSub}</p>
        </div>`

  const html = `<div style="font-family: 'Helvetica Neue', sans-serif; max-width: 560px; margin: 0 auto; color: #16201B; background: #F5F1E9; padding: 32px 24px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 1.3rem; font-weight: 800; color: #16201B; letter-spacing: -0.03em;">${restaurant.name}</span>
        </div>
        ${bannerHtml}
        ${detailsTable}
        ${adminMessageBlock}
        ${restaurantBlock}
        ${footer}
      </div>`

  // Plain-text alternative. HTML-only mails score worse with spam filters; a
  // text/plain part lowers the score. The HTML layout above is left untouched.
  const detailsText = [
    `${tr.name} : ${reservation.name}`,
    `${tr.date} : ${fmtDate(reservation.date, tr.dateLocale)}`,
    `${tr.time} : ${reservation.time_slot}`,
    `${tr.covers} : ${coversLabel}`,
    reservation.notes ? `${tr.notes} : ${reservation.notes}` : null,
  ].filter(Boolean).join('\n')

  const adminMessageText = adminMessage ? `\n${tr.restaurantMsg}\n${adminMessage}\n` : ''
  const restaurantText = (restaurant.address || restaurant.phone)
    ? `\n${tr.theRestaurant}\n${restaurant.name}${restaurant.address ? `\n${restaurant.address}` : ''}${restaurant.phone ? `\n${restaurant.phone}` : ''}\n`
    : ''

  const text = `${restaurant.name}

${isAccepted
    ? `${tr.acceptedTitle}\n${tr.acceptedSub}`
    : `${tr.refusedTitle}\n${tr.refusedSub}`}

${tr.yourRequest}
${detailsText}
${adminMessageText}${restaurantText}
${tr.questionFooter}
${tr.managedWith} RESA — resa-service.com`

  const { error } = await resend.emails.send({
    from,
    to: reservation.email,
    replyTo: restaurant.email ?? undefined,
    subject: isAccepted
      ? `${tr.subjectAccepted} — ${restaurant.name}`
      : `${tr.subjectRefused} — ${restaurant.name}`,
    html,
    text,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
