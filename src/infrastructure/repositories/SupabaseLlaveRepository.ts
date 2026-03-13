import { supabase } from '../../lib/supabase'
import { ILlaveRepository } from '../../domain/repositories/ILlaveRepository'
import { Combate } from '../../domain/models/Combate'
import { Llave, TipoBracket } from '../../domain/models/Llave'
import { LlaveMapper } from '../mappers/LlaveMapper'
import { CombateMapper } from '../mappers/CombateMapper'
import { LlaveDTO } from '../dtos/LlaveDTO'
import { CombateDTO } from '../dtos/CombateDTO'

const SELECT_COMBATE = `
  *,
  judoka1:judokas!combates_judoka1_id_fkey(
    id,
    usuario:usuarios(id, nombre, apellido_paterno, apellido_materno, avatar_url)
  ),
  judoka2:judokas!combates_judoka2_id_fkey(
    id,
    usuario:usuarios(id, nombre, apellido_paterno, apellido_materno, avatar_url)
  )
`

export class SupabaseLlaveRepository implements ILlaveRepository {
  async crear(
    torneoCategoriaId: string,
    combates: Omit<Combate, 'id'>[],
    tipoBracket: TipoBracket,
    numParticipantes: number,
    estructura: object,
    generadoPor: string
  ): Promise<Llave> {
    const { data: llaveData, error: llaveError } = await supabase
      .from('llaves')
      .insert({
        torneo_categoria_id: torneoCategoriaId,
        estructura,
        num_participantes: numParticipantes,
        tipo_bracket: tipoBracket,
        generado_por: generadoPor,
      })
      .select('id')
      .single()

    if (llaveError || !llaveData) throw new Error('No se pudo crear la llave')
    const llaveId = llaveData.id

    if (combates.length > 0) {
      const { error: combatesError } = await supabase
        .from('combates')
        .insert(combates.map(c => ({
          llave_id: llaveId,
          ronda: c.ronda,
          posicion: c.posicion,
          judoka1_id: c.judoka1Id ?? null,
          judoka2_id: c.judoka2Id ?? null,
          ganador_id: c.ganadorId ?? null,
          judoka1_ippones: 0,
          judoka1_wazaris: 0,
          judoka1_shidos: 0,
          judoka2_ippones: 0,
          judoka2_wazaris: 0,
          judoka2_shidos: 0,
          estado: c.estado,
          tatami: c.tatami ?? null,
        })))

      if (combatesError) throw new Error('No se pudieron crear los combates')
    }

    const { data, error } = await supabase
      .from('llaves')
      .select('*')
      .eq('id', llaveId)
      .single()

    if (error || !data) throw new Error('No se pudo obtener la llave creada')
    return LlaveMapper.toDomain(data as LlaveDTO)
  }

  async obtenerPorTorneoCategoria(torneoCategoriaId: string): Promise<Llave | null> {
    const { data, error } = await supabase
      .from('llaves')
      .select('*')
      .eq('torneo_categoria_id', torneoCategoriaId)
      .maybeSingle()

    if (error || !data) return null
    return LlaveMapper.toDomain(data as LlaveDTO)
  }

  async listarCombatesPorLlave(llaveId: string): Promise<Combate[]> {
    const { data, error } = await supabase
      .from('combates')
      .select(SELECT_COMBATE)
      .eq('llave_id', llaveId)
      .order('ronda')
      .order('posicion')

    if (error) throw new Error('No se pudieron cargar los combates')
    return (data as CombateDTO[]).map(CombateMapper.toDomain)
  }

  async actualizarResultadoCombate(combateId: string, resultado: Partial<Combate>): Promise<Combate> {
    const { data, error } = await supabase
      .from('combates')
      .update({
        ganador_id: resultado.ganadorId ?? null,
        judoka1_ippones: resultado.judoka1Ippones,
        judoka1_wazaris: resultado.judoka1Wazaris,
        judoka1_shidos: resultado.judoka1Shidos,
        judoka2_ippones: resultado.judoka2Ippones,
        judoka2_wazaris: resultado.judoka2Wazaris,
        judoka2_shidos: resultado.judoka2Shidos,
        estado: resultado.estado ?? 'finalizado',
        tipo_victoria: resultado.tipoVictoria ?? null,
      })
      .eq('id', combateId)
      .select(SELECT_COMBATE)
      .single()

    if (error || !data) throw new Error('No se pudo actualizar el resultado')
    return CombateMapper.toDomain(data as CombateDTO)
  }
}
