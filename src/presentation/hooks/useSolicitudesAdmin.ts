'use client'
import { useState, useEffect } from 'react'
import { Inscripcion } from '../../domain/models/Inscripcion'
import { SupabaseInscripcionRepository } from '../../infrastructure/repositories/SupabaseInscripcionRepository'
import { AprobarInscripcionAdmin } from '../../application/use-cases/inscripciones/AprobarInscripcionAdmin'
import { ConfirmarPago } from '../../application/use-cases/inscripciones/ConfirmarPago'

const repo = new SupabaseInscripcionRepository()
const registrarPesoUseCase = new AprobarInscripcionAdmin(repo)
const confirmarPagoUseCase = new ConfirmarPago(repo)

export function useSolicitudesAdmin(torneoId: string) {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = () => {
    if (!torneoId) return
    setCargando(true)
    repo.listarPorTorneo(torneoId, ['aprobado_entrenador', 'pendiente_pago', 'confirmado'])
      .then(setInscripciones)
      .catch(e => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [torneoId])

  const registrarPeso = async (inscripcionId: string, pesoOficial: number) => {
    try {
      await registrarPesoUseCase.execute(inscripcionId, pesoOficial)
      setInscripciones(prev =>
        prev.map(i => i.id === inscripcionId
          ? { ...i, estado: 'pendiente_pago' as const, pesoOficial }
          : i
        )
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al registrar peso')
    }
  }

  const confirmarPago = async (inscripcionId: string) => {
    try {
      await confirmarPagoUseCase.execute(inscripcionId)
      setInscripciones(prev =>
        prev.map(i => i.id === inscripcionId ? { ...i, estado: 'confirmado' as const } : i)
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al confirmar pago')
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

  return { inscripciones, cargando, error, registrarPeso, confirmarPago, cambiarCategoria, eliminar }
}
