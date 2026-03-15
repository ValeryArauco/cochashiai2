'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Inscripcion } from '../../domain/models/Inscripcion'
import { TorneoCategoria } from '../../domain/models/TorneoCategoria'
import { Categoria, GeneroCategoria, GrupoEdad } from '../../domain/models/Categoria'
import { SupabaseInscripcionRepository } from '../../infrastructure/repositories/SupabaseInscripcionRepository'
import { AprobarInscripcionAdmin } from '../../application/use-cases/inscripciones/AprobarInscripcionAdmin'

const repo = new SupabaseInscripcionRepository()
const registrarPesoUseCase = new AprobarInscripcionAdmin(repo)

export function useSolicitudesAdmin(torneoId: string) {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [torneoCategorias, setTorneoCategorias] = useState<TorneoCategoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = async () => {
    if (!torneoId) return
    setCargando(true)
    try {
      const [insc, { data: tcData }] = await Promise.all([
        repo.listarPorTorneo(torneoId, ['aprobado_entrenador', 'pendiente_pago', 'confirmado']),
        supabase
          .from('torneo_categoria')
          .select('id, torneo_id, categoria_id, categoria:categorias(id, nombre, genero, edad, peso_minimo, peso_maximo, activo)')
          .eq('torneo_id', torneoId),
      ])
      setInscripciones(insc)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tcs: TorneoCategoria[] = ((tcData ?? []) as any[]).map(tc => ({
        id: tc.id,
        torneoId: tc.torneo_id,
        categoriaId: tc.categoria_id,
        categoria: {
          id: tc.categoria.id,
          nombre: tc.categoria.nombre,
          genero: tc.categoria.genero as GeneroCategoria,
          edad: tc.categoria.edad as GrupoEdad,
          pesoMinimo: tc.categoria.peso_minimo,
          pesoMaximo: tc.categoria.peso_maximo,
          activo: tc.categoria.activo,
        } as Categoria,
      }))
      setTorneoCategorias(tcs)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [torneoId])

  // Registra el peso y mueve la inscripción a "confirmado"
  const registrarPeso = async (ins: Inscripcion, pesoOficial: number) => {
    try {
      await registrarPesoUseCase.execute(ins.id, pesoOficial)
      setInscripciones(prev =>
        prev.map(i => i.id === ins.id ? { ...i, estado: 'confirmado' as const, pesoOficial } : i)
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al registrar peso')
    }
  }

  // Marca el pago — independiente del estado
  const registrarPago = async (inscripcionId: string) => {
    try {
      await repo.marcarPagado(inscripcionId)
      setInscripciones(prev =>
        prev.map(i => i.id === inscripcionId ? { ...i, pagado: true } : i)
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al registrar pago')
    }
  }

  // Deshace el pago — independiente del estado
  const deshacerPago = async (inscripcionId: string) => {
    try {
      await repo.desmarcarPagado(inscripcionId)
      setInscripciones(prev =>
        prev.map(i => i.id === inscripcionId ? { ...i, pagado: false } : i)
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al deshacer pago')
    }
  }

  // Cambia categoría y registra el peso → confirmado
  const cambiarCategoriaYRegistrarPeso = async (
    ins: Inscripcion,
    nuevaTorneoCategoriaId: string,
    peso: number
  ) => {
    try {
      await repo.cambiarCategoria(ins.id, nuevaTorneoCategoriaId)
      await registrarPesoUseCase.execute(ins.id, peso)
      const nuevaTC = torneoCategorias.find(tc => tc.id === nuevaTorneoCategoriaId)
      setInscripciones(prev =>
        prev.map(i => i.id === ins.id
          ? { ...i, estado: 'confirmado' as const, pesoOficial: peso, torneoCategoriaId: nuevaTorneoCategoriaId, torneoCategoria: nuevaTC }
          : i
        )
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cambiar categoría')
    }
  }

  const eliminar = async (inscripcionId: string) => {
    try {
      await repo.eliminar(inscripcionId)
      setInscripciones(prev => prev.filter(i => i.id !== inscripcionId))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  return { inscripciones, torneoCategorias, cargando, error, registrarPeso, registrarPago, deshacerPago, cambiarCategoriaYRegistrarPeso, eliminar }
}
