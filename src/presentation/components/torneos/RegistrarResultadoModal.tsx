'use client'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Stack, TextField, Divider,
  FormControl, InputLabel, Select, MenuItem, Alert,
} from '@mui/material'
import { useState } from 'react'
import { Combate, TipoVictoria } from '../../../domain/models/Combate'

interface Props {
  abierto: boolean
  onCerrar: () => void
  combate: Combate
  onGuardar: (combateId: string, resultado: Partial<Combate>) => Promise<void>
}

const TIPOS_VICTORIA: { value: TipoVictoria; label: string }[] = [
  { value: 'ippon',          label: 'Ippon' },
  { value: 'wazari',         label: 'Wazari acumulado' },
  { value: 'decision',       label: 'Decisión de árbitros' },
  { value: 'descalificacion',label: 'Descalificación' },
  { value: 'wo',             label: 'W.O.' },
]

function nombreJudoka(j?: Combate['judoka1']): string {
  if (!j) return '—'
  return `${j.usuario.nombre} ${j.usuario.apellidoPaterno ?? ''}`
}

export function RegistrarResultadoModal({ abierto, onCerrar, combate, onGuardar }: Props) {
  const [j1Ippones,  setJ1Ippones]  = useState(combate.judoka1Ippones)
  const [j1Wazaris,  setJ1Wazaris]  = useState(combate.judoka1Wazaris)
  const [j1Shidos,   setJ1Shidos]   = useState(combate.judoka1Shidos)
  const [j2Ippones,  setJ2Ippones]  = useState(combate.judoka2Ippones)
  const [j2Wazaris,  setJ2Wazaris]  = useState(combate.judoka2Wazaris)
  const [j2Shidos,   setJ2Shidos]   = useState(combate.judoka2Shidos)
  const [ganadorId,  setGanadorId]  = useState<string>(combate.ganadorId ?? '')
  const [tipoVictoria, setTipoVictoria] = useState<TipoVictoria | ''>(combate.tipoVictoria ?? '')
  const [guardando,  setGuardando]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const numInput = (val: number, set: (v: number) => void) => (
    <TextField
      type="number"
      value={val}
      onChange={e => set(Math.max(0, Number(e.target.value)))}
      inputProps={{ min: 0, style: { textAlign: 'center' } }}
      size="small"
      sx={{ width: 70 }}
    />
  )

  const handleGuardar = async () => {
    if (!ganadorId) { setError('Selecciona un ganador'); return }
    if (!tipoVictoria) { setError('Selecciona el tipo de victoria'); return }
    setError(null)
    setGuardando(true)
    try {
      await onGuardar(combate.id, {
        judoka1Ippones: j1Ippones,
        judoka1Wazaris: j1Wazaris,
        judoka1Shidos:  j1Shidos,
        judoka2Ippones: j2Ippones,
        judoka2Wazaris: j2Wazaris,
        judoka2Shidos:  j2Shidos,
        ganadorId,
        tipoVictoria,
        estado: 'finalizado',
      })
      onCerrar()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar resultado</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        {/* Scores */}
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          {/* Judoka 1 */}
          <Stack alignItems="center" spacing={1} flex={1}>
            <Typography variant="subtitle2">{nombreJudoka(combate.judoka1)}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {numInput(j1Ippones, setJ1Ippones)}
              <Typography variant="caption" color="text.secondary">I</Typography>
              {numInput(j1Wazaris, setJ1Wazaris)}
              <Typography variant="caption" color="text.secondary">W</Typography>
              {numInput(j1Shidos, setJ1Shidos)}
              <Typography variant="caption" color="text.secondary">S</Typography>
            </Stack>
          </Stack>

          <Divider orientation="vertical" flexItem />

          {/* Judoka 2 */}
          <Stack alignItems="center" spacing={1} flex={1}>
            <Typography variant="subtitle2">{nombreJudoka(combate.judoka2)}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {numInput(j2Ippones, setJ2Ippones)}
              <Typography variant="caption" color="text.secondary">I</Typography>
              {numInput(j2Wazaris, setJ2Wazaris)}
              <Typography variant="caption" color="text.secondary">W</Typography>
              {numInput(j2Shidos, setJ2Shidos)}
              <Typography variant="caption" color="text.secondary">S</Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* Ganador */}
        <FormControl fullWidth size="small">
          <InputLabel>Ganador</InputLabel>
          <Select label="Ganador" value={ganadorId} onChange={e => setGanadorId(e.target.value)}>
            {combate.judoka1Id && (
              <MenuItem value={combate.judoka1Id}>{nombreJudoka(combate.judoka1)}</MenuItem>
            )}
            {combate.judoka2Id && (
              <MenuItem value={combate.judoka2Id}>{nombreJudoka(combate.judoka2)}</MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Tipo victoria */}
        <FormControl fullWidth size="small">
          <InputLabel>Tipo de victoria</InputLabel>
          <Select
            label="Tipo de victoria"
            value={tipoVictoria}
            onChange={e => setTipoVictoria(e.target.value as TipoVictoria)}
          >
            {TIPOS_VICTORIA.map(t => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar} disabled={guardando}>Cancelar</Button>
        <Button variant="contained" onClick={handleGuardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar resultado'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
