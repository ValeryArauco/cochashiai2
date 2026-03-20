import { AprobarInscripcionSensei } from '../AprobarInscripcionSensei'
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

const useCase = new AprobarInscripcionSensei(mockRepo)

beforeEach(() => jest.clearAllMocks())

describe('AprobarInscripcionSensei', () => {

  test('aprobación exitosa → llama a aprobarEntrenador con el id correcto', async () => {
    mockRepo.aprobarEntrenador.mockResolvedValue(undefined)

    await useCase.execute('ins-1')

    expect(mockRepo.aprobarEntrenador).toHaveBeenCalledWith('ins-1')
    expect(mockRepo.aprobarEntrenador).toHaveBeenCalledTimes(1)
  })

  test('id vacío → lanza error sin llamar al repositorio', async () => {
    await expect(useCase.execute(''))
      .rejects.toThrow('El id de la inscripción es requerido')

    expect(mockRepo.aprobarEntrenador).not.toHaveBeenCalled()
  })

  test('repositorio falla → propaga el error', async () => {
    mockRepo.aprobarEntrenador.mockRejectedValue(new Error('Error de conexión'))

    await expect(useCase.execute('ins-1'))
      .rejects.toThrow('Error de conexión')
  })

})
