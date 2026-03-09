import { UsuarioDTO } from './UsuarioDTO'

export interface JudokaDTO {
  id: string
  usuario_id: string
  club_id?: string
  entrenador_id?: string
  peso_competitivo?: number
  cinturon_actual?: string
  tipo_sangre?: string
  contacto_emergencia?: string
  relacion_contacto?: string

  usuario: UsuarioDTO
}