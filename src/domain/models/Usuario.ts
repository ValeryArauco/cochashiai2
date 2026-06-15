export type RolUsuario = 'admin' | 'asociacion' | 'sensei' | 'judoka' | 'mesa'

export function esAdminOAsociacion(rol: RolUsuario): boolean {
  return rol === 'admin' || rol === 'asociacion'
}
export type Genero = 'Masculino' | 'Femenino' | 'Prefiero no decir'

export interface Usuario {
  id: string
  correo: string
  rol: RolUsuario
  nombre: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  fechaNacimiento?: string
  celular?: string
  genero?: string
  avatarUrl?: string
  ci?: string
  tatamiAsignado?: number
}