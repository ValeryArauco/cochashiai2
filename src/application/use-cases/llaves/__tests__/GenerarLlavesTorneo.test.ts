import { GenerarLlavesTorneo, ResultadoCategoria } from '../GenerarLlavesTorneo'
import { ILlaveRepository } from '../../../../domain/repositories/ILlaveRepository'
import { IInscripcionRepository } from '../../../../domain/repositories/IInscripcionRepository'
import { Inscripcion } from '../../../../domain/models/Inscripcion'
import { Combate } from '../../../../domain/models/Combate'
import { Cinturon } from '../../../../domain/models/Judoka'


function mkIns(judokaId: string, cinturon: Cinturon, clubId: string, tcId: string): Inscripcion {
  return {
    id: `ins-${judokaId}`,
    torneoCategoriaId: tcId,
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

function mkRepos(inscripciones: Inscripcion[]): {
  llaveRepo: jest.Mocked<ILlaveRepository>
  inscripcionRepo: jest.Mocked<IInscripcionRepository>
} {
  const llaveRepo = {
    crear: jest.fn().mockResolvedValue({ id: 'llave-1', tipoBracket: 'round_robin' }),
    obtenerPorTorneoCategoria: jest.fn().mockResolvedValue(null),
    listarCombatesPorLlave: jest.fn().mockResolvedValue([]),
    actualizarResultadoCombate: jest.fn().mockResolvedValue({} as Combate),
    actualizarMarcadorParcial: jest.fn().mockResolvedValue(undefined),
    actualizarEstadoCombate: jest.fn().mockResolvedValue({} as Combate),
    actualizarTatamiCombate: jest.fn().mockResolvedValue({} as Combate),
    listarCombatesPorTorneoYTatami: jest.fn().mockResolvedValue([]),
  } as jest.Mocked<ILlaveRepository>

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
    descalificarPorPeso: jest.fn(),
  } as jest.Mocked<IInscripcionRepository>

  return { llaveRepo, inscripcionRepo }
}

const TC_RR  = { id: 'tc-rr',  nombre: 'Infantil -30kg' }
const TC_SE  = { id: 'tc-se',  nombre: 'Senior -66kg' }
const TC_CAT1 = { id: 'tc-c1', nombre: 'Cadete A' }
const TC_CAT2 = { id: 'tc-c2', nombre: 'Cadete B' }


describe('Round Robin — N ≤ 5', () => {
  test('N=3: genera N*(N-1)/2 = 3 combates, todos en ronda=1', async () => {
    const ins = [
      mkIns('j1', 'Negro', 'A', TC_RR.id),
      mkIns('j2', 'Café',  'B', TC_RR.id),
      mkIns('j3', 'Azul',  'A', TC_RR.id),
    ]
    const { llaveRepo, inscripcionRepo } = mkRepos(ins)
    const uc = new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
    await uc.execute('torneo-1', [TC_RR], 1, 'admin-1')

    const [, combates] = llaveRepo.crear.mock.calls[0]
    expect(combates).toHaveLength(3)
    expect((combates as Omit<Combate, 'id'>[]).every(c => c.ronda === 1)).toBe(true)
  })

  test('N=3: estructura.tieneRepesca = false', async () => {
    const ins = [
      mkIns('j1', 'Negro', 'A', TC_RR.id),
      mkIns('j2', 'Café',  'B', TC_RR.id),
      mkIns('j3', 'Azul',  'A', TC_RR.id),
    ]
    const { llaveRepo, inscripcionRepo } = mkRepos(ins)
    await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_RR], 1, 'admin-1')

    const estructura = llaveRepo.crear.mock.calls[0][4] as Record<string, unknown>
    expect(estructura.tieneRepesca).toBe(false)
  })

  test('N=5: genera 5*(5-1)/2 = 10 combates (todos contra todos)', async () => {
    const ins = Array.from({ length: 5 }, (_, i) =>
      mkIns(`j${i+1}`, (['Negro','Café','Azul','Verde','Naranja'] as Cinturon[])[i], `club${i}`, TC_RR.id)
    )
    const { llaveRepo, inscripcionRepo } = mkRepos(ins)
    await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_RR], 1, 'admin-1')

    const [, combates] = llaveRepo.crear.mock.calls[0]
    expect(combates).toHaveLength(10)
  })
})


