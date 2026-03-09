import { JudokaDTO } from '../dtos/JudokaDTO'
import { Judoka } from '../../domain/models/Judoka'
import { UsuarioMapper } from './UsuarioMapper'

export class JudokaMapper {
  static toDomain(dto: JudokaDTO): Judoka {
    return {
      id: dto.id,
      usuarioId: dto.usuario_id,
      clubId: dto.club_id,
      entrenadorId: dto.entrenador_id,
      peso: dto.peso_competitivo,
      cinturon: dto.cinturon_actual as Judoka['cinturon'],
      tipoSangre: dto.tipo_sangre as Judoka['tipoSangre'],
      contactoEmergencia: dto.contacto_emergencia,
      relacionContacto: dto.relacion_contacto as Judoka['relacionContacto'],
      
      usuario: UsuarioMapper.toDomain(dto.usuario),
    }
  }
}