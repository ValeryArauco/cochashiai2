import { ITorneoRepository } from '../../../domain/repositories/ITorneoRepository'
import { Torneo } from '../../../domain/models/Torneo'

export class ObtenerTorneo {
  constructor(private readonly torneoRepo: ITorneoRepository) {}

  async execute(id: string): Promise<Torneo> {
    if (!id) throw new Error('El id del torneo es requerido')
    return await this.torneoRepo.obtenerPorId(id)
  }
}
