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
): { rondaRepesca: number; posicionBronce: number; campo: 'judoka1Id' | 'judoka2Id' } | null {
  if (!est.repesca) return null

  for (const rc of est.repesca.combates) {
    if (
      rc.fuente1.tipo === 'perdedor_principal' &&
      rc.fuente1.ronda === ronda &&
      rc.fuente1.posicion === posicion
    ) {
      return { rondaRepesca: rc.rondaRepesca, posicionBronce: rc.posicion, campo: 'judoka1Id' }
    }
    if (
      rc.fuente2.tipo === 'perdedor_principal' &&
      rc.fuente2.ronda === ronda &&
      rc.fuente2.posicion === posicion
    ) {
      return { rondaRepesca: rc.rondaRepesca, posicionBronce: rc.posicion, campo: 'judoka2Id' }
    }
  }
  return null
}
