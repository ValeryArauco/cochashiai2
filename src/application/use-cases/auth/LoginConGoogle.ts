import { IAuthRepository } from '../../../domain/repositories/IAuthRepository'

export class LoginConGoogle {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(redirectTo: string): Promise<void> {
    await this.authRepo.iniciarSesionConGoogle(redirectTo)
  }
}
