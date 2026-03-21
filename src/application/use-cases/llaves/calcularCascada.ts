import { EstructuraLlave } from '../../../domain/models/Llave'

export function siguienteSlot(posicion: number): {
  posicion: number
  campo: 'judoka1Id' | 'judoka2Id'
} {
  return {
    posicion: Math.ceil(posicion / 2),
    campo: posicion % 2 === 1 ? 'judoka1Id' : 'judoka2Id',
  }
}

export function tatamiDelSlot(posicion: number, numTatamis: number): number {
  const n = Math.max(1, numTatamis)
  return ((posicion - 1) % n) + 1
}

export function identificarPerdedor(
  ganadorId: string,
  judoka1Id: string | undefined,
  judoka2Id: string | undefined,
): string | undefined {
  if (ganadorId === judoka1Id) return judoka2Id
  if (ganadorId === judoka2Id) return judoka1Id
  return undefined
}

export function resolverRepesca(
  ronda: number,
  posicion: number,
  est: EstructuraLlave,
): { posicionBronce: number; campo: 'judoka1Id' | 'judoka2Id' } | null {
  if (!est.repesca) return null
  if (ronda !== est.repesca.qfRonda) return null

  for (const bronce of est.repesca.combatesBronce) {
    const idx = bronce.alimentadoPorQF.findIndex(
      qf => qf.ronda === ronda && qf.posicion === posicion,
    )
    if (idx === -1) continue
    return {
      posicionBronce: bronce.bronce,
      campo: idx === 0 ? 'judoka1Id' : 'judoka2Id',
    }
  }
  return null
}
