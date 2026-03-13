'use client'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Checkbox, Box, Typography, Avatar, CircularProgress,
  TextField, Alert, Chip, Divider,
} from '@mui/material'
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
  const { inscripciones, cargando, guardando, error, aprobar } = useSolicitudesSensei(torneoId)
  const [aprobadas, setAprobadas] = useState<string[]>([])
  const [busqueda, setBusqueda] = useState('')

  const filtradas = inscripciones.filter(i => {
    const nombre = `${i.judoka?.usuario.nombre ?? ''} ${i.judoka?.usuario.apellidoPaterno ?? ''}`.toLowerCase()
    return nombre.includes(busqueda.toLowerCase())
  })

  const handleGuardar = async () => {
    await aprobar(aprobadas)
    setAprobadas([])
  }

  const toggle = (id: string) => {
    setAprobadas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle>Solicitudes pendientes</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          sx={{ mb: 2 }}
        />

        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ) : filtradas.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>
            No hay solicitudes pendientes
          </Typography>
        ) : (
          filtradas.map((ins: Inscripcion) => {
            const u = ins.judoka?.usuario
            const nombreCompleto = `${u?.nombre ?? ''} ${u?.apellidoPaterno ?? ''}`.trim()
            const inicial = u?.nombre?.[0]?.toUpperCase() ?? '?'
            const edad = calcularEdad(u?.fechaNacimiento)

            return (
              <Box key={ins.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                  <Checkbox
                    checked={aprobadas.includes(ins.id)}
                    onChange={() => toggle(ins.id)}
                    disabled={ins.estado !== 'pendiente_entrenador'}
                  />
                  <Avatar src={u?.avatarUrl}>{inicial}</Avatar>
                  <Box flex={1}>
                    <Typography fontWeight={500}>{nombreCompleto}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {edad} años · {u?.genero ?? '—'} · {ins.judoka?.cinturon ?? '—'}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2">{ins.torneoCategoria?.categoria.nombre ?? '—'}</Typography>
                    {ins.estado === 'aprobado_sensei' && (
                      <Chip label="Ya aprobado" size="small" color="success" />
                    )}
                  </Box>
                </Box>
                <Divider />
              </Box>
            )
          })
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
