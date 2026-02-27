'use client'

import { useAuth } from "@/presentation/context/AuthContext"
import { useLogin } from "@/presentation/hooks/useLogin"
import { Box, Typography, Button, CircularProgress } from "@mui/material"

function Header() {
    const { usuario, cargando } = useAuth()
    const { logout } = useLogin()

    if (cargando) return null

    return (
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px' }}>
            <span>Hola, {usuario?.nombre ?? usuario?.correo}</span>
            <span>Rol: {usuario?.rol}</span>
            <button onClick={logout}>Cerrar sesión</button>
        </nav>
    )
}

function PanelAdmin() {
    const { usuario } = useAuth()

    if (usuario?.rol !== 'admin') {
        return <p>No tenés permisos para ver esto.</p>
    }

    return <div>Panel de administración...</div>
}

export default function DashboardPage() {
    const { usuario, cargando } = useAuth()

    if (cargando) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', p: 4 }}>
            <Header />
            <Typography variant="h4" sx={{ mt: 4 }}>
                Bienvenido al Dashboard
            </Typography>
            <PanelAdmin />
        </Box>
    )
}