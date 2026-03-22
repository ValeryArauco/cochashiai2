import { GenerarLlaves, nextPow2 } from '../GenerarLlaves'
import { ILlaveRepository } from '../../../../domain/repositories/ILlaveRepository'
import { IInscripcionRepository } from '../../../../domain/repositories/IInscripcionRepository'
import { Combate, EstadoCombate } from '../../../../domain/models/Combate'
import { Inscripcion } from '../../../../domain/models/Inscripcion'
import { Cinturon } from '../../../../domain/models/Judoka'
import { EstructuraLlave } from '../../../../domain/models/Llave'


function mkInscripcion(judokaId: string, cinturon: Cinturon, clubId: string): Inscripcion {
  return {
    id: `ins-${judokaId}`,
    torneoCategoriaId: 'tc-1',
    judokaId,
    pagado: true,
    estado: 'confirmado',
    judoka: {
      id: judokaId,
      usuarioId: `u-${judokaId}`,
      cinturon,
      clubId,
      usuario: { id: `u-${judokaId}`, nombre: 'Test', apellidoPaterno: judokaId, rol: 'judoka' } as any,
    },
  }
}

type CapturedCrear = { combates: Omit<Combate, 'id'>[]; estructura: EstructuraLlave }

function mkRepos(inscripciones: Inscripcion[]): {
  llaveRepo: jest.Mocked<ILlaveRepository>
  inscripcionRepo: jest.Mocked<IInscripcionRepository>
  capturado: CapturedCrear
} {
  const capturado: CapturedCrear = { combates: [], estructura: {} as EstructuraLlave }

  const llaveRepo = {
    crear: jest.fn(async (_tcId, combates, _tipo, _N, estructura, _generadoPor) => {
      capturado.combates = combates as Omit<Combate, 'id'>[]
      capturado.estructura = estructura as EstructuraLlave
      return {
        id: 'llave-1',
        torneoCategoriaId: 'tc-1',
        estructura,
        numParticipantes: combates.length,
        tipoBracket: 'single_elimination' as const,
      }
    }),
    obtenerPorTorneoCategoria: jest.fn().mockResolvedValue(null),
    listarCombatesPorLlave: jest.fn().mockResolvedValue([]),
    actualizarResultadoCombate: jest.fn().mockResolvedValue({} as Combate),
    actualizarEstadoCombate: jest.fn().mockResolvedValue({} as Combate),
    actualizarTatamiCombate: jest.fn().mockResolvedValue({} as Combate),
    listarCombatesPorTorneoYTatami: jest.fn().mockResolvedValue([]),
  } as unknown as jest.Mocked<ILlaveRepository>

  const inscripcionRepo = {
    crear: jest.fn(),
    listarPorTorneo: jest.fn().mockResolvedValue(inscripciones),
    obtenerPorJudokaYTorneo: jest.fn().mockResolvedValue(null),
    aprobarEntrenador: jest.fn(),
    registrarPeso: jest.fn(),
    marcarPagado: jest.fn(),
    desmarcarPagado: jest.fn(),
    cambiarCategoria: jest.fn(),
    eliminar: jest.fn(),
  } as jest.Mocked<IInscripcionRepository>

  return { llaveRepo, inscripcionRepo, capturado }
}

async function ejecutar(
  inscripciones: Inscripcion[],
  numTatamis = 1
): Promise<CapturedCrear> {
  const { llaveRepo, inscripcionRepo, capturado } = mkRepos(inscripciones)
  const uc = new GenerarLlaves(llaveRepo, inscripcionRepo)
  await uc.execute('torneo-1', 'tc-1', 'single_elimination', numTatamis, 'admin-1')
  return capturado
}


