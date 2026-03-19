'use client'
import {
  Box, Typography, Paper, Stack, Chip, Divider, Table,
  TableHead, TableBody, TableRow, TableCell,
} from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'
import { Combate, TipoVictoria } from '../../../domain/models/Combate'
import { Torneo } from '../../../domain/models/Torneo'

function nombreJudoka(c: Combate, cual: 'judoka1' | 'judoka2'): string {
  const j = c[cual]
  if (!j) return '—'
  return `${j.usuario.nombre} ${j.usuario.apellidoPaterno ?? ''}`
}

function ganador(c: Combate): string {
  if (!c.ganadorId) return '—'
  return c.ganadorId === c.judoka1Id ? nombreJudoka(c, 'judoka1') : nombreJudoka(c, 'judoka2')
}

function perdedor(c: Combate): string {
  if (!c.ganadorId) return '—'
  return c.ganadorId === c.judoka1Id ? nombreJudoka(c, 'judoka2') : nombreJudoka(c, 'judoka1')
}

const VICTORIA_LABEL: Record<TipoVictoria, string> = {
  ippon:           'Ippon',
  wazari:          'Wazari',
  decision:        'Decisión',
  descalificacion: 'Descalificación',
  wo:              'W.O.',
}

function labelRondaResultados(ronda: number, maxRonda: number): string {
  if (ronda === -1) return 'Bronce'
  if (ronda === maxRonda) return 'Final'
  if (ronda === maxRonda - 1) return 'Semifinal'
  if (ronda === maxRonda - 2) return 'Cuartos'
  if (ronda === maxRonda - 3) return 'Octavos'
  return `Ronda ${ronda}`
}

interface Props {
  torneo: Torneo
  combatesPorCategoria: Record<string, Combate[]>  
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

            const principales = combates.filter(c => c.fase === 'principal' && c.estado === 'finalizado' && c.ganadorId)
            const repescas    = combates.filter(c => c.fase === 'repesca'    && c.estado === 'finalizado' && c.ganadorId)

            const maxRonda = principales.length > 0 ? Math.max(...principales.map(c => c.ronda)) : 1
            const final    = principales.find(c => c.ronda === maxRonda)

            const todosFinalizados = combates
              .filter(c => c.estado === 'finalizado' && c.ganadorId)
              .sort((a, b) => {
                if (a.ronda < 0 && b.ronda >= 0) return 1
                if (a.ronda >= 0 && b.ronda < 0) return -1
                return a.ronda - b.ronda || a.posicion - b.posicion
              })

            return (
              <Paper key={cat.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">{cat.nombre}</Typography>
                  <Chip label={cat.edad} size="small" />
                  <Chip label={cat.genero} size="small" variant="outlined" />
                </Stack>

                <Stack spacing={1} mb={2}>
                  {final && (
                    <Stack direction="row" spacing={1} alignItems="center"
                      sx={{ p: 1.5, bgcolor: 'warning.50', borderRadius: 1 }}>
                      <EmojiEventsIcon sx={{ color: '#FFD700' }} />
                      <Typography variant="body1" fontWeight="bold">
                        1.° {ganador(final)}
                      </Typography>
                      {final.tipoVictoria && (
                        <Chip label={VICTORIA_LABEL[final.tipoVictoria]} size="small" color="warning" />
                      )}
                    </Stack>
                  )}

                  {final && perdedor(final) !== '—' && (
                    <Stack direction="row" spacing={1} alignItems="center"
                      sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <EmojiEventsIcon sx={{ color: '#C0C0C0' }} />
                      <Typography variant="body1" fontWeight="medium">
                        2.° {perdedor(final)}
                      </Typography>
                    </Stack>
                  )}

                  {repescas.map((c, i) => (
                    <Stack key={c.id} direction="row" spacing={1} alignItems="center"
                      sx={{ p: 1.5, bgcolor: 'orange.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.light' }}>
                      <MilitaryTechIcon sx={{ color: '#CD7F32' }} />
                      <Typography variant="body1">
                        3.° {ganador(c)}
                        {repescas.length > 1 && (
                          <Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
                            (Bronce {i + 1})
                          </Typography>
                        )}
                      </Typography>
                      {c.tipoVictoria && (
                        <Chip label={VICTORIA_LABEL[c.tipoVictoria]} size="small" />
                      )}
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ mb: 1 }} />

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fase</TableCell>
                      <TableCell>Judoka 1</TableCell>
                      <TableCell align="center">Score</TableCell>
                      <TableCell>Judoka 2</TableCell>
                      <TableCell align="center">Score</TableCell>
                      <TableCell>Victoria</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todosFinalizados.map(c => (
                      <TableRow key={c.id}>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {labelRondaResultados(c.ronda, maxRonda)}
                        </TableCell>
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
                            <Chip
                              label={VICTORIA_LABEL[c.tipoVictoria]}
                              size="small"
                              color={c.fase === 'repesca' ? 'warning' : 'default'}
                            />
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
