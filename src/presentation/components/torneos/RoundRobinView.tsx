'use client'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Divider, Stack,
} from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { Combate } from '../../../domain/models/Combate'
import { RolUsuario } from '../../../domain/models/Usuario'

interface Props {
  combates: Combate[]
  rol: RolUsuario
  onIniciar: (c: Combate) => void
  onResultado: (c: Combate) => void
}

interface Standing {
  judokaId: string
  nombre: string
  V: number
  D: number
  ippones: number
  wazaris: number
}

function nombreCompleto(c: Combate, num: 1 | 2): string {
  const j = num === 1 ? c.judoka1 : c.judoka2
  if (!j) return '—'
  const u = j.usuario
  return [u.nombre, u.apellidoPaterno].filter(Boolean).join(' ')
}

function calcularStandings(combates: Combate[]): Standing[] {
  const map = new Map<string, Standing>()

  const asegurar = (judokaId: string, nombre: string) => {
    if (!map.has(judokaId)) map.set(judokaId, { judokaId, nombre, V: 0, D: 0, ippones: 0, wazaris: 0 })
    return map.get(judokaId)!
  }

  for (const c of combates) {
    if (!c.judoka1Id || !c.judoka2Id) continue
    const n1 = nombreCompleto(c, 1)
    const n2 = nombreCompleto(c, 2)
    const s1 = asegurar(c.judoka1Id, n1)
    const s2 = asegurar(c.judoka2Id, n2)

    if (c.estado !== 'finalizado' || !c.ganadorId) continue

    if (c.ganadorId === c.judoka1Id) {
      s1.V++; s2.D++
      s1.ippones += c.judoka1Ippones
      s1.wazaris += c.judoka1Wazaris
    } else {
      s2.V++; s1.D++
      s2.ippones += c.judoka2Ippones
      s2.wazaris += c.judoka2Wazaris
    }
  }

  return [...map.values()].sort((a, b) =>
    b.V - a.V || b.ippones - a.ippones || b.wazaris - a.wazaris
  )
}

const ESTADO_COLOR: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
  pendiente: 'default',
  en_curso: 'warning',
  finalizado: 'success',
}

export function RoundRobinView({ combates, rol, onIniciar, onResultado }: Props) {
  const standings = calcularStandings(combates)
  const puedeGestionar = rol === 'admin'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {standings.length > 0 && (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <EmojiEventsIcon fontSize="small" color="action" />
            <Typography variant="subtitle2">Tabla de posiciones</Typography>
          </Stack>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Atleta</TableCell>
                  <TableCell align="center">V</TableCell>
                  <TableCell align="center">D</TableCell>
                  <TableCell align="center">Ippones</TableCell>
                  <TableCell align="center">Wazaris</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {standings.map((s, i) => (
                  <TableRow key={s.judokaId} sx={i === 0 ? { bgcolor: 'warning.lighter' } : {}}>
                    <TableCell>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </TableCell>
                    <TableCell>{s.nombre || s.judokaId}</TableCell>
                    <TableCell align="center"><strong>{s.V}</strong></TableCell>
                    <TableCell align="center">{s.D}</TableCell>
                    <TableCell align="center">{s.ippones}</TableCell>
                    <TableCell align="center">{s.wazaris}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Divider />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Combates ({combates.length} en total)
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Judoka 1</TableCell>
                <TableCell align="center">vs</TableCell>
                <TableCell>Judoka 2</TableCell>
                <TableCell align="center">Estado</TableCell>
                {puedeGestionar && <TableCell align="center">Acción</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {combates.map(c => {
                const esGanador1 = c.ganadorId === c.judoka1Id
                const esGanador2 = c.ganadorId === c.judoka2Id
                return (
                  <TableRow key={c.id}>
                    <TableCell>{c.posicion}</TableCell>
                    <TableCell sx={esGanador1 ? { fontWeight: 700 } : {}}>
                      {nombreCompleto(c, 1)}
                    </TableCell>
                    <TableCell align="center" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
                      vs
                    </TableCell>
                    <TableCell sx={esGanador2 ? { fontWeight: 700 } : {}}>
                      {nombreCompleto(c, 2)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={c.estado}
                        color={ESTADO_COLOR[c.estado] ?? 'default'}
                      />
                    </TableCell>
                    {puedeGestionar && (
                      <TableCell align="center">
                        {c.estado === 'pendiente' && (
                          <Typography
                            variant="caption"
                            color="primary"
                            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => onIniciar(c)}
                          >
                            Iniciar
                          </Typography>
                        )}
                        {c.estado === 'en_curso' && (
                          <Typography
                            variant="caption"
                            color="secondary"
                            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => onResultado(c)}
                          >
                            Resultado
                          </Typography>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}
