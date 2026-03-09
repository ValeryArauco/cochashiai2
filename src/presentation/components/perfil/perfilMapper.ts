import { Judoka } from '../../../domain/models/Judoka'
import { PerfilData } from './perfilSchema'

export class PerfilMapper {
    static toJudoka(data: PerfilData, judokaActual: Judoka): Partial<Judoka> {
        return {
            usuario: {
                ...judokaActual.usuario,
                fechaNacimiento: data.fechaNacimiento,
                celular: data.celular,
                genero: data.genero,
            },
            contactoEmergencia: data.contactoEmergencia,
            relacionContacto: data.relacionContactoEmergencia,
            tipoSangre: data.tipoSangre,
        }
    }
}
