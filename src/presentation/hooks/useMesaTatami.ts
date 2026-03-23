'use client'
import { useState, useEffect } from 'react'
import { Combate } from '../../domain/models/Combate'
import { SupabaseLlaveRepository } from '../../infrastructure/repositories/SupabaseLlaveRepository'

const llaveRepo = new SupabaseLlaveRepository()

export function useMesaTatami(torneoId: string, tatami: number) {
  const [combates, setCombates] = useState<Combate[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = async () => {
    if (!torneoId || tatami < 1) return
    setCargando(true)
    try {
      const c = await llaveRepo.listarCombatesPorTorneoYTatami(torneoId, tatami)
      setCombates(c)
    } catch {
      setCombates([])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [torneoId, tatami])

  const iniciarCombate = async (combateId: string) => {
    await llaveRepo.actualizarEstadoCombate(combateId, 'en_curso')
    await cargar()
  }

  const registrarResultado = async (combateId: string, resultado: Partial<Combate>) => {
    await llaveRepo.actualizarResultadoCombate(combateId, resultado)
    await cargar()
  }

  const actualizarMarcadorParcial = async (combateId: string, marcador: {
    judoka1Ippones: number; judoka1Wazaris: number; judoka1Shidos: number
    judoka2Ippones: number; judoka2Wazaris: number; judoka2Shidos: number
  }) => {
    try {
      await llaveRepo.actualizarMarcadorParcial(combateId, marcador)
    } catch (e) {
      console.error('[actualizarMarcadorParcial]', e)
    }
  }

  return { combates, cargando, iniciarCombate, registrarResultado, actualizarMarcadorParcial }
}
