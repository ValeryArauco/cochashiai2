'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Typography } from '@mui/material'
import { supabase } from '../../../lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Si Supabase redirigió con error (ej. usuario canceló en Google)
    const params = new URLSearchParams(globalThis.location.search)
    if (params.get('error')) {
      router.replace('/login?error=sin_sesion')
      return
    }

    let terminado = false

    async function validar(session: { user: { id: string; email?: string | null } } | null) {
      if (terminado) return
      terminado = true

      if (!session) {
        router.replace('/login?error=sin_sesion')
        return
      }

      const email = session.user.email
      if (!email) {
        // signOut fuera del ciclo de onAuthStateChange para no bloquear la auth machine
        setTimeout(async () => {
          await supabase.auth.signOut()
          router.replace('/login?error=no_registrado')
        }, 0)
        return
      }

      const { data: perfil } = await supabase
        .from('usuarios')
        .select('id')
        .eq('correo', email)
        .maybeSingle()

      if (!perfil) {
        setTimeout(async () => {
          await supabase.auth.signOut()
          router.replace('/login?error=no_registrado')
        }, 0)
        return
      }

      router.replace('/torneos')
    }

    // onAuthStateChange es la forma correcta de esperar que el intercambio PKCE termine.
    // SIGNED_IN se dispara exactamente cuando el code ya fue canjeado por tokens.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Ejecutar fuera del callback para no bloquear la auth machine
        setTimeout(() => validar(session), 0)
      }
    })

    // También revisar si la sesión ya estaba disponible al cargar la página
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) validar(data.session)
    })

    // Timeout de seguridad: si en 15 s no pasa nada, redirigir con error
    const timeout = setTimeout(() => {
      if (!terminado) {
        terminado = true
        router.replace('/login?error=sin_sesion')
      }
    }, 15_000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography color="text.secondary">Verificando cuenta...</Typography>
    </Box>
  )
}
