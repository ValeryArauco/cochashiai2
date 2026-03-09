export interface UsuarioDTO {
  id: string
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  correo: string
  fecha_nacimiento?: string
  numero_celular?: string
  genero?: string
  rol: string
  avatar_url?: string
  ci?: string
}