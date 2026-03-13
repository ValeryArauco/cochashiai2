import { ITorneoRepository } from '../../../domain/repositories/ITorneoRepository'
import { Torneo, TorneoFecha } from '../../../domain/models/Torneo'

export class CrearTorneo {
  constructor(private readonly torneoRepo: ITorneoRepository) {}

  async execute(
    datos: Omit<Torneo, 'id' | 'fechas' | 'categorias' | 'torneoCategorias'>,
    fechas: Omit<TorneoFecha, 'id' | 'torneoId'>[],
    categoriaIds: string[]
  ): Promise<Torneo> {
    if (!datos.nombre.trim()) throw new Error('El nombre del torneo es requerido')
    if (!datos.ubicacion.trim()) throw new Error('La ubicación es requerida')
    if (fechas.length === 0) throw new Error('Debe agregar al menos una fecha')
    if (categoriaIds.length === 0) throw new Error('Debe seleccionar al menos una categoría')

    return await this.torneoRepo.crear(datos, fechas, categoriaIds)
  }
}
