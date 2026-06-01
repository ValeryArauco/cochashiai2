import { supabase } from '../../lib/supabase'
import { ILlaveRepository } from '../../domain/repositories/ILlaveRepository'
import { Combate, EstadoCombate } from '../../domain/models/Combate'
import { Llave, TipoBracket, EstructuraLlave } from '../../domain/models/Llave'
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

    const { data: llaveExistente } = await supabase
      .from('llaves')
      .select('id')
      .eq('torneo_categoria_id', torneoCategoriaId)
      .maybeSingle()

    if (llaveExistente) {
      await supabase.from('combates').delete().eq('llave_id', llaveExistente.id)
      await supabase.from('llaves').delete().eq('id', llaveExistente.id)
    }

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

    if (llaveError || !llaveData) throw new Error(`No se pudo crear la llave: ${llaveError?.message ?? 'error desconocido'}`)
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
          fase: c.fase,
          estado: c.estado,
          tipo_victoria: c.tipoVictoria ?? null,
          tatami: c.tatami ?? null,
        })))

      if (combatesError) throw new Error('No se pudieron crear los combates')
    }

    // Cascade byes and DQ-auto-resolved combates (finalizado with ganador_id)
    const { data: autoCombates } = await supabase
      .from('combates')
      .select('id, llave_id, ronda, posicion, judoka1_id, judoka2_id, ganador_id, fase')
      .eq('llave_id', llaveId)
      .in('estado', ['bye', 'finalizado'])
      .not('ganador_id', 'is', null)

    if (autoCombates) {
      for (const c of autoCombates as {
        id: string; llave_id: string; ronda: number; posicion: number
        judoka1_id: string | null; judoka2_id: string | null
        ganador_id: string | null; fase: string
      }[]) {
        await this.cascadear(c)
      }
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
    const { error: updateError } = await supabase
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

    if (updateError) throw new Error('No se pudo actualizar el resultado')


    const { data: rawData } = await supabase
      .from('combates')
      .select('id, llave_id, ronda, posicion, judoka1_id, judoka2_id, ganador_id, fase')
      .eq('id', combateId)
      .single()

    if (rawData) {
      await this.cascadear(rawData as {
        id: string; llave_id: string; ronda: number; posicion: number
        judoka1_id: string | null; judoka2_id: string | null
        ganador_id: string | null; fase: string
      })
    }


    const { data, error } = await supabase
      .from('combates')
      .select(SELECT_COMBATE)
      .eq('id', combateId)
      .single()

    if (error || !data) throw new Error('No se pudo obtener el combate actualizado')
    return CombateMapper.toDomain(data as CombateDTO)
  }

  /**
   * Propaga el resultado de un combate:
   * - fase='principal': ganador avanza en el cuadro principal; perdedor va a su combate de repesca
   * - fase='repesca': ganador avanza al siguiente combate de repesca
   *
   * La lógica de alimentación está completamente codificada en estructura.repesca.combates,
   * lo que permite soportar la estructura multi-ronda de bronce.
   */
  private async cascadear(combate: {
    id: string
    llave_id: string
    ronda: number
    posicion: number
    judoka1_id: string | null
    judoka2_id: string | null
    ganador_id: string | null
    fase: string
  }): Promise<void> {
    const { llave_id, ronda, posicion, judoka1_id, judoka2_id, ganador_id, fase } = combate
    if (!ganador_id) return

    const { data: llaveData } = await supabase
      .from('llaves')
      .select('estructura, num_participantes')
      .eq('id', llave_id)
      .single()

    if (!llaveData) return
    const est = llaveData.estructura as EstructuraLlave
    const numTatamis = Math.max(1, est.numTatamis ?? 1)
    const loserId = ganador_id === judoka1_id ? judoka2_id : judoka1_id

    if (fase === 'principal') {
      // 1. Avanzar ganador en el cuadro principal
      const nextRonda = ronda + 1
      if (nextRonda <= est.rondas) {
        const nextPosicion = Math.ceil(posicion / 2)
        const campo = posicion % 2 === 1 ? 'judoka1_id' : 'judoka2_id'
        const tatami = ((nextPosicion - 1) % numTatamis) + 1

        const { data: nextCombate } = await supabase
          .from('combates')
          .select('id, estado')
          .eq('llave_id', llave_id)
          .eq('ronda', nextRonda)
          .eq('posicion', nextPosicion)
          .eq('fase', 'principal')
          .maybeSingle()

        if (nextCombate && nextCombate.estado !== 'finalizado') {
          await supabase
            .from('combates')
            .update({ [campo]: ganador_id, tatami })
            .eq('id', nextCombate.id)
        }
      }

      // 2. Alimentar perdedor al combate de repesca correspondiente
      if (!est.repesca || !loserId) return

      for (const rc of est.repesca.combates) {
        const matchesFuente1 =
          rc.fuente1.tipo === 'perdedor_principal' &&
          rc.fuente1.ronda === ronda &&
          rc.fuente1.posicion === posicion
        const matchesFuente2 =
          rc.fuente2.tipo === 'perdedor_principal' &&
          rc.fuente2.ronda === ronda &&
          rc.fuente2.posicion === posicion

        if (!matchesFuente1 && !matchesFuente2) continue

        const campo = matchesFuente1 ? 'judoka1_id' : 'judoka2_id'
        const rondaDB = est.rondas + rc.rondaRepesca

        const { data: repescaCombate } = await supabase
          .from('combates')
          .select('id, estado')
          .eq('llave_id', llave_id)
          .eq('fase', 'repesca')
          .eq('ronda', rondaDB)
          .eq('posicion', rc.posicion)
          .maybeSingle()

        if (repescaCombate && repescaCombate.estado !== 'finalizado') {
          await supabase
            .from('combates')
            .update({ [campo]: loserId })
            .eq('id', repescaCombate.id)
        }
        break
      }

    } else if (fase === 'repesca' && est.repesca) {
      // 3. Avanzar ganador al siguiente combate de repesca
      const rondaRepescaActual = ronda - est.rondas

      for (const rc of est.repesca.combates) {
        const matchesFuente1 =
          rc.fuente1.tipo === 'ganador_repesca' &&
          rc.fuente1.rondaRepesca === rondaRepescaActual &&
          rc.fuente1.posicion === posicion
        const matchesFuente2 =
          rc.fuente2.tipo === 'ganador_repesca' &&
          rc.fuente2.rondaRepesca === rondaRepescaActual &&
          rc.fuente2.posicion === posicion

        if (!matchesFuente1 && !matchesFuente2) continue

        const campo = matchesFuente1 ? 'judoka1_id' : 'judoka2_id'
        const rondaDB = est.rondas + rc.rondaRepesca

        const { data: nextRepescaCombate } = await supabase
          .from('combates')
          .select('id, estado')
          .eq('llave_id', llave_id)
          .eq('fase', 'repesca')
          .eq('ronda', rondaDB)
          .eq('posicion', rc.posicion)
          .maybeSingle()

        if (nextRepescaCombate && nextRepescaCombate.estado !== 'finalizado') {
          await supabase
            .from('combates')
            .update({ [campo]: ganador_id })
            .eq('id', nextRepescaCombate.id)
        }
        break
      }
    }
  }

  async actualizarMarcadorParcial(combateId: string, marcador: {
    judoka1Ippones: number; judoka1Wazaris: number; judoka1Shidos: number
    judoka2Ippones: number; judoka2Wazaris: number; judoka2Shidos: number
  }): Promise<void> {
    const { error } = await supabase
      .from('combates')
      .update({
        judoka1_ippones: marcador.judoka1Ippones,
        judoka1_wazaris: marcador.judoka1Wazaris,
        judoka1_shidos:  marcador.judoka1Shidos,
        judoka2_ippones: marcador.judoka2Ippones,
        judoka2_wazaris: marcador.judoka2Wazaris,
        judoka2_shidos:  marcador.judoka2Shidos,
      })
      .eq('id', combateId)
    if (error) throw new Error(`No se pudo actualizar el marcador: ${error.message}`)
  }

  async actualizarEstadoCombate(combateId: string, estado: EstadoCombate): Promise<Combate> {
    const { data, error } = await supabase
      .from('combates')
      .update({ estado })
      .eq('id', combateId)
      .select(SELECT_COMBATE)
      .single()

    if (error || !data) throw new Error('No se pudo actualizar el estado del combate')
    return CombateMapper.toDomain(data as CombateDTO)
  }

  async listarCombatesPorTorneoYTatami(torneoId: string, tatami: number): Promise<Combate[]> {
    const { data, error } = await supabase
      .from('combates')
      .select(`
        ${SELECT_COMBATE},
        llaves!inner(
          torneo_categoria!inner(torneo_id)
        )
      `)
      .eq('tatami', tatami)
      .eq('llaves.torneo_categoria.torneo_id', torneoId)
      .order('ronda')
      .order('posicion')

    if (error) throw new Error('No se pudieron cargar los combates del tatami')
    return (data as CombateDTO[]).map(CombateMapper.toDomain)
  }

  async actualizarTatamiCombate(combateId: string, tatami: number): Promise<Combate> {
    const { data, error } = await supabase
      .from('combates')
      .update({ tatami })
      .eq('id', combateId)
      .select(SELECT_COMBATE)
      .single()

    if (error || !data) throw new Error('No se pudo actualizar el tatami del combate')
    return CombateMapper.toDomain(data as CombateDTO)
  }
}
