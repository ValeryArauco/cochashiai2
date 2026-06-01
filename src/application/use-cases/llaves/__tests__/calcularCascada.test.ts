import {
  siguienteSlot,
  tatamiDelSlot,
  identificarPerdedor,
  resolverRepesca,
} from '../calcularCascada'
import { EstructuraLlave } from '../../../../domain/models/Llave'


describe('siguienteSlot — posición del ganador en la siguiente ronda', () => {
  test.each([
    [1, 1, 'judoka1Id'],
    [2, 1, 'judoka2Id'],
    [3, 2, 'judoka1Id'],
    [4, 2, 'judoka2Id'],
    [5, 3, 'judoka1Id'],
    [6, 3, 'judoka2Id'],
    [7, 4, 'judoka1Id'],
    [8, 4, 'judoka2Id'],
  ] as const)(
    'posicion=%i → {posicion: %i, campo: %s}',
    (pos, expectedPos, expectedCampo) => {
      const slot = siguienteSlot(pos)
      expect(slot.posicion).toBe(expectedPos)
      expect(slot.campo).toBe(expectedCampo)
    }
  )

  test('posicion impar siempre da campo judoka1Id', () => {
    ;[1, 3, 5, 7, 9, 15].forEach(p => {
      expect(siguienteSlot(p).campo).toBe('judoka1Id')
    })
  })

  test('posicion par siempre da campo judoka2Id', () => {
    ;[2, 4, 6, 8, 10, 16].forEach(p => {
      expect(siguienteSlot(p).campo).toBe('judoka2Id')
    })
  })
})


describe('tatamiDelSlot — asignación de tatami por ciclo modular', () => {
  test('con 1 tatami: todas las posiciones dan tatami 1', () => {
    ;[1, 2, 3, 4, 5].forEach(p => {
      expect(tatamiDelSlot(p, 1)).toBe(1)
    })
  })

  test('con 2 tatamis: posiciones impares→1, pares→2', () => {
    expect(tatamiDelSlot(1, 2)).toBe(1)
    expect(tatamiDelSlot(2, 2)).toBe(2)
    expect(tatamiDelSlot(3, 2)).toBe(1)
    expect(tatamiDelSlot(4, 2)).toBe(2)
  })

  test('con 3 tatamis: ciclo 1-2-3-1-2-3…', () => {
    expect(tatamiDelSlot(1, 3)).toBe(1)
    expect(tatamiDelSlot(2, 3)).toBe(2)
    expect(tatamiDelSlot(3, 3)).toBe(3)
    expect(tatamiDelSlot(4, 3)).toBe(1)
    expect(tatamiDelSlot(5, 3)).toBe(2)
    expect(tatamiDelSlot(6, 3)).toBe(3)
  })

  test('numTatamis=0 se trata como 1 (no divide por cero)', () => {
    expect(tatamiDelSlot(1, 0)).toBe(1)
    expect(tatamiDelSlot(3, 0)).toBe(1)
  })

  test('numTatamis negativo se trata como 1', () => {
    expect(tatamiDelSlot(2, -1)).toBe(1)
  })
})


describe('identificarPerdedor', () => {
  test('ganador es judoka1 → retorna judoka2Id', () => {
    expect(identificarPerdedor('j1', 'j1', 'j2')).toBe('j2')
  })

  test('ganador es judoka2 → retorna judoka1Id', () => {
    expect(identificarPerdedor('j2', 'j1', 'j2')).toBe('j1')
  })

  test('ganadorId no coincide con ningún participante → retorna undefined', () => {
    expect(identificarPerdedor('x', 'j1', 'j2')).toBeUndefined()
  })

  test('judoka2Id undefined → retorna undefined aunque ganador sea judoka1', () => {
    expect(identificarPerdedor('j1', 'j1', undefined)).toBeUndefined()
  })

  test('judoka1Id undefined → retorna undefined aunque ganador sea judoka2', () => {
    expect(identificarPerdedor('j2', undefined, 'j2')).toBeUndefined()
  })

  test('ambos participantes undefined → retorna undefined', () => {
    expect(identificarPerdedor('j1', undefined, undefined)).toBeUndefined()
  })
})


