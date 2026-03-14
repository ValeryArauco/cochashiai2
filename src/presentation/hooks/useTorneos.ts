'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Torneo } from '../../domain/models/Torneo'
import { FiltrosTorneos } from '../../domain/repositories/ITorneoRepository'
import { SupabaseTorneoRepository } from '../../infrastructure/repositories/SupabaseTorneoRepository'

const repo = new SupabaseTorneoRepository()

export type OrdenCampo = 'fechaLimiteInscripcion' | 'primerFechaTorneo'
export type OrdenDir = 'asc' | 'desc'

export interface OrdenTorneos {
  campo: OrdenCampo
  dir: OrdenDir
}

export function useTorneos() {
  const ahora = new Date()
  const [torneos, setTorneos] = useState<Torneo[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosTorneos>({
    año: ahora.getFullYear(),
    mes: ahora.getMonth() + 1,
  })
  const [orden, setOrden] = useState<OrdenTorneos>({ campo: 'fechaLimiteInscripcion', dir: 'desc' })

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await repo.listar(filtros)
      setTorneos(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar torneos')
    } finally {
      setCargando(false)
    }
  }, [filtros])

  useEffect(() => { cargar() }, [cargar])

  const torneosSorted = useMemo(() => {
    return [...torneos].sort((a, b) => {
      let valA: string
      let valB: string

      if (orden.campo === 'fechaLimiteInscripcion') {
        valA = a.fechaLimiteInscripcion
        valB = b.fechaLimiteInscripcion
      } else {
        // primer día del torneo (mínima fecha de fechas[])
        valA = a.fechas.length > 0
          ? [...a.fechas].sort((x, y) => x.fecha.localeCompare(y.fecha))[0].fecha
          : ''
        valB = b.fechas.length > 0
          ? [...b.fechas].sort((x, y) => x.fecha.localeCompare(y.fecha))[0].fecha
          : ''
      }

      const cmp = valA.localeCompare(valB)
      return orden.dir === 'asc' ? cmp : -cmp
    })
  }, [torneos, orden])

  return { torneos: torneosSorted, cargando, error, filtros, setFiltros, orden, setOrden, recargar: cargar }
}
