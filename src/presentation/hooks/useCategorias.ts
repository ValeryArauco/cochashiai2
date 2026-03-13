'use client'
import { useState, useEffect } from 'react'
import { Categoria } from '../../domain/models/Categoria'
import { SupabaseCategoriaRepository } from '../../infrastructure/repositories/SupabaseCategoriaRepository'

const repo = new SupabaseCategoriaRepository()

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    repo.listarActivas()
      .then(setCategorias)
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  return { categorias, cargando }
}
