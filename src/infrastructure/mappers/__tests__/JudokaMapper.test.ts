import { JudokaMapper } from '../JudokaMapper'
import { JudokaDTO } from '../../dtos/JudokaDTO'

const dtoPrueba: JudokaDTO = {
  id: 'judoka-001',
  usuario_id: 'usuario-001',
  club_id: 'club-001',
  entrenador_id: undefined,
  peso_competitivo: 73,
  cinturon_actual: 'Verde',
  tipo_sangre: 'A+',
  contacto_emergencia: '76543210',
  relacion_contacto: 'madre',
  usuario: {
    id: 'usuario-001',
    nombre: 'Ana',
    apellido_paterno: 'Quispe',
    apellido_materno: 'Mamani',
    correo: 'ana@judo.com',
    fecha_nacimiento: '1999-03-22',
    numero_celular: '70001111',
    genero: 'Femenino',
    rol: 'judoka',
    avatar_url: undefined,
    ci: '12345678',
  },
}

describe('JudokaMapper.toDomain', () => {

  test('mapea todos los campos snake_case a camelCase correctamente', () => {
    const resultado = JudokaMapper.toDomain(dtoPrueba)

    expect(resultado.id).toBe('judoka-001')
    expect(resultado.usuarioId).toBe('usuario-001')
    expect(resultado.clubId).toBe('club-001')
    expect(resultado.peso).toBe(73)
    expect(resultado.cinturon).toBe('Verde')
    expect(resultado.tipoSangre).toBe('A+')
    expect(resultado.contactoEmergencia).toBe('76543210')
    expect(resultado.relacionContacto).toBe('madre')
  })

  test('fecha_nacimiento → fechaNacimiento (mapeo crítico)', () => {
    const resultado = JudokaMapper.toDomain(dtoPrueba)

    expect(resultado.usuario.fechaNacimiento).toBe('1999-03-22')
  })

  test('numero_celular → celular (rename no obvio)', () => {
    const resultado = JudokaMapper.toDomain(dtoPrueba)

    expect(resultado.usuario.celular).toBe('70001111')
  })

  test('campos opcionales undefined → quedan undefined en el dominio', () => {
    const dtoSinOpcionales: JudokaDTO = {
      id: 'judoka-002',
      usuario_id: 'usuario-002',
      usuario: {
        id: 'usuario-002',
        nombre: 'Luis',
        apellido_paterno: 'Rojas',
        apellido_materno: 'Vega',
        correo: 'luis@judo.com',
        rol: 'judoka',
      },
    }

    const resultado = JudokaMapper.toDomain(dtoSinOpcionales)

    expect(resultado.clubId).toBeUndefined()
    expect(resultado.peso).toBeUndefined()
    expect(resultado.cinturon).toBeUndefined()
    expect(resultado.tipoSangre).toBeUndefined()
    expect(resultado.contactoEmergencia).toBeUndefined()
    expect(resultado.relacionContacto).toBeUndefined()
    expect(resultado.usuario.fechaNacimiento).toBeUndefined()
    expect(resultado.usuario.celular).toBeUndefined()
  })

})
