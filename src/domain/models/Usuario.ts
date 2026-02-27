export type RolUsuario = 'admin' | 'sensei' | 'judoka'
export type Genero = 'Masculino' | 'Femenino'

export interface Usuario {
  id: string
  correo: string
  rol: RolUsuario
  nombre: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  fechaNacimiento?: string
  numeroCelular?: string
  genero?: string
  avatarUrl?: string
  ci?: string
}