describe('N=4 — Cadete Femenino -52kg (caso mínimo)', () => {
  const inscripciones = [
    mkInscripcion('j1', 'Negro', 'IMBA'),
    mkInscripcion('j2', 'Café',  'Kazan'),
    mkInscripcion('j3', 'Azul',  'IMBA'),
    mkInscripcion('j4', 'Verde', 'Bolívar'),
  ]

  test('genera 4 combates en total', async () => {
    const { combates } = await ejecutar(inscripciones)
    expect(combates).toHaveLength(4)
  })

  test('estructura: S=4, rondas=2, byes=0, 1 bronce', async () => {
    const { estructura } = await ejecutar(inscripciones)
    expect(estructura.slots).toBe(4)
    expect(estructura.rondas).toBe(2)
    expect(estructura.byes).toBe(0)
    expect(estructura.tieneRepesca).toBe(true)
    expect(estructura.repesca?.qfRonda).toBe(1)
    expect(estructura.repesca?.combatesBronce).toHaveLength(1)
  })

  test('R1 tiene 2 combates sin byes', async () => {
    const { combates } = await ejecutar(inscripciones)
    const r1 = combates.filter(c => c.ronda === 1 && c.fase === 'principal')
    expect(r1).toHaveLength(2)
    expect(r1.every(c => c.estado !== 'bye')).toBe(true)
  })

  test('seed 1 (Negro) queda en R1 pos 1 como judoka1', async () => {
    const { combates } = await ejecutar(inscripciones)
    const r1 = combates.filter(c => c.ronda === 1 && c.fase === 'principal')
      .sort((a, b) => a.posicion - b.posicion)
    expect(r1[0].judoka1Id).toBe('j1')
  })

  test('la Final es R2 pos 1 sin judokas (placeholder)', async () => {
    const { combates } = await ejecutar(inscripciones)
    const final = combates.find(c => c.ronda === 2 && c.fase === 'principal')
    expect(final).toBeDefined()
    expect(final?.judoka1Id).toBeUndefined()
    expect(final?.judoka2Id).toBeUndefined()
    expect(final?.estado).toBe('pendiente')
  })

  test('hay 1 combate de bronce (repesca)', async () => {
    const { combates } = await ejecutar(inscripciones)
    const bronces = combates.filter(c => c.fase === 'repesca')
    expect(bronces).toHaveLength(1)
  })
})


describe('N=8 — Senior Masculino -66kg (cuadro perfecto)', () => {
  const inscripciones = [
    mkInscripcion('j1', 'Negro',  'IMBA'),
    mkInscripcion('j2', 'Negro',  'Kazan'),
    mkInscripcion('j3', 'Café',   'Bolívar'),
    mkInscripcion('j4', 'Café',   'JudoC'),
    mkInscripcion('j5', 'Azul',   'IMBA'),
    mkInscripcion('j6', 'Azul',   'Kazan'),
    mkInscripcion('j7', 'Verde',  'Bolívar'),
    mkInscripcion('j8', 'Verde',  'JudoC'),
  ]

  test('genera 9 combates en total', async () => {
    const { combates } = await ejecutar(inscripciones, 2)
    expect(combates).toHaveLength(9)
  })

  test('estructura: S=8, rondas=3, 0 byes, 2 bronces, qfRonda=1', async () => {
    const { estructura } = await ejecutar(inscripciones, 2)
    expect(estructura.slots).toBe(8)
    expect(estructura.rondas).toBe(3)
    expect(estructura.byes).toBe(0)
    expect(estructura.repesca?.qfRonda).toBe(1)
    expect(estructura.repesca?.combatesBronce).toHaveLength(2)
  })

  test('ningún combate R1 es bye', async () => {
    const { combates } = await ejecutar(inscripciones, 2)
    const r1 = combates.filter(c => c.ronda === 1 && c.fase === 'principal')
    expect(r1).toHaveLength(4)
    expect(r1.every(c => c.estado !== 'bye')).toBe(true)
  })

  test('seeds 1 y 2 (los 2 Negros) están en halveas opuestas (pos 1 vs pos 3)', async () => {
    const { combates } = await ejecutar(inscripciones, 2)
    const r1 = combates.filter(c => c.ronda === 1 && c.fase === 'principal')
      .sort((a, b) => a.posicion - b.posicion)
      
    const seed1Pos = r1.find(c => c.judoka1Id === 'j1' || c.judoka2Id === 'j1')?.posicion
    
    const seed2Pos = r1.find(c => c.judoka1Id === 'j2' || c.judoka2Id === 'j2')?.posicion
    expect(seed1Pos).toBe(1)
    expect(seed2Pos).toBe(3)
    
    expect(seed1Pos).not.toBe(seed2Pos)
    const izquierda = [1, 2]
    const derecha = [3, 4]
    expect(izquierda.includes(seed1Pos!)).toBe(true)
    expect(derecha.includes(seed2Pos!)).toBe(true)
  })

  test('tatamis distribuidos en R1 con 2 tatamis', async () => {
    const { combates } = await ejecutar(inscripciones, 2)
    const r1 = combates.filter(c => c.ronda === 1 && c.fase === 'principal')
    expect(r1.every(c => c.tatami !== undefined && c.tatami! > 0)).toBe(true)
    const tatamisUsados = new Set(r1.map(c => c.tatami))
    expect(tatamisUsados.size).toBe(2)
    expect([...tatamisUsados].every(t => t! >= 1 && t! <= 2)).toBe(true)
  })

  test('hay 2 combates de bronce (repesca)', async () => {
    const { combates } = await ejecutar(inscripciones, 2)
    expect(combates.filter(c => c.fase === 'repesca')).toHaveLength(2)
  })

  test('cada judoka aparece en un solo combate de R1', async () => {
    const { combates } = await ejecutar(inscripciones, 2)
    const r1 = combates.filter(c => c.ronda === 1 && c.fase === 'principal')
    const todos = [...r1.map(c => c.judoka1Id), ...r1.map(c => c.judoka2Id)].filter(Boolean)
    expect(new Set(todos).size).toBe(8) 
    expect(todos).toHaveLength(8)
  })
})


