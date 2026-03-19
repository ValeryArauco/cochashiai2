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
  clubId?: string
}

export function ModalSolicitudesSensei({ abierto, onCerrar, torneoId, clubId }: Props) {
  const { inscripciones, cargando, guardando, error, aprobar, rechazar } = useSolicitudesSensei(torneoId)
  const [aprobadas, setAprobadas] = useState<string[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroCinturon, setFiltroCinturon] = useState('')
  const [filtroEdad, setFiltroEdad] = useState('')
  const [filtroGenero, setFiltroGenero] = useState('')
  const [filtroPeso, setFiltroPeso] = useState('')

  
  const delClub = clubId
    ? inscripciones.filter(i => i.judoka?.clubId === clubId)
    : inscripciones

  const pendientes = delClub.filter(i => i.estado === 'pendiente_entrenador')
  const resto = delClub.filter(i => i.estado !== 'pendiente_entrenador')

  const cinturones = Array.from(new Set(
    delClub.map(i => i.judoka?.cinturon).filter(Boolean) as string[]
  )).sort()

  const pesoKey = (min?: number, max?: number) => `${min ?? ''}-${max ?? ''}`
  const pesoLabel = (min?: number, max?: number) => {
    if (min && max) return `${min} – ${max} kg`
    if (min) return `> ${min} kg`
    if (max) return `< ${max} kg`
    return 'Sin límite'
  }
  const pesosUnicos = Array.from(
    new Map(
      delClub
        .map(i => i.torneoCategoria?.categoria)
        .filter(Boolean)
        .map(c => [pesoKey(c!.pesoMinimo, c!.pesoMaximo), { min: c!.pesoMinimo, max: c!.pesoMaximo }])
    ).entries()
  ).sort(([a], [b]) => {
    const aMin = Number(a.split('-')[0]) || 0
    const bMin = Number(b.split('-')[0]) || 0
    return aMin - bMin
  })

  const ordenarAlfa = (lista: Inscripcion[]) =>
    [...lista].sort((a, b) => {
      const na = `${a.judoka?.usuario.nombre ?? ''} ${a.judoka?.usuario.apellidoPaterno ?? ''}`.toLowerCase()
      const nb = `${b.judoka?.usuario.nombre ?? ''} ${b.judoka?.usuario.apellidoPaterno ?? ''}`.toLowerCase()
      return na.localeCompare(nb, 'es')
    })

  const filtrar = (lista: Inscripcion[]) =>
    lista.filter(i => {
      const nombre = `${i.judoka?.usuario.nombre ?? ''} ${i.judoka?.usuario.apellidoPaterno ?? ''}`.toLowerCase()
      if (busqueda && !nombre.includes(busqueda.toLowerCase())) return false
      if (filtroCinturon && i.judoka?.cinturon !== filtroCinturon) return false
      if (filtroEdad && i.torneoCategoria?.categoria.edad !== filtroEdad) return false
      if (filtroGenero && i.torneoCategoria?.categoria.genero !== filtroGenero) return false
      if (filtroPeso) {
        const cat = i.torneoCategoria?.categoria
        if (pesoKey(cat?.pesoMinimo, cat?.pesoMaximo) !== filtroPeso) return false
      }
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
          <Avatar src={u?.avatarUrl} sx={{ display: { xs: 'none', sm: 'flex' } }}>{inicial}</Avatar>
          <Box flex={1}>
            <Typography fontWeight={500}>{nombreCompleto}</Typography>
            <Typography variant="caption" color="text.secondary">
              {edad} años · {u?.genero ?? '—'} · {ins.judoka?.cinturon ?? '—'}
              {ins.judoka?.clubNombre ? ` · ${ins.judoka.clubNombre}` : ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {ins.torneoCategoria?.categoria.nombre ?? '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' } }}>
              {ins.torneoCategoria?.categoria.nombre 
                ? (() => {
                    const parts = ins.torneoCategoria.categoria.nombre.split(' ');
                    if (parts.length >= 3) {
                      return `${parts[0]} ${parts[1][0]} ${parts.slice(2).join(' ')}`;
                    }
                    return ins.torneoCategoria.categoria.nombre;
                  })()
                : '—'}
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

  const todasLasFiltradas = ordenarAlfa(filtrar([...pendientes, ...resto]))

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle>Solicitudes de inscripción</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box 
          sx={{ 
            display: { xs: 'grid', sm: 'flex' }, 
            gridTemplateColumns: { xs: 'repeat(6, 1fr)', sm: 'none' }, 
            gap: 1, 
            mb: 2, 
            flexWrap: 'wrap' 
          }}
        >
          <TextField
            size="small"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            sx={{ flex: 1, minWidth: { sm: 160 }, gridColumn: { xs: 'span 4', sm: 'auto' } }}
          />
          <FormControl size="small" sx={{ minWidth: { sm: 140 }, gridColumn: { xs: 'span 2', sm: 'auto' } }}>
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
          <FormControl size="small" sx={{ minWidth: { sm: 120 }, gridColumn: { xs: 'span 2', sm: 'auto' } }}>
            <InputLabel>Edad</InputLabel>
            <Select
              label="Edad"
              value={filtroEdad}
              onChange={(e: SelectChangeEvent) => setFiltroEdad(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="infantil">Infantil</MenuItem>
              <MenuItem value="cadete">Cadete</MenuItem>
              <MenuItem value="senior">Senior</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { sm: 130 }, gridColumn: { xs: 'span 2', sm: 'auto' } }}>
            <InputLabel>Género</InputLabel>
            <Select
              label="Género"
              value={filtroGenero}
              onChange={(e: SelectChangeEvent) => setFiltroGenero(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="masculino">Masculino</MenuItem>
              <MenuItem value="femenino">Femenino</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { sm: 140 }, gridColumn: { xs: 'span 2', sm: 'auto' } }}>
            <InputLabel>Peso</InputLabel>
            <Select
              label="Peso"
              value={filtroPeso}
              onChange={(e: SelectChangeEvent) => setFiltroPeso(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {pesosUnicos.map(([key, { min, max }]) => (
                <MenuItem key={key} value={key}>{pesoLabel(min, max)}</MenuItem>
              ))}
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
