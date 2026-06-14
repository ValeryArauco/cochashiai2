import { supabase } from '../../lib/supabase'
import { IAuthRepository } from '../../domain/repositories/IAuthRepository'
import { Usuario } from '../../domain/models/Usuario'
import { UsuarioMapper } from '../mappers/UsuarioMapper'
import { UsuarioDTO } from '../dtos/UsuarioDTO'

export class SupabaseAuthRepository implements IAuthRepository {

  async login(email: string, password: string): Promise<Usuario> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new Error('Correo o contraseña incorrectos')
      }
      throw new Error(error.message)
    }

    return await this.obtenerDatosUsuario(data.user.id, data.user.email ?? undefined)
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }

  async obtenerSesionActual(): Promise<Usuario | null> {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return null
    return await this.obtenerDatosUsuario(
      data.session.user.id,
      data.session.user.email ?? undefined,
    )
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

  private async obtenerDatosUsuario(authUserId: string, email?: string): Promise<Usuario> {
    // Ruta principal: email/contraseña — auth_user_id coincide directamente
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle()

    if (data) return UsuarioMapper.toDomain(data as UsuarioDTO)

    // Fallback para Google OAuth: Supabase crea un auth_user_id diferente al del
    // registro original. La política RLS debe permitir correo = auth.email() para
    // que esta consulta funcione. El email viene de getSession(), nunca de getUser().
    if (!email) throw new Error('No se encontró el perfil del usuario')

    const { data: byEmail } = await supabase
      .from('usuarios')
      .select('*')
      .ilike('correo', email)
      .maybeSingle()

    if (!byEmail) throw new Error('No se encontró el perfil del usuario')
    return UsuarioMapper.toDomain(byEmail as UsuarioDTO)
  }
}
