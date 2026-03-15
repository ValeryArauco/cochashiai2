'use client'
import { useState, useEffect } from 'react'
import { Inscripcion } from '../../domain/models/Inscripcion'
import { SupabaseInscripcionRepository } from '../../infrastructure/repositories/SupabaseInscripcionRepository'
import { AprobarInscripcionSensei } from '../../application/use-cases/inscripciones/AprobarInscripcionSensei'
import { RechazarInscripcion } from '../../application/use-cases/inscripciones/RechazarInscripcion'
import { useAuth } from '../context/AuthContext'

const repo = new SupabaseInscripcionRepository()
const aprobarUseCase = new AprobarInscripcionSensei(repo)
const rechazarUseCase = new RechazarInscripcion(repo)

export function useSolicitudesSensei(torneoId: string) {
  const { usuario } = useAuth()
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!torneoId) return
    repo.listarPorTorneo(torneoId, ['pendiente_entrenador', 'aprobado_entrenador'])
      .then(setInscripciones)
      .catch(e => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setCargando(false))
  }, [torneoId])

  const aprobar = async (ids: string[]) => {
    if (!usuario?.id) return
    setGuardando(true)
    setError(null)
    try {
      await Promise.all(ids.map(id => aprobarUseCase.execute(id)))
      setInscripciones(prev =>
        prev.map(i => ids.includes(i.id) ? { ...i, estado: 'aprobado_entrenador' as const } : i)
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al aprobar')
    } finally {
      setGuardando(false)
    }
  }

  const rechazar = async (id: string) => {
    setGuardando(true)
    setError(null)
    try {
      await rechazarUseCase.execute(id)
      setInscripciones(prev => prev.filter(i => i.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al rechazar')
    } finally {
      setGuardando(false)
    }
  }

  return { inscripciones, cargando, guardando, error, aprobar, rechazar }
}
