'use client'
import { Box, Typography, IconButton, CircularProgress } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from 'next/navigation'
import { useJudoka } from '@/presentation/hooks/useJudoka'
import { CardIdentidad } from '@/presentation/components/perfil/CardIdentidad'
import { FormPerfil } from '@/presentation/components/perfil/FormPerfil'

export default function PerfilPage() {
  const router = useRouter()
  const { judoka, cargando, error, exito, guardar, guardando} = useJudoka()

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!judoka) return null

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