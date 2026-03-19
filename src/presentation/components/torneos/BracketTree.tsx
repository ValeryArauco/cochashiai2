'use client'
import { Box, Typography, Chip, Button, Paper, Stack } from '@mui/material'
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'
import { Combate, EstadoCombate } from '../../../domain/models/Combate'
import { Llave, EstructuraLlave } from '../../../domain/models/Llave'
import { RolUsuario } from '../../../domain/models/Usuario'

export function nombreJudoka(c: Combate, cual: 'judoka1' | 'judoka2'): string {
  const j = c[cual]
  if (!j) {
    const id = cual === 'judoka1' ? c.judoka1Id : c.judoka2Id
    return id ? '…' : 'Por definir'
  }
  return `${j.usuario.nombre} ${j.usuario.apellidoPaterno ?? ''}`
}

export function labelRonda(ronda: number, maxRonda: number): string {
  if (ronda === maxRonda) return 'Final'
  if (ronda === maxRonda - 1) return 'Semifinal'
  if (ronda === maxRonda - 2) return 'Cuartos'
  if (ronda === maxRonda - 3) return 'Octavos'
  return `Ronda ${ronda}`
}

function chipEstado(estado: EstadoCombate) {
  const map: Record<EstadoCombate, { label: string; color: 'default' | 'warning' | 'success' | 'info' }> = {
    pendiente:  { label: 'Pendiente',  color: 'default' },
    en_curso:   { label: 'En curso',   color: 'warning' },
    finalizado: { label: 'Finalizado', color: 'success' },
    bye:        { label: 'BYE',        color: 'info' },
  }
  const { label, color } = map[estado] ?? { label: estado, color: 'default' }
  return <Chip label={label} color={color} size="small" />
}

interface MatchBoxProps {
  combate: Combate
  maxRonda: number
  rol: RolUsuario
  esRepesca?: boolean
  onIniciar?: (c: Combate) => void
  onResultado?: (c: Combate) => void
}

