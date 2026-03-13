'use client'
import { useState, useEffect } from 'react'
import { Club } from '../../domain/models/Club'
import { SupabaseClubRepository } from '../../infrastructure/repositories/SupabaseClubRepository'

const repo = new SupabaseClubRepository()

export function useClubes() {
  const [clubes, setClubes] = useState<Club[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    repo.listarActivos()
      .then(setClubes)
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  return { clubes, cargando }
}
