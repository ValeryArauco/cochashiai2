'use client'
import { Box, Avatar, Typography, Divider } from '@mui/material'
import { Usuario } from '../../../domain/models/Usuario'

interface Props {
  perfil: Usuario
}

export function CardIdentidad({ perfil }: Props) {
  const campo = (label: string, valor?: string) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={500}>{valor ?? '—'}</Typography>
      <Divider sx={{ mt: 1 }} />
    </Box>
  )

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar src={perfil.avatarUrl} sx={{ width: 120, height: 120, fontSize: 40 }}>
          {perfil.nombre?.[0]}
        </Avatar>
      </Box>

      {campo('Nombre', perfil.nombre)}
      {campo('Apellido Paterno', perfil.apellidoPaterno)}
      {campo('Apellido Materno', perfil.apellidoMaterno)}
      {campo('Correo', perfil.correo)}
    </Box>
  )
}
