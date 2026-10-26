import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { readVisitorMeta, checkEmail } from '../../../../lib/tracking'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_REASON_LABEL: Record<string, string> = {
  syntaxe: 'syntaxe invalide',
  jetable: 'adresse jetable',
  domaine_inexistant: 'domaine inexistant (aucun MX)',
}

export async function POST(request: NextRequest) {
  const { name, email, restaurant, message } = await request.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 })
  }

  // Capture who is submitting + whether the address can actually receive mail.
  const meta = readVisitorMeta(request)
  const emailCheck = await checkEmail(email)

  // Log the submission (service-role bypasses RLS). Never let a logging failure
  // block the contact email itself.
  try {
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    await admin.from('site_events').insert({
      type: 'contact',
      path: '/',
      ip: meta.ip,
      country: meta.country,
      region: meta.region,
      city: meta.city,
      user_agent: meta.user_agent,
      device: meta.device,
      is_bot: meta.is_bot,
      referer: meta.referer,
      name,
      email,
      restaurant: restaurant || null,
      message,
      email_valid: emailCheck.valid,
      email_reason: emailCheck.reason,
    })
  } catch {
    // tracking is best-effort
  }

  const from = process.env.RESEND_FROM_EMAIL!
  const to = process.env.CONTACT_EMAIL!

  // Human-readable visitor summary appended to the notification.
  const geo = [meta.city, meta.region, meta.country].filter(Boolean).join(', ') || 'inconnue'
  const emailStatus = emailCheck.valid
    ? 'valide'
    : `⚠ SUSPECT — ${EMAIL_REASON_LABEL[emailCheck.reason ?? ''] ?? emailCheck.reason}`
  const metaText = `
— — —
Email       : ${emailStatus}
IP          : ${meta.ip ?? 'inconnue'}
Localisation: ${geo}
Appareil    : ${meta.device}${meta.is_bot ? ' ⚠ (bot probable)' : ''}
Référent    : ${meta.referer ?? 'direct'}`
  const metaHtml = `
          <hr style="border: none; border-top: 1px solid #E5DED0; margin: 20px 0;" />
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
            <tr><td style="padding: 4px 0; color: #9A9587; width: 120px;">EMAIL</td><td style="padding: 4px 0; color: ${emailCheck.valid ? '#13503B' : '#B4452F'}; font-weight: 600;">${emailStatus}</td></tr>
            <tr><td style="padding: 4px 0; color: #9A9587;">IP</td><td style="padding: 4px 0; color: #16201B;">${meta.ip ?? 'inconnue'}</td></tr>
            <tr><td style="padding: 4px 0; color: #9A9587;">LOCALISATION</td><td style="padding: 4px 0; color: #16201B;">${geo}</td></tr>
            <tr><td style="padding: 4px 0; color: #9A9587;">APPAREIL</td><td style="padding: 4px 0; color: ${meta.is_bot ? '#B4452F' : '#16201B'};">${meta.device}${meta.is_bot ? ' ⚠ (bot probable)' : ''}</td></tr>
            <tr><td style="padding: 4px 0; color: #9A9587;">RÉFÉRENT</td><td style="padding: 4px 0; color: #16201B;">${meta.referer ?? 'direct'}</td></tr>
          </table>`

  // Plain-text alternative lowers spam score; HTML layout is left untouched.
  const text = `RESA — Nouveau contact

NOM : ${name}
EMAIL : ${email}${restaurant ? `\nRESTAURANT : ${restaurant}` : ''}

MESSAGE
${message}
${metaText}`

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `${!emailCheck.valid || meta.is_bot ? '⚠ ' : ''}Nouveau message de ${name}${restaurant ? ` — ${restaurant}` : ''}`,
    text,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; color: #16201B;">
        <div style="background: #13503B; padding: 24px 28px; border-radius: 12px 12px 0 0;">
          <p style="color: #F5F1E9; font-size: 1.2rem; font-weight: 700; margin: 0;">RESA<span style="color: #C77E3A;">.</span> — Nouveau contact</p>
        </div>
        <div style="background: #FFFFFF; border: 1px solid #E5DED0; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #9A9587; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em; width: 120px;">NOM</td>
              <td style="padding: 8px 0; color: #16201B; font-size: 0.9rem;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9A9587; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em;">EMAIL</td>
              <td style="padding: 8px 0; color: #16201B; font-size: 0.9rem;"><a href="mailto:${email}" style="color: #13503B;">${email}</a></td>
            </tr>
            ${restaurant ? `
            <tr>
              <td style="padding: 8px 0; color: #9A9587; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em;">RESTAURANT</td>
              <td style="padding: 8px 0; color: #16201B; font-size: 0.9rem;">${restaurant}</td>
            </tr>
            ` : ''}
          </table>
          <hr style="border: none; border-top: 1px solid #E5DED0; margin: 20px 0;" />
          <p style="color: #9A9587; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em; margin: 0 0 10px;">MESSAGE</p>
          <p style="color: #16201B; font-size: 0.95rem; line-height: 1.65; white-space: pre-wrap; margin: 0;">${message}</p>
          ${metaHtml}
        </div>
      </div>
    `,
  })

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
