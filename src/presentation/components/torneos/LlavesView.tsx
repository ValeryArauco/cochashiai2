'use client'
import {
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  Chip, Button, Stack, Paper, CircularProgress, Alert,
} from '@mui/material'
import { useState } from 'react'
import { Combate, EstadoCombate } from '../../../domain/models/Combate'
import { Llave } from '../../../domain/models/Llave'
import { RolUsuario } from '../../../domain/models/Usuario'
import { RegistrarResultadoModal } from './RegistrarResultadoModal'

function nombreJudoka(c: Combate, cual: 'judoka1' | 'judoka2'): string {
  const j = c[cual]
  if (!j) return cual === 'judoka1' ? c.judoka1Id ? '—' : 'BYE' : c.judoka2Id ? '—' : 'BYE'
  return `${j.usuario.nombre} ${j.usuario.apellidoPaterno ?? ''}`
}

function chipEstado(estado: EstadoCombate) {
  const map: Record<EstadoCombate, { label: string; color: 'default' | 'warning' | 'success' | 'info' }> = {
    pendiente:   { label: 'Pendiente', color: 'default' },
    en_curso:    { label: 'En curso',  color: 'warning' },
    finalizado:  { label: 'Finalizado', color: 'success' },
    bye:         { label: 'BYE',       color: 'info' },
  }
  const { label, color } = map[estado] ?? { label: estado, color: 'default' }
  return <Chip label={label} color={color} size="small" />
}

interface Props {
  llave: Llave | null
  combates: Combate[]
  cargando: boolean
  rol: RolUsuario
  onRegistrarResultado: (combateId: string, resultado: Partial<Combate>) => Promise<void>
}

export function LlavesView({ llave, combates, cargando, rol, onRegistrarResultado }: Props) {
  const [combateSeleccionado, setCombateSeleccionado] = useState<Combate | null>(null)

  if (cargando) return <CircularProgress />

  if (!llave) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Aún no se han generado las llaves para esta categoría.
      </Alert>
    )
  }

  // Agrupar por tatami
  const porTatami = combates.reduce<Record<number, Combate[]>>((acc, c) => {
    const t = c.tatami ?? 0
    if (!acc[t]) acc[t] = []
    acc[t].push(c)
    return acc
  }, {})

  const tatamis = Object.keys(porTatami).map(Number).sort((a, b) => a - b)

  return (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          Bracket — {llave.tipoBracket === 'single_elimination' ? 'Eliminación simple' : 'Eliminación doble'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {llave.numParticipantes} participantes
        </Typography>
      </Stack>

      {tatamis.map(tatami => (
        <Paper key={tatami} variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {tatami === 0 ? 'Sin tatami asignado' : `Tatami ${tatami}`}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ronda</TableCell>
                <TableCell>Pos.</TableCell>
                <TableCell>Judoka 1</TableCell>
                <TableCell align="center">vs</TableCell>
                <TableCell>Judoka 2</TableCell>
                <TableCell>Estado</TableCell>
                {rol === 'admin' && <TableCell>Acción</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {porTatami[tatami].map(c => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.ronda}</TableCell>
                  <TableCell>{c.posicion}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={c.ganadorId === c.judoka1Id ? 'bold' : 'normal'}
                    >
                      {nombreJudoka(c, 'judoka1')}
                    </Typography>
                    {c.estado === 'finalizado' && (
                      <Typography variant="caption" color="text.secondary">
                        {c.judoka1Ippones}I {c.judoka1Wazaris}W {c.judoka1Shidos}S
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">—</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={c.ganadorId === c.judoka2Id ? 'bold' : 'normal'}
                    >
                      {nombreJudoka(c, 'judoka2')}
                    </Typography>
                    {c.estado === 'finalizado' && (
                      <Typography variant="caption" color="text.secondary">
                        {c.judoka2Ippones}I {c.judoka2Wazaris}W {c.judoka2Shidos}S
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{chipEstado(c.estado)}</TableCell>
                  {rol === 'admin' && (
                    <TableCell>
                      {c.estado !== 'finalizado' && c.estado !== 'bye' && c.judoka1Id && c.judoka2Id && (
                        <Button size="small" onClick={() => setCombateSeleccionado(c)}>
                          Resultado
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ))}

      {combateSeleccionado && (
        <RegistrarResultadoModal
          abierto
          onCerrar={() => setCombateSeleccionado(null)}
          combate={combateSeleccionado}
          onGuardar={async (id, r) => {
            await onRegistrarResultado(id, r)
            setCombateSeleccionado(null)
          }}
        />
      )}
    </Box>
  )
}
