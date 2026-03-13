'use client'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, Typography,
} from '@mui/material'
import { useState } from 'react'
import { TipoBracket } from '../../../domain/models/Llave'

const TIPOS: { value: TipoBracket; label: string; descripcion: string }[] = [
  { value: 'single_elimination', label: 'Eliminación simple', descripcion: 'El judoka queda eliminado al perder un combate' },
  { value: 'double_elimination', label: 'Eliminación doble', descripcion: 'El judoka necesita perder dos combates para quedar eliminado' },
]

interface Props {
  abierto: boolean
  onCerrar: () => void
  onGenerar: (tipo: TipoBracket) => void
  generando: boolean
  error: string | null
}

export function GenerarLlavesModal({ abierto, onCerrar, onGenerar, generando, error }: Props) {
  const [tipo, setTipo] = useState<TipoBracket>('single_elimination')

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>Generar llaves</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <Typography variant="body2" color="text.secondary">
          Las llaves se generan aleatoriamente con los participantes aprobados.
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Tipo de bracket</InputLabel>
          <Select label="Tipo de bracket" value={tipo} onChange={e => setTipo(e.target.value as TipoBracket)}>
            {TIPOS.map(t => (
              <MenuItem key={t.value} value={t.value}>
                <div>
                  <Typography variant="body2">{t.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{t.descripcion}</Typography>
                </div>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar} disabled={generando}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={() => onGenerar(tipo)}
          disabled={generando}
          startIcon={generando ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {generando ? 'Generando...' : 'Generar llaves'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
