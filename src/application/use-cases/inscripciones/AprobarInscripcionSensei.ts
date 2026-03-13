import { IInscripcionRepository } from '../../../domain/repositories/IInscripcionRepository'

export class AprobarInscripcionSensei {
  constructor(private readonly inscripcionRepo: IInscripcionRepository) {}

  async execute(inscripcionId: string, usuarioId: string): Promise<void> {
    if (!inscripcionId) throw new Error('El id de la inscripción es requerido')
    if (!usuarioId) throw new Error('El id del usuario es requerido')
    await this.inscripcionRepo.aprobarSensei(inscripcionId, usuarioId)
  }
}
