'use client'
import {
  Card, CardActionArea, CardContent, CardActions, Typography, Chip, Box, Stack, IconButton, Tooltip,
} from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DeleteIcon from '@mui/icons-material/Delete'
import { useRouter } from 'next/navigation'
import { Torneo } from '../../../domain/models/Torneo'

function formatearFecha(fecha: string) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

interface Props {
  torneo: Torneo
  onEliminar?: () => void
}

export function TorneoCard({ torneo, onEliminar }: Props) {
  const router = useRouter()
  const inscripcionAbierta = new Date() <= new Date(
    `${torneo.fechaLimiteInscripcion}T${torneo.horaLimiteInscripcion ?? '23:59:59'}`
  )

  const fechasOrdenadas = [...torneo.fechas].sort((a, b) => a.fecha.localeCompare(b.fecha))
  const fechaInicio = fechasOrdenadas[0]?.fecha
  const fechaFin = fechasOrdenadas[fechasOrdenadas.length - 1]?.fecha

  return (
    <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => router.push(`/torneos/${torneo.id}`)} sx={{ flex: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Typography variant="h6" fontWeight={700} lineHeight={1.3} sx={{ flex: 1, mr: 1 }}>
              {torneo.nombre}
            </Typography>
            <Chip
              label={inscripcionAbierta ? 'Abierto' : 'Cerrado'}
              color={inscripcionAbierta ? 'success' : 'default'}
              size="small"
            />
          </Box>

          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" noWrap>
                {torneo.ubicacion}
              </Typography>
            </Box>

            {fechaInicio && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {fechaInicio === fechaFin
                    ? formatearFecha(fechaInicio)
                    : `${formatearFecha(fechaInicio)} — ${formatearFecha(fechaFin!)}`}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Límite inscripción: {formatearFecha(torneo.fechaLimiteInscripcion)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>

      {onEliminar && (
        <CardActions sx={{ justifyContent: 'flex-end', pt: 0, px: 2, pb: 1 }}>
          <Tooltip title="Eliminar torneo">
            <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); onEliminar() }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  )
}
