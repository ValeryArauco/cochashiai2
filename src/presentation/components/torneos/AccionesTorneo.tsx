'use client'
import { Button, Chip, Stack } from '@mui/material'
import { useState } from 'react'
import { Torneo } from '../../../domain/models/Torneo'
import { Inscripcion } from '../../../domain/models/Inscripcion'
import { Judoka } from '../../../domain/models/Judoka'
import { RolUsuario } from '../../../domain/models/Usuario'
import { ModalInscripcion } from './ModalInscripcion'
import { ModalSolicitudesSensei } from './ModalSolicitudesSensei'
import { ModalSolicitudesAdmin } from './ModalSolicitudesAdmin'
import { GenerarTodasLlavesModal } from './GenerarTodasLlavesModal'
import { ModalGestionarMesa } from './ModalGestionarMesa'
import { useInscripcion } from '../../hooks/useInscripcion'
import { ResultadoCategoria, ProgresoGeneracion } from '../../hooks/useGenerarTorneo'

const ESTADO_LABEL: Record<string, { label: string; color: 'warning' | 'info' | 'success' | 'error' | 'default' }> = {
  pendiente_entrenador: { label: 'Pendiente sensei', color: 'warning' },
  aprobado_entrenador:  { label: 'Aprobado por sensei', color: 'info' },
  pendiente_pago:       { label: 'Pendiente de pago', color: 'warning' },
  confirmado:           { label: 'Confirmado', color: 'success' },
  cancelado:            { label: 'Cancelado', color: 'default' },
}

interface Props {
  torneo: Torneo
  rol: RolUsuario
  judoka: Judoka | null
  inscripcionActual: Inscripcion | null
  inscripcionAbierta: boolean
  onInscripcionCancelada: () => void
  generarTodas: () => void
  generandoLlaves: boolean
  progresoLlaves: ProgresoGeneracion | null
  resultadosLlaves: ResultadoCategoria[] | null
  errorLlaves: string | null
  limpiarResultadosLlaves: () => void
}

export function AccionesTorneo({
  torneo, rol, judoka, inscripcionActual, inscripcionAbierta,
  onInscripcionCancelada,
  generarTodas, generandoLlaves, progresoLlaves, resultadosLlaves, errorLlaves, limpiarResultadosLlaves,
}: Props) {
  const [modalInscripcion, setModalInscripcion] = useState(false)
  const [modalSensei, setModalSensei] = useState(false)
  const [modalAdmin, setModalAdmin] = useState(false)
  const [modalLlaves, setModalLlaves] = useState(false)
  const [modalMesa, setModalMesa] = useState(false)

  const { cancelando, cancelar } = useInscripcion(judoka, torneo.id)

  const handleCerrarLlaves = () => {
    setModalLlaves(false)
    limpiarResultadosLlaves()
  }

  if (rol === 'judoka') {
    if (inscripcionActual) {
      const estado = ESTADO_LABEL[inscripcionActual.estado]
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={estado?.label ?? inscripcionActual.estado}
            color={estado?.color ?? 'default'}
            variant="outlined"
          />
          {inscripcionActual.estado === 'pendiente_entrenador' && (
            <Button
              size="small"
              color="error"
              variant="outlined"
              disabled={cancelando}
              onClick={() => cancelar(inscripcionActual.id, inscripcionActual.estado, onInscripcionCancelada)}
            >
              {cancelando ? 'Cancelando...' : 'Cancelar solicitud'}
            </Button>
          )}
        </Stack>
      )
    }
    if (inscripcionAbierta && judoka) {
      return (
        <>
          <Button variant="contained" onClick={() => setModalInscripcion(true)}>
            Inscribirse
          </Button>
          <ModalInscripcion
            abierto={modalInscripcion}
            onCerrar={() => setModalInscripcion(false)}
            onExito={() => { setModalInscripcion(false); onInscripcionCancelada() }}
            judoka={judoka}
            torneoCategorias={torneo.torneoCategorias}
            torneoId={torneo.id}
          />
        </>
      )
    }
    return null
  }

  if (rol === 'sensei') {
    return (
      <>
        <Button variant="outlined" onClick={() => setModalSensei(true)}>
          Ver solicitudes
        </Button>
        <ModalSolicitudesSensei
          abierto={modalSensei}
          onCerrar={() => setModalSensei(false)}
          torneoId={torneo.id}
          clubId={judoka?.clubId}
        />
      </>
    )
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Button variant="outlined" onClick={() => setModalAdmin(true)}>
        Gestionar solicitudes
      </Button>
      <Button variant="contained" color="secondary" onClick={() => setModalLlaves(true)}>
        Generar llaves
      </Button>
      <Button variant="outlined" color="info" onClick={() => setModalMesa(true)}>
        Gestionar mesa
      </Button>
      <ModalSolicitudesAdmin
        abierto={modalAdmin}
        onCerrar={() => setModalAdmin(false)}
        torneoId={torneo.id}
      />
      <GenerarTodasLlavesModal
        abierto={modalLlaves}
        onCerrar={handleCerrarLlaves}
        onGenerar={generarTodas}
        generando={generandoLlaves}
        progreso={progresoLlaves}
        resultados={resultadosLlaves}
        error={errorLlaves}
        totalCategorias={torneo.torneoCategorias.length}
      />
      <ModalGestionarMesa
        abierto={modalMesa}
        onCerrar={() => setModalMesa(false)}
        numTatamis={torneo.numTatamis}
      />
    </Stack>
  )
}
