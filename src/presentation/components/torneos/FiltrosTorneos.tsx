'use client'
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import InputAdornment from '@mui/material/InputAdornment'
import { FiltrosTorneos as Filtros } from '../../../domain/repositories/ITorneoRepository'

const MESES = [
  'Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const añoActual = new Date().getFullYear()
const AÑOS = Array.from({ length: 5 }, (_, i) => añoActual - 1 + i)

interface Props {
  filtros: Filtros
  onChange: (filtros: Filtros) => void
}

export function FiltrosTorneos({ filtros, onChange }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
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
    </Box>
  )
}
