import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()

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
    const esRutaProtegida = rutaActual.startsWith('/dashboard') || rutaActual.startsWith('/torneos')
    const esRutaDeAuth = rutaActual.startsWith('/login')

    if (!session && esRutaProtegida) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (session && esRutaDeAuth) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: ['/dashboard/:path*', '/torneos/:path*', '/login'],
}