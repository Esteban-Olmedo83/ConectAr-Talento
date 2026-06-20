import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// L2 FIX: allowlist of valid redirect targets (relative paths only)
const ALLOWED_NEXT_PATHS = /^\/[a-zA-Z0-9\-_/?=&#%]+$/

// L2 FIX: allowlist of trusted hosts for x-forwarded-host
const ALLOWED_HOSTS = new Set([
  new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.conectartalento.com').hostname,
  'localhost',
])

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // L2: validate next is a relative path; reject absolute URLs and protocol-relative URLs
  const rawNext = searchParams.get('next') ?? '/pipeline'
  const next = ALLOWED_NEXT_PATHS.test(rawNext) ? rawNext : '/pipeline'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocal = process.env.NODE_ENV === 'development'

      if (isLocal) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost && ALLOWED_HOSTS.has(forwardedHost.split(':')[0])) {
        // L2: only redirect to allowlisted hosts
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
