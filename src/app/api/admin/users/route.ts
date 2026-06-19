import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '../../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = getAdminClient()
  const [{ data: authData }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers(),
    admin.from('profiles').select('id, restaurant_id, is_admin, subscription_status, restaurants(name)'),
  ])

  const users = (authData?.users ?? []).map(u => {
    const profile = profiles?.find(p => p.id === u.id)
    return {
      id: u.id,
      email: u.email,
      restaurant_id: profile?.restaurant_id ?? null,
      restaurant_name: (profile?.restaurants as unknown as { name: string } | null)?.name ?? null,
      is_admin: profile?.is_admin ?? false,
      subscription_status: profile?.subscription_status ?? 'pending',
    }
  })

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, password, restaurant_id } = await request.json()
  const admin = getAdminClient()

  const { data: newUser, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await admin.from('profiles').upsert({
    id: newUser.user.id,
    restaurant_id: restaurant_id || null,
  })

  if (restaurant_id) {
    const { data: restaurant } = await admin
      .from('restaurants')
      .select('email')
      .eq('id', restaurant_id)
      .single()
    if (!restaurant?.email) {
      await admin.from('restaurants').update({ email }).eq('id', restaurant_id)
    }
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { user_id, restaurant_id, subscription_status } = await request.json()
  const admin = getAdminClient()

  const updates: Record<string, unknown> = {}
  if (restaurant_id !== undefined) updates.restaurant_id = restaurant_id || null
  if (subscription_status !== undefined) updates.subscription_status = subscription_status

  await admin
    .from('profiles')
    .update(updates)
    .eq('id', user_id)

  return NextResponse.json({ success: true })
}
