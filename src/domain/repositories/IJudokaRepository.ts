import { Judoka } from '../models/Judoka'

export interface IJudokaRepository {
  obtenerPorUsuarioId(usuarioId: string): Promise<Judoka | null>
  obtenerPorId(id: string): Promise<Judoka>
  
  actualizar(id: string, datos: Partial<Judoka>): Promise<Judoka>
}