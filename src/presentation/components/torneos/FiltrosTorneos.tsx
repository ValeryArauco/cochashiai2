'use client'
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import InputAdornment from '@mui/material/InputAdornment'
import { FiltrosTorneos as Filtros } from '../../../domain/repositories/ITorneoRepository'
import { OrdenTorneos, OrdenCampo, OrdenDir } from '../../hooks/useTorneos'

const MESES = [
  'Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const añoActual = new Date().getFullYear()
const AÑOS = Array.from({ length: 5 }, (_, i) => añoActual - 1 + i)

interface Props {
  filtros: Filtros
  onChange: (filtros: Filtros) => void
  orden: OrdenTorneos
  onOrdenChange: (orden: OrdenTorneos) => void
}

export function FiltrosTorneos({ filtros, onChange, orden, onOrdenChange }: Props) {
  const handleCampo = (campo: OrdenCampo) => onOrdenChange({ ...orden, campo })
  const handleDir = (dir: OrdenDir) => onOrdenChange({ ...orden, dir })

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3, alignItems: 'center' }}>
      <TextField
        placeholder="Buscar torneo..."
        value={filtros.nombre ?? ''}
        onChange={e => onChange({ ...filtros, nombre: e.target.value || undefined })}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
        sx={{ flex: 1, minWidth: 200 }}
        size="small"
      />

      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Año</InputLabel>
        <Select
          label="Año"
          value={filtros.año ?? ''}
          onChange={e => onChange({ ...filtros, año: e.target.value ? Number(e.target.value) : undefined })}
        >
          <MenuItem value="">Todos</MenuItem>
          {AÑOS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Mes</InputLabel>
        <Select
          label="Mes"
          value={filtros.mes ?? ''}
          onChange={e => onChange({ ...filtros, mes: e.target.value ? Number(e.target.value) : undefined })}
        >
          {MESES.map((m, i) => (
            <MenuItem key={i} value={i === 0 ? '' : i}>{m}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Ordenar por</InputLabel>
        <Select
          label="Ordenar por"
          value={orden.campo}
          onChange={e => handleCampo(e.target.value as OrdenCampo)}
        >
          <MenuItem value="primerFechaTorneo">Fecha del torneo</MenuItem>
          <MenuItem value="fechaLimiteInscripcion">Cierre de inscripción</MenuItem>
        </Select>
      </FormControl>

      <ToggleButtonGroup
        size="small"
        exclusive
        value={orden.dir}
        onChange={(_, val) => { if (val) handleDir(val as OrdenDir) }}
        aria-label="dirección de orden"
      >
        <Tooltip title="Ascendente">
          <ToggleButton value="asc" aria-label="ascendente">
            <ArrowUpwardIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Descendente">
          <ToggleButton value="desc" aria-label="descendente">
            <ArrowDownwardIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  )
}
