import { SolicitarInscripcion } from '../SolicitarInscripcion'
import { IInscripcionRepository } from '../../../../domain/repositories/IInscripcionRepository'
import { Inscripcion } from '../../../../domain/models/Inscripcion'
import { Judoka } from '../../../../domain/models/Judoka'


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

const useCase = new SolicitarInscripcion(mockRepo)


const judokaCompleto: Judoka = {
  id: 'j-1',
  usuarioId: 'u-1',
  tipoSangre: 'O+',
  contactoEmergencia: '71234567',
  relacionContacto: 'madre',
  usuario: {
    id: 'u-1',
    nombre: 'Ana',
    correo: 'ana@judo.com',
    rol: 'judoka',
    fechaNacimiento: '2000-05-15',
    genero: 'femenino',
    celular: '79876543',
  } as any,
}

const inscripcionMock: Inscripcion = {
  id: 'ins-1',
  torneoCategoriaId: 'tc-1',
  judokaId: 'j-1',
  estado: 'pendiente_entrenador',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockRepo.obtenerPorJudokaYTorneo.mockResolvedValue(null)
  mockRepo.crear.mockResolvedValue(inscripcionMock)
})


describe('SolicitarInscripcion', () => {

  describe('solicitud exitosa', () => {
    test('retorna la inscripción creada con estado pendiente_entrenador', async () => {
      const resultado = await useCase.execute(judokaCompleto, 'tc-1', 'torneo-1')

      expect(mockRepo.crear).toHaveBeenCalledWith('tc-1', 'j-1')
      expect(resultado).toEqual(inscripcionMock)
      expect(resultado.estado).toBe('pendiente_entrenador')
    })
  })

  describe('validación de parámetros', () => {
    test('torneoCategoriaId vacío → lanza error sin llamar al repositorio', async () => {
      await expect(useCase.execute(judokaCompleto, '', 'torneo-1'))
        .rejects.toThrow('La categoría es requerida')

      expect(mockRepo.crear).not.toHaveBeenCalled()
    })
  })

  describe('validación de duplicado', () => {
    test('judoka ya inscrito en ese torneo → lanza error', async () => {
      mockRepo.obtenerPorJudokaYTorneo.mockResolvedValue(inscripcionMock)

      await expect(useCase.execute(judokaCompleto, 'tc-1', 'torneo-1'))
        .rejects.toThrow('Ya tienes una solicitud de inscripción para este torneo')

      expect(mockRepo.crear).not.toHaveBeenCalled()
    })
  })

  describe('validación de perfil incompleto', () => {
    test('falta fechaNacimiento → lanza error mencionando el campo', async () => {
      const judoka = { ...judokaCompleto, usuario: { ...judokaCompleto.usuario, fechaNacimiento: undefined } }

      await expect(useCase.execute(judoka as any, 'tc-1', 'torneo-1'))
        .rejects.toThrow('Fecha de nacimiento')

      expect(mockRepo.crear).not.toHaveBeenCalled()
    })

    test('falta género → lanza error mencionando el campo', async () => {
      const judoka = { ...judokaCompleto, usuario: { ...judokaCompleto.usuario, genero: undefined } }

      await expect(useCase.execute(judoka as any, 'tc-1', 'torneo-1'))
        .rejects.toThrow('Género')

      expect(mockRepo.crear).not.toHaveBeenCalled()
    })

    test('falta celular → lanza error mencionando el campo', async () => {
      const judoka = { ...judokaCompleto, usuario: { ...judokaCompleto.usuario, celular: undefined } }

      await expect(useCase.execute(judoka as any, 'tc-1', 'torneo-1'))
        .rejects.toThrow('Celular')

      expect(mockRepo.crear).not.toHaveBeenCalled()
    })

    test('falta tipoSangre → lanza error mencionando el campo', async () => {
      const judoka = { ...judokaCompleto, tipoSangre: undefined }

      await expect(useCase.execute(judoka as any, 'tc-1', 'torneo-1'))
        .rejects.toThrow('Tipo de sangre')

      expect(mockRepo.crear).not.toHaveBeenCalled()
    })

    test('falta contactoEmergencia → lanza error mencionando el campo', async () => {
      const judoka = { ...judokaCompleto, contactoEmergencia: undefined }

      await expect(useCase.execute(judoka as any, 'tc-1', 'torneo-1'))
        .rejects.toThrow('Contacto de emergencia')

      expect(mockRepo.crear).not.toHaveBeenCalled()
    })

    test('falta relacionContacto → lanza error mencionando el campo', async () => {
      const judoka = { ...judokaCompleto, relacionContacto: undefined }

      await expect(useCase.execute(judoka as any, 'tc-1', 'torneo-1'))
        .rejects.toThrow('Relación con contacto de emergencia')

      expect(mockRepo.crear).not.toHaveBeenCalled()
    })

    test('múltiples campos faltantes → el error los lista todos', async () => {
      const judoka = {
        ...judokaCompleto,
        tipoSangre: undefined,
        contactoEmergencia: undefined,
        usuario: { ...judokaCompleto.usuario, fechaNacimiento: undefined },
      }

      await expect(useCase.execute(judoka as any, 'tc-1', 'torneo-1'))
        .rejects.toThrow('Fecha de nacimiento')

      expect(mockRepo.crear).not.toHaveBeenCalled()
    })
  })

})