describe('Selección automática de sistema de competición', () => {
  test('N=5 → resultado.sistema = round_robin', async () => {
    const ins = Array.from({ length: 5 }, (_, i) =>
      mkIns(`j${i+1}`, 'Verde', `c${i}`, TC_RR.id)
    )
    const { llaveRepo, inscripcionRepo } = mkRepos(ins)
    const [resultado] = await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_RR], 1, 'admin-1')

    expect(resultado.sistema).toBe('round_robin')
  })

  test('N=6 → resultado.sistema = single_elimination', async () => {
    const ins = Array.from({ length: 6 }, (_, i) =>
      mkIns(`j${i+1}`, 'Verde', `c${i}`, TC_SE.id)
    )
    const { llaveRepo, inscripcionRepo } = mkRepos(ins)
    const [resultado] = await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_SE], 1, 'admin-1')

    expect(resultado.sistema).toBe('single_elimination')
  })
})


describe('Categorías con participantes insuficientes', () => {
  test('N=0 → result.ok=false con mensaje descriptivo', async () => {
    const { llaveRepo, inscripcionRepo } = mkRepos([])
    const [resultado] = await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_RR], 1, 'admin-1')

    expect(resultado.ok).toBe(false)
    expect(resultado.error).toMatch(/sin participantes/i)
  })

  test('N=1 → result.ok=false con mensaje descriptivo', async () => {
    const ins = [mkIns('j1', 'Negro', 'A', TC_RR.id)]
    const { llaveRepo, inscripcionRepo } = mkRepos(ins)
    const [resultado] = await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_RR], 1, 'admin-1')

    expect(resultado.ok).toBe(false)
    expect(resultado.error).toMatch(/solo 1 participante/i)
  })

  test('categoría fallida no llama a llaveRepo.crear', async () => {
    const { llaveRepo, inscripcionRepo } = mkRepos([])
    await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_RR], 1, 'admin-1')

    expect(llaveRepo.crear).not.toHaveBeenCalled()
  })
})


describe('Múltiples categorías', () => {
  test('2 categorías exitosas → llaveRepo.crear llamado 2 veces', async () => {
    const ins = [
      ...Array.from({ length: 3 }, (_, i) => mkIns(`a${i+1}`, 'Verde', `c${i}`, TC_CAT1.id)),
      ...Array.from({ length: 3 }, (_, i) => mkIns(`b${i+1}`, 'Azul',  `c${i}`, TC_CAT2.id)),
    ]
    const { llaveRepo, inscripcionRepo } = mkRepos(ins)
    await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_CAT1, TC_CAT2], 1, 'admin-1')

    expect(llaveRepo.crear).toHaveBeenCalledTimes(2)
  })

  test('retorna un ResultadoCategoria por cada categoría procesada', async () => {
    const ins = [
      ...Array.from({ length: 3 }, (_, i) => mkIns(`a${i+1}`, 'Verde', `c${i}`, TC_CAT1.id)),
      ...Array.from({ length: 3 }, (_, i) => mkIns(`b${i+1}`, 'Azul',  `c${i}`, TC_CAT2.id)),
    ]
    const { llaveRepo, inscripcionRepo } = mkRepos(ins)
    const resultados = await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_CAT1, TC_CAT2], 1, 'admin-1')

    expect(resultados).toHaveLength(2)
    expect(resultados[0].torneoCategoriaId).toBe(TC_CAT1.id)
    expect(resultados[1].torneoCategoriaId).toBe(TC_CAT2.id)
  })

  test('1 categoría exitosa + 1 fallida (N=0) → crear llamado solo 1 vez', async () => {
    
    const ins = Array.from({ length: 3 }, (_, i) =>
      mkIns(`a${i+1}`, 'Verde', `c${i}`, TC_CAT1.id)
    )
    const { llaveRepo, inscripcionRepo } = mkRepos(ins)
    const resultados = await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_CAT1, TC_CAT2], 1, 'admin-1')

    expect(llaveRepo.crear).toHaveBeenCalledTimes(1)
    expect(resultados.find(r => r.torneoCategoriaId === TC_CAT1.id)?.ok).toBe(true)
    expect(resultados.find(r => r.torneoCategoriaId === TC_CAT2.id)?.ok).toBe(false)
  })
})

