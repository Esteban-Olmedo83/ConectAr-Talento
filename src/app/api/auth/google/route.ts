// Este endpoint ya no se usa. El flujo OAuth de Google ahora es manejado
// directamente por Supabase desde el cliente con supabase.auth.signInWithOAuth.
// El callback se procesa en /auth/callback/route.ts.
// Se mantiene este archivo solo para evitar errores 404 si hay referencias antiguas.

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = new URL(request.url).origin
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin
  return NextResponse.redirect(new URL('/login', appUrl))
}
