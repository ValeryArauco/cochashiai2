'use client'
import { useState, useEffect } from 'react'
import { Llave, TipoBracket } from '../../domain/models/Llave'
import { Combate } from '../../domain/models/Combate'
import { SupabaseLlaveRepository } from '../../infrastructure/repositories/SupabaseLlaveRepository'
import { SupabaseInscripcionRepository } from '../../infrastructure/repositories/SupabaseInscripcionRepository'
import { GenerarLlaves } from '../../application/use-cases/llaves/GenerarLlaves'
import { useAuth } from '../context/AuthContext'

const llaveRepo = new SupabaseLlaveRepository()
const inscripcionRepo = new SupabaseInscripcionRepository()
const generarUseCase = new GenerarLlaves(llaveRepo, inscripcionRepo)

export function useLlaves(torneoCategoriaId: string, torneoId: string, numTatamis: number) {
  const { usuario } = useAuth()
  const [llave, setLlave] = useState<Llave | null>(null)
  const [combates, setCombates] = useState<Combate[]>([])
  const [cargando, setCargando] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!torneoCategoriaId) return
    llaveRepo.obtenerPorTorneoCategoria(torneoCategoriaId)
      .then(async l => {
        setLlave(l)
        if (l) {
          const c = await llaveRepo.listarCombatesPorLlave(l.id)
          setCombates(c)
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [torneoCategoriaId])

  const generar = async (tipoBracket: TipoBracket) => {
    if (!usuario?.id) return
    setGenerando(true)
    setError(null)
    try {
      const nuevaLlave = await generarUseCase.execute(
        torneoId, torneoCategoriaId, tipoBracket, numTatamis, usuario.id
      )
      setLlave(nuevaLlave)
      const c = await llaveRepo.listarCombatesPorLlave(nuevaLlave.id)
      setCombates(c)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al generar llaves')
    } finally {
      setGenerando(false)
    }
  }

  const registrarResultado = async (combateId: string, resultado: Partial<Combate>) => {
    try {
      const actualizado = await llaveRepo.actualizarResultadoCombate(combateId, resultado)
      setCombates(prev => prev.map(c => c.id === combateId ? actualizado : c))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al registrar resultado')
    }
  }

  return { llave, combates, cargando, generando, error, generar, registrarResultado }
}
