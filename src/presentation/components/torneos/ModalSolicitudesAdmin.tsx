'use client'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Avatar, CircularProgress,
  TextField, Alert, Chip, Divider, IconButton, Tooltip,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState } from 'react'
import { useSolicitudesAdmin } from '../../hooks/useSolicitudesAdmin'
import { Inscripcion } from '../../../domain/models/Inscripcion'

interface Props {
  abierto: boolean
  onCerrar: () => void
  torneoId: string
}

export function ModalSolicitudesAdmin({ abierto, onCerrar, torneoId }: Props) {
  const { inscripciones, cargando, error, aprobar, eliminar } = useSolicitudesAdmin(torneoId)
  const [pesos, setPesos] = useState<Record<string, string>>({})
  const [pagados, setPagados] = useState<Record<string, boolean>>({})

  const handleAprobar = async (ins: Inscripcion) => {
    const peso = parseFloat(pesos[ins.id] ?? '0')
    if (!peso || peso <= 0) return
    await aprobar(ins.id, peso)
  }

  const handleEliminar = async (id: string) => {
    if (confirm('¿Eliminar este participante del torneo?')) await eliminar(id)
  }

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle>Gestión de inscripciones</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ) : inscripciones.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>
            No hay inscripciones aprobadas por el sensei
          </Typography>
        ) : (
          inscripciones.map((ins: Inscripcion) => {
            const u = ins.judoka?.usuario
            const nombreCompleto = `${u?.nombre ?? ''} ${u?.apellidoPaterno ?? ''}`.trim()
            const inicial = u?.nombre?.[0]?.toUpperCase() ?? '?'
            const aprobado = ins.estado === 'aprobado_admin'

            return (
              <Box key={ins.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <Avatar src={u?.avatarUrl}>{inicial}</Avatar>
                  <Box flex={1}>
                    <Typography fontWeight={500}>{nombreCompleto}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ins.torneoCategoria?.categoria.nombre ?? '—'}
                      {ins.pesoOficial ? ` · Peso oficial: ${ins.pesoOficial} kg` : ''}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {aprobado ? (
                      <Chip label="Aprobado" color="success" size="small" icon={<CheckCircleIcon />} />
                    ) : (
                      <>
                        <TextField
                          label="Peso (kg)"
                          type="number"
                          size="small"
                          sx={{ width: 110 }}
                          value={pesos[ins.id] ?? ''}
                          onChange={e => setPesos(prev => ({ ...prev, [ins.id]: e.target.value }))}
                          inputProps={{ min: 0, step: 0.1 }}
                        />
                        <Tooltip title="Aprobar">
                          <span>
                            <IconButton
                              color="success"
                              onClick={() => handleAprobar(ins)}
                              disabled={!pesos[ins.id] || parseFloat(pesos[ins.id]) <= 0}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Eliminar participante">
                      <IconButton color="error" onClick={() => handleEliminar(ins.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
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
      </DialogActions>
    </Dialog>
  )
}
