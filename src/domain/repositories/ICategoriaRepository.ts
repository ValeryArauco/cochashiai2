import { Categoria } from '../models/Categoria'

export interface ICategoriaRepository {
  listarActivas(): Promise<Categoria[]>
}
