'use client'
import { useState, useEffect } from 'react'
import { Inscripcion } from '../../domain/models/Inscripcion'
import { SupabaseInscripcionRepository } from '../../infrastructure/repositories/SupabaseInscripcionRepository'
import { AprobarInscripcionAdmin } from '../../application/use-cases/inscripciones/AprobarInscripcionAdmin'

const repo = new SupabaseInscripcionRepository()
const aprobarUseCase = new AprobarInscripcionAdmin(repo)

export function useSolicitudesAdmin(torneoId: string) {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = () => {
    if (!torneoId) return
    setCargando(true)
    repo.listarPorTorneo(torneoId, ['aprobado_sensei', 'aprobado_admin'])
      .then(setInscripciones)
      .catch(e => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [torneoId])

  const aprobar = async (inscripcionId: string, pesoOficial: number) => {
    try {
      await aprobarUseCase.execute(inscripcionId, pesoOficial)
      setInscripciones(prev =>
        prev.map(i => i.id === inscripcionId
          ? { ...i, estado: 'aprobado_admin' as const, pesoOficial }
          : i
        )
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al aprobar')
    }
  }

  const cambiarCategoria = async (inscripcionId: string, nuevaTorneoCategoriaId: string) => {
    try {
      await repo.cambiarCategoria(inscripcionId, nuevaTorneoCategoriaId)
      cargar()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cambiar categoría')
    }
  }

  const eliminar = async (inscripcionId: string) => {
    try {
      await repo.eliminar(inscripcionId)
      setInscripciones(prev => prev.filter(i => i.id !== inscripcionId))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  return { inscripciones, cargando, error, aprobar, cambiarCategoria, eliminar }
}
