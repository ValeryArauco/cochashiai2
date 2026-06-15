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
    Link,
    Snackbar,
} from '@mui/material'
import { useState } from 'react'
import { loginSchema, LoginFormData } from './loginSchema'
import { useLogin } from '../../hooks/useLogin'

const ADDJC_URL = 'https://addjc.vercel.app/login'

export function LoginForm() {
    const { login, cargando, error } = useLogin()
    const [toastAbierto, setToastAbierto] = useState(false)

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

    const handleOlvideContrasena = () => {
        setToastAbierto(true)
        setTimeout(() => {
            window.open(ADDJC_URL, '_blank', 'noopener,noreferrer')
        }, 1500)
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

                {error && (
                    <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
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

                    <Link
                        component="button"
                        type="button"
                        underline="hover"
                        onClick={handleOlvideContrasena}
                        sx={{ mt: 2, display: 'block', width: '100%', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </Box>
            </Paper>

            <Snackbar
                open={toastAbierto}
                autoHideDuration={4000}
                onClose={() => setToastAbierto(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                message="Serás redirigido al sistema ADDJC para cambiar tu contraseña. Los credenciales son los mismos para ambos sistemas."
            />
        </Box>
    )
}
