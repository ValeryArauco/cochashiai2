'use client'
import {
  Box, Typography, Chip, Button, Stack, Paper,
  Tabs, Tab, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material'
import SportsIcon from '@mui/icons-material/Sports'
import { useState } from 'react'
import { Combate } from '../../../domain/models/Combate'
import { RolUsuario } from '../../../domain/models/Usuario'
import { nombreJudoka, labelRonda } from './BracketTree'

interface Props {
  combates: Combate[]
  numTatamis: number
  maxRondaPrincipal: number
  rol: RolUsuario
  onIniciar: (c: Combate) => Promise<void>
  onResultado: (c: Combate) => void
  onReasignarTatami: (combateId: string, tatami: number) => Promise<void>
}

function chipEstadoColor(estado: string): 'default' | 'warning' | 'success' | 'info' {
  if (estado === 'en_curso') return 'warning'
  if (estado === 'finalizado') return 'success'
  if (estado === 'bye') return 'info'
  return 'default'
}

function CombateCard({
  c, maxRondaPrincipal, numTatamis, rol, onIniciar, onResultado, onReasignarTatami,
}: {
  c: Combate
  maxRondaPrincipal: number
  numTatamis: number
  rol: RolUsuario
  onIniciar: (c: Combate) => Promise<void>
  onResultado: (c: Combate) => void
  onReasignarTatami: (combateId: string, tatami: number) => Promise<void>
}) {
  const [reasignando, setReasignando] = useState(false)
  const esBye = c.estado === 'bye'
  const puedeActuar = rol === 'admin' || rol === 'mesa'
  const ambosPresentes = !!(c.judoka1Id && c.judoka2Id)
  const puedeIniciar = puedeActuar && c.estado === 'pendiente' && ambosPresentes
  const puedeResultado = puedeActuar && (c.estado === 'en_curso' || (c.estado === 'pendiente' && ambosPresentes))
  const puedeReasignar = rol === 'admin' && c.estado !== 'finalizado' && c.estado !== 'bye'
  const enCurso = c.estado === 'en_curso'

  const j1Gana = c.ganadorId === c.judoka1Id
  const j2Gana = c.ganadorId === c.judoka2Id

  const etiquetaRonda = c.fase === 'repesca'
    ? 'Bronce'
    : labelRonda(c.ronda, maxRondaPrincipal)

  const handleReasignar = async (nuevoTatami: number) => {
    setReasignando(true)
    await onReasignarTatami(c.id, nuevoTatami)
    setReasignando(false)
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: enCurso ? 'warning.main' : 'divider',
        borderWidth: enCurso ? 2 : 1,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Header con etiqueta de fase */}
      <Box sx={{ px: 1.5, py: 0.5, bgcolor: enCurso ? 'warning.main' : 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {enCurso && <SportsIcon sx={{ color: 'warning.contrastText', fontSize: 16 }} />}
          <Typography variant="caption" fontWeight="bold" color={enCurso ? 'warning.contrastText' : 'text.secondary'}>
            {etiquetaRonda} — #{c.posicion}
          </Typography>
        </Stack>
        <Chip label={c.estado === 'en_curso' ? 'En curso' : c.estado === 'finalizado' ? 'Finalizado' : c.estado === 'bye' ? 'BYE' : 'Pendiente'}
          color={chipEstadoColor(c.estado)} size="small"
          sx={enCurso ? { bgcolor: 'warning.dark', color: 'warning.contrastText' } : undefined}
        />
      </Box>

      {/* Judokas */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{
            width: 20, height: 20, borderRadius: '50%', bgcolor: 'primary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography variant="caption" color="primary.contrastText" fontWeight="bold" fontSize={10}>A</Typography>
          </Box>
          <Typography
            variant="body2"
            fontWeight={j1Gana ? 'bold' : 'normal'}
            color={!c.judoka1Id ? 'text.disabled' : 'text.primary'}
            sx={{ fontStyle: !c.judoka1Id ? 'italic' : 'normal' }}
          >
            {nombreJudoka(c, 'judoka1')}
          </Typography>
          {c.estado === 'finalizado' && (
            <Typography variant="caption" color="text.secondary">
              {c.judoka1Ippones}I {c.judoka1Wazaris}W {c.judoka1Shidos}S
            </Typography>
          )}
          {j1Gana && <Chip label="Ganador" size="small" color="success" sx={{ height: 16, fontSize: 10 }} />}
        </Box>

        {!esBye && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 20, height: 20, borderRadius: '50%', bgcolor: 'error.main',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography variant="caption" color="error.contrastText" fontWeight="bold" fontSize={10}>R</Typography>
            </Box>
            <Typography
              variant="body2"
              fontWeight={j2Gana ? 'bold' : 'normal'}
              color={!c.judoka2Id ? 'text.disabled' : 'text.primary'}
              sx={{ fontStyle: !c.judoka2Id ? 'italic' : 'normal' }}
            >
              {nombreJudoka(c, 'judoka2')}
            </Typography>
            {c.estado === 'finalizado' && (
              <Typography variant="caption" color="text.secondary">
                {c.judoka2Ippones}I {c.judoka2Wazaris}W {c.judoka2Shidos}S
              </Typography>
            )}
            {j2Gana && <Chip label="Ganador" size="small" color="success" sx={{ height: 16, fontSize: 10 }} />}
          </Box>
        )}
      </Box>

      {/* Acciones */}
      {puedeActuar && (
        <Box sx={{ px: 1.5, py: 0.75, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={1}>
            {puedeIniciar && (
              <Button size="small" variant="outlined" color="warning" onClick={() => onIniciar(c)}>
                Iniciar
              </Button>
            )}
            {puedeResultado && (
              <Button size="small" variant="contained" onClick={() => onResultado(c)}>
                Resultado
              </Button>
            )}
          </Stack>
          {puedeReasignar && numTatamis > 1 && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Tatami</InputLabel>
              <Select
                value={c.tatami ?? ''}
                label="Tatami"
                disabled={reasignando}
                onChange={e => handleReasignar(Number(e.target.value))}
                sx={{ fontSize: '0.75rem' }}
              >
                {Array.from({ length: numTatamis }, (_, i) => i + 1).map(t => (
                  <MenuItem key={t} value={t}>Tatami {t}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      )}
    </Paper>
  )
}

export function TatamiView({ combates, numTatamis, maxRondaPrincipal, rol, onIniciar, onResultado, onReasignarTatami }: Props) {
  const [tabActual, setTabActual] = useState(0)

  const tabTatami = (tab: number): number | null => tab < numTatamis ? tab + 1 : null

  const combatesDeTatami = (tab: number): Combate[] => {
    const tatami = tabTatami(tab)
    const filtrados = tatami !== null
      ? combates.filter(c => c.tatami === tatami)
      : combates.filter(c => !c.tatami)
    return filtrados.sort((a, b) => {
      const prioridad = (c: Combate) => {
        if (c.estado === 'en_curso') return 0
        if (c.estado === 'pendiente' && c.judoka1Id && c.judoka2Id) return 1
        if (c.estado === 'pendiente') return 2
        if (c.estado === 'bye') return 3
        return 4
      }
      return prioridad(a) - prioridad(b) || a.ronda - b.ronda || a.posicion - b.posicion
    })
  }

  const tabs = [
    ...Array.from({ length: numTatamis }, (_, i) => `Tatami ${i + 1}`),
    'Sin asignar',
  ]

  return (
    <Box>
      <Tabs
        value={tabActual}
        onChange={(_, v) => setTabActual(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        {tabs.map((label, i) => {
          const count = combatesDeTatami(i).filter(c => c.estado !== 'finalizado' && c.estado !== 'bye').length
          return (
            <Tab
              key={label}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <span>{label}</span>
                  {count > 0 && <Chip label={count} size="small" color="primary" sx={{ height: 18, fontSize: 10 }} />}
                </Stack>
              }
            />
          )
        })}
      </Tabs>

      <Stack spacing={1.5}>
        {combatesDeTatami(tabActual).length === 0 ? (
          <Typography variant="body2" color="text.secondary" py={2} align="center">
            No hay combates en {tabs[tabActual]}.
          </Typography>
        ) : (
          combatesDeTatami(tabActual).map(c => (
            <CombateCard
              key={c.id}
              c={c}
              maxRondaPrincipal={maxRondaPrincipal}
              numTatamis={numTatamis}
              rol={rol}
              onIniciar={onIniciar}
              onResultado={onResultado}
              onReasignarTatami={onReasignarTatami}
            />
          ))
        )}
      </Stack>
    </Box>
  )
}
