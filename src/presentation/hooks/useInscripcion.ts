'use client'
import { useState } from 'react'
import { Judoka } from '../../domain/models/Judoka'
import { TorneoCategoria } from '../../domain/models/TorneoCategoria'
import { Categoria, GrupoEdad, GeneroCategoria } from '../../domain/models/Categoria'
import { EstadoInscripcion } from '../../domain/models/Inscripcion'
import { SupabaseInscripcionRepository } from '../../infrastructure/repositories/SupabaseInscripcionRepository'
import { SolicitarInscripcion } from '../../application/use-cases/inscripciones/SolicitarInscripcion'
import { CancelarInscripcion } from '../../application/use-cases/inscripciones/CancelarInscripcion'

const repo = new SupabaseInscripcionRepository()
const solicitarUseCase = new SolicitarInscripcion(repo)
const cancelarUseCase = new CancelarInscripcion(repo)

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

function grupoEdad(edad: number): GrupoEdad {
  if (edad <= 14) return 'infantil'
  if (edad <= 17) return 'cadete'
  return 'senior'
}

export function categoriasElegibles(
  judoka: Judoka,
  torneoCategorias: TorneoCategoria[]
): TorneoCategoria[] {
  if (!judoka.usuario.fechaNacimiento || !judoka.usuario.genero) return []
  const edad = calcularEdad(judoka.usuario.fechaNacimiento)
  const grupo = grupoEdad(edad)
  const generoJudoka = judoka.usuario.genero.toLowerCase() as GeneroCategoria

  return torneoCategorias.filter(tc => {
    const cat: Categoria = tc.categoria
    if (cat.edad !== grupo) return false
    if (cat.genero !== 'mixto' && cat.genero !== generoJudoka) return false
    return true
  })
}

export function useInscripcion(judoka: Judoka | null, torneoId: string) {
  const [enviando, setEnviando] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  const solicitar = async (torneoCategoriaId: string) => {
    if (!judoka) return
    setEnviando(true)
    setError(null)
    setExito(false)
    try {
      await solicitarUseCase.execute(judoka, torneoCategoriaId, torneoId)
      setExito(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al solicitar inscripción')
    } finally {
      setEnviando(false)
    }
  }

  const cancelar = async (inscripcionId: string, estadoActual: EstadoInscripcion, onCancelado: () => void) => {
    setCancelando(true)
    setError(null)
    try {
      await cancelarUseCase.execute(inscripcionId, estadoActual)
      onCancelado()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cancelar la inscripción')
    } finally {
      setCancelando(false)
    }
  }

  return { enviando, cancelando, error, exito, solicitar, cancelar }
}
