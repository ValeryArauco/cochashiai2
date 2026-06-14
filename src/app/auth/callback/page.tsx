'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Typography } from '@mui/material'
import { supabase } from '../../../lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const procesado = useRef(false)

  useEffect(() => {
    if (procesado.current) return
    procesado.current = true

    async function validar() {
      // Supabase puede devolver un error en la URL (ej. acceso denegado en Google)
      const params = new URLSearchParams(globalThis.location.search)
      if (params.get('error')) {
        router.replace('/login?error=sin_sesion')
        return
      }

      // esperar a que el createBrowserClient intercambie el code por sesión (PKCE)
      let sesion = null
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getSession()
        if (data.session) { sesion = data.session; break }
        await new Promise(r => setTimeout(r, 250))
      }

      if (!sesion) {
        router.replace('/login?error=sin_sesion')
        return
      }

      // Validar por correo: así funciona tanto con como sin identity linking
      // (Si Supabase creó un nuevo auth_user_id distinto, igual encontramos al usuario por correo)
      const email = sesion.user.email
      if (!email) {
        await supabase.auth.signOut()
        router.replace('/login?error=no_registrado')
        return
      }

      const { data: perfil } = await supabase
        .from('usuarios')
        .select('id')
        .eq('correo', email)
        .maybeSingle()

      if (!perfil) {
        await supabase.auth.signOut()
        router.replace('/login?error=no_registrado')
        return
      }

      router.replace('/torneos')
    }

    validar()
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
