import { Inscripcion, EstadoInscripcion } from '../../domain/models/Inscripcion'
import { Categoria, GeneroCategoria, GrupoEdad } from '../../domain/models/Categoria'
import { TorneoCategoria } from '../../domain/models/TorneoCategoria'
import { Judoka } from '../../domain/models/Judoka'
import { UsuarioMapper } from './UsuarioMapper'
import { InscripcionDTO } from '../dtos/InscripcionDTO'

export class InscripcionMapper {
  static toDomain(dto: InscripcionDTO): Inscripcion {
    let judoka: Judoka | undefined
    if (dto.judoka) {
      judoka = {
        id: dto.judoka.id,
        usuarioId: dto.judoka.usuario_id,
        cinturon: dto.judoka.cinturon_actual as Judoka['cinturon'],
        peso: dto.judoka.peso_competitivo,
        usuario: UsuarioMapper.toDomain(dto.judoka.usuario as Parameters<typeof UsuarioMapper.toDomain>[0]),
      }
    }

    let torneoCategoria: TorneoCategoria | undefined
    if (dto.torneo_categoria) {
      const cat = dto.torneo_categoria.categoria
      const categoria: Categoria = {
        id: cat.id,
        nombre: cat.nombre,
        genero: cat.genero as GeneroCategoria,
        edad: cat.edad as GrupoEdad,
        pesoMinimo: cat.peso_minimo,
        pesoMaximo: cat.peso_maximo,
        activo: cat.activo,
      }
      torneoCategoria = {
        id: dto.torneo_categoria.id,
        torneoId: dto.torneo_categoria.torneo_id,
        categoriaId: dto.torneo_categoria.categoria_id,
        categoria,
      }
    }

    return {
      id: dto.id,
      torneoCategoriaId: dto.torneo_categoria_id,
      judokaId: dto.judoka_id,
      pesoOficial: dto.peso_oficial,
      aprobadoPorSenseiId: dto.aprobado_por_sensei_id,
      fechaAprobacionSensei: dto.fecha_aprobacion_sensei,
      estado: dto.estado as EstadoInscripcion,
      judoka,
      torneoCategoria,
    }
  }
}
