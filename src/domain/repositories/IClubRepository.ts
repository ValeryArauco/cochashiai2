import { Club } from '../models/Club'

export interface IClubRepository {
  listarActivos(): Promise<Club[]>
}
