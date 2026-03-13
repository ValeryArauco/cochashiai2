import { Judoka } from './Judoka'

export type EstadoCombate = 'pendiente' | 'en_curso' | 'finalizado' | 'bye'
export type TipoVictoria = 'ippon' | 'wazari' | 'decision' | 'descalificacion' | 'wo'

export interface Combate {
  id: string
  llaveId: string
  ronda: number
  posicion: number
  judoka1Id?: string
  judoka2Id?: string
  ganadorId?: string
  arbitroId?: string
  judoka1Ippones: number
  judoka1Wazaris: number
  judoka1Shidos: number
  judoka2Ippones: number
  judoka2Wazaris: number
  judoka2Shidos: number
  estado: EstadoCombate
  tipoVictoria?: TipoVictoria
  tatami?: number
  judoka1?: Judoka
  judoka2?: Judoka
}
