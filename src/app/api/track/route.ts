import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { readVisitorMeta } from '../../../../lib/tracking'

// Landing-page visit beacon. Called once per session from the browser, so only
// real browsers (that run JS) are logged here — exactly the "who is really
// connected" signal. Inserts with the service-role key (bypasses RLS).
export async function POST(request: NextRequest) {
  const meta = readVisitorMeta(request)

  let path = '/'
  try {
    const body = await request.json()
    if (typeof body?.path === 'string') path = body.path.slice(0, 512)
  } catch {
    // no body / invalid JSON → default path
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  await admin.from('site_events').insert({
    type: 'visit',
    path,
    ip: meta.ip,
    country: meta.country,
    region: meta.region,
    city: meta.city,
    user_agent: meta.user_agent,
    device: meta.device,
    is_bot: meta.is_bot,
    referer: meta.referer,
  })

  // Always 204 — the beacon must never surface an error to the visitor.
  return new NextResponse(null, { status: 204 })
}
