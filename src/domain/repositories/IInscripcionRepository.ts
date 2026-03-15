import { EstadoInscripcion, Inscripcion } from '../models/Inscripcion'

export interface IInscripcionRepository {
  crear(torneoCategoriaId: string, judokaId: string): Promise<Inscripcion>
  listarPorTorneo(torneoId: string, estadoFiltro?: EstadoInscripcion[]): Promise<Inscripcion[]>
  obtenerPorJudokaYTorneo(judokaId: string, torneoId: string): Promise<Inscripcion | null>
  aprobarEntrenador(inscripcionId: string): Promise<void>
  registrarPeso(inscripcionId: string, pesoOficial: number): Promise<void>
  confirmarPago(inscripcionId: string): Promise<void>
  cambiarCategoria(inscripcionId: string, nuevaTorneoCategoriaId: string): Promise<void>
  eliminar(inscripcionId: string): Promise<void>
}
