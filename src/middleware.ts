import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isTrialExpired } from '../lib/trial'

const PUBLIC_ROUTES = ['/login', '/']
const ALWAYS_PUBLIC_ROUTES = ['/mentions-legales', '/cgv', '/contrat-abonnement']
const PUBLIC_API_PREFIXES = ['/api/contact', '/api/stripe/webhook']
const SETUP_ROUTE = '/setup'
const SUBSCRIBE_ROUTE = '/subscribe'
const ACTIVE_STATUSES = ['active', 'trialing', 'free']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Rafraîchit la session — NE PAS supprimer ce bloc
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Si Supabase est inaccessible, traiter comme non-authentifié
  }

  const path = request.nextUrl.pathname

  // Routes API publiques (pas d'auth requise)
  if (PUBLIC_API_PREFIXES.some(prefix => path.startsWith(prefix))) {
    return supabaseResponse
  }

  // Toutes les routes API : pas de redirection. Chaque route gère son auth.
  if (path.startsWith('/api/')) {
    return supabaseResponse
  }

  // Pages légales — accessibles connecté ou non, sans aucune redirection
  if (ALWAYS_PUBLIC_ROUTES.includes(path)) {
    return supabaseResponse
  }

  // Utilisateur non connecté
  if (!user) {
    if (PUBLIC_ROUTES.includes(path)) return supabaseResponse
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Utilisateur connecté — vérifier le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id, is_admin, subscription_status, created_at')
    .eq('id', user.id)
    .single()

  const isAdmin = !!profile?.is_admin
  const hasRestaurant = !!profile?.restaurant_id
  const restaurantId = profile?.restaurant_id as string | null
  const subscriptionStatus = profile?.subscription_status as string | null
  const createdAt = (profile?.created_at as string | undefined) ?? user.created_at
  const trialExpired =
    subscriptionStatus === 'trialing' && createdAt ? isTrialExpired(createdAt) : false
  const hasActiveSubscription =
    ACTIVE_STATUSES.includes(subscriptionStatus ?? '') && !trialExpired

  // Sur /login avec une session valide → rediriger selon le rôle
  if (PUBLIC_ROUTES.includes(path)) {
    if (isAdmin) return NextResponse.redirect(new URL('/admin', request.url))
    if (!hasRestaurant) return NextResponse.redirect(new URL(SETUP_ROUTE, request.url))
    if (!hasActiveSubscription) return NextResponse.redirect(new URL(SUBSCRIBE_ROUTE, request.url))
    return NextResponse.redirect(new URL(`/restaurant/${restaurantId}`, request.url))
  }

  // Routes /admin réservées à l'administrateur
  if (path.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin : accès libre à tout sauf /setup, /subscribe et /
  if (isAdmin) {
    if (path === SETUP_ROUTE || path === SUBSCRIBE_ROUTE || path === '/') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return supabaseResponse
  }

  // Utilisateur sans restaurant → /setup
  if (!hasRestaurant) {
    if (path !== SETUP_ROUTE) return NextResponse.redirect(new URL(SETUP_ROUTE, request.url))
    return supabaseResponse
  }

  // Utilisateur avec restaurant mais sans abonnement actif → /subscribe
  if (!hasActiveSubscription) {
    if (!path.startsWith(SUBSCRIBE_ROUTE)) {
      return NextResponse.redirect(new URL(SUBSCRIBE_ROUTE, request.url))
    }
    return supabaseResponse
  }

  // Utilisateur avec restaurant et abonnement actif : rediriger / et /setup vers son restaurant
  if (path === '/' || path === SETUP_ROUTE || path === SUBSCRIBE_ROUTE) {
    return NextResponse.redirect(new URL(`/restaurant/${restaurantId}`, request.url))
  }

  // Empêcher l'accès à un autre restaurant
  if (path.startsWith('/restaurant/')) {
    const requestedId = path.split('/')[2]
    if (requestedId !== restaurantId) {
      return NextResponse.redirect(new URL(`/restaurant/${restaurantId}`, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov|m4v|ogg|mp3|wav)$).*)',
  ],
}
