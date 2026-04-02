import {
  calcularWinRate,
  calcularDistribucionVictorias,
  calcularEvolucionPorTorneo,
  agruparInscriptosPorCategoria,
  calcularMaxRondaPorLlave,
  asignarMedallas,
  type CombateConTorneo,
  type CombateMedallero,
  type DatoCategoria,
} from '../calcularAnalytics'

describe('calcularWinRate', () => {
  test('3 victorias de 5 → 60', () => {
    expect(calcularWinRate(3, 5)).toBe(60)
  })

  test('5 victorias de 5 → 100', () => {
    expect(calcularWinRate(5, 5)).toBe(100)
  })

  test('0 victorias de 5 → 0', () => {
    expect(calcularWinRate(0, 5)).toBe(0)
  })

  test('0 combates → 0 (sin división por cero)', () => {
    expect(calcularWinRate(0, 0)).toBe(0)
  })

  test('2/3 → redondea a 67', () => {
    expect(calcularWinRate(2, 3)).toBe(67)
  })

  test('1/3 → redondea a 33', () => {
    expect(calcularWinRate(1, 3)).toBe(33)
  })
})

describe('calcularDistribucionVictorias', () => {
  test('array vacío → []', () => {
    expect(calcularDistribucionVictorias([])).toEqual([])
  })

  test('3 ippones → [{tipoVictoria:"ippon", cantidad:3, porcentaje:100}]', () => {
    const result = calcularDistribucionVictorias(['ippon', 'ippon', 'ippon'])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ tipoVictoria: 'ippon', cantidad: 3, porcentaje: 100 })
  })

  test('tipo null se trata como "decision"', () => {
    const result = calcularDistribucionVictorias([null])
    expect(result[0].tipoVictoria).toBe('decision')
  })

  test('mezcla 2 ippones + 1 decision → porcentajes correctos', () => {
    const result = calcularDistribucionVictorias(['ippon', 'ippon', 'decision'])
    const ippon = result.find(r => r.tipoVictoria === 'ippon')!
    const decision = result.find(r => r.tipoVictoria === 'decision')!
    expect(ippon.cantidad).toBe(2)
    expect(ippon.porcentaje).toBe(67)
    expect(decision.cantidad).toBe(1)
    expect(decision.porcentaje).toBe(33)
  })

  test('4 ippones + 1 wazari → 80% y 20%', () => {
    const result = calcularDistribucionVictorias(['ippon', 'ippon', 'ippon', 'ippon', 'wazari'])
    const ippon = result.find(r => r.tipoVictoria === 'ippon')!
    const wazari = result.find(r => r.tipoVictoria === 'wazari')!
    expect(ippon.porcentaje).toBe(80)
    expect(wazari.porcentaje).toBe(20)
  })
})

function mkCombateTorneo(
  ganadorId: string | null,
  torneoNombre: string | null,
  torneoFecha: string | null,
): CombateConTorneo {
  return { ganadorId, torneoNombre, torneoFecha }
}

