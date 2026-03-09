import { supabase } from '../../lib/supabase'
import { IJudokaRepository } from '../../domain/repositories/IJudokaRepository'
import { Judoka } from '../../domain/models/Judoka'
import { JudokaMapper } from '../mappers/JudokaMapper'
import { JudokaDTO } from '../dtos/JudokaDTO'

export class SupabaseJudokaRepository implements IJudokaRepository {

  private readonly SELECT = `
    *,
    usuario:usuarios(*)
  `

  async obtenerPorUsuarioId(usuarioId: string): Promise<Judoka | null> {
    const { data, error } = await supabase
      .from('judokas')
      .select(this.SELECT)
      .eq('usuario_id', usuarioId)
      .single()

    if (error || !data) return null
    return JudokaMapper.toDomain(data as JudokaDTO)
  }

  async obtenerPorId(id: string): Promise<Judoka> {
    const { data, error } = await supabase
      .from('judokas')
      .select(this.SELECT)
      .eq('id', id)
      .single()

    if (error || !data) throw new Error('Judoka no encontrado')
    return JudokaMapper.toDomain(data as JudokaDTO)
  }


  async actualizar(id: string, datos: Partial<Judoka>): Promise<Judoka> {
  
    if (datos.usuario) {
      const { error: errorUsuario } = await supabase
        .from('usuarios')
        .update({
          fecha_nacimiento: datos.usuario.fechaNacimiento,
          numero_celular: datos.usuario.celular,
          genero: datos.usuario.genero,
        })
        .eq('id', datos.usuario.id)

      if (errorUsuario) throw new Error('No se pudo actualizar el usuario')
    }

    const { data, error } = await supabase
      .from('judokas')
      .update({
        contacto_emergencia: datos.contactoEmergencia,
        relacion_contacto: datos.relacionContacto,
        tipo_sangre: datos.tipoSangre,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(this.SELECT)
      .single()

    if (error || !data) throw new Error('No se pudo actualizar el judoka')
    return JudokaMapper.toDomain(data as JudokaDTO)
  }



}