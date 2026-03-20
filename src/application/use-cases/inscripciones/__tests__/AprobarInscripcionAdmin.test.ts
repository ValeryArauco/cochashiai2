import { AprobarInscripcionAdmin } from '../AprobarInscripcionAdmin'
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

const useCase = new AprobarInscripcionAdmin(mockRepo)

beforeEach(() => jest.clearAllMocks())


describe('AprobarInscripcionAdmin', () => {

  describe('registro exitoso de peso', () => {
    test('peso válido → llama a registrarPeso con los parámetros correctos', async () => {
      mockRepo.registrarPeso.mockResolvedValue(undefined)

      await useCase.execute('ins-1', 66.5)

      expect(mockRepo.registrarPeso).toHaveBeenCalledWith('ins-1', 66.5)
      expect(mockRepo.registrarPeso).toHaveBeenCalledTimes(1)
    })
  })

  describe('validación de id', () => {
    test('id vacío → lanza error sin llamar al repositorio', async () => {
      await expect(useCase.execute('', 66.5))
        .rejects.toThrow('El id de la inscripción es requerido')

      expect(mockRepo.registrarPeso).not.toHaveBeenCalled()
    })
  })

  describe('validación de peso', () => {
    test('peso = 0 → lanza error', async () => {
      await expect(useCase.execute('ins-1', 0))
        .rejects.toThrow('El peso oficial debe ser mayor a 0')

      expect(mockRepo.registrarPeso).not.toHaveBeenCalled()
    })

    test('peso negativo → lanza error', async () => {
      await expect(useCase.execute('ins-1', -5))
        .rejects.toThrow('El peso oficial debe ser mayor a 0')

      expect(mockRepo.registrarPeso).not.toHaveBeenCalled()
    })
  })

  describe('errores del repositorio', () => {
    test('repositorio falla → propaga el error', async () => {
      mockRepo.registrarPeso.mockRejectedValue(new Error('Error de conexión'))

      await expect(useCase.execute('ins-1', 66.5))
        .rejects.toThrow('Error de conexión')
    })
  })

})
