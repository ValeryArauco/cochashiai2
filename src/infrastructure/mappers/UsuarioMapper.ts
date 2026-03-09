import { UsuarioDTO } from '../dtos/UsuarioDTO'
import { Usuario, RolUsuario } from '../../domain/models/Usuario'

export class UsuarioMapper {
  static toDomain(dto: UsuarioDTO): Usuario {
    return {
      id: dto.id,
      nombre: dto.nombre,
      apellidoPaterno: dto.apellido_paterno,
      apellidoMaterno: dto.apellido_materno,
      correo: dto.correo,
      fechaNacimiento: dto.fecha_nacimiento,
      celular: dto.numero_celular,
      genero: dto.genero as Usuario['genero'],
      rol: dto.rol as RolUsuario,
      avatarUrl: dto.avatar_url,
      ci: dto.ci,
    }
  }
}