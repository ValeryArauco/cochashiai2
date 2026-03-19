'use client'
import { AppBar, Box, Toolbar, Typography, Avatar, Button, Menu, MenuItem, ListItemIcon, Divider, Tooltip, IconButton } from "@mui/material";
import { useAuth } from "@/presentation/context/AuthContext";
import { useLogin } from "@/presentation/hooks/useLogin";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';

export function TopBar() {
    const { usuario } = useAuth()
    const { logout } = useLogin()
    const router = useRouter()
    const pathname = usePathname()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const abrirMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
    const cerrarMenu = () => setAnchorEl(null)

    const manejarLogout = async () => {
        cerrarMenu()
        await logout()
    }
    const manejarPerfil = () => {
        cerrarMenu()
        router.push('/perfil')
    }
    return (
        <AppBar position="sticky" color="default" elevation={0} sx={{ zIndex: 10 }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {usuario?.rol === 'admin' && (
                    <Tooltip title="Reportes">
                        <IconButton
                            onClick={() => router.push('/reportes')}
                            color={pathname === '/reportes' ? 'primary' : 'default'}
                            sx={{ mr: 1 }}
                        >
                            <BarChartIcon />
                        </IconButton>
                    </Tooltip>
                )}

                <Button
                    color="inherit"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                    <Avatar sx={{ width: 40, height: 40 }} src={usuario?.avatarUrl} alt="Avatar">{usuario?.avatarUrl ? '' : (usuario?.nombre?.charAt(0)?.toUpperCase() ?? 'U') + (usuario?.apellidoPaterno?.charAt(0)?.toUpperCase() ?? '')}</Avatar>
                    <Box sx={{ flexDirection: 'column', textAlign: 'left', display: { xs: 'none', md: 'flex' } }}>
                        <Typography variant="body1" sx={{ color: 'text.primary' }} >
                            {usuario?.nombre ? [usuario.nombre, usuario.apellidoPaterno].filter(Boolean).join(' ') : 'Usuario'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {usuario?.correo}
                        </Typography>
                    </Box>
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={cerrarMenu}>

                    {usuario?.rol === 'judoka' && (
                    <MenuItem onClick={manejarPerfil}>
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    Mi perfil
                    </MenuItem>
                )}

                {usuario?.rol === 'judoka' && <Divider />}

                    <MenuItem onClick={manejarLogout}>
                        <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                        Cerrar sesión
                    </MenuItem>

                </Menu>

            </Toolbar>
        </AppBar>
    )
}