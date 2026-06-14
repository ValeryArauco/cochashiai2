import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=sin_sesion`)
  }

  const cookieStore = await cookies()

  // Cliente SSR: necesario para el intercambio PKCE (accede al code_verifier en cookies HttpOnly)
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

  // Cliente admin (service role): bypasea RLS para verificar si el correo está registrado.
  // El auth_user_id del usuario OAuth puede diferir del guardado en la tabla,
  // por lo que una consulta con anon key sería bloqueada por las políticas RLS.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: perfil } = await supabaseAdmin
    .from('usuarios')
    .select('id')
    .ilike('correo', email)   // ilike: insensible a mayúsculas/minúsculas
    .maybeSingle()

  if (!perfil) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=no_registrado`)
  }

  return NextResponse.redirect(`${origin}/torneos`)
}
