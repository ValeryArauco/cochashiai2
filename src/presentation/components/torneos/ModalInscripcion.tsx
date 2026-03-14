'use client'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, RadioGroup, FormControlLabel, Radio, Typography,
  Alert, CircularProgress, Box,
} from '@mui/material'
import { useState } from 'react'
import { Judoka } from '../../../domain/models/Judoka'
import { TorneoCategoria } from '../../../domain/models/TorneoCategoria'
import { categoriasElegibles, useInscripcion } from '../../hooks/useInscripcion'

const CAMPOS_REQUERIDOS: { label: string; check: (j: Judoka) => boolean }[] = [
  { label: 'Fecha de nacimiento', check: j => !!j.usuario.fechaNacimiento },
  { label: 'Género (debe ser Masculino o Femenino)', check: j => j.usuario.genero === 'Masculino' || j.usuario.genero === 'Femenino' },
  { label: 'Celular', check: j => !!j.usuario.celular },
  { label: 'Tipo de sangre', check: j => !!j.tipoSangre },
  { label: 'Contacto de emergencia', check: j => !!j.contactoEmergencia },
  { label: 'Relación con contacto de emergencia', check: j => !!j.relacionContacto },
]

function camposFaltantes(judoka: Judoka): string[] {
  return CAMPOS_REQUERIDOS.filter(c => !c.check(judoka)).map(c => c.label)
}

interface Props {
  abierto: boolean
  onCerrar: () => void
  judoka: Judoka
  torneoCategorias: TorneoCategoria[]
  torneoId: string
}

export function ModalInscripcion({ abierto, onCerrar, judoka, torneoCategorias, torneoId }: Props) {
  const [torneoCategoriaIdSeleccionada, setSeleccionada] = useState('')
  const { enviando, error, exito, solicitar } = useInscripcion(judoka, torneoId)
  const elegibles = categoriasElegibles(judoka, torneoCategorias)
  const faltantes = camposFaltantes(judoka)

  const handleConfirmar = async () => {
    if (!torneoCategoriaIdSeleccionada) return
    await solicitar(torneoCategoriaIdSeleccionada)
  }

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>Solicitar inscripción</DialogTitle>
      <DialogContent>
        {exito ? (
          <Alert severity="success">Tu solicitud de inscripción fue enviada correctamente.</Alert>
        ) : faltantes.length > 0 ? (
          <Alert severity="warning">
            Para inscribirte debes completar estos datos en tu perfil:
            <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
              {faltantes.map(campo => <li key={campo}>{campo}</li>)}
            </Box>
          </Alert>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {elegibles.length === 0 ? (
              <Alert severity="warning">
                No hay categorías disponibles para tu perfil en este torneo.
                Tu grupo de edad, género o peso no coincide con ninguna categoría habilitada.
              </Alert>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Selecciona la categoría en la que deseas participar:
                </Typography>
                <RadioGroup value={torneoCategoriaIdSeleccionada} onChange={e => setSeleccionada(e.target.value)}>
                  {elegibles.map(tc => (
                    <FormControlLabel
                      key={tc.id}
                      value={tc.id}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{tc.categoria.nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tc.categoria.edad} · {tc.categoria.genero}
                            {tc.categoria.pesoMinimo !== undefined && tc.categoria.pesoMaximo !== undefined
                              ? ` · ${tc.categoria.pesoMinimo}–${tc.categoria.pesoMaximo} kg`
                              : ''}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar}>{exito ? 'Cerrar' : 'Cancelar'}</Button>
        {!exito && faltantes.length === 0 && elegibles.length > 0 && (
          <Button
            variant="contained"
            onClick={handleConfirmar}
            disabled={!torneoCategoriaIdSeleccionada || enviando}
            startIcon={enviando ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {enviando ? 'Enviando...' : 'Confirmar inscripción'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
