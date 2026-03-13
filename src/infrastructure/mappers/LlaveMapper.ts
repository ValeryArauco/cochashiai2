import { Llave, TipoBracket } from '../../domain/models/Llave'
import { LlaveDTO } from '../dtos/LlaveDTO'

export class LlaveMapper {
  static toDomain(dto: LlaveDTO): Llave {
    return {
      id: dto.id,
      torneoCategoriaId: dto.torneo_categoria_id,
      estructura: dto.estructura,
      numParticipantes: dto.num_participantes,
      tipoBracket: dto.tipo_bracket as TipoBracket,
      generadoPor: dto.generado_por,
    }
  }
}
