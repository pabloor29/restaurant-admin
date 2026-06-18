import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  return !!profile?.is_admin
}

export async function PATCH(request: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { restaurant_id, reservation_mode } = await request.json()
  const admin = getAdminClient()

  await admin
    .from('restaurants')
    .update({ reservation_mode })
    .eq('id', restaurant_id)

  return NextResponse.json({ success: true })
}
