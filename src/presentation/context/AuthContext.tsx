'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  useEffect(() => {
    // Load initial session — always unblock cargando even on error
    authRepo.obtenerSesionActual()
      .then((u) => setUsuario(u))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false))

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return

      if (!session) {

        setUsuario(null)
        setCargando(false)
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          router.replace('/login')
        }
        return
      }

      
      try {
        const u = await authRepo.obtenerSesionActual()
        setUsuario(u)
      } catch {
        
      } finally {
        setCargando(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [router])

  return (
    <AuthContext.Provider value={{ usuario, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)