import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const { name, email, restaurant, message } = await request.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 })
  }

  const from = process.env.RESEND_FROM_EMAIL!
  const to = process.env.CONTACT_EMAIL!

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `Nouveau message de ${name}${restaurant ? ` — ${restaurant}` : ''}`,
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
        </div>
      </div>
    `,
  })

  if (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
