import { supabase } from '../../lib/supabase'
import { ITorneoRepository, FiltrosTorneos } from '../../domain/repositories/ITorneoRepository'
import { Torneo, TorneoFecha } from '../../domain/models/Torneo'
import { TorneoMapper } from '../mappers/TorneoMapper'
import { TorneoDTO } from '../dtos/TorneoDTO'

const SELECT = `
  *,
  torneos_fechas(*),
  torneo_categoria(
    id,
    torneo_id,
    categoria_id,
    fecha_torneo_id,
    categoria:categorias(*)
  )
`

export class SupabaseTorneoRepository implements ITorneoRepository {
  async listar(filtros?: FiltrosTorneos): Promise<Torneo[]> {
    const { data, error } = await supabase
      .from('torneos')
      .select(SELECT)
      .eq('activo', true)
      .order('fecha_limite_inscripcion', { ascending: false })

    if (error) throw new Error('No se pudieron cargar los torneos')

    let torneos = (data as TorneoDTO[]).map(TorneoMapper.toDomain)

    if (filtros?.nombre) {
      const nombre = filtros.nombre.toLowerCase()
      torneos = torneos.filter(t => t.nombre.toLowerCase().includes(nombre))
    }
    if (filtros?.año) {
      torneos = torneos.filter(t =>
        t.fechas.some(f => new Date(f.fecha).getFullYear() === filtros.año) ||
        new Date(t.fechaLimiteInscripcion).getFullYear() === filtros.año
      )
    }
    if (filtros?.mes) {
      torneos = torneos.filter(t =>
        t.fechas.some(f => new Date(f.fecha).getMonth() + 1 === filtros.mes) ||
        new Date(t.fechaLimiteInscripcion).getMonth() + 1 === filtros.mes
      )
    }

    return torneos
  }

  async obtenerPorId(id: string): Promise<Torneo> {
    const { data, error } = await supabase
      .from('torneos')
      .select(SELECT)
      .eq('id', id)
      .eq('activo', true)
      .single()

    if (error || !data) throw new Error('Torneo no encontrado')
    return TorneoMapper.toDomain(data as TorneoDTO)
  }

  async crear(
    datos: Omit<Torneo, 'id' | 'fechas' | 'categorias' | 'torneoCategorias'>,
    fechas: Omit<TorneoFecha, 'id' | 'torneoId'>[],
    categoriaIds: string[]
  ): Promise<Torneo> {
    const { data: torneoData, error: torneoError } = await supabase
      .from('torneos')
      .insert({
        nombre: datos.nombre,
        fecha_limite_inscripcion: datos.fechaLimiteInscripcion,
        hora_limite_inscripcion: datos.horaLimiteInscripcion,
        ubicacion: datos.ubicacion,
        num_tatamis: datos.numTatamis,
        organizado_por: datos.organizadoPor,
        activo: true,
      })
      .select('id')
      .single()

    if (torneoError || !torneoData) throw new Error('No se pudo crear el torneo')
    const torneoId = torneoData.id

    if (fechas.length > 0) {
      const { error: fechasError } = await supabase
        .from('torneos_fechas')
        .insert(fechas.map(f => ({
          torneo_id: torneoId,
          fecha: f.fecha,
          hora_inicio: f.horaInicio,
          hora_fin: f.horaFin,
          descripcion: f.descripcion,
        })))

      if (fechasError) throw new Error('No se pudieron guardar las fechas del torneo')
    }

    if (categoriaIds.length > 0) {
      const { error: catError } = await supabase
        .from('torneo_categoria')
        .insert(categoriaIds.map(cId => ({
          torneo_id: torneoId,
          categoria_id: cId,
        })))

      if (catError) throw new Error('No se pudieron guardar las categorías del torneo')
    }

    return this.obtenerPorId(torneoId)
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await supabase
      .from('torneos')
      .update({ activo: false })
      .eq('id', id)

    if (error) throw new Error('No se pudo eliminar el torneo')
  }
}
