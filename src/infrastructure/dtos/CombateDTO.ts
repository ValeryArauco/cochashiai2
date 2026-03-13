export interface CombateDTO {
  id: string
  llave_id: string
  ronda: number
  posicion: number
  judoka1_id?: string
  judoka2_id?: string
  ganador_id?: string
  arbitro_id?: string
  judoka1_ippones: number
  judoka1_wazaris: number
  judoka1_shidos: number
  judoka2_ippones: number
  judoka2_wazaris: number
  judoka2_shidos: number
  estado: string
  tipo_victoria?: string
  tatami?: number
  judoka1?: {
    id: string
    usuario: { id: string; nombre: string; apellido_paterno?: string; apellido_materno?: string; avatar_url?: string }
  }
  judoka2?: {
    id: string
    usuario: { id: string; nombre: string; apellido_paterno?: string; apellido_materno?: string; avatar_url?: string }
  }
}
