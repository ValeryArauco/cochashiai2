import { supabase } from '../../lib/supabase'
import { IAuthRepository } from '../../domain/repositories/IAuthRepository'
import { Usuario, RolUsuario } from '../../domain/models/Usuario'
import { UsuarioMapper } from '../mappers/UsuarioMapper'
import { UsuarioDTO } from '../dtos/UsuarioDTO'

export class SupabaseAuthRepository implements IAuthRepository {

  async login(email: string, password: string): Promise<Usuario> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new Error('Correo o contraseña incorrectos')
      }
      throw new Error(error.message)
    }

    return await this.obtenerDatosUsuario(data.user.id)
  }

  async logout(): Promise<void> {
    
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }

  async obtenerSesionActual(): Promise<Usuario | null> {
    const { data } = await supabase.auth.getSession()

    if (!data.session) return null

    return await this.obtenerDatosUsuario(data.session.user.id)
  }

  async listarUsuariosMesa(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('rol', 'mesa')
      .order('nombre')

    if (error) throw new Error('No se pudieron cargar los operadores de mesa')
    return (data as UsuarioDTO[]).map(UsuarioMapper.toDomain)
  }

  async actualizarTatamiAsignado(usuarioId: string, tatami: number | null): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .update({ tatami_asignado: tatami })
      .eq('id', usuarioId)

    if (error) throw new Error('No se pudo actualizar el tatami asignado')
  }

  async iniciarSesionConGoogle(redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) throw new Error(error.message)
  }

  private async obtenerDatosUsuario(authUserId: string): Promise<Usuario> {
    // Ruta principal: login por email/contraseña — el auth_user_id coincide directamente
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle()

    if (data) return UsuarioMapper.toDomain(data as UsuarioDTO)

    // Fallback para OAuth (Google): Supabase puede crear un auth_user_id distinto
    // si "link identity" no está habilitado. Buscamos por correo del usuario de sesión.
    const { data: authData } = await supabase.auth.getUser()
    const email = authData.user?.email
    if (!email) throw new Error('No se encontró el perfil del usuario')

    const { data: byEmail } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', email)
      .maybeSingle()

    if (!byEmail) throw new Error('No se encontró el perfil del usuario')
    return UsuarioMapper.toDomain(byEmail as UsuarioDTO)
  }
}