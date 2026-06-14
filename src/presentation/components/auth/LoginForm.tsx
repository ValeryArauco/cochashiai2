'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    Divider,
    Link,
} from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { loginSchema, LoginFormData } from './loginSchema'
import { useLogin } from '../../hooks/useLogin'

const ERRORES_URL: Record<string, string> = {
    no_registrado: 'El correo de tu cuenta de Google no está registrado en el sistema. Intenta con otro correo o contacta al administrador.',
    sin_sesion:    'No se pudo completar el inicio de sesión. Por favor, intenta de nuevo.',
}

function GoogleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    )
}

function ErrorDeUrl() {
    const params = useSearchParams()
    const key = params.get('error') ?? ''
    const mensaje = ERRORES_URL[key]
    if (!mensaje) return null
    return <Alert severity="warning" sx={{ mb: 2 }}>{mensaje}</Alert>
}

export function LoginForm() {
    const { login, loginConGoogle, cargando, error } = useLogin()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = (data: LoginFormData) => {
        login(data.email, data.password)
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 420, backgroundColor: 'transparent' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" mt={1}>
                        Iniciar Sesión
                    </Typography>
                </Box>

                {/* Error del servidor / credenciales incorrectas */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Error devuelto por la URL (callback de Google) */}
                <ErrorDeUrl />

                {/* ── Botón Google ─────────────────────────────────────── */}
                <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={loginConGoogle}
                    disabled={cargando}
                    startIcon={<GoogleIcon />}
                    sx={{
                        mt: 2,
                        borderColor: 'divider',
                        color: 'text.primary',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                    }}
                >
                    {cargando ? <CircularProgress size={22} color="inherit" /> : 'Continuar con Google'}
                </Button>

                <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">o</Typography>
                </Divider>

                {/* ── Formulario email / contraseña ─────────────────────── */}
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        {...register('email')}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        disabled={cargando}
                    />

                    <TextField
                        label="Contraseña"
                        type="password"
                        fullWidth
                        margin="normal"
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        disabled={cargando}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={cargando}
                        sx={{ mt: 2 }}
                    >
                        {cargando ? <CircularProgress size={24} color="inherit" /> : 'Iniciar sesión'}
                    </Button>

                    <Link href="#" underline="hover" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                        ¿Olvidaste tu contraseña?
                    </Link>
                </Box>
            </Paper>
        </Box>
    )
}
