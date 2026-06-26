import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../../lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function getAdminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAuthorizedUser(restaurantId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, restaurant_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null
  if (profile.is_admin) return user
  if (profile.restaurant_id === restaurantId) return user
  return null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: restaurantId } = await params
  const admin = getAdminClient()

  const [{ data: restaurant }, { data: review }, { data: profile }] = await Promise.all([
    admin.from('restaurants').select('name, phone, address, email').eq('id', restaurantId).single(),
    admin.from('restaurants').select('google_review_url, review_email_auto').eq('id', restaurantId).single(),
    admin.from('profiles').select('subscription_status').eq('restaurant_id', restaurantId).neq('is_admin', true).single(),
  ])

  return NextResponse.json({
    name: restaurant?.name ?? '',
    phone: restaurant?.phone ?? '',
    address: restaurant?.address ?? '',
    email: restaurant?.email ?? '',
    google_review_url: review?.google_review_url ?? '',
    review_email_auto: review?.review_email_auto ?? false,
    subscription_status: profile?.subscription_status ?? 'pending',
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: restaurantId } = await params
  const user = await getAuthorizedUser(restaurantId)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const body = await request.json()
  const { phone, address, email, google_review_url, review_email_auto } = body
  const admin = getAdminClient()

  const update: Record<string, string | boolean | null> = {}
  if ('phone' in body) update.phone = phone || null
  if ('address' in body) update.address = address || null
  if ('email' in body) update.email = email || null
  if ('google_review_url' in body) update.google_review_url = google_review_url || null
  if ('review_email_auto' in body) update.review_email_auto = !!review_email_auto

  const { error } = await admin
    .from('restaurants')
    .update(update)
    .eq('id', restaurantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