describe('calcularEvolucionPorTorneo', () => {
  test('sin combates → []', () => {
    expect(calcularEvolucionPorTorneo([], 'j1')).toEqual([])
  })

  test('combate con torneoNombre null → ignorado', () => {
    const combates = [mkCombateTorneo('j1', null, '2025-01-01')]
    expect(calcularEvolucionPorTorneo(combates, 'j1')).toEqual([])
  })

  test('combate con torneoFecha null → ignorado', () => {
    const combates = [mkCombateTorneo('j1', 'Open Cbba', null)]
    expect(calcularEvolucionPorTorneo(combates, 'j1')).toEqual([])
  })

  test('3 victorias en un torneo → victorias:3, derrotas:0, winRate:100', () => {
    const combates = [
      mkCombateTorneo('j1', 'Open A', '2025-03-01'),
      mkCombateTorneo('j1', 'Open A', '2025-03-01'),
      mkCombateTorneo('j1', 'Open A', '2025-03-01'),
    ]
    const [t] = calcularEvolucionPorTorneo(combates, 'j1')
    expect(t.victorias).toBe(3)
    expect(t.derrotas).toBe(0)
    expect(t.winRate).toBe(100)
  })

  test('1 victoria + 1 derrota en el mismo torneo → winRate:50', () => {
    const combates = [
      mkCombateTorneo('j1', 'Open A', '2025-03-01'),
      mkCombateTorneo('j2', 'Open A', '2025-03-01'),
    ]
    const [t] = calcularEvolucionPorTorneo(combates, 'j1')
    expect(t.victorias).toBe(1)
    expect(t.derrotas).toBe(1)
    expect(t.winRate).toBe(50)
  })

  test('dos torneos → retorna 2 entradas', () => {
    const combates = [
      mkCombateTorneo('j1', 'Open A', '2025-01-01'),
      mkCombateTorneo('j1', 'Open B', '2025-06-01'),
    ]
    expect(calcularEvolucionPorTorneo(combates, 'j1')).toHaveLength(2)
  })

  test('resultado ordenado por fecha ascendente (torneo antiguo primero)', () => {
    const combates = [
      mkCombateTorneo('j1', 'Open B', '2025-06-01'),
      mkCombateTorneo('j1', 'Open A', '2025-01-01'),
    ]
    const result = calcularEvolucionPorTorneo(combates, 'j1')
    expect(result[0].torneoNombre).toBe('Open A')
    expect(result[1].torneoNombre).toBe('Open B')
  })
})

function mkDatoCat(id: string | null, nombre: string | null, edad = '-15', genero = 'M'): DatoCategoria {
  return { categoriaId: id, categoriaNombre: nombre, edad, genero }
}

describe('agruparInscriptosPorCategoria', () => {
  test('array vacío → []', () => {
    expect(agruparInscriptosPorCategoria([])).toEqual([])
  })

  test('fila con categoriaId null → ignorada', () => {
    expect(agruparInscriptosPorCategoria([mkDatoCat(null, 'Cat A')])).toEqual([])
  })

  test('fila con categoriaNombre null → ignorada', () => {
    expect(agruparInscriptosPorCategoria([mkDatoCat('c1', null)])).toEqual([])
  })

  test('3 inscripciones de la misma categoría → totalInscritos:3', () => {
    const rows = [mkDatoCat('c1', 'Sub-15'), mkDatoCat('c1', 'Sub-15'), mkDatoCat('c1', 'Sub-15')]
    const [cat] = agruparInscriptosPorCategoria(rows)
    expect(cat.totalInscritos).toBe(3)
    expect(cat.categoriaId).toBe('c1')
  })

  test('2 categorías → ordenadas por totalInscritos descendente', () => {
    const rows = [
      mkDatoCat('c1', 'Cat A'),
      mkDatoCat('c2', 'Cat B'),
      mkDatoCat('c2', 'Cat B'),
      mkDatoCat('c1', 'Cat A'),
      mkDatoCat('c1', 'Cat A'),
    ]
    const result = agruparInscriptosPorCategoria(rows)
    expect(result[0].categoriaId).toBe('c1')  
    expect(result[1].categoriaId).toBe('c2')  
  })

  test('preserva nombre, edad y genero de la categoría', () => {
    const rows = [mkDatoCat('c1', 'Cadete', '-15', 'F')]
    const [cat] = agruparInscriptosPorCategoria(rows)
    expect(cat.categoriaNombre).toBe('Cadete')
    expect(cat.edad).toBe('-15')
    expect(cat.genero).toBe('F')
  })
})


function mkCombateMed(
  llaveId: string,
  ronda: number,
  fase: string | null = 'principal',
): CombateMedallero {
  return { llaveId, ronda, fase, judoka1Id: 'j1', judoka2Id: 'j2', ganadorId: 'j1', club1Id: 'clubA', club2Id: 'clubB' }
}

