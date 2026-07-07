import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function getAdminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { endpoint } = await request.json()
  if (!endpoint) return NextResponse.json({ error: 'Endpoint manquant' }, { status: 400 })

  const admin = getAdminClient()
  await admin.from('push_subscriptions').delete().eq('endpoint', endpoint)
  return NextResponse.json({ ok: true })
}
