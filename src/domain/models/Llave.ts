export type TipoBracket = 'single_elimination' | 'double_elimination'

export interface Llave {
  id: string
  torneoCategoriaId: string
  estructura: object
  numParticipantes: number
  tipoBracket: TipoBracket
  generadoPor?: string
}
