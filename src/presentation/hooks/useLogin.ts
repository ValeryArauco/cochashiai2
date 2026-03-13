'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Login } from '../../application/use-cases/auth/Login'
import { Logout } from '../../application/use-cases/auth/Logout'
import { SupabaseAuthRepository } from '../../infrastructure/repositories/SupabaseAuthRepository'

const authRepo = new SupabaseAuthRepository()
const loginUseCase = new Login(authRepo)
const logoutUseCase = new Logout(authRepo)

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

    const logout = async () => {
        await logoutUseCase.execute()
        router.refresh()
        router.push('/login')
    }

    return { login, logout, cargando, error }
}