describe('calcularMaxRondaPorLlave', () => {
  test('array vacío → {}', () => {
    expect(calcularMaxRondaPorLlave([])).toEqual({})
  })

  test('un combate → {llaveId: {principal: ronda}}', () => {
    const result = calcularMaxRondaPorLlave([mkCombateMed('l1', 3)])
    expect(result['l1']['principal']).toBe(3)
  })

  test('misma llave, rondas 1 y 3 → maxRonda = 3', () => {
    const result = calcularMaxRondaPorLlave([
      mkCombateMed('l1', 1),
      mkCombateMed('l1', 3),
      mkCombateMed('l1', 2),
    ])
    expect(result['l1']['principal']).toBe(3)
  })

  test('misma llave, fases distintas → entradas independientes', () => {
    const result = calcularMaxRondaPorLlave([
      mkCombateMed('l1', 2, 'principal'),
      mkCombateMed('l1', 3, 'repesca'),
    ])
    expect(result['l1']['principal']).toBe(2)
    expect(result['l1']['repesca']).toBe(3)
  })

  test('dos llaves distintas → dos claves en el resultado', () => {
    const result = calcularMaxRondaPorLlave([
      mkCombateMed('l1', 2),
      mkCombateMed('l2', 3),
    ])
    expect(result['l1']['principal']).toBe(2)
    expect(result['l2']['principal']).toBe(3)
  })
})


function mkFinal(fase: 'principal' | 'repesca', ganadorId: string, llaveId = 'l1'): CombateMedallero {
  return {
    llaveId,
    ronda: 3,
    fase,
    judoka1Id: 'j1',
    judoka2Id: 'j2',
    ganadorId,
    club1Id: 'clubA',
    club2Id: 'clubB',
  }
}

const maxRondasEstandar: Record<string, Record<string, number>> = {
  l1: { principal: 3, repesca: 3 },
}

describe('asignarMedallas', () => {
  test('final principal: ganador (j1) → oro para clubA, perdedor (j2) → plata para clubB', () => {
    const { oros, platas, bronces } = asignarMedallas([mkFinal('principal', 'j1')], maxRondasEstandar)
    expect(oros['clubA']).toBe(1)
    expect(platas['clubB']).toBe(1)
    expect(Object.keys(bronces)).toHaveLength(0)
  })

  test('final principal con ganador j2 → oro para clubB, plata para clubA', () => {
    const { oros, platas } = asignarMedallas([mkFinal('principal', 'j2')], maxRondasEstandar)
    expect(oros['clubB']).toBe(1)
    expect(platas['clubA']).toBe(1)
  })

  test('final repesca: ganador (j1) → bronce para clubA, sin oro ni plata', () => {
    const { oros, platas, bronces } = asignarMedallas([mkFinal('repesca', 'j1')], maxRondasEstandar)
    expect(bronces['clubA']).toBe(1)
    expect(Object.keys(oros)).toHaveLength(0)
    expect(Object.keys(platas)).toHaveLength(0)
  })

  test('combate no-final (ronda < maxRonda) → sin medallas', () => {
    const combate: CombateMedallero = { ...mkFinal('principal', 'j1'), ronda: 1 }
    const { oros, platas, bronces } = asignarMedallas([combate], maxRondasEstandar)
    expect(Object.keys(oros)).toHaveLength(0)
    expect(Object.keys(platas)).toHaveLength(0)
    expect(Object.keys(bronces)).toHaveLength(0)
  })

  test('ganadorId null → combate ignorado', () => {
    const combate: CombateMedallero = { ...mkFinal('principal', 'j1'), ganadorId: null }
    const { oros } = asignarMedallas([combate], maxRondasEstandar)
    expect(Object.keys(oros)).toHaveLength(0)
  })

  test('mismo club gana 2 finales en llaves distintas → oros acumulados = 2', () => {
    const final1: CombateMedallero = { ...mkFinal('principal', 'j1', 'l1') }
    const final2: CombateMedallero = { ...mkFinal('principal', 'j1', 'l2'), llaveId: 'l2' }
    const maxRondas = { l1: { principal: 3 }, l2: { principal: 3 } }
    const { oros } = asignarMedallas([final1, final2], maxRondas)
    expect(oros['clubA']).toBe(2)
  })

  test('club1Id null → no se asigna medalla al ganador sin club', () => {
    const combate: CombateMedallero = { ...mkFinal('principal', 'j1'), club1Id: null }
    const { oros } = asignarMedallas([combate], maxRondasEstandar)
    expect(oros['clubA']).toBeUndefined()
  })
})