describe('Bin-packing — distribución de tatamis entre categorías', () => {
  
  const insGrande = Array.from({ length: 8 }, (_, i) =>
    mkIns(`g${i+1}`, (['Negro','Negro','Café','Café','Azul','Azul','Verde','Verde'] as Cinturon[])[i], `c${i}`, TC_CAT1.id)
  )
  const insChica = [
    mkIns('p1', 'Negro', 'A', TC_CAT2.id),
    mkIns('p2', 'Café',  'B', TC_CAT2.id),
    mkIns('p3', 'Azul',  'A', TC_CAT2.id),
  ]

  test('las 2 categorías reciben tatamis diferentes', async () => {
    const { llaveRepo, inscripcionRepo } = mkRepos([...insGrande, ...insChica])
    await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_CAT1, TC_CAT2], 2, 'admin-1')

    const est1 = llaveRepo.crear.mock.calls[0][4] as Record<string, unknown>
    const est2 = llaveRepo.crear.mock.calls[1][4] as Record<string, unknown>
    expect(est1.tatamiAsignado).not.toBe(est2.tatamiAsignado)
  })

  test('la categoría con más combates va al tatami 1 (menor carga inicial)', async () => {
    const { llaveRepo, inscripcionRepo } = mkRepos([...insGrande, ...insChica])
    await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_CAT1, TC_CAT2], 2, 'admin-1')

    const callsById = Object.fromEntries(
      llaveRepo.crear.mock.calls.map(args => [args[0] as string, args[4] as Record<string, unknown>])
    )
    
    expect(callsById[TC_CAT1.id].tatamiAsignado).toBe(1)
    expect(callsById[TC_CAT2.id].tatamiAsignado).toBe(2)
  })
})


describe('Callback onProgreso', () => {
  test('se invoca una vez por categoría procesada', async () => {
    const ins = [
      ...Array.from({ length: 3 }, (_, i) => mkIns(`a${i+1}`, 'Verde', `c${i}`, TC_CAT1.id)),
      ...Array.from({ length: 3 }, (_, i) => mkIns(`b${i+1}`, 'Azul',  `c${i}`, TC_CAT2.id)),
    ]
    const { llaveRepo, inscripcionRepo } = mkRepos(ins)
    const progreso = jest.fn()
    await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_CAT1, TC_CAT2], 1, 'admin-1', progreso)

    expect(progreso).toHaveBeenCalledTimes(2)
  })

  test('recibe el resultado correcto, el índice y el total', async () => {
    const ins = Array.from({ length: 3 }, (_, i) =>
      mkIns(`a${i+1}`, 'Verde', `c${i}`, TC_CAT1.id)
    )
    const { llaveRepo, inscripcionRepo } = mkRepos(ins)
    const progreso = jest.fn()
    await new GenerarLlavesTorneo(llaveRepo, inscripcionRepo)
      .execute('torneo-1', [TC_CAT1], 1, 'admin-1', progreso)

    const [resultado, idx, total] = progreso.mock.calls[0] as [ResultadoCategoria, number, number]
    expect(resultado.torneoCategoriaId).toBe(TC_CAT1.id)
    expect(resultado.ok).toBe(true)
    expect(idx).toBe(1)
    expect(total).toBe(1)
  })
})
