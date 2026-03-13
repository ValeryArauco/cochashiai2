import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const rutaActual = request.nextUrl.pathname

  const esRutaProtegida =
    rutaActual.startsWith('/torneos') ||
    rutaActual.startsWith('/perfil')

  const esRutaDeAuth = rutaActual.startsWith('/login')

  if (rutaActual === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!session && esRutaProtegida) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && esRutaDeAuth) {
    return NextResponse.redirect(new URL('/torneos', request.url))
  }

  return response
}

export const config = {
  matcher: ['/', '/torneos/:path*', '/perfil/:path*', '/login'],
}
