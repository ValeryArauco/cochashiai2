import { Torneo, TorneoFecha } from '../../domain/models/Torneo'
import { Categoria, GeneroCategoria, GrupoEdad } from '../../domain/models/Categoria'
import { TorneoCategoria } from '../../domain/models/TorneoCategoria'
import { TorneoDTO, TorneoFechaDTO, TorneoCategoriaDTO } from '../dtos/TorneoDTO'

export class TorneoMapper {
  static fechaToDomain(dto: TorneoFechaDTO): TorneoFecha {
    return {
      id: dto.id,
      torneoId: dto.torneo_id,
      fecha: dto.fecha,
      horaInicio: dto.hora_inicio,
      horaFin: dto.hora_fin,
      descripcion: dto.descripcion,
    }
  }

  static categoriaFromJoin(cat: TorneoCategoriaDTO['categoria']): Categoria {
    return {
      id: cat.id,
      nombre: cat.nombre,
      genero: cat.genero as GeneroCategoria,
      edad: cat.edad as GrupoEdad,
      pesoMinimo: cat.peso_minimo,
      pesoMaximo: cat.peso_maximo,
      activo: cat.activo,
    }
  }

  static torneoCategoriaFromJoin(dto: TorneoCategoriaDTO): TorneoCategoria {
    return {
      id: dto.id,
      torneoId: dto.torneo_id,
      categoriaId: dto.categoria_id,
      fechaTorneoId: dto.fecha_torneo_id,
      categoria: TorneoMapper.categoriaFromJoin(dto.categoria),
    }
  }

  static toDomain(dto: TorneoDTO): Torneo {
    const torneoCategorias = (dto.torneo_categoria ?? []).map(TorneoMapper.torneoCategoriaFromJoin)
    return {
      id: dto.id,
      nombre: dto.nombre,
      fechaLimiteInscripcion: dto.fecha_limite_inscripcion,
      horaLimiteInscripcion: dto.hora_limite_inscripcion,
      ubicacion: dto.ubicacion,
      numTatamis: dto.num_tatamis,
      organizadoPor: dto.organizado_por,
      activo: dto.activo,
      fechas: (dto.torneos_fechas ?? []).map(TorneoMapper.fechaToDomain),
      categorias: torneoCategorias.map(tc => tc.categoria),
      torneoCategorias,
    }
  }
}
