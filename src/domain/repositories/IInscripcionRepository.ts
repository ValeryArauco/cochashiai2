import { EstadoInscripcion, Inscripcion } from '../models/Inscripcion'

export interface IInscripcionRepository {
  crear(torneoCategoriaId: string, judokaId: string): Promise<Inscripcion>
  listarPorTorneo(torneoId: string, estadoFiltro?: EstadoInscripcion[]): Promise<Inscripcion[]>
  obtenerPorJudokaYTorneo(judokaId: string, torneoId: string): Promise<Inscripcion | null>
  aprobarSensei(inscripcionId: string, usuarioId: string): Promise<void>
  aprobarAdmin(inscripcionId: string, pesoOficial: number): Promise<void>
  cambiarCategoria(inscripcionId: string, nuevaTorneoCategoriaId: string): Promise<void>
  eliminar(inscripcionId: string): Promise<void>
}
