'use client'

import { use, useState } from 'react'
import {
  Box, CircularProgress, Alert, Divider, IconButton,
  FormControl, InputLabel, Select, MenuItem, Typography,
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from 'next/navigation'
import { useTorneoDetalle } from '@/presentation/hooks/useTorneoDetalle'
import { useAuth } from '@/presentation/context/AuthContext'
import { useJudoka } from '@/presentation/hooks/useJudoka'
import { useLlaves } from '@/presentation/hooks/useLlaves'
import { useGenerarTorneo } from '@/presentation/hooks/useGenerarTorneo'
import { TorneoDetalleHeader } from '@/presentation/components/torneos/TorneoDetalleHeader'
import { TorneoFechasTable } from '@/presentation/components/torneos/TorneoFechasTable'
import { CategoriasChips } from '@/presentation/components/torneos/CategoriasChips'
import { AccionesTorneo } from '@/presentation/components/torneos/AccionesTorneo'
import { LlavesView } from '@/presentation/components/torneos/LlavesView'
import { ResultadosView } from '@/presentation/components/torneos/ResultadosView'
import { MesaTatamiView } from '@/presentation/components/torneos/MesaTatamiView'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TorneoDetallePage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { usuario } = useAuth()
  const { judoka } = useJudoka()
  const { torneo, inscripcionActual, cargando, error, inscripcionAbierta, recargarInscripcion } = useTorneoDetalle(id, judoka?.id)

  const [torneoCategoriaId, setTorneoCategoriaId] = useState<string>('')
  // Caer en la primera categoría si no hay selección manual
  const tcId = torneoCategoriaId || torneo?.torneoCategorias[0]?.id || ''

  const {
    llave, combates, cargando: cargandoLlaves,
    registrarResultado, iniciarCombate, reasignarTatami,
  } = useLlaves(tcId, id, torneo?.numTatamis ?? 1)

  const {
    generarTodas, generando: generandoLlaves, progreso: progresoLlaves,
    resultados: resultadosLlaves, error: errorLlaves, limpiarResultados,
  } = useGenerarTorneo(id, torneo ?? null)

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !torneo) {
    const noDisponible = !torneo || error === 'Torneo no encontrado'
    return (
      <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
        <IconButton onClick={() => router.back()} edge="start" sx={{ mb: 2 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Alert severity={noDisponible ? 'warning' : 'error'}>
          {noDisponible
            ? 'Este torneo no está disponible o fue eliminado.'
            : error}
        </Alert>
      </Box>
    )
  }

  // Vista Mesa: pantalla dedicada al operador de tatami
  if (usuario?.rol === 'mesa') {
    return (
      <Box sx={{ p: { xs: 1, md: 2 }, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ mb: 1 }}>
          <IconButton onClick={() => router.back()} edge="start" aria-label="Volver">
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <TorneoDetalleHeader torneo={torneo} />
        <MesaTatamiView
          torneoId={id}
          tatami={usuario.tatamiAsignado ?? 1}
          numTatamis={torneo.numTatamis}
        />
      </Box>
    )
  }

  const hayCombatesFinalizados = combates.some(c => c.estado === 'finalizado')
  const combatesPorCategoria: Record<string, typeof combates> = {}
  if (hayCombatesFinalizados) {
    const tc = torneo.torneoCategorias.find(t => t.id === tcId)
    if (tc) combatesPorCategoria[tc.categoriaId] = combates
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ mb: 2 }}>
        <IconButton onClick={() => router.back()} edge="start" aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <TorneoDetalleHeader torneo={torneo} />
      <TorneoFechasTable fechas={torneo.fechas} />

      <Box sx={{ mt: 2 }}>
        <CategoriasChips categorias={torneo.categorias} />
      </Box>

      {usuario && (
        <Box sx={{ mt: 3 }}>
          <AccionesTorneo
            torneo={torneo}
            rol={usuario.rol}
            judoka={judoka}
            inscripcionActual={inscripcionActual}
            inscripcionAbierta={inscripcionAbierta}
            onInscripcionCancelada={recargarInscripcion}
            generarTodas={generarTodas}
            generandoLlaves={generandoLlaves}
            progresoLlaves={progresoLlaves}
            resultadosLlaves={resultadosLlaves}
            errorLlaves={errorLlaves}
            limpiarResultadosLlaves={limpiarResultados}
          />
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Selector de categoría para las llaves */}
      {torneo.torneoCategorias.length > 1 && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            Ver llaves de:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              label="Categoría"
              value={tcId}
              onChange={(e: SelectChangeEvent) => setTorneoCategoriaId(e.target.value)}
            >
              {torneo.torneoCategorias.map(tc => (
                <MenuItem key={tc.id} value={tc.id}>
                  {tc.categoria.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <LlavesView
        llave={llave}
        combates={combates}
        cargando={cargandoLlaves}
        rol={usuario?.rol ?? 'judoka'}
        numTatamis={torneo.numTatamis}
        onRegistrarResultado={registrarResultado}
        onIniciarCombate={iniciarCombate}
        onReasignarTatami={reasignarTatami}
      />

      {hayCombatesFinalizados && (
        <ResultadosView
          torneo={torneo}
          combatesPorCategoria={combatesPorCategoria}
        />
      )}
    </Box>
  )
}
