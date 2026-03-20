import { CancelarInscripcion } from '../CancelarInscripcion'
import { IInscripcionRepository } from '../../../../domain/repositories/IInscripcionRepository'
import { EstadoInscripcion } from '../../../../domain/models/Inscripcion'


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

const useCase = new CancelarInscripcion(mockRepo)

beforeEach(() => jest.clearAllMocks())


describe('CancelarInscripcion', () => {

  describe('cancelación exitosa', () => {
    test('estado pendiente_entrenador → llama a eliminar con el id correcto', async () => {
      mockRepo.eliminar.mockResolvedValue(undefined)

      await useCase.execute('ins-1', 'pendiente_entrenador')

      expect(mockRepo.eliminar).toHaveBeenCalledWith('ins-1')
      expect(mockRepo.eliminar).toHaveBeenCalledTimes(1)
    })
  })

  describe('validación de id', () => {
    test('id vacío → lanza error sin llamar al repositorio', async () => {
      await expect(useCase.execute('', 'pendiente_entrenador'))
        .rejects.toThrow('El ID de la inscripción es requerido')

      expect(mockRepo.eliminar).not.toHaveBeenCalled()
    })
  })

  describe('validación de estado', () => {
    const estadosNoCancelables: EstadoInscripcion[] = [
      'aprobado_entrenador',
      'pendiente_pago',
      'confirmado',
      'cancelado',
    ]

    test.each(estadosNoCancelables)(
      'estado "%s" → no se puede cancelar',
      async (estado) => {
        await expect(useCase.execute('ins-1', estado))
          .rejects.toThrow('Solo puedes cancelar una solicitud que esté pendiente de aprobación por el sensei')

        expect(mockRepo.eliminar).not.toHaveBeenCalled()
      }
    )
  })

  describe('errores del repositorio', () => {
    test('repositorio falla → propaga el error', async () => {
      mockRepo.eliminar.mockRejectedValue(new Error('Error de conexión'))

      await expect(useCase.execute('ins-1', 'pendiente_entrenador'))
        .rejects.toThrow('Error de conexión')
    })
  })

})
