import { ActualizarPerfil } from '../ActualizarPerfil'
import { IJudokaRepository } from '../../../../domain/repositories/IJudokaRepository'
import { Judoka } from '../../../../domain/models/Judoka'

const mockJudokaRepo: jest.Mocked<IJudokaRepository> = {
  obtenerPorUsuarioId: jest.fn(),
  obtenerPorId: jest.fn(),
  actualizar: jest.fn(),
}

const actualizarPerfilUseCase = new ActualizarPerfil(mockJudokaRepo)

const judokaMock: Judoka = {
  id: 'judoka-123',
  usuarioId: 'usuario-456',
  tipoSangre: 'O+',
  contactoEmergencia: '77889900',
  relacionContacto: 'madre',
  usuario: {
    id: 'usuario-456',
    correo: 'judoka@judo.com',
    rol: 'judoka',
    nombre: 'Marco',
    fechaNacimiento: '2000-05-15',
    celular: '71234567',
    genero: 'Masculino',
  },
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ActualizarPerfil - caso de uso', () => {

  test('actualización exitosa → retorna el judoka del repositorio', async () => {
    mockJudokaRepo.actualizar.mockResolvedValue(judokaMock)

    const resultado = await actualizarPerfilUseCase.execute('judoka-123', { tipoSangre: 'O+' })

    expect(mockJudokaRepo.actualizar).toHaveBeenCalledWith('judoka-123', { tipoSangre: 'O+' })
    expect(resultado).toEqual(judokaMock)
  })

  test('id vacío → lanza error sin llamar al repositorio', async () => {
    await expect(actualizarPerfilUseCase.execute('', { tipoSangre: 'A+' }))
      .rejects
      .toThrow('El id del judoka es requerido')

    expect(mockJudokaRepo.actualizar).not.toHaveBeenCalled()
  })

  test('repositorio falla → propaga el error', async () => {
    mockJudokaRepo.actualizar.mockRejectedValue(new Error('No se pudo actualizar el judoka'))

    await expect(actualizarPerfilUseCase.execute('judoka-123', { tipoSangre: 'B+' }))
      .rejects
      .toThrow('No se pudo actualizar el judoka')

    expect(mockJudokaRepo.actualizar).toHaveBeenCalledWith('judoka-123', { tipoSangre: 'B+' })
  })

  test('datos parciales → pasa exactamente los datos recibidos sin modificarlos', async () => {
    const datosParciales: Partial<Judoka> = {
      contactoEmergencia: '79991111',
      relacionContacto: 'padre',
    }
    mockJudokaRepo.actualizar.mockResolvedValue(judokaMock)

    await actualizarPerfilUseCase.execute('judoka-123', datosParciales)

    expect(mockJudokaRepo.actualizar).toHaveBeenCalledWith('judoka-123', datosParciales)
  })

})