function MatchBox({ combate: c, maxRonda, rol, esRepesca = false, onIniciar, onResultado }: MatchBoxProps) {
  const esBye = c.estado === 'bye'
  const isAdmin = rol === 'admin'
  const ambosPresentes = !!(c.judoka1Id && c.judoka2Id)
  const puedeIniciar = isAdmin && c.estado === 'pendiente' && ambosPresentes
  const puedeResultado = isAdmin && (c.estado === 'en_curso' || (c.estado === 'pendiente' && ambosPresentes))
  const enCurso = c.estado === 'en_curso'

  const j1Gana = c.ganadorId && c.ganadorId === c.judoka1Id
  const j2Gana = c.ganadorId && c.ganadorId === c.judoka2Id

  return (
    <Paper
      variant="outlined"
      sx={{
        minWidth: 180,
        borderColor: enCurso ? 'warning.main' : esRepesca ? 'warning.light' : 'divider',
        borderWidth: enCurso ? 2 : 1,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 1.5, py: 0.75,
          bgcolor: j1Gana ? 'success.main' : 'transparent',
          color: j1Gana ? 'success.contrastText' : 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={j1Gana ? 'bold' : 'normal'}
          noWrap
          sx={{ flex: 1, color: !c.judoka1Id ? 'text.disabled' : 'inherit', fontStyle: !c.judoka1Id ? 'italic' : 'normal' }}
        >
          {esBye && c.judoka1Id ? nombreJudoka(c, 'judoka1') : !c.judoka1Id ? 'Por definir' : nombreJudoka(c, 'judoka1')}
        </Typography>
        {c.estado === 'finalizado' && (
          <Typography variant="caption" color={j1Gana ? 'inherit' : 'text.secondary'} sx={{ whiteSpace: 'nowrap' }}>
            {c.judoka1Ippones}I {c.judoka1Wazaris}W {c.judoka1Shidos}S
          </Typography>
        )}
      </Box>

      {!esBye && (
        <Box
          sx={{
            px: 1.5, py: 0.75,
            bgcolor: j2Gana ? 'success.main' : 'transparent',
            color: j2Gana ? 'success.contrastText' : 'text.primary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={j2Gana ? 'bold' : 'normal'}
            noWrap
            sx={{ flex: 1, color: !c.judoka2Id ? 'text.disabled' : 'inherit', fontStyle: !c.judoka2Id ? 'italic' : 'normal' }}
          >
            {!c.judoka2Id ? 'Por definir' : nombreJudoka(c, 'judoka2')}
          </Typography>
          {c.estado === 'finalizado' && (
            <Typography variant="caption" color={j2Gana ? 'inherit' : 'text.secondary'} sx={{ whiteSpace: 'nowrap' }}>
              {c.judoka2Ippones}I {c.judoka2Wazaris}W {c.judoka2Shidos}S
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        {chipEstado(c.estado)}
        {isAdmin && !esBye && (
          <Stack direction="row" spacing={0.5}>
            {puedeIniciar && (
              <Button size="small" variant="outlined" color="warning" sx={{ py: 0, px: 1, fontSize: '0.7rem' }}
                onClick={() => onIniciar?.(c)}>
                Iniciar
              </Button>
            )}
            {puedeResultado && (
              <Button size="small" variant="contained" sx={{ py: 0, px: 1, fontSize: '0.7rem' }}
                onClick={() => onResultado?.(c)}>
                Resultado
              </Button>
            )}
          </Stack>
        )}
      </Box>
    </Paper>
  )
}

interface RondaColumnaProps {
  label: string
  combates: Combate[]
  maxRonda: number
  rol: RolUsuario
  totalR1: number
  onIniciar?: (c: Combate) => void
  onResultado?: (c: Combate) => void
}

function RondaColumna({ label, combates, maxRonda, rol, totalR1, onIniciar, onResultado }: RondaColumnaProps) {
  const slotH = 90
  const totalH = totalR1 * slotH

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
      <Typography
        variant="caption"
        fontWeight="bold"
        color="text.secondary"
        align="center"
        sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
      <Box sx={{ height: totalH, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
        {combates.map(c => (
          <MatchBox
            key={c.id}
            combate={c}
            maxRonda={maxRonda}
            rol={rol}
            onIniciar={onIniciar}
            onResultado={onResultado}
          />
        ))}
      </Box>
    </Box>
  )
}

function Conector({ fromCount, toCount, totalR1 }: { fromCount: number; toCount: number; totalR1: number }) {
  const slotH = 90
  const totalH = totalR1 * slotH
  const fromSlotH = totalH / fromCount
  const toSlotH = totalH / toCount

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = []

  for (let i = 0; i < fromCount; i++) {
    const fromY = fromSlotH * i + fromSlotH / 2
    const toIdx = Math.floor(i / 2)
    const toY = toSlotH * toIdx + toSlotH / 2
    lines.push({ x1: 0, y1: fromY, x2: 32, y2: toY })
  }

  return (
    <Box sx={{ width: 32, position: 'relative', flexShrink: 0 }}>
      <svg width="32" height={totalH} style={{ display: 'block' }}>
        {lines.map((l, i) => (
          <g key={i}>
            <line x1={l.x1} y1={l.y1} x2={16} y2={l.y1} stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <line x1={16} y1={l.y1} x2={16} y2={l.y2} stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <line x1={16} y1={l.y2} x2={l.x2} y2={l.y2} stroke="currentColor" strokeWidth="1" opacity="0.3" />
          </g>
        ))}
      </svg>
    </Box>
  )
}

interface Props {
  llave: Llave
  combates: Combate[]
  rol: RolUsuario
  onIniciar?: (c: Combate) => void
  onResultado?: (c: Combate) => void
}

export function BracketTree({ llave, combates, rol, onIniciar, onResultado }: Props) {
  const principales = combates.filter(c => c.fase === 'principal').sort((a, b) => a.ronda - b.ronda || a.posicion - b.posicion)
  const repesca = combates.filter(c => c.fase === 'repesca').sort((a, b) => a.posicion - b.posicion)

  const est = llave.estructura as EstructuraLlave
  const maxRonda = est.rondas

  const porRonda: Record<number, Combate[]> = {}
  for (const c of principales) {
    if (!porRonda[c.ronda]) porRonda[c.ronda] = []
    porRonda[c.ronda].push(c)
  }
  const rondas = Object.keys(porRonda).map(Number).sort((a, b) => a - b)
  const totalR1 = porRonda[rondas[0]]?.length ?? 1

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 0 }}>
          {rondas.map((ronda, idx) => (
            <Box key={ronda} sx={{ display: 'flex', alignItems: 'flex-start' }}>
              {idx > 0 && (
                <Conector
                  fromCount={porRonda[rondas[idx - 1]].length}
                  toCount={porRonda[ronda].length}
                  totalR1={totalR1}
                />
              )}
              <RondaColumna
                label={labelRonda(ronda, maxRonda)}
                combates={porRonda[ronda]}
                maxRonda={maxRonda}
                rol={rol}
                totalR1={totalR1}
                onIniciar={onIniciar}
                onResultado={onResultado}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {est.tieneRepesca && repesca.length > 0 && (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
            <MilitaryTechIcon sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle2" fontWeight="bold" color="warning.main">
              Medallas de Bronce
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {repesca.map((c, i) => (
              <Box key={c.id} sx={{ minWidth: 200 }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Bronce {i + 1}
                </Typography>
                <MatchBox
                  combate={c}
                  maxRonda={maxRonda}
                  rol={rol}
                  esRepesca
                  onIniciar={onIniciar}
                  onResultado={onResultado}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {est.tieneRepesca && repesca.length === 0 && (
        <Stack direction="row" spacing={1} alignItems="center">
          <MilitaryTechIcon sx={{ color: 'warning.main' }} />
          <Typography variant="body2" color="text.secondary">
            Los combates de bronce aparecerán al registrar los resultados de cuartos de final.
          </Typography>
        </Stack>
      )}
    </Box>
  )
}
