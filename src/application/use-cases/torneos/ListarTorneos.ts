import { ITorneoRepository, FiltrosTorneos } from '../../../domain/repositories/ITorneoRepository'
import { Torneo } from '../../../domain/models/Torneo'

export class ListarTorneos {
  constructor(private readonly torneoRepo: ITorneoRepository) {}

  async execute(filtros?: FiltrosTorneos): Promise<Torneo[]> {
    return await this.torneoRepo.listar(filtros)
  }
}
