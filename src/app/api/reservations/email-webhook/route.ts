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
  data?: { email_id?: string }
}

// Resend delivery webhook (signed with Svix). Flags a reservation when its
// confirmation email hard-bounces — the client mailbox does not exist, so they
// received nothing and the restaurant must call them to confirm. Matches the
// event back to the reservation via the stored Resend message id.
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

  const emailId = evt.data?.email_id
  if (!emailId) return NextResponse.json({ ok: true, skipped: 'no_email_id' })

  const admin = getAdminClient()

  if (evt.type === 'email.bounced') {
    await admin
      .from('reservations')
      .update({ email_bounced: true, email_bounced_at: new Date().toISOString() })
      .eq('confirm_email_id', emailId)
  } else if (evt.type === 'email.delivered') {
    // Delivered after all (e.g. a transient issue cleared) → drop the flag.
    await admin
      .from('reservations')
      .update({ email_bounced: false, email_bounced_at: null })
      .eq('confirm_email_id', emailId)
  }

  return NextResponse.json({ ok: true })
}
