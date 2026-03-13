import { PerfilMapper } from '../perfilMapper'
import { PerfilData } from '../perfilSchema'
import { Judoka } from '../../../../domain/models/Judoka'

const judokaActualMock: Judoka = {
  id: 'judoka-123',
  usuarioId: 'usuario-456',
  tipoSangre: 'O-',
  contactoEmergencia: '71111111',
  relacionContacto: 'padre',
  usuario: {
    id: 'usuario-456',
    correo: 'marco@judo.com',
    rol: 'judoka',
    nombre: 'Marco',
    apellidoPaterno: 'Torres',
    apellidoMaterno: 'Lima',
    fechaNacimiento: '1998-01-10',
    celular: '72222222',
    genero: 'Masculino',
  },
}

const datosFormulario: PerfilData = {
  fechaNacimiento: '2000-05-15',
  celular: '79998888',
  genero: 'Masculino',
  contactoEmergencia: '77776666',
  relacionContactoEmergencia: 'madre',
  tipoSangre: 'A+',
}

describe('PerfilMapper.toJudoka', () => {

  test('relacionContactoEmergencia → relacionContacto (mapeo crítico)', () => {
    const resultado = PerfilMapper.toJudoka(datosFormulario, judokaActualMock)

    expect(resultado.relacionContacto).toBe('madre')
  })

  test('todos los campos del formulario se trasladan a los campos de dominio correspondientes', () => {
    const resultado = PerfilMapper.toJudoka(datosFormulario, judokaActualMock)

    expect(resultado.tipoSangre).toBe('A+')
    expect(resultado.contactoEmergencia).toBe('77776666')
    expect(resultado.usuario?.fechaNacimiento).toBe('2000-05-15')
    expect(resultado.usuario?.celular).toBe('79998888')
    expect(resultado.usuario?.genero).toBe('Masculino')
  })

  test('conserva los campos del usuario que no están en el formulario', () => {
    const resultado = PerfilMapper.toJudoka(datosFormulario, judokaActualMock)

    expect(resultado.usuario?.id).toBe('usuario-456')
    expect(resultado.usuario?.correo).toBe('marco@judo.com')
    expect(resultado.usuario?.rol).toBe('judoka')
    expect(resultado.usuario?.nombre).toBe('Marco')
    expect(resultado.usuario?.apellidoPaterno).toBe('Torres')
  })

  test('no incluye id ni usuarioId en el resultado (es Partial<Judoka>)', () => {
    const resultado = PerfilMapper.toJudoka(datosFormulario, judokaActualMock)

    expect(resultado.id).toBeUndefined()
    expect(resultado.usuarioId).toBeUndefined()
  })

})
