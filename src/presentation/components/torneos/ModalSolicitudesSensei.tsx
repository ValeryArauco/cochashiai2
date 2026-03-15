'use client'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Checkbox, Box, Typography, Avatar, CircularProgress,
  TextField, Alert, Chip, Divider, IconButton, Tooltip,
  MenuItem, Select, FormControl, InputLabel, SelectChangeEvent,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react'
import { useSolicitudesSensei } from '../../hooks/useSolicitudesSensei'
import { Inscripcion } from '../../../domain/models/Inscripcion'

function calcularEdad(fechaNacimiento?: string) {
  if (!fechaNacimiento) return '—'
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  return String(hoy.getFullYear() - nac.getFullYear())
}

interface Props {
  abierto: boolean
  onCerrar: () => void
  torneoId: string
}

export function ModalSolicitudesSensei({ abierto, onCerrar, torneoId }: Props) {
  const { inscripciones, cargando, guardando, error, aprobar, rechazar } = useSolicitudesSensei(torneoId)
  const [aprobadas, setAprobadas] = useState<string[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroCinturon, setFiltroCinturon] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const pendientes = inscripciones.filter(i => i.estado === 'pendiente_entrenador')
  const resto = inscripciones.filter(i => i.estado !== 'pendiente_entrenador')

  const cinturones = Array.from(new Set(
    inscripciones.map(i => i.judoka?.cinturon).filter(Boolean) as string[]
  )).sort()
  const categorias = Array.from(new Set(
    inscripciones.map(i => i.torneoCategoria?.categoria.nombre).filter(Boolean) as string[]
  )).sort()

  const filtrar = (lista: Inscripcion[]) =>
    lista.filter(i => {
      const nombre = `${i.judoka?.usuario.nombre ?? ''} ${i.judoka?.usuario.apellidoPaterno ?? ''}`.toLowerCase()
      if (busqueda && !nombre.includes(busqueda.toLowerCase())) return false
      if (filtroCinturon && i.judoka?.cinturon !== filtroCinturon) return false
      if (filtroCategoria && i.torneoCategoria?.categoria.nombre !== filtroCategoria) return false
      return true
    })

  const handleGuardar = async () => {
    await aprobar(aprobadas)
    setAprobadas([])
  }

  const toggle = (id: string) => {
    setAprobadas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const renderFila = (ins: Inscripcion) => {
    const u = ins.judoka?.usuario
    const nombreCompleto = `${u?.nombre ?? ''} ${u?.apellidoPaterno ?? ''}`.trim()
    const inicial = u?.nombre?.[0]?.toUpperCase() ?? '?'
    const edad = calcularEdad(u?.fechaNacimiento)
    const esPendiente = ins.estado === 'pendiente_entrenador'

    return (
      <Box key={ins.id}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
          {esPendiente ? (
            <Checkbox
              checked={aprobadas.includes(ins.id)}
              onChange={() => toggle(ins.id)}
              disabled={guardando}
            />
          ) : (
            <Box sx={{ width: 42 }} />
          )}
          <Avatar src={u?.avatarUrl}>{inicial}</Avatar>
          <Box flex={1}>
            <Typography fontWeight={500}>{nombreCompleto}</Typography>
            <Typography variant="caption" color="text.secondary">
              {edad} años · {u?.genero ?? '—'} · {ins.judoka?.cinturon ?? '—'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {ins.torneoCategoria?.categoria.nombre ?? '—'}
            </Typography>
            {ins.estado === 'aprobado_entrenador' && (
              <Chip label="Aprobado" size="small" color="success" />
            )}
            {esPendiente && (
              <Tooltip title="Rechazar">
                <IconButton
                  size="small"
                  color="error"
                  disabled={guardando}
                  onClick={() => rechazar(ins.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        <Divider />
      </Box>
    )
  }

  const todasLasFiltradas = filtrar([...pendientes, ...resto])

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle>Solicitudes de inscripción</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            sx={{ flex: 1, minWidth: 160 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Cinturón</InputLabel>
            <Select
              label="Cinturón"
              value={filtroCinturon}
              onChange={(e: SelectChangeEvent) => setFiltroCinturon(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {cinturones.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              label="Categoría"
              value={filtroCategoria}
              onChange={(e: SelectChangeEvent) => setFiltroCategoria(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {categorias.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ) : todasLasFiltradas.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>
            No hay solicitudes
          </Typography>
        ) : (
          todasLasFiltradas.map(renderFila)
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar}>Cerrar</Button>
        <Button
          variant="contained"
          onClick={handleGuardar}
          disabled={aprobadas.length === 0 || guardando}
          startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {guardando ? 'Guardando...' : `Aprobar (${aprobadas.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
