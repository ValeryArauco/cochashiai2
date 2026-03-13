'use client'
import { Box, Typography, Chip, Stack, Divider } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts'
import { Torneo } from '../../../domain/models/Torneo'

function formatFecha(f: string) {
  return new Date(f + 'T00:00:00').toLocaleDateString('es-BO', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })
}

export function TorneoDetalleHeader({ torneo }: { torneo: Torneo }) {
  const inscripcionAbierta = new Date() <= new Date(
    `${torneo.fechaLimiteInscripcion}T${torneo.horaLimiteInscripcion ?? '23:59:59'}`
  )

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
        <Typography variant="h4" fontWeight={700} flex={1}>{torneo.nombre}</Typography>
        <Chip
          label={inscripcionAbierta ? 'Inscripción abierta' : 'Inscripción cerrada'}
          color={inscripcionAbierta ? 'success' : 'default'}
        />
      </Box>

      <Stack spacing={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOnIcon color="action" fontSize="small" />
          <Typography color="text.secondary">{torneo.ubicacion}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon color="action" fontSize="small" />
          <Typography color="text.secondary">
            Límite de inscripción: {formatFecha(torneo.fechaLimiteInscripcion)}
            {torneo.horaLimiteInscripcion ? ` a las ${torneo.horaLimiteInscripcion}` : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SportsMartialArtsIcon color="action" fontSize="small" />
          <Typography color="text.secondary">{torneo.numTatamis} tatami{torneo.numTatamis !== 1 ? 's' : ''}</Typography>
        </Box>
      </Stack>
      <Divider sx={{ mt: 2 }} />
    </Box>
  )
}
