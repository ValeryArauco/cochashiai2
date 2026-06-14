import { Usuario } from '../models/Usuario'

export interface IAuthRepository {
  login(email: string, password: string): Promise<Usuario>
  logout(): Promise<void>
  obtenerSesionActual(): Promise<Usuario | null>
  listarUsuariosMesa(): Promise<Usuario[]>
  actualizarTatamiAsignado(usuarioId: string, tatami: number | null): Promise<void>
  iniciarSesionConGoogle(redirectTo: string): Promise<void>
}