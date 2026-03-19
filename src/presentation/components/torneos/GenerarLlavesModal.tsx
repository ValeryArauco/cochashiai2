'use client'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, InputLabel, Select, MenuItem,
  Alert, CircularProgress, Typography, Box,
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import { useState } from 'react'
import { TipoBracket } from '../../../domain/models/Llave'
import { TipoSeed } from '../../hooks/useLlaves'

const TIPOS_SEED: { value: TipoSeed; label: string; descripcion: string }[] = [
  {
    value: 'cinturon',
    label: 'Por cinturón',
    descripcion: 'Negro > Café > Azul > Verde > Naranja > Amarillo > Blanco',
  },
]

interface Props {
  abierto: boolean
  onCerrar: () => void
  onGenerar: (tipo: TipoBracket, tipoSeed: TipoSeed) => void
  generando: boolean
  error: string | null
}

export function GenerarLlavesModal({ abierto, onCerrar, onGenerar, generando, error }: Props) {
  const [tipoSeed, setTipoSeed] = useState<TipoSeed>('cinturon')

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>Generar llaves</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
          Solo participan judokas con estado <strong>confirmado</strong> y pago registrado.
          El cuadro usa eliminación simple con <strong>repesca de cuartos de final</strong>
          (2 medallas de bronce). Los mejores sembrados reciben bye automático.
        </Alert>

        <FormControl fullWidth>
          <InputLabel>Criterio de clasificación (seed)</InputLabel>
          <Select
            label="Criterio de clasificación (seed)"
            value={tipoSeed}
            onChange={(e: SelectChangeEvent) => setTipoSeed(e.target.value as TipoSeed)}
          >
            {TIPOS_SEED.map(t => (
              <MenuItem key={t.value} value={t.value}>
                <Box>
                  <Typography variant="body2">{t.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{t.descripcion}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="caption" color="text.secondary">
          Reglas aplicadas: seeds 1 y 2 solo se pueden encontrar en la final · judokas del
          mismo club se separan en pools distintos · se evitan enfrentamientos Blanco vs Café/Negro
          en primera ronda.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar} disabled={generando}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={() => onGenerar('single_elimination', tipoSeed)}
          disabled={generando}
          startIcon={generando ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {generando ? 'Generando...' : 'Generar llaves'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
