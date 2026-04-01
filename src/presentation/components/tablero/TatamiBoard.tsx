'use client'
import { Avatar, Box, Chip, Divider, Paper, Typography } from '@mui/material'
import type { BoardData, JugadorTablero } from '@/presentation/hooks/useTablero'

const AZUL = {
  gradient: 'linear-gradient(160deg, #0a1c52 0%, #1565C0 100%)',
  accent: '#42A5F5',
  textDim: '#90CAF9',
  scoreBg: '#060f2a',
  avatarBorder: '#60a5fa',
}

const BLANCO = {
  gradient: 'linear-gradient(160deg, #1c2b38 0%, #334155 100%)',
  accent: '#CBD5E1',
  textDim: '#94A3B8',
  scoreBg: '#111827',
  avatarBorder: '#CBD5E1',
}

function ScoreCell({ value, label, isShido }: { value: number; label: string; isShido?: boolean }) {
  const active = isShido ? value > 0 : value > 0
  return (
    <Box sx={{ textAlign: 'center', py: 1.5, px: 0.5 }}>
      <Typography
        sx={{
          fontSize: { xs: '2rem', sm: '2.6rem', md: '3rem' },
          fontWeight: 900,
          lineHeight: 1,
          color: isShido ? (active ? '#f87171' : '#7f1d1d') : (active ? '#ffffff' : '#4b5563'),
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: -1,
          transition: 'color 0.2s',
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.52rem',
          letterSpacing: 2,
          color: isShido ? '#7f1d1d' : '#6b7280',
          mt: 0.5,
          fontWeight: 800,
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

function PlayerPanel({ jugador, side, label }: {
  jugador: JugadorTablero | null
  side: typeof AZUL
  label: string
}) {
  return (
    <Box
      sx={{
        flex: 1,
        background: side.gradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75,
        py: 2.5,
        px: 1.5,
        minHeight: 200,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6rem',
          fontWeight: 900,
          letterSpacing: 4,
          color: side.accent,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Avatar
        src={jugador?.avatarUrl ?? undefined}
        sx={{
          width: 72,
          height: 72,
          border: `3px solid ${side.avatarBorder}`,
          bgcolor: side.scoreBg,
          fontSize: '1.5rem',
          fontWeight: 800,
          color: side.accent,
          mb: 0.75,
        }}
      >
        {jugador
          ? `${jugador.nombre.charAt(0)}${jugador.apellido.charAt(0)}`
          : '?'}
      </Avatar>

      {jugador ? (
        <>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              {jugador.nombre}
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              {jugador.apellido}
            </Typography>
          </Box>
          {jugador.peso !== null && (
            <Chip
              label={`${jugador.peso} kg`}
              size="small"
              sx={{
                bgcolor: 'rgba(0,0,0,0.35)',
                color: side.accent,
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
                border: `1px solid ${side.accent}33`,
              }}
            />
          )}
          <Typography
            sx={{ fontSize: '0.7rem', color: side.textDim, textAlign: 'center', mt: 0.25 }}
          >
            {jugador.club}
          </Typography>
        </>
      ) : (
        <Typography sx={{ color: side.textDim, fontSize: '0.85rem', mt: 1.5, fontStyle: 'italic' }}>
          Por definir
        </Typography>
      )}
    </Box>
  )
}

interface Props {
  tatami: number
  data: BoardData | null
}

export function TatamiBoard({ tatami, data }: Props) {
  const enCurso = data?.estado === 'en_curso'

  return (
    <Paper
      elevation={enCurso ? 10 : 3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: enCurso ? '2px solid #4ade80' : '2px solid #1f2937',
        bgcolor: '#080f1e',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.4s, box-shadow 0.4s',
        boxShadow: enCurso ? '0 0 32px rgba(74, 222, 128, 0.2)' : 'none',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: '#04080f',
          borderBottom: `1px solid ${enCurso ? '#166534' : '#111827'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: enCurso ? '#4ade80' : '#374151',
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{ fontWeight: 900, fontSize: '0.95rem', color: '#fff', letterSpacing: 3 }}
          >
            TATAMI {tatami}
          </Typography>
        </Box>

        {data && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
            <Typography
              sx={{
                fontSize: '0.68rem',
                color: '#6b7280',
                textAlign: 'right',
                maxWidth: 180,
                lineHeight: 1.35,
              }}
            >
              {data.categoria}
            </Typography>
            <Chip
              label={enCurso ? 'EN CURSO' : 'PRÓXIMO'}
              size="small"
              sx={enCurso
                ? { bgcolor: '#14532d', color: '#86efac', fontWeight: 700, fontSize: '0.58rem', height: 21 }
                : { bgcolor: '#451a03', color: '#fcd34d', fontWeight: 700, fontSize: '0.58rem', height: 21 }
              }
            />
          </Box>
        )}
      </Box>

      {data ? (
        <>
          <Box sx={{ display: 'flex' }}>
            <PlayerPanel jugador={data.judoka1} side={AZUL} label="AZUL" />
            <Divider orientation="vertical" flexItem sx={{ bgcolor: '#111827', width: '2px' }} />
            <PlayerPanel jugador={data.judoka2} side={BLANCO} label="BLANCO" />
          </Box>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 2px 1fr',
              borderTop: '1px solid #111827',
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', bgcolor: AZUL.scoreBg }}>
              <ScoreCell value={data.judoka1Ippones} label="IPPON" />
              <ScoreCell value={data.judoka1Wazaris} label="WAZARI" />
              <ScoreCell value={data.judoka1Shidos} label="SHIDO" isShido />
            </Box>
            <Box sx={{ bgcolor: '#111827' }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', bgcolor: BLANCO.scoreBg }}>
              <ScoreCell value={data.judoka2Ippones} label="IPPON" />
              <ScoreCell value={data.judoka2Wazaris} label="WAZARI" />
              <ScoreCell value={data.judoka2Shidos} label="SHIDO" isShido />
            </Box>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 5,
            minHeight: 180,
          }}
        >
          <Typography sx={{ color: '#1f2937', fontStyle: 'italic', fontSize: '0.85rem', letterSpacing: 1 }}>
            SIN COMBATE
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
