'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Usuario } from '../../domain/models/Usuario'
import { SupabaseAuthRepository } from '../../infrastructure/repositories/SupabaseAuthRepository'
import { supabase } from '../../lib/supabase'

interface AuthContextType {
  usuario: Usuario | null
  cargando: boolean
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  cargando: true,
})

const authRepo = new SupabaseAuthRepository()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    authRepo.obtenerSesionActual().then((u) => {
      setUsuario(u)
      setCargando(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const u = await authRepo.obtenerSesionActual()
        setUsuario(u)
      } else {
        setUsuario(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)