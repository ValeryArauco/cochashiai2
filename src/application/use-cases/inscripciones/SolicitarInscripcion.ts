import { IInscripcionRepository } from '../../../domain/repositories/IInscripcionRepository'
import { Inscripcion } from '../../../domain/models/Inscripcion'
import { Judoka } from '../../../domain/models/Judoka'

const CAMPOS_REQUERIDOS: { campo: keyof Judoka | string; etiqueta: string }[] = [
  { campo: 'usuario.fechaNacimiento', etiqueta: 'Fecha de nacimiento' },
  { campo: 'usuario.genero', etiqueta: 'Género' },
  { campo: 'usuario.celular', etiqueta: 'Celular' },
  { campo: 'tipoSangre', etiqueta: 'Tipo de sangre' },
  { campo: 'contactoEmergencia', etiqueta: 'Contacto de emergencia' },
  { campo: 'relacionContacto', etiqueta: 'Relación con contacto de emergencia' },
]

export class SolicitarInscripcion {
  constructor(private readonly inscripcionRepo: IInscripcionRepository) {}

  async execute(judoka: Judoka, torneoCategoriaId: string, torneoId: string): Promise<Inscripcion> {
    if (!torneoCategoriaId) throw new Error('La categoría es requerida')

    const inscripcionExistente = await this.inscripcionRepo.obtenerPorJudokaYTorneo(judoka.id, torneoId)
    if (inscripcionExistente) throw new Error('Ya tienes una solicitud de inscripción para este torneo')

    const camposFaltantes: string[] = []

    if (!judoka.usuario.fechaNacimiento) camposFaltantes.push('Fecha de nacimiento')
    if (!judoka.usuario.genero) camposFaltantes.push('Género')
    if (!judoka.usuario.celular) camposFaltantes.push('Celular')
    if (!judoka.tipoSangre) camposFaltantes.push('Tipo de sangre')
    if (!judoka.contactoEmergencia) camposFaltantes.push('Contacto de emergencia')
    if (!judoka.relacionContacto) camposFaltantes.push('Relación con contacto de emergencia')

    if (camposFaltantes.length > 0) {
      throw new Error(
        `Para inscribirte debes completar estos datos en tu perfil: ${camposFaltantes.join(', ')}`
      )
    }

    return await this.inscripcionRepo.crear(torneoCategoriaId, judoka.id)
  }
}
