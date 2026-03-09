'use client'
import { useState, useEffect } from 'react'
import { Judoka } from '../../domain/models/Judoka'
import { SupabaseJudokaRepository } from '../../infrastructure/repositories/SupabaseJudokaRepository'
import { useAuth } from '../context/AuthContext'

const repo = new SupabaseJudokaRepository()

export function useJudoka() {
  const { usuario } = useAuth()
  const [judoka, setJudoka] = useState<Judoka | null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    if (!usuario?.id) return
    repo.obtenerPorUsuarioId(usuario.id)
      .then(setJudoka)
      .finally(() => setCargando(false))
  }, [usuario?.id])

  const guardar = async (datos: Partial<Judoka>) => {
    if (!judoka) return
    setGuardando(true)
    setError(null)
    setExito(false)
    try {
      await repo.actualizar(judoka.id, datos)
      setJudoka({ ...judoka, ...datos })
      setExito(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  return { judoka, cargando, guardando, error, exito, guardar, esJudoka: judoka !== null }
}