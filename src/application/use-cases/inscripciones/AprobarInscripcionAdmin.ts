import { IInscripcionRepository } from '../../../domain/repositories/IInscripcionRepository'

export class AprobarInscripcionAdmin {
  constructor(private readonly inscripcionRepo: IInscripcionRepository) {}

  async execute(inscripcionId: string, pesoOficial: number): Promise<void> {
    if (!inscripcionId) throw new Error('El id de la inscripción es requerido')
    if (!pesoOficial || pesoOficial <= 0) throw new Error('El peso oficial debe ser mayor a 0')
    await this.inscripcionRepo.aprobarAdmin(inscripcionId, pesoOficial)
  }
}
