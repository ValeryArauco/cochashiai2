'use client'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Alert, CircularProgress, Typography, Box,
  List, ListItem, ListItemIcon, ListItemText, LinearProgress,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { ResultadoCategoria, ProgresoGeneracion } from '../../hooks/useGenerarTorneo'

const SISTEMA_LABEL: Record<string, string> = {
  round_robin: 'Liguilla',
  single_elimination: 'Eliminatoria',
}

interface Props {
  abierto: boolean
  onCerrar: () => void
  onGenerar: () => void
  generando: boolean
  progreso: ProgresoGeneracion | null
  resultados: ResultadoCategoria[] | null
  error: string | null
  totalCategorias: number
}

export function GenerarTodasLlavesModal({
  abierto, onCerrar, onGenerar,
  generando, progreso, resultados, error, totalCategorias,
}: Props) {

  const exitosas = resultados?.filter(r => r.ok).length ?? 0
  const fallidas = resultados?.filter(r => !r.ok).length ?? 0

  return (
    <Dialog open={abierto} onClose={generando ? undefined : onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>Generar llaves — todas las categorías</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>

        {error && <Alert severity="error">{error}</Alert>}

        {!generando && !resultados && (
          <>
            <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
              Se generarán llaves para <strong>todas las {totalCategorias} categorías</strong> del torneo.
              El sistema elige automáticamente:
              <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
                <li><strong>Liguilla</strong> — 2 a 5 participantes (todos contra todos)</li>
                <li><strong>Eliminatoria directa</strong> — 6 o más (bracket con repesca)</li>
              </ul>
              Solo participan judokas con estado <strong>confirmado</strong> y pago registrado.
              Las categorías sin participantes suficientes se omiten con un aviso.
            </Alert>
            <Typography variant="caption" color="text.secondary">
              Criterio de clasificación: por cinturón (Negro &gt; Café &gt; Azul &gt; Verde &gt; Naranja &gt; Amarillo &gt; Blanco).
              Seeds 1 y 2 en halveas opuestas · mismos clubes separados en pools distintos.
            </Typography>
          </>
        )}

        {generando && progreso && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="body2">
              Generando {progreso.actual} de {progreso.total}…
            </Typography>
            {progreso.categoriaActual && (
              <Typography variant="caption" color="text.secondary">
                {progreso.categoriaActual}
              </Typography>
            )}
            <LinearProgress
              variant="determinate"
              value={progreso.total > 0 ? (progreso.actual / progreso.total) * 100 : 0}
            />
          </Box>
        )}

        {resultados && (
          <Box>
            <Alert severity={fallidas === 0 ? 'success' : exitosas === 0 ? 'error' : 'warning'} sx={{ mb: 1.5 }}>
              {exitosas} categoría{exitosas !== 1 ? 's' : ''} generada{exitosas !== 1 ? 's' : ''} correctamente
              {fallidas > 0 && ` · ${fallidas} con error`}
            </Alert>
            <List dense disablePadding>
              {resultados.map(r => (
                <ListItem key={r.torneoCategoriaId} disableGutters sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {r.ok
                      ? <CheckCircleIcon fontSize="small" color="success" />
                      : <ErrorIcon fontSize="small" color="error" />
                    }
                  </ListItemIcon>
                  <ListItemText
                    primary={r.nombreCategoria}
                    secondary={
                      r.ok
                        ? `${SISTEMA_LABEL[r.sistema] ?? r.sistema} · ${r.N} participantes`
                        : r.error
                    }
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption', color: r.ok ? 'text.secondary' : 'error' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCerrar} disabled={generando}>
          {resultados ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!resultados && (
          <Button
            variant="contained"
            onClick={onGenerar}
            disabled={generando}
            startIcon={generando ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {generando ? 'Generando…' : 'Generar todas'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
