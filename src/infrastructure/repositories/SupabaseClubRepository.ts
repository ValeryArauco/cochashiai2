import { supabase } from '../../lib/supabase'
import { IClubRepository } from '../../domain/repositories/IClubRepository'
import { Club } from '../../domain/models/Club'
import { ClubMapper } from '../mappers/ClubMapper'
import { ClubDTO } from '../dtos/ClubDTO'

export class SupabaseClubRepository implements IClubRepository {
  async listarActivos(): Promise<Club[]> {
    const { data, error } = await supabase
      .from('clubes')
      .select('*')
      .eq('activo', true)
      .order('nombre_club')

    if (error) throw new Error('No se pudieron cargar los clubes')
    return (data as ClubDTO[]).map(ClubMapper.toDomain)
  }
}
