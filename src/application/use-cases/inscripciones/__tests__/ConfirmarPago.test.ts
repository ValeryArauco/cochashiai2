import { ConfirmarPago } from '../ConfirmarPago'
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
  descalificarPorPeso: jest.fn(),
}

const useCase = new ConfirmarPago(mockRepo)

beforeEach(() => jest.clearAllMocks())


describe('ConfirmarPago', () => {

  test('pago exitoso → llama a marcarPagado con el id correcto', async () => {
    mockRepo.marcarPagado.mockResolvedValue(undefined)

    await useCase.execute('ins-1')

    expect(mockRepo.marcarPagado).toHaveBeenCalledWith('ins-1')
    expect(mockRepo.marcarPagado).toHaveBeenCalledTimes(1)
  })

  test('id vacío → lanza error sin llamar al repositorio', async () => {
    await expect(useCase.execute(''))
      .rejects.toThrow('El id de la inscripción es requerido')

    expect(mockRepo.marcarPagado).not.toHaveBeenCalled()
  })

  test('repositorio falla → propaga el error', async () => {
    mockRepo.marcarPagado.mockRejectedValue(new Error('Error de conexión'))

    await expect(useCase.execute('ins-1'))
      .rejects.toThrow('Error de conexión')
  })

})
