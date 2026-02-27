import { IAuthRepository } from '../../../domain/repositories/IAuthRepository'

export class Logout {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepo.logout()
  }
}