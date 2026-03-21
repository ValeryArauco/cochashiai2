'use client'
import {
  Box, Typography, Chip, Stack, CircularProgress,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import TableRowsIcon from '@mui/icons-material/TableRows'
import { useState } from 'react'
import { Combate } from '../../../domain/models/Combate'
import { Llave, EstructuraLlave } from '../../../domain/models/Llave'
import { RolUsuario } from '../../../domain/models/Usuario'
import { RegistrarResultadoModal } from './RegistrarResultadoModal'
import { BracketTree } from './BracketTree'
import { TatamiView } from './TatamiView'
import { RoundRobinView } from './RoundRobinView'

interface Props {
  llave: Llave | null
  combates: Combate[]
  cargando: boolean
  rol: RolUsuario
  numTatamis: number
  onRegistrarResultado: (combateId: string, resultado: Partial<Combate>) => Promise<void>
  onActualizarMarcadorParcial: (combateId: string, marcador: {
    judoka1Ippones: number; judoka1Wazaris: number; judoka1Shidos: number
    judoka2Ippones: number; judoka2Wazaris: number; judoka2Shidos: number
  }) => Promise<void>
  onIniciarCombate: (combateId: string) => Promise<void>
  onReasignarTatami: (combateId: string, tatami: number) => Promise<void>
}

export function LlavesView({
  llave, combates, cargando, rol, numTatamis,
  onRegistrarResultado, onActualizarMarcadorParcial, onIniciarCombate, onReasignarTatami,
}: Props) {
  const [vista, setVista] = useState<'cuadro' | 'tatami'>('cuadro')
  const [combateSeleccionado, setCombateSeleccionado] = useState<Combate | null>(null)

  if (cargando) return <CircularProgress />
  if (!llave) return <></>

  const estructura = llave.estructura as EstructuraLlave | null
  const esLiguilla = llave.tipoBracket === 'round_robin'

  const handleIniciar = async (c: Combate) => {
    await onIniciarCombate(c.id)
  }

  const handleResultado = (c: Combate) => {
    setCombateSeleccionado(c)
  }

  return (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">{esLiguilla ? 'Liguilla' : 'Bracket'}</Typography>
          {esLiguilla && (
            <Chip size="small" label="Round Robin" color="info" variant="outlined" />
          )}
          {estructura?.tipoSeed && (
            <Chip size="small" label={`Seed: ${estructura.tipoSeed}`} variant="outlined" />
          )}
          {!esLiguilla && estructura?.byes != null && estructura.byes > 0 && (
            <Chip size="small" label={`${estructura.byes} bye${estructura.byes > 1 ? 's' : ''}`} />
          )}
          <Typography variant="body2" color="text.secondary">
            {llave.numParticipantes} participantes
          </Typography>
        </Stack>

        {!esLiguilla && (
          <ToggleButtonGroup
            value={vista}
            exclusive
            onChange={(_, v) => v && setVista(v)}
            size="small"
          >
            <ToggleButton value="cuadro" aria-label="Cuadro">
              <AccountTreeIcon fontSize="small" sx={{ mr: 0.5 }} />
              Cuadro
            </ToggleButton>
            <ToggleButton value="tatami" aria-label="Por tatami">
              <TableRowsIcon fontSize="small" sx={{ mr: 0.5 }} />
              Por tatami
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>

      {esLiguilla && (
        <RoundRobinView
          combates={combates}
          rol={rol}
          onIniciar={handleIniciar}
          onResultado={handleResultado}
        />
      )}

      {!esLiguilla && vista === 'cuadro' && (
        <BracketTree
          llave={llave}
          combates={combates}
          rol={rol}
          onIniciar={handleIniciar}
          onResultado={handleResultado}
        />
      )}

      {!esLiguilla && vista === 'tatami' && (
        <TatamiView
          combates={combates}
          numTatamis={numTatamis}
          maxRondaPrincipal={
            combates.filter(c => c.fase === 'principal').length > 0
              ? Math.max(...combates.filter(c => c.fase === 'principal').map(c => c.ronda))
              : 1
          }
          rol={rol}
          onIniciar={handleIniciar}
          onResultado={handleResultado}
          onReasignarTatami={onReasignarTatami}
        />
      )}

      {combateSeleccionado && (
        <RegistrarResultadoModal
          abierto
          onCerrar={() => setCombateSeleccionado(null)}
          combate={combateSeleccionado}
          onGuardar={async (id, r) => {
            await onRegistrarResultado(id, r)
            setCombateSeleccionado(null)
          }}
          onMarcadorChange={onActualizarMarcadorParcial}
        />
      )}
    </Box>
  )
}
