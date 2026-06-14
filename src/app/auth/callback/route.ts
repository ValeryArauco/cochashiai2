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

  const pendingCookies: { name: string; value: string; options: object }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) =>
          list.forEach(({ name, value, options }) =>
            pendingCookies.push({ name, value, options: options ?? {} })
          ),
      },
    }
  )

  function makeRedirect(url: string) {
    const res = NextResponse.redirect(url)
    pendingCookies.forEach(({ name, value, options }) =>
      res.cookies.set({ name, value, ...options })
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

  // Service role para bypassear RLS: verifica que el correo esté en la tabla usuarios
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
