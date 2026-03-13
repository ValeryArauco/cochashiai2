import { Club } from '../../domain/models/Club'
import { ClubDTO } from '../dtos/ClubDTO'

export class ClubMapper {
  static toDomain(dto: ClubDTO): Club {
    return {
      id: dto.id,
      nombreClub: dto.nombre_club,
      provincia: dto.provincia,
      direccion: dto.direccion,
      activo: dto.activo,
    }
  }
}
