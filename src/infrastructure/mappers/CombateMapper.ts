import { Combate, EstadoCombate, TipoVictoria } from '../../domain/models/Combate'
import { Judoka } from '../../domain/models/Judoka'
import { UsuarioMapper } from './UsuarioMapper'
import { CombateDTO } from '../dtos/CombateDTO'

export class CombateMapper {
  static toDomain(dto: CombateDTO): Combate {
    const mapJudoka = (j: CombateDTO['judoka1']): Judoka | undefined => {
      if (!j) return undefined
      return {
        id: j.id,
        usuarioId: j.usuario.id,
        usuario: UsuarioMapper.toDomain(j.usuario as Parameters<typeof UsuarioMapper.toDomain>[0]),
      }
    }

    return {
      id: dto.id,
      llaveId: dto.llave_id,
      ronda: dto.ronda,
      posicion: dto.posicion,
      judoka1Id: dto.judoka1_id,
      judoka2Id: dto.judoka2_id,
      ganadorId: dto.ganador_id,
      arbitroId: dto.arbitro_id,
      judoka1Ippones: dto.judoka1_ippones,
      judoka1Wazaris: dto.judoka1_wazaris,
      judoka1Shidos: dto.judoka1_shidos,
      judoka2Ippones: dto.judoka2_ippones,
      judoka2Wazaris: dto.judoka2_wazaris,
      judoka2Shidos: dto.judoka2_shidos,
      estado: dto.estado as EstadoCombate,
      tipoVictoria: dto.tipo_victoria as TipoVictoria | undefined,
      tatami: dto.tatami,
      judoka1: mapJudoka(dto.judoka1),
      judoka2: mapJudoka(dto.judoka2),
    }
  }
}
