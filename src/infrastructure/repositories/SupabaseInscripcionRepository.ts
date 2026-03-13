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
    let query = supabase
      .from('inscripciones')
      .select(SELECT_COMPLETO)
      .eq('torneo_categoria.torneo_id', torneoId)

    if (estadoFiltro && estadoFiltro.length > 0) {
      query = query.in('estado', estadoFiltro)
    }

    const { data, error } = await query
    if (error) throw new Error('No se pudieron cargar las inscripciones')
    return (data as InscripcionDTO[]).map(InscripcionMapper.toDomain)
  }

  async obtenerPorJudokaYTorneo(judokaId: string, torneoId: string): Promise<Inscripcion | null> {
    const { data, error } = await supabase
      .from('inscripciones')
      .select(SELECT_COMPLETO)
      .eq('judoka_id', judokaId)
      .eq('torneo_categoria.torneo_id', torneoId)
      .maybeSingle()

    if (error) return null
    if (!data) return null
    return InscripcionMapper.toDomain(data as InscripcionDTO)
  }

  async aprobarSensei(inscripcionId: string, usuarioId: string): Promise<void> {
    const { data: senseiData, error: senseiError } = await supabase
      .from('senseis')
      .select('id')
      .eq('usuario_id', usuarioId)
      .single()

    if (senseiError || !senseiData) throw new Error('No se encontró el perfil del sensei')

    const { error } = await supabase
      .from('inscripciones')
      .update({
        estado: 'aprobado_sensei',
        aprobado_por_sensei_id: senseiData.id,
        fecha_aprobacion_sensei: new Date().toISOString(),
      })
      .eq('id', inscripcionId)

    if (error) throw new Error('No se pudo aprobar la inscripción')
  }

  async aprobarAdmin(inscripcionId: string, pesoOficial: number): Promise<void> {
    const { error } = await supabase
      .from('inscripciones')
      .update({ estado: 'aprobado_admin', peso_oficial: pesoOficial })
      .eq('id', inscripcionId)

    if (error) throw new Error('No se pudo aprobar la inscripción')
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
