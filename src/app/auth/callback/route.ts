import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=sin_sesion`)
  }

  // Acumula los cambios de cookies (sesión, code_verifier, etc.)
  // para aplicarlos en el NextResponse final en vez de en next/headers
  const pendingCookies: { name: string; value: string; options: object }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Lee desde la request (accede al code_verifier HttpOnly)
        getAll: () => request.cookies.getAll(),
        // Acumula en memoria — se vuelcan al NextResponse justo antes de retornar
        setAll: (list) =>
          list.forEach(({ name, value, options }) =>
            pendingCookies.push({ name, value, options: options ?? {} })
          ),
      },
    }
  )

  // Helper: crea el redirect y le aplica todas las cookies acumuladas
  function makeRedirect(url: string) {
    const res = NextResponse.redirect(url)
    pendingCookies.forEach(({ name, value, options }) =>
      res.cookies.set({ name, value, ...(options as object) })
    )
    return res
  }

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.session) {
    return makeRedirect(`${origin}/login?error=sin_sesion`)
  }

  const email = data.session.user.email
  if (!email) {
    await supabase.auth.signOut()
    return makeRedirect(`${origin}/login?error=no_registrado`)
  }

  // Service role bypasea RLS para verificar el correo:
  // el auth_user_id del OAuth difiere del guardado en usuarios,
  // así que el cliente anon sería bloqueado por las políticas RLS.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: perfil } = await supabaseAdmin
    .from('usuarios')
    .select('id')
    .ilike('correo', email)
    .maybeSingle()

  if (!perfil) {
    await supabase.auth.signOut()
    return makeRedirect(`${origin}/login?error=no_registrado`)
  }

  return makeRedirect(`${origin}/torneos`)
}
