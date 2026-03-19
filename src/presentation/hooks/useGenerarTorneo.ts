'use client'
import { useState } from 'react'
import { Torneo } from '../../domain/models/Torneo'
import { SupabaseLlaveRepository } from '../../infrastructure/repositories/SupabaseLlaveRepository'
import { SupabaseInscripcionRepository } from '../../infrastructure/repositories/SupabaseInscripcionRepository'
import { CinturonStrategy } from '../../application/use-cases/llaves/seeding/CinturonStrategy'
import { GenerarLlavesTorneo, ResultadoCategoria } from '../../application/use-cases/llaves/GenerarLlavesTorneo'
import { useAuth } from '../context/AuthContext'

export type { ResultadoCategoria }

const llaveRepo = new SupabaseLlaveRepository()
const inscripcionRepo = new SupabaseInscripcionRepository()

export interface ProgresoGeneracion {
  actual: number
  total: number
  categoriaActual: string
}

export function useGenerarTorneo(torneoId: string, torneo: Torneo | null) {
  const { usuario } = useAuth()
  const [generando, setGenerando] = useState(false)
  const [progreso, setProgreso] = useState<ProgresoGeneracion | null>(null)
  const [resultados, setResultados] = useState<ResultadoCategoria[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generarTodas = async () => {
    if (!usuario?.id || !torneo) return
    setGenerando(true)
    setError(null)
    setResultados(null)
    setProgreso({ actual: 0, total: torneo.torneoCategorias.length, categoriaActual: '' })

    try {
      const strategy = new CinturonStrategy()
      const uc = new GenerarLlavesTorneo(llaveRepo, inscripcionRepo, strategy)
      const res = await uc.execute(
        torneoId,
        torneo.torneoCategorias.map(tc => ({ id: tc.id, nombre: tc.categoria.nombre })),
        torneo.numTatamis,
        usuario.id,
        (resultado, idx, total) => {
          setProgreso({ actual: idx, total, categoriaActual: resultado.nombreCategoria })
        },
      )
      setResultados(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar llaves')
    } finally {
      setGenerando(false)
      setProgreso(null)
    }
  }

  const limpiarResultados = () => setResultados(null)

  return { generarTodas, generando, progreso, resultados, error, limpiarResultados }
}
