export type TipoBracket = 'single_elimination' | 'double_elimination' | 'round_robin'

export type RepescaFuente =
  | { tipo: 'perdedor_principal'; ronda: number; posicion: number }
  | { tipo: 'ganador_repesca'; rondaRepesca: number; posicion: number }

export interface RepescaCombateEstructura {
  rondaRepesca: number
  posicion: number
  fuente1: RepescaFuente
  fuente2: RepescaFuente
}

export interface EstructuraLlave {
  rondas: number
  slots: number
  byes: number
  tipoSeed: string
  numTatamis: number
  participantes: Array<{ judokaId: string; cinturon: string; clubId?: string; pool: string }>
  tieneRepesca: boolean
  repesca?: {
    combates: RepescaCombateEstructura[]
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
