export type TipoBracket = 'single_elimination' | 'double_elimination' | 'round_robin'

export interface EstructuraLlave {
  rondas: number
  slots: number
  byes: number
  tipoSeed: string
  numTatamis: number
  participantes: Array<{ judokaId: string; cinturon: string; clubId?: string; pool: string }>
  tieneRepesca: boolean
  repesca?: {
    qfRonda: number
    combatesBronce: Array<{
      bronce: number
      alimentadoPorQF: Array<{ ronda: number; posicion: number }>
    }>
  }
}

export interface Llave {
  id: string
  torneoCategoriaId: string
  estructura: object
  numParticipantes: number
  tipoBracket: TipoBracket
  generadoPor?: string
}
