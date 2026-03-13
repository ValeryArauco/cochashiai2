import { Judoka } from './Judoka'
import { TorneoCategoria } from './TorneoCategoria'

export type EstadoInscripcion =
  | 'pendiente_entrenador'
  | 'aprobado_sensei'
  | 'aprobado_admin'
  | 'rechazado'

export interface Inscripcion {
  id: string
  torneoCategoriaId: string
  judokaId: string
  pesoOficial?: number
  aprobadoPorSenseiId?: string
  fechaAprobacionSensei?: string
  estado: EstadoInscripcion
  judoka?: Judoka
  torneoCategoria?: TorneoCategoria
}
