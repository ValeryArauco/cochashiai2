import { RegistrarResultado, ResultadoCombate } from '../RegistrarResultado'
import { ILlaveRepository } from '../../../../domain/repositories/ILlaveRepository'
import { Combate } from '../../../../domain/models/Combate'


function mkCombate(overrides: Partial<Combate> = {}): Combate {
  return {
    id: 'c-1',
    llaveId: 'l-1',
    ronda: 1,
    posicion: 1,
    fase: 'principal',
    judoka1Id: 'j1',
    judoka2Id: 'j2',
    judoka1Ippones: 0,
    judoka1Wazaris: 0,
    judoka1Shidos: 0,
    judoka2Ippones: 0,
    judoka2Wazaris: 0,
    judoka2Shidos: 0,
    estado: 'pendiente',
    ...overrides,
  }
}

function mkResultado(overrides: Partial<ResultadoCombate> = {}): ResultadoCombate {
  return {
    ganadorId: 'j1',
    tipoVictoria: 'ippon',
    judoka1Ippones: 1,
    judoka1Wazaris: 0,
    judoka1Shidos: 0,
    judoka2Ippones: 0,
    judoka2Wazaris: 0,
    judoka2Shidos: 0,
    ...overrides,
  }
}

function mkRepo(): jest.Mocked<ILlaveRepository> {
  return {
    crear: jest.fn(),
    obtenerPorTorneoCategoria: jest.fn(),
    listarCombatesPorLlave: jest.fn(),
    actualizarResultadoCombate: jest.fn().mockResolvedValue({ ...mkCombate(), estado: 'finalizado', ganadorId: 'j1' }),
    actualizarMarcadorParcial: jest.fn().mockResolvedValue(undefined),
    actualizarEstadoCombate: jest.fn(),
    actualizarTatamiCombate: jest.fn(),
    listarCombatesPorTorneoYTatami: jest.fn(),
  } as jest.Mocked<ILlaveRepository>
}

describe('RegistrarResultado — validaciones de entrada', () => {
  test('lanza error si el combate tiene estado "bye"', async () => {
    const repo = mkRepo()
    const uc = new RegistrarResultado(repo)
    await expect(uc.execute(mkCombate({ estado: 'bye' }), mkResultado()))
      .rejects.toThrow(/BYE/i)
    expect(repo.actualizarResultadoCombate).not.toHaveBeenCalled()
  })

  test('lanza error si el combate ya está finalizado', async () => {
    const repo = mkRepo()
    const uc = new RegistrarResultado(repo)
    await expect(uc.execute(mkCombate({ estado: 'finalizado' }), mkResultado()))
      .rejects.toThrow(/finalizado/i)
    expect(repo.actualizarResultadoCombate).not.toHaveBeenCalled()
  })

  test('lanza error si judoka1Id está ausente (combate incompleto)', async () => {
    const repo = mkRepo()
    const uc = new RegistrarResultado(repo)
    await expect(
      uc.execute(mkCombate({ judoka1Id: undefined }), mkResultado({ ganadorId: 'j2' }))
    ).rejects.toThrow(/dos participantes/i)
  })

  test('lanza error si judoka2Id está ausente (combate incompleto)', async () => {
    const repo = mkRepo()
    const uc = new RegistrarResultado(repo)
    await expect(
      uc.execute(mkCombate({ judoka2Id: undefined }), mkResultado())
    ).rejects.toThrow(/dos participantes/i)
  })

  test('lanza error si ganadorId no es ninguno de los dos participantes', async () => {
    const repo = mkRepo()
    const uc = new RegistrarResultado(repo)
    await expect(
      uc.execute(mkCombate(), mkResultado({ ganadorId: 'intruso' }))
    ).rejects.toThrow(/participantes del combate/i)
  })
})