describe('N=13 — Senior Masculino -73kg (con byes)', () => {
  
  const inscripciones = [
    mkInscripcion('j1',  'Negro',   'IMBA'),
    mkInscripcion('j2',  'Negro',   'Kazan'),
    mkInscripcion('j3',  'Café',    'Bolívar'),
    mkInscripcion('j4',  'Café',    'JudoC'),
    mkInscripcion('j5',  'Azul',    'IMBA'),
    mkInscripcion('j6',  'Azul',    'Kazan'),
    mkInscripcion('j7',  'Verde',   'Bolívar'),
    mkInscripcion('j8',  'Verde',   'JudoC'),
    mkInscripcion('j9',  'Verde',   'IMBA'),
    mkInscripcion('j10', 'Naranja', 'Kazan'),
    mkInscripcion('j11', 'Naranja', 'Bolívar'),
    mkInscripcion('j12', 'Naranja', 'IMBA'),
    mkInscripcion('j13', 'Amarillo','JudoC'),
  ]

  test('genera 17 combates en total', async () => {
    const { combates } = await ejecutar(inscripciones, 3)
    expect(combates).toHaveLength(17)
  })

  test('estructura: S=16, rondas=4, byes=3, qfRonda=2', async () => {
    const { estructura } = await ejecutar(inscripciones, 3)
    expect(estructura.slots).toBe(16)
    expect(estructura.rondas).toBe(4)
    expect(estructura.byes).toBe(3)
    expect(estructura.tieneRepesca).toBe(true)
    expect(estructura.repesca?.qfRonda).toBe(2)
    expect(estructura.repesca?.combatesBronce).toHaveLength(2)
  })

  test('exactamente 3 combates en estado bye', async () => {
    const { combates } = await ejecutar(inscripciones, 3)
    const byes = combates.filter(c => c.estado === 'bye')
    expect(byes).toHaveLength(3)
  })

  test('todos los byes tienen ganador asignado (el seed avanza automáticamente)', async () => {
    const { combates } = await ejecutar(inscripciones, 3)
    const byes = combates.filter(c => c.estado === 'bye')
    expect(byes.every(b => b.ganadorId !== undefined && b.ganadorId !== null)).toBe(true)
  })

  test('los byes los reciben los top seeds (Negro y Café)', async () => {
    const { combates } = await ejecutar(inscripciones, 3)
    const byes = combates.filter(c => c.estado === 'bye')
    const byeGanadores = byes.map(b => b.ganadorId)
    const topSeeds = ['j1', 'j2', 'j3', 'j4'] 
    expect(byeGanadores.every(id => topSeeds.includes(id!))).toBe(true)
  })

  test('R1 tiene 8 combates (5 normales + 3 byes)', async () => {
    const { combates } = await ejecutar(inscripciones, 3)
    const r1 = combates.filter(c => c.ronda === 1 && c.fase === 'principal')
    expect(r1).toHaveLength(8)
    expect(r1.filter(c => c.estado === 'bye')).toHaveLength(3)
    expect(r1.filter(c => c.estado === 'pendiente')).toHaveLength(5)
  })

  test('hay 2 combates de bronce (repesca)', async () => {
    const { combates } = await ejecutar(inscripciones, 3)
    expect(combates.filter(c => c.fase === 'repesca')).toHaveLength(2)
  })

  test('tatamis asignados solo en combates pendientes de R1 (no en byes)', async () => {
    const { combates } = await ejecutar(inscripciones, 3)
    const r1Pendientes = combates.filter(c => c.ronda === 1 && c.estado === 'pendiente')
    const r1Byes = combates.filter(c => c.ronda === 1 && c.estado === 'bye')
    expect(r1Pendientes.every(c => c.tatami !== undefined)).toBe(true)
    expect(r1Byes.every(c => c.tatami === undefined || c.tatami === null)).toBe(true)
  })

  test('atletas del club IMBA no se enfrentan entre sí en R1', async () => {
    const { combates } = await ejecutar(inscripciones, 3)
    const r1 = combates.filter(c => c.ronda === 1 && c.estado === 'pendiente')
    const imbaJudokas = ['j1', 'j5', 'j9', 'j12']
    for (const c of r1) {
      const j1EsImba = imbaJudokas.includes(c.judoka1Id ?? '')
      const j2EsImba = imbaJudokas.includes(c.judoka2Id ?? '')
      
      expect(j1EsImba && j2EsImba).toBe(false)
    }
  })
})


