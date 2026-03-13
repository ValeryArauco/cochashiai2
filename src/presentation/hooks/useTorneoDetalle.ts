'use client'
import { useState, useEffect } from 'react'
import { Torneo } from '../../domain/models/Torneo'
import { Inscripcion } from '../../domain/models/Inscripcion'
import { SupabaseTorneoRepository } from '../../infrastructure/repositories/SupabaseTorneoRepository'
import { SupabaseInscripcionRepository } from '../../infrastructure/repositories/SupabaseInscripcionRepository'
import { useAuth } from '../context/AuthContext'

const torneoRepo = new SupabaseTorneoRepository()
const inscripcionRepo = new SupabaseInscripcionRepository()

export function useTorneoDetalle(torneoId: string) {
  const { usuario } = useAuth()
  const [torneo, setTorneo] = useState<Torneo | null>(null)
  const [inscripcionActual, setInscripcionActual] = useState<Inscripcion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!torneoId) return
    setCargando(true)
    Promise.all([
      torneoRepo.obtenerPorId(torneoId),
      usuario?.id ? inscripcionRepo.obtenerPorJudokaYTorneo(usuario.id, torneoId).catch(() => null) : Promise.resolve(null),
    ])
      .then(([t, i]) => {
        setTorneo(t)
        setInscripcionActual(i)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setCargando(false))
  }, [torneoId, usuario?.id])

  const inscripcionAbierta = torneo
    ? new Date() <= new Date(`${torneo.fechaLimiteInscripcion}T${torneo.horaLimiteInscripcion ?? '23:59:59'}`)
    : false

  return { torneo, inscripcionActual, cargando, error, inscripcionAbierta }
}
