import { supabase } from '../../lib/supabase'
import { ICategoriaRepository } from '../../domain/repositories/ICategoriaRepository'
import { Categoria } from '../../domain/models/Categoria'
import { CategoriaMapper } from '../mappers/CategoriaMapper'
import { CategoriaDTO } from '../dtos/CategoriaDTO'

export class SupabaseCategoriaRepository implements ICategoriaRepository {
  async listarActivas(): Promise<Categoria[]> {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('activo', true)
      .order('edad')
      .order('genero')
      .order('peso_minimo', { nullsFirst: true })

    if (error) throw new Error('No se pudieron cargar las categorías')
    return (data as CategoriaDTO[]).map(CategoriaMapper.toDomain)
  }
}
