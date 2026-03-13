'use client'
import {
  Box, Typography, Paper, Stack, Chip, Divider, Table,
  TableHead, TableBody, TableRow, TableCell,
} from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { Combate, TipoVictoria } from '../../../domain/models/Combate'
import { Torneo } from '../../../domain/models/Torneo'

function nombreJudoka(c: Combate, cual: 'judoka1' | 'judoka2'): string {
  const j = c[cual]
  if (!j) return '—'
  return `${j.usuario.nombre} ${j.usuario.apellidoPaterno ?? ''}`
}

const VICTORIA_LABEL: Record<TipoVictoria, string> = {
  ippon:           'Ippon',
  wazari:          'Wazari',
  decision:        'Decisión',
  descalificacion: 'Descalificación',
  wo:              'W.O.',
}

interface Props {
  torneo: Torneo
  combatesPorCategoria: Record<string, Combate[]>  // key = categoriaId
}

export function ResultadosView({ torneo, combatesPorCategoria }: Props) {
  const categoriaIds = Object.keys(combatesPorCategoria)
  if (categoriaIds.length === 0) return null

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>Resultados</Typography>
      <Stack spacing={3}>
        {torneo.categorias
          .filter(cat => combatesPorCategoria[cat.id]?.some(c => c.estado === 'finalizado'))
          .map(cat => {
            const combates = combatesPorCategoria[cat.id] ?? []
            const finalizados = combates.filter(c => c.estado === 'finalizado' && c.ganadorId)

            // La final es el combate de ronda más alta con ganador
            const maxRonda = Math.max(...finalizados.map(c => c.ronda))
            const final = finalizados.find(c => c.ronda === maxRonda)

            return (
              <Paper key={cat.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">{cat.nombre}</Typography>
                  <Chip label={cat.edad} size="small" />
                  <Chip label={cat.genero} size="small" variant="outlined" />
                </Stack>

                {/* Ganador */}
                {final && (
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}
                    sx={{ p: 1.5, bgcolor: 'warning.50', borderRadius: 1 }}>
                    <EmojiEventsIcon color="warning" />
                    <Typography variant="body1" fontWeight="bold">
                      Campeón:{' '}
                      {final.ganadorId === final.judoka1Id
                        ? nombreJudoka(final, 'judoka1')
                        : nombreJudoka(final, 'judoka2')}
                    </Typography>
                    {final.tipoVictoria && (
                      <Chip
                        label={VICTORIA_LABEL[final.tipoVictoria]}
                        size="small"
                        color="warning"
                      />
                    )}
                  </Stack>
                )}

                <Divider sx={{ mb: 1 }} />

                {/* Tabla de combates finalizados */}
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ronda</TableCell>
                      <TableCell>Judoka 1</TableCell>
                      <TableCell align="center">Score</TableCell>
                      <TableCell>Judoka 2</TableCell>
                      <TableCell align="center">Score</TableCell>
                      <TableCell>Victoria</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {finalizados
                      .sort((a, b) => a.ronda - b.ronda || a.posicion - b.posicion)
                      .map(c => (
                        <TableRow key={c.id}>
                          <TableCell>{c.ronda}</TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={c.ganadorId === c.judoka1Id ? 'bold' : 'normal'}
                            >
                              {nombreJudoka(c, 'judoka1')}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="caption">
                              {c.judoka1Ippones}I {c.judoka1Wazaris}W {c.judoka1Shidos}S
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={c.ganadorId === c.judoka2Id ? 'bold' : 'normal'}
                            >
                              {nombreJudoka(c, 'judoka2')}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="caption">
                              {c.judoka2Ippones}I {c.judoka2Wazaris}W {c.judoka2Shidos}S
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {c.tipoVictoria && (
                              <Chip label={VICTORIA_LABEL[c.tipoVictoria]} size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Paper>
            )
          })}
      </Stack>
    </Box>
  )
}
