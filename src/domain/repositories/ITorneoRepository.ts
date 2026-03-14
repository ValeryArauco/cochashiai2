import { Torneo, TorneoFecha } from '../models/Torneo'

export interface FiltrosTorneos {
  nombre?: string
  año?: number
  mes?: number
}

export interface ITorneoRepository {
  crear(
    datos: Omit<Torneo, 'id' | 'fechas' | 'categorias' | 'torneoCategorias'>,
    fechas: Omit<TorneoFecha, 'id' | 'torneoId'>[],
    categoriaIds: string[]
  ): Promise<Torneo>
  eliminar(id: string): Promise<void>
  listar(filtros?: FiltrosTorneos): Promise<Torneo[]>
  obtenerPorId(id: string): Promise<Torneo>
}
