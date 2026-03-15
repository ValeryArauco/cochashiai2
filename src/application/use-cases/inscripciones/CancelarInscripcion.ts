import { IInscripcionRepository } from '../../../domain/repositories/IInscripcionRepository'
import { EstadoInscripcion } from '../../../domain/models/Inscripcion'

export class CancelarInscripcion {
  constructor(private readonly inscripcionRepo: IInscripcionRepository) {}

  async execute(inscripcionId: string, estadoActual: EstadoInscripcion): Promise<void> {
    if (!inscripcionId) throw new Error('El ID de la inscripción es requerido')
    if (estadoActual !== 'pendiente_entrenador') {
      throw new Error('Solo puedes cancelar una solicitud que esté pendiente de aprobación por el sensei')
    }
    await this.inscripcionRepo.eliminar(inscripcionId)
  }
}
