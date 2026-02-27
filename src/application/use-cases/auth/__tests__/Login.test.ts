import { Login } from '../Login'
import { IAuthRepository } from '../../../../domain/repositories/IAuthRepository'
import { Usuario } from '../../../../domain/models/Usuario'

const mockAuthRepo: jest.Mocked<IAuthRepository> = {
    login: jest.fn(),
    logout: jest.fn(),
    obtenerSesionActual: jest.fn(),
}

const loginUseCase = new Login(mockAuthRepo)

const usuarioMock: Usuario = {
    id: 'abc123',
    correo: 'juanito@judo.com',
    rol: 'judoka',
    nombre: 'Juanito',
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('Login - caso de uso', () => {

    test('login exitoso → retorna el usuario', async () => {
        mockAuthRepo.login.mockResolvedValue(usuarioMock)

        const resultado = await loginUseCase.execute('juanito@judo.com', '123456')

        expect(mockAuthRepo.login).toHaveBeenCalledWith('juanito@judo.com', '123456')
        expect(resultado).toEqual(usuarioMock)
    })

    test('email vacío → lanza error', async () => {
        await expect(loginUseCase.execute('', '123456'))
            .rejects
            .toThrow('Email y contraseña son requeridos')

        expect(mockAuthRepo.login).not.toHaveBeenCalled()
    })

    test('contraseña vacía → lanza error', async () => {
        await expect(loginUseCase.execute('juanito@judo.com', ''))
            .rejects
            .toThrow('Email y contraseña son requeridos')

        expect(mockAuthRepo.login).not.toHaveBeenCalled()
    })

    test('credenciales incorrectas → lanza error del repositorio', async () => {
        mockAuthRepo.login.mockRejectedValue(new Error('Correo o contraseña incorrectos'))

        await expect(loginUseCase.execute('mal@email.com', 'wrongpass'))
            .rejects
            .toThrow('Correo o contraseña incorrectos')

        expect(mockAuthRepo.login).toHaveBeenCalledWith('mal@email.com', 'wrongpass')
    })

})
