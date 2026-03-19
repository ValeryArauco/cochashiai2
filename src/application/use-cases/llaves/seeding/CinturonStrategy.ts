import { Cinturon } from '../../../../domain/models/Judoka'
import { Inscripcion } from '../../../../domain/models/Inscripcion'
import { ISeedingStrategy } from './ISeedingStrategy'

/** Jerarquía de cinturones: 1 = más alto, 7 = más bajo */
export const JERARQUIA_CINTURON: Partial<Record<Cinturon, number>> = {
  'Negro':    1,
  'Café':     2,
  'Azul':     3,
  'Verde':    4,
  'Naranja':  5,
  'Amarillo': 6,
  'Blanco':   7,
}

/**
 * Clasifica a los judokas por cinturón (Negro > Café > … > Blanco).
 * Judokas sin cinturón registrado quedan al final.
 *
 * Para cambiar al criterio de ranking histórico en el futuro:
 * implementar ISeedingStrategy con nombre = 'ranking'.
 */
export class CinturonStrategy implements ISeedingStrategy {
  readonly nombre = 'cinturon' as const

  ordenar(inscripciones: Inscripcion[]): Inscripcion[] {
    return [...inscripciones].sort((a, b) => {
      const ra = JERARQUIA_CINTURON[a.judoka?.cinturon as Cinturon] ?? 99
      const rb = JERARQUIA_CINTURON[b.judoka?.cinturon as Cinturon] ?? 99
      return ra - rb
    })
  }
}
