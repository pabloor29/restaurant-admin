import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login']
const SETUP_ROUTE = '/setup'

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

  // Utilisateur non connecté
  if (!user) {
    if (PUBLIC_ROUTES.includes(path)) return supabaseResponse
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Utilisateur connecté — vérifier le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id, is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = !!profile?.is_admin
  const hasRestaurant = !!profile?.restaurant_id

  const restaurantId = profile?.restaurant_id as string | null

  // Sur /login avec une session valide → rediriger selon le rôle
  if (PUBLIC_ROUTES.includes(path)) {
    if (isAdmin) return NextResponse.redirect(new URL('/admin', request.url))
    if (hasRestaurant) return NextResponse.redirect(new URL(`/restaurant/${restaurantId}`, request.url))
    return NextResponse.redirect(new URL(SETUP_ROUTE, request.url))
  }

  // Routes /admin réservées à l'administrateur
  if (path.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin : accès libre à tout sauf /setup
  if (isAdmin) {
    if (path === SETUP_ROUTE) return NextResponse.redirect(new URL('/admin', request.url))
    return supabaseResponse
  }

  // Utilisateur sans restaurant → /setup
  if (!hasRestaurant) {
    if (path !== SETUP_ROUTE) return NextResponse.redirect(new URL(SETUP_ROUTE, request.url))
    return supabaseResponse
  }

  // Utilisateur avec restaurant : rediriger / et /setup vers son restaurant
  if (path === '/' || path === SETUP_ROUTE) {
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
    '/((?!_next/static|_next/image|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
