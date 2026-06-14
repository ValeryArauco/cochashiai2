import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  // El proveedor OAuth rechazó la solicitud (ej. usuario canceló en Google)
  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=sin_sesion`)
  }

  const cookieStore = await cookies()

  // createServerClient tiene acceso a las cookies HttpOnly donde está
  // el code_verifier del flujo PKCE — necesario para el intercambio
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) =>
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  )

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.session) {
    return NextResponse.redirect(`${origin}/login?error=sin_sesion`)
  }

  const email = data.session.user.email
  if (!email) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=no_registrado`)
  }

  // Verificar que el correo existe en la tabla usuarios
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('id')
    .eq('correo', email)
    .maybeSingle()

  if (!perfil) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=no_registrado`)
  }

  return NextResponse.redirect(`${origin}/torneos`)
}
