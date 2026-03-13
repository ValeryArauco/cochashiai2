import { Categoria, GeneroCategoria, GrupoEdad } from '../../domain/models/Categoria'
import { CategoriaDTO } from '../dtos/CategoriaDTO'

export class CategoriaMapper {
  static toDomain(dto: CategoriaDTO): Categoria {
    return {
      id: dto.id,
      nombre: dto.nombre,
      genero: dto.genero as GeneroCategoria,
      edad: dto.edad as GrupoEdad,
      pesoMinimo: dto.peso_minimo,
      pesoMaximo: dto.peso_maximo,
      activo: dto.activo,
    }
  }
}
