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
import { GenerarLlavesModal } from './GenerarLlavesModal'
import { useLlaves } from '../../hooks/useLlaves'

const ESTADO_LABEL: Record<string, { label: string; color: 'warning' | 'info' | 'success' | 'error' }> = {
  pendiente_entrenador: { label: 'Pendiente sensei', color: 'warning' },
  aprobado_sensei:     { label: 'Pendiente admin', color: 'info' },
  aprobado_admin:      { label: 'Aprobado', color: 'success' },
  rechazado:           { label: 'Rechazado', color: 'error' },
}

interface Props {
  torneo: Torneo
  rol: RolUsuario
  judoka: Judoka | null
  inscripcionActual: Inscripcion | null
  inscripcionAbierta: boolean
}

export function AccionesTorneo({ torneo, rol, judoka, inscripcionActual, inscripcionAbierta }: Props) {
  const [modalInscripcion, setModalInscripcion] = useState(false)
  const [modalSensei, setModalSensei] = useState(false)
  const [modalAdmin, setModalAdmin] = useState(false)
  const [modalLlaves, setModalLlaves] = useState(false)

  const primeraTorneoCategoriaId = torneo.torneoCategorias[0]?.id ?? ''

  const { generando, error: errorLlaves, generar } = useLlaves(
    primeraTorneoCategoriaId, torneo.id, torneo.numTatamis
  )

  if (rol === 'judoka') {
    if (inscripcionActual) {
      const estado = ESTADO_LABEL[inscripcionActual.estado]
      return (
        <Chip
          label={estado?.label ?? inscripcionActual.estado}
          color={estado?.color ?? 'default'}
          variant="outlined"
        />
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
        />
      </>
    )
  }

  // admin
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Button variant="outlined" onClick={() => setModalAdmin(true)}>
        Gestionar solicitudes
      </Button>
      <Button variant="contained" color="secondary" onClick={() => setModalLlaves(true)}>
        Generar llaves
      </Button>
      <ModalSolicitudesAdmin
        abierto={modalAdmin}
        onCerrar={() => setModalAdmin(false)}
        torneoId={torneo.id}
      />
      <GenerarLlavesModal
        abierto={modalLlaves}
        onCerrar={() => setModalLlaves(false)}
        onGenerar={generar}
        generando={generando}
        error={errorLlaves}
      />
    </Stack>
  )
}
