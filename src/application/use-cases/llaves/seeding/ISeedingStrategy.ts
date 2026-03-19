import { Inscripcion } from '../../../../domain/models/Inscripcion'

/**
 * Estrategia de clasificación (seeding) para generar llaves.
 * Implementar esta interfaz para agregar nuevos criterios de seed
 * (por ejemplo, ranking histórico de puntos IJF).
 */
export interface ISeedingStrategy {
  /** Identificador del criterio — se guarda en `estructura.tipoSeed` */
  readonly nombre: string
  /** Devuelve las inscripciones ordenadas de mayor a menor ranking (seed 1 = mejor) */
  ordenar(inscripciones: Inscripcion[]): Inscripcion[]
}
