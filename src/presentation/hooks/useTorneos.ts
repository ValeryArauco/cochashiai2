'use client'
import { useState, useEffect, useCallback } from 'react'
import { Torneo } from '../../domain/models/Torneo'
import { FiltrosTorneos } from '../../domain/repositories/ITorneoRepository'
import { SupabaseTorneoRepository } from '../../infrastructure/repositories/SupabaseTorneoRepository'

const repo = new SupabaseTorneoRepository()

export function useTorneos() {
  const ahora = new Date()
  const [torneos, setTorneos] = useState<Torneo[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosTorneos>({
    año: ahora.getFullYear(),
    mes: ahora.getMonth() + 1,
  })

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

  return { torneos, cargando, error, filtros, setFiltros, recargar: cargar }
}