describe('RegistrarResultado — llamada al repositorio', () => {
  test('llama a actualizarResultadoCombate con el id del combate', async () => {
    const repo = mkRepo()
    await new RegistrarResultado(repo).execute(mkCombate({ id: 'c-99' }), mkResultado())
    expect(repo.actualizarResultadoCombate).toHaveBeenCalledWith('c-99', expect.anything())
  })

  test('incluye estado="finalizado" en el payload enviado al repositorio', async () => {
    const repo = mkRepo()
    await new RegistrarResultado(repo).execute(mkCombate(), mkResultado())
    const payload = repo.actualizarResultadoCombate.mock.calls[0][1]
    expect(payload.estado).toBe('finalizado')
  })

  test('propaga ganadorId y tipoVictoria sin modificarlos', async () => {
    const repo = mkRepo()
    const resultado = mkResultado({ ganadorId: 'j2', tipoVictoria: 'decision' })
    await new RegistrarResultado(repo).execute(mkCombate(), resultado)
    const payload = repo.actualizarResultadoCombate.mock.calls[0][1]
    expect(payload.ganadorId).toBe('j2')
    expect(payload.tipoVictoria).toBe('decision')
  })

  test('propaga el marcador completo (6 campos de puntuación)', async () => {
    const repo = mkRepo()
    const resultado = mkResultado({
      judoka1Ippones: 1,
      judoka1Wazaris: 2,
      judoka1Shidos: 0,
      judoka2Ippones: 0,
      judoka2Wazaris: 1,
      judoka2Shidos: 2,
    })
    await new RegistrarResultado(repo).execute(mkCombate(), resultado)
    const payload = repo.actualizarResultadoCombate.mock.calls[0][1]
    expect(payload.judoka1Ippones).toBe(1)
    expect(payload.judoka1Wazaris).toBe(2)
    expect(payload.judoka1Shidos).toBe(0)
    expect(payload.judoka2Ippones).toBe(0)
    expect(payload.judoka2Wazaris).toBe(1)
    expect(payload.judoka2Shidos).toBe(2)
  })

  test('retorna el combate devuelto por el repositorio', async () => {
    const repo = mkRepo()
    const combateActualizado = { ...mkCombate(), estado: 'finalizado' as const, ganadorId: 'j1' }
    repo.actualizarResultadoCombate.mockResolvedValue(combateActualizado)
    const result = await new RegistrarResultado(repo).execute(mkCombate(), mkResultado())
    expect(result).toBe(combateActualizado)
  })
})

describe('RegistrarResultado — tipos de victoria admitidos', () => {
  test.each([
    ['ippon',           { judoka1Ippones: 1 }],
    ['wazari',          { judoka1Wazaris: 2 }],
    ['decision',        {}],
    ['descalificacion', { judoka2Shidos: 3 }],
    ['wo',              {}],
  ] as const)(
    'tipoVictoria="%s" es aceptado sin error',
    async (tipo, marcador) => {
      const repo = mkRepo()
      await expect(
        new RegistrarResultado(repo).execute(
          mkCombate(),
          mkResultado({ tipoVictoria: tipo, ...marcador }),
        )
      ).resolves.not.toThrow()
    }
  )
})

describe('RegistrarResultado — estados iniciales del combate', () => {
  test('combate en estado "pendiente" es procesado correctamente', async () => {
    const repo = mkRepo()
    await expect(
      new RegistrarResultado(repo).execute(mkCombate({ estado: 'pendiente' }), mkResultado())
    ).resolves.toBeDefined()
  })

  test('combate en estado "en_curso" es procesado correctamente', async () => {
    const repo = mkRepo()
    await expect(
      new RegistrarResultado(repo).execute(mkCombate({ estado: 'en_curso' }), mkResultado())
    ).resolves.toBeDefined()
  })

  test('ganador puede ser judoka2 además de judoka1', async () => {
    const repo = mkRepo()
    repo.actualizarResultadoCombate.mockResolvedValue(
      { ...mkCombate(), estado: 'finalizado', ganadorId: 'j2' }
    )
    const result = await new RegistrarResultado(repo).execute(
      mkCombate(),
      mkResultado({ ganadorId: 'j2' }),
    )
    expect(result.ganadorId).toBe('j2')
  })

  test('combate en fase "repesca" también puede registrar resultado', async () => {
    const repo = mkRepo()
    await expect(
      new RegistrarResultado(repo).execute(
        mkCombate({ fase: 'repesca', estado: 'pendiente' }),
        mkResultado(),
      )
    ).resolves.toBeDefined()
  })
})
