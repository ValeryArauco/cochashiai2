'use client'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Stack, Divider, Alert,
  FormControl, InputLabel, Select, MenuItem, IconButton, Box,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useEffect, useState } from 'react'
import { Combate, TipoVictoria } from '../../../domain/models/Combate'

interface Props {
  abierto: boolean
  onCerrar: () => void
  combate: Combate
  onGuardar: (combateId: string, resultado: Partial<Combate>) => Promise<void>
}

const TIPOS_VICTORIA: { value: TipoVictoria; label: string }[] = [
  { value: 'ippon',           label: 'Ippon' },
  { value: 'wazari',          label: 'Waza-ari acumulado' },
  { value: 'decision',        label: 'Decisión de árbitros' },
  { value: 'descalificacion', label: 'Descalificación' },
  { value: 'wo',              label: 'W.O.' },
]

function nombreJudoka(j?: Combate['judoka1']): string {
  if (!j) return '—'
  return `${j.usuario.apellidoPaterno ?? ''} ${j.usuario.nombre}`.trim()
}

function Contador({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <Stack alignItems="center" spacing={0.25}>
      <Typography variant="caption" color="text.secondary" fontWeight="bold">{label}</Typography>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton size="small" onClick={() => onChange(Math.max(0, value - 1))} sx={{ bgcolor: 'action.hover' }}>
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" fontWeight="bold" sx={{ minWidth: 28, textAlign: 'center' }}>{value}</Typography>
        <IconButton size="small" onClick={() => onChange(value + 1)} sx={{ bgcolor: 'action.hover' }}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  )
}

export function RegistrarResultadoModal({ abierto, onCerrar, combate, onGuardar }: Props) {
  const [j1Ippones,    setJ1Ippones]    = useState(combate.judoka1Ippones)
  const [j1Wazaris,    setJ1Wazaris]    = useState(combate.judoka1Wazaris)
  const [j1Shidos,     setJ1Shidos]     = useState(combate.judoka1Shidos)
  const [j2Ippones,    setJ2Ippones]    = useState(combate.judoka2Ippones)
  const [j2Wazaris,    setJ2Wazaris]    = useState(combate.judoka2Wazaris)
  const [j2Shidos,     setJ2Shidos]     = useState(combate.judoka2Shidos)
  const [ganadorId,    setGanadorId]    = useState<string>(combate.ganadorId ?? '')
  const [tipoVictoria, setTipoVictoria] = useState<TipoVictoria | ''>(combate.tipoVictoria ?? '')
  const [guardando,    setGuardando]    = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    if (j1Ippones >= 1) {
      setGanadorId(combate.judoka1Id ?? ''); setTipoVictoria('ippon')
    } else if (j2Ippones >= 1) {
      setGanadorId(combate.judoka2Id ?? ''); setTipoVictoria('ippon')
    } else if (j1Wazaris >= 2) {
      setGanadorId(combate.judoka1Id ?? ''); setTipoVictoria('wazari')
    } else if (j2Wazaris >= 2) {
      setGanadorId(combate.judoka2Id ?? ''); setTipoVictoria('wazari')
    } else if (j1Shidos >= 3) {
      setGanadorId(combate.judoka2Id ?? ''); setTipoVictoria('descalificacion')
    } else if (j2Shidos >= 3) {
      setGanadorId(combate.judoka1Id ?? ''); setTipoVictoria('descalificacion')
    }
  }, [j1Ippones, j2Ippones, j1Wazaris, j2Wazaris, j1Shidos, j2Shidos, combate.judoka1Id, combate.judoka2Id])

  const handleGuardar = async () => {
    if (!ganadorId)    { setError('Selecciona un ganador');          return }
    if (!tipoVictoria) { setError('Selecciona el tipo de victoria'); return }
    setError(null)
    setGuardando(true)
    try {
      await onGuardar(combate.id, {
        judoka1Ippones: j1Ippones, judoka1Wazaris: j1Wazaris, judoka1Shidos: j1Shidos,
        judoka2Ippones: j2Ippones, judoka2Wazaris: j2Wazaris, judoka2Shidos: j2Shidos,
        ganadorId, tipoVictoria, estado: 'finalizado',
      })
      onCerrar()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const j1Nombre = nombreJudoka(combate.judoka1)
  const j2Nombre = nombreJudoka(combate.judoka2)

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle>Registrar resultado</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-around">
          <Stack alignItems="center" spacing={1.5} flex={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Typography fontSize={11} fontWeight="bold" color="white">A</Typography>
              </Box>
              <Typography variant="subtitle2" noWrap>{j1Nombre}</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Contador label="I" value={j1Ippones} onChange={setJ1Ippones} />
              <Contador label="W" value={j1Wazaris} onChange={setJ1Wazaris} />
              <Contador label="S" value={j1Shidos}  onChange={setJ1Shidos} />
            </Stack>
          </Stack>

          <Divider orientation="vertical" flexItem />

          <Stack alignItems="center" spacing={1.5} flex={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Typography fontSize={11} fontWeight="bold" color="white">R</Typography>
              </Box>
              <Typography variant="subtitle2" noWrap>{j2Nombre}</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Contador label="I" value={j2Ippones} onChange={setJ2Ippones} />
              <Contador label="W" value={j2Wazaris} onChange={setJ2Wazaris} />
              <Contador label="S" value={j2Shidos}  onChange={setJ2Shidos} />
            </Stack>
          </Stack>
        </Stack>

        <FormControl fullWidth size="small">
          <InputLabel>Ganador</InputLabel>
          <Select label="Ganador" value={ganadorId} onChange={e => setGanadorId(e.target.value)}>
            {combate.judoka1Id && <MenuItem value={combate.judoka1Id}>{j1Nombre}</MenuItem>}
            {combate.judoka2Id && <MenuItem value={combate.judoka2Id}>{j2Nombre}</MenuItem>}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Tipo de victoria</InputLabel>
          <Select label="Tipo de victoria" value={tipoVictoria} onChange={e => setTipoVictoria(e.target.value as TipoVictoria)}>
            {TIPOS_VICTORIA.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
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
