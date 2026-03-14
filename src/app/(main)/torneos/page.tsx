'use client'

import {
  Box, Grid, Typography, CircularProgress, Alert, Fab, useMediaQuery, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useState } from 'react'
import { useTorneos } from '@/presentation/hooks/useTorneos'
import { useAuth } from '@/presentation/context/AuthContext'
import { FiltrosTorneos } from '@/presentation/components/torneos/FiltrosTorneos'
import { TorneoCard } from '@/presentation/components/torneos/TorneoCard'
import { CrearTorneoModal } from '@/presentation/components/torneos/CrearTorneoModal'
import { SupabaseTorneoRepository } from '@/infrastructure/repositories/SupabaseTorneoRepository'
import { EliminarTorneo } from '@/application/use-cases/torneos/EliminarTorneo'
import { Torneo } from '@/domain/models/Torneo'

const eliminarTorneoUseCase = new EliminarTorneo(new SupabaseTorneoRepository())

export default function TorneosPage() {
  const { usuario } = useAuth()
  const { torneos, cargando, error, filtros, setFiltros, orden, setOrden, recargar } = useTorneos()
  const [modalCrear, setModalCrear] = useState(false)
  const [torneoEliminar, setTorneoEliminar] = useState<Torneo | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)
  const theme = useTheme()
  const esDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  const esAdmin = usuario?.rol === 'admin'

  const handleEliminar = async () => {
    if (!torneoEliminar) return
    setEliminando(true)
    setErrorEliminar(null)
    try {
      await eliminarTorneoUseCase.execute(torneoEliminar.id)
      setTorneoEliminar(null)
      recargar()
    } catch (e: unknown) {
      setErrorEliminar(e instanceof Error ? e.message : 'Error al eliminar')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Torneos
      </Typography>

      <FiltrosTorneos filtros={filtros} onChange={setFiltros} orden={orden} onOrdenChange={setOrden} />

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
                <TorneoCard
                  torneo={torneo}
                  onEliminar={esAdmin ? () => setTorneoEliminar(torneo) : undefined}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {esAdmin && (
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

      <Dialog open={!!torneoEliminar} onClose={() => !eliminando && setTorneoEliminar(null)}>
        <DialogTitle>¿Eliminar torneo?</DialogTitle>
        <DialogContent>
          <Typography>
            &ldquo;{torneoEliminar?.nombre}&rdquo; dejará de ser visible para todos los usuarios.
          </Typography>
          {errorEliminar && <Alert severity="error" sx={{ mt: 2 }}>{errorEliminar}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTorneoEliminar(null)} disabled={eliminando}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={handleEliminar} disabled={eliminando}>
            {eliminando ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
