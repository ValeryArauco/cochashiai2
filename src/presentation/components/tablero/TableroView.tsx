'use client'
import { Box, CircularProgress, Grid, IconButton, Tooltip, Typography } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useTablero } from '@/presentation/hooks/useTablero'
import { TatamiBoard } from './TatamiBoard'

interface Props {
  torneoId: string
}

export function TableroView({ torneoId }: Props) {
  const { torneo, boards, loading, error, refetch } = useTablero(torneoId)

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#04080f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#1565C0' }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#04080f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  const numTatamis = torneo?.numTatamis ?? 0
  const cols = numTatamis <= 2 ? 6 : numTatamis <= 4 ? 6 : 4

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#04080f', p: { xs: 1.5, sm: 2.5 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          pb: 2,
          borderBottom: '1px solid #0f1f38',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              color: '#fff',
              letterSpacing: 1,
              lineHeight: 1.1,
            }}
          >
            {torneo?.nombre ?? 'Tablero'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#4ade80',
              }}
            />
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: 3,
                color: '#4ade80',
              }}
            >
              EN VIVO
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Actualizar ahora">
          <IconButton
            onClick={refetch}
            size="small"
            sx={{
              color: '#4b5563',
              border: '1px solid #1f2937',
              borderRadius: 1.5,
              '&:hover': { color: '#9ca3af', bgcolor: '#111827' },
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2.5}>
        {Array.from({ length: numTatamis }, (_, i) => i + 1).map((tatami) => (
          <Grid key={tatami} size={{ xs: 12, sm: cols, lg: numTatamis >= 5 ? 4 : cols }}>
            <TatamiBoard tatami={tatami} data={boards.get(tatami) ?? null} />
          </Grid>
        ))}
      </Grid>

      {numTatamis === 0 && (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <Typography sx={{ color: '#1f2937', fontSize: '0.9rem', letterSpacing: 1 }}>
            Este torneo no tiene tatamis configurados.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
