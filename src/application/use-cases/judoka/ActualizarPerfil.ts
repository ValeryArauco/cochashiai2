import { IJudokaRepository } from '../../../domain/repositories/IJudokaRepository'
import { Judoka } from '../../../domain/models/Judoka'

export class ActualizarPerfil {
  constructor(private readonly judokaRepo: IJudokaRepository) {}

  async execute(id: string, datos: Partial<Judoka>): Promise<Judoka> {
    if (!id) {
      throw new Error('El id del judoka es requerido')
    }
    return await this.judokaRepo.actualizar(id, datos)
  }
}
