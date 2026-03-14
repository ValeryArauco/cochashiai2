'use client'
import {
  Dialog, DialogTitle, DialogContent, Stepper, Step, StepLabel, IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { TorneoFormStep } from './TorneoFormStep'
import { SeleccionCategoriasStep } from './SeleccionCategoriasStep'
import { useCrearTorneo } from '../../hooks/useCrearTorneo'

const PASOS = ['Información del torneo', 'Categorías']

interface Props {
  abierto: boolean
  onCerrar: () => void
  onExito: () => void
}

export function CrearTorneoModal({ abierto, onCerrar, onExito }: Props) {
  const {
    paso, formData, categoriasSeleccionadas, setCategoriasSeleccionadas,
    guardando, error, irAPaso2, volver, guardar, resetear,
  } = useCrearTorneo(onExito)

  const handleCerrar = () => {
    resetear()
    onCerrar()
  }

  return (
    <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Nuevo torneo
        <IconButton onClick={handleCerrar} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={paso - 1} sx={{ mb: 3 }}>
          {PASOS.map(label => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {paso === 1 && (
          <TorneoFormStep
            defaultValues={formData ?? undefined}
            onSiguiente={irAPaso2}
          />
        )}

        {paso === 2 && (
          <SeleccionCategoriasStep
            seleccionadas={categoriasSeleccionadas}
            onChange={setCategoriasSeleccionadas}
            onVolver={volver}
            onGuardar={guardar}
            guardando={guardando}
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
