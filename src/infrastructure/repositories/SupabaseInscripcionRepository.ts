import { supabase } from '../../lib/supabase'
import { IInscripcionRepository } from '../../domain/repositories/IInscripcionRepository'
import { EstadoInscripcion, Inscripcion } from '../../domain/models/Inscripcion'
import { InscripcionMapper } from '../mappers/InscripcionMapper'
import { InscripcionDTO } from '../dtos/InscripcionDTO'

const SELECT_COMPLETO = `
  *,
  judoka:judokas(
    id,
    usuario_id,
    cinturon_actual,
    peso_competitivo,
    usuario:usuarios(id, nombre, apellido_paterno, apellido_materno, correo, fecha_nacimiento, genero, avatar_url, rol)
  ),
  torneo_categoria:torneo_categoria(
    id,
    torneo_id,
    categoria_id,
    categoria:categorias(id, nombre, genero, edad, peso_minimo, peso_maximo, activo)
  )
`

export class SupabaseInscripcionRepository implements IInscripcionRepository {
  async crear(torneoCategoriaId: string, judokaId: string): Promise<Inscripcion> {
    const { data, error } = await supabase
      .from('inscripciones')
      .insert({ torneo_categoria_id: torneoCategoriaId, judoka_id: judokaId })
      .select(SELECT_COMPLETO)
      .single()

    if (error || !data) throw new Error('No se pudo crear la inscripción')
    return InscripcionMapper.toDomain(data as InscripcionDTO)
  }

  async listarPorTorneo(torneoId: string, estadoFiltro?: EstadoInscripcion[]): Promise<Inscripcion[]> {
    const { data: tcData } = await supabase
      .from('torneo_categoria')
      .select('id')
      .eq('torneo_id', torneoId)

    if (!tcData || tcData.length === 0) return []

    const tcIds = tcData.map((tc: { id: string }) => tc.id)

    let query = supabase
      .from('inscripciones')
      .select(SELECT_COMPLETO)
      .in('torneo_categoria_id', tcIds)

    if (estadoFiltro && estadoFiltro.length > 0) {
      query = query.in('estado', estadoFiltro)
    }

    const { data, error } = await query
    if (error) throw new Error('No se pudieron cargar las inscripciones')
    return (data as InscripcionDTO[]).map(InscripcionMapper.toDomain)
  }

  async obtenerPorJudokaYTorneo(judokaId: string, torneoId: string): Promise<Inscripcion | null> {
    const { data: tcData } = await supabase
      .from('torneo_categoria')
      .select('id')
      .eq('torneo_id', torneoId)

    if (!tcData || tcData.length === 0) return null

    const tcIds = tcData.map((tc: { id: string }) => tc.id)

    const { data, error } = await supabase
      .from('inscripciones')
      .select(SELECT_COMPLETO)
      .eq('judoka_id', judokaId)
      .in('torneo_categoria_id', tcIds)
      .limit(1)
      .maybeSingle()

    if (error || !data) return null
    return InscripcionMapper.toDomain(data as InscripcionDTO)
  }

  async aprobarEntrenador(inscripcionId: string): Promise<void> {
    const { error } = await supabase
      .from('inscripciones')
      .update({ estado: 'aprobado_entrenador' })
      .eq('id', inscripcionId)

    if (error) throw new Error('No se pudo aprobar la inscripción')
  }

  async registrarPeso(inscripcionId: string, pesoOficial: number): Promise<void> {
    const { error } = await supabase
      .from('inscripciones')
      .update({ estado: 'pendiente_pago', peso_oficial: pesoOficial })
      .eq('id', inscripcionId)

    if (error) throw new Error('No se pudo registrar el peso')
  }

  async confirmarPago(inscripcionId: string): Promise<void> {
    const { error } = await supabase
      .from('inscripciones')
      .update({ estado: 'confirmado' })
      .eq('id', inscripcionId)

    if (error) throw new Error('No se pudo confirmar el pago')
  }

  async cambiarCategoria(inscripcionId: string, nuevaTorneoCategoriaId: string): Promise<void> {
    const { error } = await supabase
      .from('inscripciones')
      .update({ torneo_categoria_id: nuevaTorneoCategoriaId })
      .eq('id', inscripcionId)

    if (error) throw new Error('No se pudo cambiar la categoría')
  }

  async eliminar(inscripcionId: string): Promise<void> {
    const { error } = await supabase
      .from('inscripciones')
      .delete()
      .eq('id', inscripcionId)

    if (error) throw new Error('No se pudo eliminar la inscripción')
  }
}
