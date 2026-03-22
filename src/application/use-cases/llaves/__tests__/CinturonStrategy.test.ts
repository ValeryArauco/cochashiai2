import { CinturonStrategy } from '../seeding/CinturonStrategy'
import { Inscripcion } from '../../../../domain/models/Inscripcion'
import { Cinturon } from '../../../../domain/models/Judoka'

function mkIns(id: string, cinturon: Cinturon | undefined): Inscripcion {
  return {
    id: `ins-${id}`,
    torneoCategoriaId: 'tc-1',
    judokaId: id,
    pagado: true,
    estado: 'confirmado',
    judoka: {
      id,
      usuarioId: `u-${id}`,
      cinturon: cinturon as Cinturon,
      clubId: 'club-1',
      usuario: { id: `u-${id}`, nombre: 'Test', apellidoPaterno: id, rol: 'judoka' } as any,
    },
  }
}

const strategy = new CinturonStrategy()

describe('CinturonStrategy', () => {
  test('nombre de la estrategia es "cinturon"', () => {
    expect(strategy.nombre).toBe('cinturon')
  })

  test('orden completo: Negro → Café → Azul → Verde → Naranja → Amarillo → Blanco', () => {
    const ins = [
      mkIns('blanco',   'Blanco'),
      mkIns('amarillo', 'Amarillo'),
      mkIns('naranja',  'Naranja'),
      mkIns('verde',    'Verde'),
      mkIns('azul',     'Azul'),
      mkIns('cafe',     'Café'),
      mkIns('negro',    'Negro'),
    ]
    const resultado = strategy.ordenar(ins)
    expect(resultado.map(i => i.judokaId)).toEqual([
      'negro', 'cafe', 'azul', 'verde', 'naranja', 'amarillo', 'blanco',
    ])
  })

  test('Negro siempre queda antes que Café', () => {
    const ins = [mkIns('j1', 'Café'), mkIns('j2', 'Negro')]
    const resultado = strategy.ordenar(ins)
    expect(resultado[0].judokaId).toBe('j2') 
  })

  test('judoka sin cinturón registrado queda al final (detrás de Blanco)', () => {
    const ins = [
      mkIns('sinCinturon', undefined),
      mkIns('blanco',      'Blanco'),
      mkIns('negro',       'Negro'),
    ]
    const resultado = strategy.ordenar(ins)
    expect(resultado[0].judokaId).toBe('negro')
    expect(resultado[resultado.length - 1].judokaId).toBe('sinCinturon')
  })

  test('no modifica el array original (devuelve copia ordenada)', () => {
    const ins = [mkIns('j1', 'Blanco'), mkIns('j2', 'Negro')]
    const original = [...ins]
    strategy.ordenar(ins)
    expect(ins[0].judokaId).toBe(original[0].judokaId) 
  })

  test('mismo cinturón mantiene todos los elementos (no descarta empates)', () => {
    const ins = [
      mkIns('j1', 'Azul'),
      mkIns('j2', 'Azul'),
      mkIns('j3', 'Azul'),
    ]
    const resultado = strategy.ordenar(ins)
    expect(resultado).toHaveLength(3)
    expect(resultado.every(i => i.judoka?.cinturon === 'Azul')).toBe(true)
  })
})