// Estructura S=8: 5 combates de repesca con el nuevo sistema multi-ronda
function mkEst(overrides: Partial<EstructuraLlave> = {}): EstructuraLlave {
  return {
    rondas: 3,
    slots: 8,
    byes: 0,
    tipoSeed: 'cinturon',
    numTatamis: 1,
    participantes: [],
    tieneRepesca: true,
    repesca: {
      combates: [
        // Repesca R1: perdedores de QF (ronda 1)
        { rondaRepesca: 1, posicion: 1, fuente1: { tipo: 'perdedor_principal', ronda: 1, posicion: 1 }, fuente2: { tipo: 'perdedor_principal', ronda: 1, posicion: 2 } },
        { rondaRepesca: 1, posicion: 2, fuente1: { tipo: 'perdedor_principal', ronda: 1, posicion: 3 }, fuente2: { tipo: 'perdedor_principal', ronda: 1, posicion: 4 } },
        // Repesca R2: perdedores de SF (ronda 2) + final mini-bracket QF
        { rondaRepesca: 2, posicion: 1, fuente1: { tipo: 'perdedor_principal', ronda: 2, posicion: 1 }, fuente2: { tipo: 'perdedor_principal', ronda: 2, posicion: 2 } },
        { rondaRepesca: 2, posicion: 2, fuente1: { tipo: 'ganador_repesca', rondaRepesca: 1, posicion: 1 }, fuente2: { tipo: 'ganador_repesca', rondaRepesca: 1, posicion: 2 } },
        // Repesca R3: Final de Bronce
        { rondaRepesca: 3, posicion: 1, fuente1: { tipo: 'ganador_repesca', rondaRepesca: 2, posicion: 1 }, fuente2: { tipo: 'ganador_repesca', rondaRepesca: 2, posicion: 2 } },
      ],
    },
    ...overrides,
  }
}

describe('resolverRepesca — enrutamiento del perdedor a la fase bronce', () => {
  test('sin estructura de repesca → retorna null', () => {
    const est = { ...mkEst(), repesca: undefined, tieneRepesca: false }
    expect(resolverRepesca(1, 1, est)).toBeNull()
  })

  test('ronda que no alimenta ningún combate de repesca → retorna null', () => {
    // Ronda 3 (Final) no alimenta repesca (solo SF y QF lo hacen)
    expect(resolverRepesca(3, 1, mkEst())).toBeNull()
  })

  test('QF posicion 1 (ronda 1) → repesca R1 pos 1, campo judoka1Id', () => {
    const result = resolverRepesca(1, 1, mkEst())
    expect(result).not.toBeNull()
    expect(result!.rondaRepesca).toBe(1)
    expect(result!.posicionBronce).toBe(1)
    expect(result!.campo).toBe('judoka1Id')
  })

  test('QF posicion 2 (ronda 1) → repesca R1 pos 1, campo judoka2Id', () => {
    const result = resolverRepesca(1, 2, mkEst())
    expect(result).not.toBeNull()
    expect(result!.posicionBronce).toBe(1)
    expect(result!.campo).toBe('judoka2Id')
  })

  test('QF posicion 3 (ronda 1) → repesca R1 pos 2, campo judoka1Id', () => {
    const result = resolverRepesca(1, 3, mkEst())
    expect(result).not.toBeNull()
    expect(result!.rondaRepesca).toBe(1)
    expect(result!.posicionBronce).toBe(2)
    expect(result!.campo).toBe('judoka1Id')
  })

  test('QF posicion 4 (ronda 1) → repesca R1 pos 2, campo judoka2Id', () => {
    const result = resolverRepesca(1, 4, mkEst())
    expect(result).not.toBeNull()
    expect(result!.posicionBronce).toBe(2)
    expect(result!.campo).toBe('judoka2Id')
  })

  test('SF posicion 1 (ronda 2) → repesca R2 pos 1, campo judoka1Id', () => {
    const result = resolverRepesca(2, 1, mkEst())
    expect(result).not.toBeNull()
    expect(result!.rondaRepesca).toBe(2)
    expect(result!.posicionBronce).toBe(1)
    expect(result!.campo).toBe('judoka1Id')
  })

  test('SF posicion 2 (ronda 2) → repesca R2 pos 1, campo judoka2Id', () => {
    const result = resolverRepesca(2, 2, mkEst())
    expect(result).not.toBeNull()
    expect(result!.rondaRepesca).toBe(2)
    expect(result!.posicionBronce).toBe(1)
    expect(result!.campo).toBe('judoka2Id')
  })

  test('posicion que no alimenta ningún combate de repesca → retorna null', () => {
    expect(resolverRepesca(1, 99, mkEst())).toBeNull()
  })

  test('bracket S=4: SF losers → 1 combate de bronce', () => {
    const est = mkEst({
      rondas: 2,
      slots: 4,
      repesca: {
        combates: [
          { rondaRepesca: 1, posicion: 1, fuente1: { tipo: 'perdedor_principal', ronda: 1, posicion: 1 }, fuente2: { tipo: 'perdedor_principal', ronda: 1, posicion: 2 } },
        ],
      },
    })
    const r1 = resolverRepesca(1, 1, est)
    const r2 = resolverRepesca(1, 2, est)
    expect(r1!.posicionBronce).toBe(1)
    expect(r1!.campo).toBe('judoka1Id')
    expect(r2!.posicionBronce).toBe(1)
    expect(r2!.campo).toBe('judoka2Id')
  })
})
