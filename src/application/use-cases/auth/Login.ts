import { IAuthRepository } from '../../../domain/repositories/IAuthRepository'
import { Usuario } from '../../../domain/models/Usuario'

export class Login {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<Usuario> {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos')
    }

    const usuario = await this.authRepo.login(email, password)
    return usuario
  }
}