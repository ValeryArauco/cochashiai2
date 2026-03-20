import { RechazarInscripcion } from '../RechazarInscripcion'
import { IInscripcionRepository } from '../../../../domain/repositories/IInscripcionRepository'


const mockRepo: jest.Mocked<IInscripcionRepository> = {
  crear: jest.fn(),
  listarPorTorneo: jest.fn(),
  obtenerPorJudokaYTorneo: jest.fn(),
  aprobarEntrenador: jest.fn(),
  registrarPeso: jest.fn(),
  marcarPagado: jest.fn(),
  desmarcarPagado: jest.fn(),
  cambiarCategoria: jest.fn(),
  eliminar: jest.fn(),
}

const useCase = new RechazarInscripcion(mockRepo)

beforeEach(() => jest.clearAllMocks())


describe('RechazarInscripcion', () => {

  test('rechazo exitoso → llama a eliminar con el id correcto', async () => {
    mockRepo.eliminar.mockResolvedValue(undefined)

    await useCase.execute('ins-1')

    expect(mockRepo.eliminar).toHaveBeenCalledWith('ins-1')
    expect(mockRepo.eliminar).toHaveBeenCalledTimes(1)
  })

  test('id vacío → lanza error sin llamar al repositorio', async () => {
    await expect(useCase.execute(''))
      .rejects.toThrow('El id de la inscripción es requerido')

    expect(mockRepo.eliminar).not.toHaveBeenCalled()
  })

  test('repositorio falla → propaga el error', async () => {
    mockRepo.eliminar.mockRejectedValue(new Error('Error de conexión'))

    await expect(useCase.execute('ins-1'))
      .rejects.toThrow('Error de conexión')
  })

})
