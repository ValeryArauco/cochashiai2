'use client'
import { useState, useEffect } from 'react'
import { Usuario } from '../../domain/models/Usuario'
import { SupabaseAuthRepository } from '../../infrastructure/repositories/SupabaseAuthRepository'

const authRepo = new SupabaseAuthRepository()

export function useGestionarMesa() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState<string | null>(null) // usuarioId en proceso
  const [error, setError] = useState<string | null>(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const data = await authRepo.listarUsuariosMesa()
      setUsuarios(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar operadores')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const asignarTatami = async (usuarioId: string, tatami: number | null) => {
    setGuardando(usuarioId)
    setError(null)
    try {
      await authRepo.actualizarTatamiAsignado(usuarioId, tatami)
      setUsuarios(prev =>
        prev.map(u => u.id === usuarioId ? { ...u, tatamiAsignado: tatami ?? undefined } : u)
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setGuardando(null)
    }
  }

  return { usuarios, cargando, guardando, error, asignarTatami }
}
