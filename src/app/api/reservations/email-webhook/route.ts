import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { Webhook } from 'svix'

function getAdminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

type ResendEvent = {
  type: string
  data?: { to?: string | string[] }
}

// Resend delivery webhook (Svix-signed). One webhook per Resend account — it
// receives bounce events for every mail sent on the account, including the
// booking-request confirmation the restaurant's public site sends to the client.
// That first mail is what actually bounces on an invalid address: once it hard-
// bounces Resend suppresses the address, so any later accept/refuse mail is never
// delivered and never fires its own bounce. We therefore match the event back to
// the reservation by the RECIPIENT ADDRESS, not by a stored message id.
export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const body = await request.text()
  const headers = {
    'svix-id': request.headers.get('svix-id') ?? '',
    'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
    'svix-signature': request.headers.get('svix-signature') ?? '',
  }

  let evt: ResendEvent
  try {
    evt = new Webhook(secret).verify(body, headers) as ResendEvent
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const to = evt.data?.to
  const raw = (Array.isArray(to) ? to : to ? [to] : []).map((e) => e.trim()).filter(Boolean)
  // Match exact and lowercased forms so a case difference between the sent and
  // stored address still resolves. Avoids ilike so an `_` in a local part can't
  // act as a wildcard and over-match.
  const recipients = Array.from(new Set(raw.flatMap((e) => [e, e.toLowerCase()])))
  if (recipients.length === 0) return NextResponse.json({ ok: true, skipped: 'no_recipient' })

  const admin = getAdminClient()

  if (evt.type === 'email.bounced') {
    await admin
      .from('reservations')
      .update({ email_bounced: true, email_bounced_at: new Date().toISOString() })
      .in('email', recipients)
      .eq('email_bounced', false)
  } else if (evt.type === 'email.delivered') {
    // A mail to the same address got through → the address works, clear the flag.
    await admin
      .from('reservations')
      .update({ email_bounced: false, email_bounced_at: null })
      .in('email', recipients)
      .eq('email_bounced', true)
  }

  return NextResponse.json({ ok: true })
}
