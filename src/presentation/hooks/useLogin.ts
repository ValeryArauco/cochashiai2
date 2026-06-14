'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Login } from '../../application/use-cases/auth/Login'
import { Logout } from '../../application/use-cases/auth/Logout'
import { LoginConGoogle } from '../../application/use-cases/auth/LoginConGoogle'
import { SupabaseAuthRepository } from '../../infrastructure/repositories/SupabaseAuthRepository'

const authRepo = new SupabaseAuthRepository()
const loginUseCase = new Login(authRepo)
const logoutUseCase = new Logout(authRepo)
const loginConGoogleUseCase = new LoginConGoogle(authRepo)

export function useLogin() {
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const login = async (email: string, password: string) => {
        setCargando(true)
        setError(null)

        try {
            await loginUseCase.execute(email, password)
            router.push('/torneos')
        } catch (e: any) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }

    const loginConGoogle = async () => {
        setCargando(true)
        setError(null)
        try {
            const redirectTo = `${globalThis.location.origin}/auth/callback`
            await loginConGoogleUseCase.execute(redirectTo)
            // el browser navega a Google; cuando vuelva irá a /auth/callback
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Error al iniciar con Google')
            setCargando(false)
        }
    }

    const logout = async () => {
        await logoutUseCase.execute()
        router.refresh()
        router.push('/login')
    }

    return { login, loginConGoogle, logout, cargando, error }
}