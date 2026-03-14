'use client'

import { use } from 'react'
import { Box, CircularProgress, Alert, Divider, IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from 'next/navigation'
import { useTorneoDetalle } from '@/presentation/hooks/useTorneoDetalle'
import { useAuth } from '@/presentation/context/AuthContext'
import { useJudoka } from '@/presentation/hooks/useJudoka'
import { useLlaves } from '@/presentation/hooks/useLlaves'
import { TorneoDetalleHeader } from '@/presentation/components/torneos/TorneoDetalleHeader'
import { TorneoFechasTable } from '@/presentation/components/torneos/TorneoFechasTable'
import { CategoriasChips } from '@/presentation/components/torneos/CategoriasChips'
import { AccionesTorneo } from '@/presentation/components/torneos/AccionesTorneo'
import { LlavesView } from '@/presentation/components/torneos/LlavesView'
import { ResultadosView } from '@/presentation/components/torneos/ResultadosView'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TorneoDetallePage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { usuario } = useAuth()
  const { judoka } = useJudoka()
  const { torneo, inscripcionActual, cargando, error, inscripcionAbierta } = useTorneoDetalle(id)

  const primeraTorneoCategoriaId = torneo?.torneoCategorias[0]?.id ?? ''
  const { llave, combates, cargando: cargandoLlaves, registrarResultado } = useLlaves(
    primeraTorneoCategoriaId, id, torneo?.numTatamis ?? 1
  )

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !torneo) {
    return (
      <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
        <Alert severity="error">{error ?? 'Torneo no encontrado'}</Alert>
      </Box>
    )
  }

  const hayCombatesFinalizados = combates.some(c => c.estado === 'finalizado')
  const combatesPorCategoria: Record<string, typeof combates> = {}
  if (hayCombatesFinalizados && torneo.torneoCategorias[0]) {
    combatesPorCategoria[torneo.torneoCategorias[0].categoriaId] = combates
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
          />
        </Box>
      )}

      

      <LlavesView
        llave={llave}
        combates={combates}
        cargando={cargandoLlaves}
        rol={usuario?.rol ?? 'judoka'}
        onRegistrarResultado={registrarResultado}
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
