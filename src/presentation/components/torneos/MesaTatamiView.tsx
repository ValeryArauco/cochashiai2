'use client'
import {
  Box, Typography, Stack, Paper, Button, Chip,
  Divider, CircularProgress,
} from '@mui/material'
import SportsIcon from '@mui/icons-material/Sports'
import { useState } from 'react'
import { Combate } from '../../../domain/models/Combate'
import { useMesaTatami } from '../../hooks/useMesaTatami'
import { RegistrarResultadoModal } from './RegistrarResultadoModal'
import { labelRonda } from './BracketTree'

interface Props {
  torneoId: string
  tatami: number
  numTatamis: number
}

function nombreJudoka(j?: Combate['judoka1']): string {
  if (!j) return '—'
  return `${j.usuario.apellidoPaterno ?? ''} ${j.usuario.nombre}`.trim()
}

function etiquetaCombate(c: Combate, maxRonda: number): string {
  if (c.fase === 'repesca') return `Bronce #${c.posicion}`
  return `${labelRonda(c.ronda, maxRonda)} #${c.posicion}`
}

export function MesaTatamiView({ torneoId, tatami, numTatamis: _numTatamis }: Props) {
  const { combates, cargando, iniciarCombate, registrarResultado } = useMesaTatami(torneoId, tatami)
  const [combateSeleccionado, setCombateSeleccionado] = useState<Combate | null>(null)

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  const maxRonda = combates.filter(c => c.fase === 'principal').length > 0
    ? Math.max(...combates.filter(c => c.fase === 'principal').map(c => c.ronda))
    : 1

  const activo = combates.find(c => c.estado === 'en_curso')
    ?? combates.find(c => c.estado === 'pendiente' && c.judoka1Id && c.judoka2Id)

  const proximos = combates.filter(
    c => c.estado === 'pendiente' && c.judoka1Id && c.judoka2Id && c.id !== activo?.id
  )

  const j1Gana = activo && activo.ganadorId === activo.judoka1Id
  const j2Gana = activo && activo.ganadorId === activo.judoka2Id

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 700, mx: 'auto' }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <SportsIcon color="action" />
        <Typography variant="h5" fontWeight="bold">Tatami {tatami}</Typography>
        <Chip
          label={`${combates.filter(c => c.estado !== 'finalizado' && c.estado !== 'bye').length} pendientes`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Stack>

      {activo ? (
        <Paper
          variant="outlined"
          sx={{
            borderColor: activo.estado === 'en_curso' ? 'warning.main' : 'primary.main',
            borderWidth: 2,
            borderRadius: 2,
            overflow: 'hidden',
            mb: 3,
          }}
        >
          <Box sx={{
            px: 2, py: 1,
            bgcolor: activo.estado === 'en_curso' ? 'warning.main' : 'primary.main',
          }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight="bold" color="white">
                {etiquetaCombate(activo, maxRonda)}
              </Typography>
              <Chip
                label={activo.estado === 'en_curso' ? 'En curso' : 'Pendiente'}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 'bold' }}
              />
            </Stack>
          </Box>

          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} justifyContent="space-around" alignItems="center">
              <Stack alignItems="center" spacing={0.5} flex={1}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography fontWeight="bold" color="white" fontSize={14}>A</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={j1Gana ? 'bold' : 'normal'} align="center">
                  {nombreJudoka(activo.judoka1)}
                </Typography>
                {activo.estado === 'en_curso' && (
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {activo.judoka1Ippones}I · {activo.judoka1Wazaris}W · {activo.judoka1Shidos}S
                  </Typography>
                )}
              </Stack>

              <Typography variant="h5" color="text.disabled" fontWeight="bold">vs</Typography>

              <Stack alignItems="center" spacing={0.5} flex={1}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%',
                  bgcolor: 'error.main',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography fontWeight="bold" color="white" fontSize={14}>R</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={j2Gana ? 'bold' : 'normal'} align="center">
                  {nombreJudoka(activo.judoka2)}
                </Typography>
                {activo.estado === 'en_curso' && (
                  <Typography variant="h6" color="error.main" fontWeight="bold">
                    {activo.judoka2Ippones}I · {activo.judoka2Wazaris}W · {activo.judoka2Shidos}S
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2.5 }}>
              {activo.estado === 'pendiente' && (
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  sx={{ px: 4 }}
                  onClick={() => iniciarCombate(activo.id)}
                >
                  Iniciar combate
                </Button>
              )}
              {activo.estado === 'en_curso' && (
                <Button
                  variant="contained"
                  size="large"
                  sx={{ px: 4 }}
                  onClick={() => setCombateSeleccionado(activo)}
                >
                  Registrar resultado
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">
            No hay combates pendientes en este tatami.
          </Typography>
        </Paper>
      )}

      {proximos.length > 0 && (
        <Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            Próximos combates
          </Typography>
          <Stack spacing={1}>
            {proximos.map(c => (
              <Paper key={c.id} variant="outlined" sx={{ px: 2, py: 1, borderRadius: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                    {etiquetaCombate(c, maxRonda)}
                  </Typography>
                  <Typography variant="body2" noWrap flex={1}>
                    {nombreJudoka(c.judoka1)} <Typography component="span" color="text.disabled">vs</Typography> {nombreJudoka(c.judoka2)}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {combateSeleccionado && (
        <RegistrarResultadoModal
          abierto
          onCerrar={() => setCombateSeleccionado(null)}
          combate={combateSeleccionado}
          onGuardar={async (id, r) => {
            await registrarResultado(id, r)
            setCombateSeleccionado(null)
          }}
        />
      )}
    </Box>
  )
}
