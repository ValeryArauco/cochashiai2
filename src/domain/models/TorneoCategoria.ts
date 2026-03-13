import { Categoria } from './Categoria'

export interface TorneoCategoria {
  id: string
  torneoId: string
  categoriaId: string
  fechaTorneoId?: string
  categoria: Categoria
}
