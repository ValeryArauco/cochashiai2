import { Categoria } from './Categoria'
import { TorneoCategoria } from './TorneoCategoria'

export interface TorneoFecha {
  id: string
  torneoId: string
  fecha: string
  horaInicio: string
  horaFin: string
  descripcion?: string
}

export interface Torneo {
  id: string
  nombre: string
  fechaLimiteInscripcion: string
  horaLimiteInscripcion?: string
  ubicacion: string
  numTatamis: number
  organizadoPor?: string
  activo: boolean
  fechas: TorneoFecha[]
  categorias: Categoria[]
  torneoCategorias: TorneoCategoria[]
}
