'use client'
import { Box, Typography, IconButton, CircularProgress, Alert } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from 'next/navigation'
import { useJudoka } from '@/presentation/hooks/useJudoka'
import { useAuth } from '@/presentation/context/AuthContext'
import { CardIdentidad } from '@/presentation/components/perfil/CardIdentidad'
import { FormPerfil } from '@/presentation/components/perfil/FormPerfil'

export default function PerfilPage() {
  const router = useRouter()
  const { usuario } = useAuth()
  const { judoka, cargando, error, exito, guardar, guardando } = useJudoka()

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!judoka) {
    return (
      <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Alert severity={usuario?.rol !== 'judoka' ? 'warning' : 'error'}>
          {usuario?.rol !== 'judoka'
            ? 'No tienes acceso a esta página. Esta sección es solo para judokas.'
            : 'No se pudo cargar tu perfil.'}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>Mi Perfil</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 3, alignItems: 'start' }}>
        <CardIdentidad perfil={judoka.usuario} />
        <FormPerfil
          judoka={judoka}
          guardando={guardando}
          error={error}
          exito={exito}
          onGuardar={guardar}
        />
      </Box>
    </Box>
  )
}
