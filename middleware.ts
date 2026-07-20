import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/pipeline',
  '/candidates',
  '/vacancies',
  '/interviews',
  '/templates',
  '/integrations',
  '/reports',
  '/settings',
  '/clients',
  '/talent-pool',
  '/job-profiles',
  '/admin',
]

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password']

// Estas rutas requieren sesión activa pero no son parte de la app protegida
const PASSWORD_RESET_PATHS = ['/reset-password']

function buildCsp(nonce: string): string {
  // En dev, Next necesita 'unsafe-eval' para el refresh/HMR basado en eval-source-map.
  // En producción no hace falta: se usa nonce + strict-dynamic para scripts propios y
  // de terceros (Sentry/GA/Crisp), con el allowlist por host como fallback en
  // navegadores que no soportan strict-dynamic.
  const scriptSrc = process.env.NODE_ENV === 'production'
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.sentry-cdn.com https://browser.sentry-cdn.com https://www.googletagmanager.com https://client.crisp.chat`
    : `script-src 'self' 'unsafe-inline' 'unsafe-eval'`

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://client.crisp.chat",
    "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://www.google-analytics.com https://image.crisp.chat",
    "font-src 'self' https://client.crisp.chat",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://sentry.io https://*.ingest.sentry.io https://ingest.sentry.io https://www.google-analytics.com https://*.analytics.google.com https://region1.analytics.google.com wss://client.relay.crisp.chat https://client.crisp.chat",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
  supabaseResponse.headers.set('Content-Security-Policy', csp)

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
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
          supabaseResponse.headers.set('Content-Security-Policy', csp)
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
    const res = NextResponse.redirect(url)
    res.headers.set('Content-Security-Policy', csp)
    return res
  }

  const isPasswordReset = PASSWORD_RESET_PATHS.some((p) => pathname.startsWith(p))

  // Redirige usuarios autenticados fuera de las páginas de auth,
  // EXCEPTO /reset-password que requiere sesión activa para funcionar
  if (user && isAuthPage && !isPasswordReset) {
    const url = request.nextUrl.clone()
    url.pathname = '/pipeline'
    const res = NextResponse.redirect(url)
    res.headers.set('Content-Security-Policy', csp)
    return res
  }

  // Si alguien entra a /reset-password sin sesión, lo manda al forgot-password
  if (!user && isPasswordReset) {
    const url = request.nextUrl.clone()
    url.pathname = '/forgot-password'
    const res = NextResponse.redirect(url)
    res.headers.set('Content-Security-Policy', csp)
    return res
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
