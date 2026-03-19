import { Combate, EstadoCombate } from '../models/Combate'
import { Llave, TipoBracket } from '../models/Llave'

export interface ILlaveRepository {
  crear(
    torneoCategoriaId: string,
    combates: Omit<Combate, 'id'>[],
    tipoBracket: TipoBracket,
    numParticipantes: number,
    estructura: object,
    generadoPor: string
  ): Promise<Llave>
  obtenerPorTorneoCategoria(torneoCategoriaId: string): Promise<Llave | null>
  listarCombatesPorLlave(llaveId: string): Promise<Combate[]>
  actualizarResultadoCombate(combateId: string, resultado: Partial<Combate>): Promise<Combate>
  actualizarEstadoCombate(combateId: string, estado: EstadoCombate): Promise<Combate>
  actualizarTatamiCombate(combateId: string, tatami: number): Promise<Combate>
  listarCombatesPorTorneoYTatami(torneoId: string, tatami: number): Promise<Combate[]>
}
