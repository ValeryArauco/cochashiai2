import { IInscripcionRepository } from '../../../domain/repositories/IInscripcionRepository'

export class RechazarInscripcion {
  constructor(private readonly inscripcionRepo: IInscripcionRepository) {}

  async execute(inscripcionId: string): Promise<void> {
    if (!inscripcionId) throw new Error('El id de la inscripción es requerido')
    await this.inscripcionRepo.eliminar(inscripcionId)
  }
}