describe('Validaciones de entrada', () => {
  test('lanza error si no hay participantes elegibles', async () => {
    const { llaveRepo, inscripcionRepo } = mkRepos([])
    const uc = new GenerarLlaves(llaveRepo, inscripcionRepo)
    await expect(
      uc.execute('torneo-1', 'tc-1', 'single_elimination', 1, 'admin-1')
    ).rejects.toThrow('Se necesitan al menos 2 participantes')
  })

  test('lanza error con solo 1 participante', async () => {
    const { llaveRepo, inscripcionRepo } = mkRepos([mkInscripcion('j1', 'Negro', 'IMBA')])
    const uc = new GenerarLlaves(llaveRepo, inscripcionRepo)
    await expect(
      uc.execute('torneo-1', 'tc-1', 'single_elimination', 1, 'admin-1')
    ).rejects.toThrow('Se necesitan al menos 2 participantes')
  })

  test('lanza error si torneoCategoriaId está vacío', async () => {
    const { llaveRepo, inscripcionRepo } = mkRepos([])
    const uc = new GenerarLlaves(llaveRepo, inscripcionRepo)
    await expect(
      uc.execute('torneo-1', '', 'single_elimination', 1, 'admin-1')
    ).rejects.toThrow('La categoría es requerida')
  })

  test('filtra participantes no pagados o no confirmados', async () => {
    const elegible = mkInscripcion('j1', 'Negro', 'IMBA')
    const noPagado = { ...mkInscripcion('j2', 'Café', 'Kazan'), pagado: false }
    
    const { llaveRepo, inscripcionRepo } = mkRepos([elegible, noPagado])
    const uc = new GenerarLlaves(llaveRepo, inscripcionRepo)
    
    await expect(
      uc.execute('torneo-1', 'tc-1', 'single_elimination', 1, 'admin-1')
    ).rejects.toThrow('Se necesitan al menos 2 participantes')
  })
})


describe('N=2 — caso mínimo absoluto', () => {
  const inscripciones = [
    mkInscripcion('j1', 'Negro', 'IMBA'),
    mkInscripcion('j2', 'Café',  'Kazan'),
  ]

  test('genera 1 combate: la Final directa, sin bronces', async () => {
    const { combates } = await ejecutar(inscripciones)
    
    expect(combates).toHaveLength(1)
    expect(combates.filter(c => c.fase === 'repesca')).toHaveLength(0)
  })

  test('estructura: S=2, rondas=1, sin repesca', async () => {
    const { estructura } = await ejecutar(inscripciones)
    expect(estructura.slots).toBe(2)
    expect(estructura.rondas).toBe(1)
    expect(estructura.byes).toBe(0)
    expect(estructura.tieneRepesca).toBe(false)
  })
})


