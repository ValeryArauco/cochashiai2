import { ILlaveRepository } from '../../../domain/repositories/ILlaveRepository'
import { Combate, TipoVictoria } from '../../../domain/models/Combate'

export interface ResultadoCombate {
  ganadorId: string
  tipoVictoria: TipoVictoria
  judoka1Ippones: number
  judoka1Wazaris: number
  judoka1Shidos: number
  judoka2Ippones: number
  judoka2Wazaris: number
  judoka2Shidos: number
}

export class RegistrarResultado {
  constructor(private readonly llaveRepo: ILlaveRepository) {}

  async execute(combate: Combate, resultado: ResultadoCombate): Promise<Combate> {
    if (combate.estado === 'bye') {
      throw new Error('No se puede registrar resultado en un combate BYE')
    }
    if (combate.estado === 'finalizado') {
      throw new Error('El combate ya ha sido finalizado')
    }
    if (!combate.judoka1Id || !combate.judoka2Id) {
      throw new Error('El combate necesita dos participantes para registrar un resultado')
    }
    if (
      resultado.ganadorId !== combate.judoka1Id &&
      resultado.ganadorId !== combate.judoka2Id
    ) {
      throw new Error('El ganador debe ser uno de los dos participantes del combate')
    }

    return this.llaveRepo.actualizarResultadoCombate(combate.id, {
      ...resultado,
      estado: 'finalizado',
    })
  }
}
