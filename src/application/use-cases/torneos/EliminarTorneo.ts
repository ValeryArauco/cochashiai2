import { ITorneoRepository } from '../../../domain/repositories/ITorneoRepository'

export class EliminarTorneo {
  constructor(private readonly torneoRepo: ITorneoRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) throw new Error('El ID del torneo es requerido')
    await this.torneoRepo.eliminar(id)
  }
}