describe('Invariantes del algoritmo (cualquier N)', () => {
  const casos: { N: number; inscripciones: Inscripcion[] }[] = [
    {
      N: 4,
      inscripciones: [
        mkInscripcion('a1', 'Negro', 'A'), mkInscripcion('a2', 'Café', 'B'),
        mkInscripcion('a3', 'Azul', 'A'),  mkInscripcion('a4', 'Verde', 'B'),
      ],
    },
    {
      N: 8,
      inscripciones: Array.from({ length: 8 }, (_, i) =>
        mkInscripcion(`b${i+1}`, (['Negro','Negro','Café','Café','Azul','Azul','Verde','Verde'] as Cinturon[])[i], i % 2 === 0 ? 'ClubX' : 'ClubY')
      ),
    },
    {
      N: 13,
      inscripciones: Array.from({ length: 13 }, (_, i) =>
        mkInscripcion(`c${i+1}`, (['Negro','Negro','Café','Café','Azul','Azul','Verde','Verde','Verde','Naranja','Naranja','Naranja','Amarillo'] as Cinturon[])[i], `club${i % 4}`)
      ),
    },
  ]

  test.each(casos)('N=$N: posiciones de R1 son únicas y cubren 1..S/2', async ({ inscripciones }) => {
    const { combates } = await ejecutar(inscripciones)
    const r1 = combates.filter(c => c.ronda === 1 && c.fase === 'principal')
    const posiciones = r1.map(c => c.posicion).sort((a, b) => a - b)
    const S = inscripciones.length <= 2 ? 2 : Math.pow(2, Math.ceil(Math.log2(inscripciones.length)))
    const expected = Array.from({ length: S / 2 }, (_, i) => i + 1)
    expect(posiciones).toEqual(expected)
  })

  test.each(casos)('N=$N: todos los judokas inscritos aparecen exactamente una vez en R1', async ({ inscripciones }) => {
    const { combates } = await ejecutar(inscripciones)
    const r1 = combates.filter(c => c.ronda === 1 && c.fase === 'principal')
    const judokasEnR1 = [
      ...r1.map(c => c.judoka1Id).filter(Boolean),
      ...r1.map(c => c.judoka2Id).filter(Boolean),
    ]
    expect(judokasEnR1).toHaveLength(inscripciones.length)
    const unicidad = new Set(judokasEnR1)
    expect(unicidad.size).toBe(inscripciones.length)
  })
})


describe('nextPow2 — tamaño de cuadro para N participantes', () => {
  test.each([
    [2, 2],
    [3, 4],
    [4, 4],
    [5, 8],
    [8, 8],
    [9, 16],
    [16, 16],
    [17, 32],
  ])('nextPow2(%i) = %i', (n, expected) => {
    expect(nextPow2(n)).toBe(expected)
  })
})


describe('N=5 — byes para los 3 top seeds (S=8)', () => {
  const inscripciones = [
    mkInscripcion('j1', 'Negro',   'ClubA'),
    mkInscripcion('j2', 'Café',    'ClubB'),
    mkInscripcion('j3', 'Azul',    'ClubA'),
    mkInscripcion('j4', 'Verde',   'ClubB'),
    mkInscripcion('j5', 'Naranja', 'ClubA'),
  ]

  test('genera 9 combates en total (mismo que N=8 porque S=8)', async () => {
    const { combates } = await ejecutar(inscripciones)
    expect(combates).toHaveLength(9)
  })

  test('estructura: S=8, rondas=3, byes=3, 2 bronces, qfRonda=1', async () => {
    const { estructura } = await ejecutar(inscripciones)
    expect(estructura.slots).toBe(8)
    expect(estructura.rondas).toBe(3)
    expect(estructura.byes).toBe(3)
    expect(estructura.tieneRepesca).toBe(true)
    expect(estructura.repesca?.qfRonda).toBe(1)
    expect(estructura.repesca?.combatesBronce).toHaveLength(2)
  })

  test('R1 tiene 3 byes y 1 combate real', async () => {
    const { combates } = await ejecutar(inscripciones)
    const r1 = combates.filter(c => c.ronda === 1 && c.fase === 'principal')
    expect(r1).toHaveLength(4)
    expect(r1.filter(c => c.estado === 'bye')).toHaveLength(3)
    expect(r1.filter(c => c.estado === 'pendiente')).toHaveLength(1)
  })

  test('todos los byes tienen ganadorId asignado', async () => {
    const { combates } = await ejecutar(inscripciones)
    const byes = combates.filter(c => c.estado === 'bye')
    expect(byes.every(b => !!b.ganadorId)).toBe(true)
  })

  test('los byes los reciben los 3 top seeds (Negro, Café, Azul)', async () => {
    const { combates } = await ejecutar(inscripciones)
    const byeGanadores = combates
      .filter(c => c.estado === 'bye')
      .map(c => c.ganadorId)
    expect(byeGanadores.every(id => ['j1', 'j2', 'j3'].includes(id!))).toBe(true)
  })

  test('solo el combate real de R1 tiene tatami asignado', async () => {
    const { combates } = await ejecutar(inscripciones)
    const r1Real = combates.filter(c => c.ronda === 1 && c.estado === 'pendiente')
    const r1Byes = combates.filter(c => c.ronda === 1 && c.estado === 'bye')
    expect(r1Real.every(c => !!c.tatami)).toBe(true)
    expect(r1Byes.every(c => !c.tatami)).toBe(true)
  })
})
