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
    Link
} from '@mui/material'
import { loginSchema, LoginFormData } from './loginSchema'
import { useLogin } from '../../hooks/useLogin'

export function LoginForm() {
    const { login, cargando, error } = useLogin()

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

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

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

                    <Link href="#" underline="hover" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>¿Olvidaste tu contraseña?</Link>
                </Box>
            </Paper>
        </Box>
    )
}