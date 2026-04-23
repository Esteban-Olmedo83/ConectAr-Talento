import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/pipeline',
  '/candidates',
  '/vacancies',
  '/interviews',
  '/templates',
  '/integrations',
  '/reports',
]

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password']

// Estas rutas requieren sesión activa pero no son parte de la app protegida
const PASSWORD_RESET_PATHS = ['/reset-password']

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do NOT remove this await
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const isPasswordReset = PASSWORD_RESET_PATHS.some((p) => pathname.startsWith(p))

  // Redirige usuarios autenticados fuera de las páginas de auth,
  // EXCEPTO /reset-password que requiere sesión activa para funcionar
  if (user && isAuthPage && !isPasswordReset) {
    const url = request.nextUrl.clone()
    url.pathname = '/pipeline'
    return NextResponse.redirect(url)
  }

  // Si alguien entra a /reset-password sin sesión, lo manda al forgot-password
  if (!user && isPasswordReset) {
    const url = request.nextUrl.clone()
    url.pathname = '/forgot-password'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
