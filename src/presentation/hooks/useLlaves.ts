'use client'
import { useState, useEffect } from 'react'
import { Llave, TipoBracket } from '../../domain/models/Llave'
import { Combate } from '../../domain/models/Combate'
import { SupabaseLlaveRepository } from '../../infrastructure/repositories/SupabaseLlaveRepository'
import { SupabaseInscripcionRepository } from '../../infrastructure/repositories/SupabaseInscripcionRepository'
import { GenerarLlaves } from '../../application/use-cases/llaves/GenerarLlaves'
import { CinturonStrategy } from '../../application/use-cases/llaves/seeding/CinturonStrategy'
import { useAuth } from '../context/AuthContext'

export type TipoSeed = 'cinturon'


const SEED_STRATEGIES: Record<TipoSeed, () => CinturonStrategy> = {
  cinturon: () => new CinturonStrategy(),
}

const llaveRepo = new SupabaseLlaveRepository()
const inscripcionRepo = new SupabaseInscripcionRepository()

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

  const generar = async (tipoBracket: TipoBracket, tipoSeed: TipoSeed = 'cinturon') => {
    if (!usuario?.id) return
    setGenerando(true)
    setError(null)
    try {
      const strategy = SEED_STRATEGIES[tipoSeed]()
      const useCase = new GenerarLlaves(llaveRepo, inscripcionRepo, strategy)
      const nuevaLlave = await useCase.execute(
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
      await llaveRepo.actualizarResultadoCombate(combateId, resultado)
      if (llave) {
        const c = await llaveRepo.listarCombatesPorLlave(llave.id)
        setCombates(c)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al registrar resultado')
    }
  }

  const iniciarCombate = async (combateId: string) => {
    try {
      const actualizado = await llaveRepo.actualizarEstadoCombate(combateId, 'en_curso')
      setCombates(prev => prev.map(c => c.id === combateId ? actualizado : c))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al iniciar combate')
    }
  }

  const actualizarMarcadorParcial = async (combateId: string, marcador: {
    judoka1Ippones: number; judoka1Wazaris: number; judoka1Shidos: number
    judoka2Ippones: number; judoka2Wazaris: number; judoka2Shidos: number
  }) => {
    try {
      await llaveRepo.actualizarMarcadorParcial(combateId, marcador)
    } catch (e) {
      console.error('[actualizarMarcadorParcial]', e)
      setError(e instanceof Error ? e.message : 'Error al actualizar marcador')
    }
  }

  const reasignarTatami = async (combateId: string, tatami: number) => {
    try {
      const actualizado = await llaveRepo.actualizarTatamiCombate(combateId, tatami)
      setCombates(prev => prev.map(c => c.id === combateId ? actualizado : c))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al reasignar tatami')
    }
  }

  return { llave, combates, cargando, generando, error, generar, registrarResultado, actualizarMarcadorParcial, iniciarCombate, reasignarTatami }
}
