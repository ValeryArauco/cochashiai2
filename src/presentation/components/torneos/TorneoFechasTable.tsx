'use client'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Typography } from '@mui/material'
import { TorneoFecha } from '../../../domain/models/Torneo'

function formatFecha(f: string) {
  return new Date(f + 'T00:00:00').toLocaleDateString('es-BO', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function TorneoFechasTable({ fechas }: { fechas: TorneoFecha[] }) {
  const ordenadas = [...fechas].sort((a, b) => a.fecha.localeCompare(b.fecha))

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><Typography fontWeight={600}>Fecha</Typography></TableCell>
            <TableCell><Typography fontWeight={600}>Hora inicio</Typography></TableCell>
            <TableCell><Typography fontWeight={600}>Hora fin</Typography></TableCell>
            <TableCell><Typography fontWeight={600}>Descripción</Typography></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ordenadas.map(f => (
            <TableRow key={f.id}>
              <TableCell>{formatFecha(f.fecha)}</TableCell>
              <TableCell>{f.horaInicio}</TableCell>
              <TableCell>{f.horaFin}</TableCell>
              <TableCell>{f.descripcion ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
