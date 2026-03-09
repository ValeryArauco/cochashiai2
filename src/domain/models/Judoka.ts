import { Usuario } from './Usuario'

export type Cinturon = 'Blanco' | 'Amarillo' | 'Naranja' | 'Verde' | 'Azul' | 'Café' | 'Negro'
export type TipoSangre = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type RelacionContacto = 'padre' | 'madre' | 'tutor' | 'hermano/a' | 'conyuge' | 'amigo/a' | 'otro'

export interface Judoka {
  id: string
  usuarioId: string
  clubId?: string
  entrenadorId?: string
  peso?: number
  cinturon?: Cinturon
  tipoSangre?: TipoSangre
  contactoEmergencia?: string
  relacionContacto?: RelacionContacto

  usuario: Usuario
}