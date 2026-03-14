'use client'
import { useState } from 'react'
import { TorneoFormData } from '../components/torneos/torneoSchema'
import { Club } from '../../domain/models/Club'
import { SupabaseTorneoRepository } from '../../infrastructure/repositories/SupabaseTorneoRepository'
import { CrearTorneo } from '../../application/use-cases/torneos/CrearTorneo'

const repo = new SupabaseTorneoRepository()
const crearTorneoUseCase = new CrearTorneo(repo)

export function useCrearTorneo(onExito?: () => void) {
  const [paso, setPaso] = useState<1 | 2>(1)
  const [formData, setFormData] = useState<TorneoFormData | null>(null)
  const [clubSeleccionado, setClubSeleccionado] = useState<Club | null>(null)
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const irAPaso2 = (data: TorneoFormData, club: Club) => {
    setFormData(data)
    setClubSeleccionado(club)
    setPaso(2)
  }

  const volver = () => setPaso(1)

  const guardar = async () => {
    if (!formData || !clubSeleccionado) return
    if (categoriasSeleccionadas.length === 0) {
      setError('Debe seleccionar al menos una categoría')
      return
    }
    setGuardando(true)
    setError(null)
    try {
      const ubicacion = clubSeleccionado.direccion
        ? `${clubSeleccionado.nombreClub} — ${clubSeleccionado.direccion}`
        : clubSeleccionado.nombreClub

      await crearTorneoUseCase.execute(
        {
          nombre: formData.nombre,
          ubicacion,
          fechaLimiteInscripcion: formData.fechaLimiteInscripcion,
          horaLimiteInscripcion: formData.horaLimiteInscripcion,
          numTatamis: formData.numTatamis,
          activo: true,
          organizadoPor: clubSeleccionado.id,
        },
        formData.fechas.map(f => ({
          fecha: f.fecha,
          horaInicio: f.horaInicio,
          horaFin: f.horaFin || '23:59:59',
          descripcion: f.descripcion,
        })),
        categoriasSeleccionadas
      )
      onExito?.()
      resetear()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear el torneo')
    } finally {
      setGuardando(false)
    }
  }

  const resetear = () => {
    setPaso(1)
    setFormData(null)
    setClubSeleccionado(null)
    setCategoriasSeleccionadas([])
    setError(null)
  }

  return {
    paso, formData, clubSeleccionado, categoriasSeleccionadas, setCategoriasSeleccionadas,
    guardando, error, irAPaso2, volver, guardar, resetear,
  }
}
