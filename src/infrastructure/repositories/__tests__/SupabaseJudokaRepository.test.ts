import { Judoka } from '../../../domain/models/Judoka'

// Mock must be declared before any import that uses supabase
const mockSingle = jest.fn()
const mockSelect = jest.fn(() => ({ single: mockSingle }))
const mockEqJudoka = jest.fn(() => ({ select: mockSelect }))
const mockUpdateJudoka = jest.fn(() => ({ eq: mockEqJudoka }))

const mockEqUsuario = jest.fn()
const mockUpdateUsuario = jest.fn(() => ({ eq: mockEqUsuario }))

const mockFrom = jest.fn((tabla: string) => {
  if (tabla === 'usuarios') return { update: mockUpdateUsuario }
  if (tabla === 'judokas') return { update: mockUpdateJudoka }
})

jest.mock('../../../lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

// Import AFTER mock registration
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SupabaseJudokaRepository } = require('../SupabaseJudokaRepository')

const judokaDTOMock = {
  id: 'judoka-123',
  usuario_id: 'usuario-456',
  tipo_sangre: 'A+',
  contacto_emergencia: '77776666',
  relacion_contacto: 'madre',
  usuario: {
    id: 'usuario-456',
    nombre: 'Marco',
    apellido_paterno: 'Torres',
    apellido_materno: 'Lima',
    correo: 'marco@judo.com',
    fecha_nacimiento: '2000-05-15',
    numero_celular: '79998888',
    genero: 'Masculino',
    rol: 'judoka',
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSingle.mockResolvedValue({ data: judokaDTOMock, error: null })
  mockEqUsuario.mockResolvedValue({ error: null })
})

describe('SupabaseJudokaRepository.actualizar', () => {

  test('envía los nombres de columna en snake_case para la tabla judokas', async () => {
    const repo = new SupabaseJudokaRepository()
    const datos: Partial<Judoka> = {
      contactoEmergencia: '77776666',
      relacionContacto: 'madre',
      tipoSangre: 'A+',
    }

    await repo.actualizar('judoka-123', datos)

    expect(mockUpdateJudoka).toHaveBeenCalledWith(
      expect.objectContaining({
        contacto_emergencia: '77776666',
        relacion_contacto: 'madre',
        tipo_sangre: 'A+',
      })
    )
  })

  test('envía los nombres de columna en snake_case para la tabla usuarios', async () => {
    const repo = new SupabaseJudokaRepository()
    const datos: Partial<Judoka> = {
      usuario: {
        id: 'usuario-456',
        correo: 'marco@judo.com',
        rol: 'judoka',
        nombre: 'Marco',
        fechaNacimiento: '2000-05-15',
        celular: '79998888',
        genero: 'Masculino',
      },
    }

    await repo.actualizar('judoka-123', datos)

    expect(mockUpdateUsuario).toHaveBeenCalledWith(
      expect.objectContaining({
        fecha_nacimiento: '2000-05-15',
        numero_celular: '79998888',
        genero: 'Masculino',
      })
    )
  })

  test('sin datos.usuario no llama a la tabla usuarios', async () => {
    const repo = new SupabaseJudokaRepository()
    const datos: Partial<Judoka> = {
      tipoSangre: 'B+',
    }

    await repo.actualizar('judoka-123', datos)

    expect(mockFrom).not.toHaveBeenCalledWith('usuarios')
    expect(mockUpdateJudoka).toHaveBeenCalled()
  })

  test('retorna el judoka mapeado al dominio (camelCase)', async () => {
    const repo = new SupabaseJudokaRepository()

    const resultado = await repo.actualizar('judoka-123', { tipoSangre: 'O+' })

    expect(resultado.tipoSangre).toBe('A+')
    expect(resultado.contactoEmergencia).toBe('77776666')
    expect(resultado.usuario.fechaNacimiento).toBe('2000-05-15')
    expect(resultado.usuario.celular).toBe('79998888')
  })

  test('error en tabla usuarios → lanza error', async () => {
    mockEqUsuario.mockResolvedValue({ error: new Error('fallo en BD') })
    const repo = new SupabaseJudokaRepository()

    await expect(
      repo.actualizar('judoka-123', {
        usuario: { id: 'usuario-456', correo: 'x@x.com', rol: 'judoka', nombre: 'X' },
      })
    ).rejects.toThrow('No se pudo actualizar el usuario')
  })

  test('error en tabla judokas → lanza error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('fallo en BD') })
    const repo = new SupabaseJudokaRepository()

    await expect(repo.actualizar('judoka-123', { tipoSangre: 'O+' }))
      .rejects
      .toThrow('No se pudo actualizar el judoka')
  })

})
