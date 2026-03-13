'use client'

import {
  Box, Grid, Typography, CircularProgress, Alert, Fab, useMediaQuery, useTheme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useState } from 'react'
import { useTorneos } from '@/presentation/hooks/useTorneos'
import { useAuth } from '@/presentation/context/AuthContext'
import { FiltrosTorneos } from '@/presentation/components/torneos/FiltrosTorneos'
import { TorneoCard } from '@/presentation/components/torneos/TorneoCard'
import { CrearTorneoModal } from '@/presentation/components/torneos/CrearTorneoModal'

export default function TorneosPage() {
  const { usuario } = useAuth()
  const { torneos, cargando, error, filtros, setFiltros, recargar } = useTorneos()
  const [modalCrear, setModalCrear] = useState(false)
  const theme = useTheme()
  const esDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Torneos
      </Typography>

      <FiltrosTorneos filtros={filtros} onChange={setFiltros} />

      <Box sx={{ mt: 3 }}>
        {cargando && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!cargando && error && (
          <Alert severity="error">{error}</Alert>
        )}

        {!cargando && !error && torneos.length === 0 && (
          <Typography color="text.secondary" textAlign="center" mt={6}>
            No hay torneos para el período seleccionado.
          </Typography>
        )}

        {!cargando && torneos.length > 0 && (
          <Grid container spacing={2}>
            {torneos.map(torneo => (
              <Grid key={torneo.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <TorneoCard torneo={torneo} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {usuario?.rol === 'admin' && (
        <Fab
          color="primary"
          variant={esDesktop ? 'extended' : 'circular'}
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
          onClick={() => setModalCrear(true)}
          aria-label="Crear torneo"
        >
          <AddIcon sx={esDesktop ? { mr: 1 } : undefined} />
          {esDesktop && 'Crear torneo'}
        </Fab>
      )}

      <CrearTorneoModal
        abierto={modalCrear}
        onCerrar={() => setModalCrear(false)}
        onExito={() => { setModalCrear(false); recargar() }}
      />
    </Box>
  )
}
