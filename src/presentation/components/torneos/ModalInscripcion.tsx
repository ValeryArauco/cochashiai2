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
  onExito: () => void
  judoka: Judoka
  torneoCategorias: TorneoCategoria[]
  torneoId: string
}

export function ModalInscripcion({ abierto, onCerrar, onExito, judoka, torneoCategorias, torneoId }: Props) {
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
                Tu grupo de edad o género no coincide con ninguna categoría habilitada.
              </Alert>
            ) : (
              <>
                <Box 
                  sx={{ 
                    mb: 3, 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 2, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                      Tu grupo habilitado
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {elegibles[0].categoria.edad} · {elegibles[0].categoria.genero}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" mb={1.5}>
                  Selecciona tu división de peso:
                </Typography>
                <RadioGroup 
                  value={torneoCategoriaIdSeleccionada} 
                  onChange={e => setSeleccionada(e.target.value)}
                  sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
                    gap: 1 
                  }}
                >
                  {[...elegibles]
                    .sort((a, b) => {
                      const pesoMinA = a.categoria.pesoMinimo ?? 0;
                      const pesoMaxA = a.categoria.pesoMaximo ?? 999;
                      const pesoMinB = b.categoria.pesoMinimo ?? 0;
                      const pesoMaxB = b.categoria.pesoMaximo ?? 999;
                      
                      if (pesoMinA !== pesoMinB) return pesoMinA - pesoMinB;
                      return pesoMaxA - pesoMaxB;
                    })
                    .map(tc => {
                    const esSeleccionado = torneoCategoriaIdSeleccionada === tc.id
                    const min = tc.categoria.pesoMinimo
                    const max = tc.categoria.pesoMaximo
                    
                    let pesoLabel = ''
                    if (min != null && max != null) {
                      pesoLabel = `${min} – ${max} kg`
                    } else if (min != null) {
                      pesoLabel = `Más de ${min} kg`
                    } else if (max != null) {
                      pesoLabel = `Hasta ${max} kg`
                    } else {
                      pesoLabel = tc.categoria.nombre.split(' ').pop() || 'Abierto'
                    }

                    return (
                      <FormControlLabel
                        key={tc.id}
                        value={tc.id}
                        control={<Radio size="small" />}
                        label={
                          <Typography fontWeight={esSeleccionado ? 600 : 400}>
                            {pesoLabel}
                          </Typography>
                        }
                        sx={{
                          m: 0,
                          p: 1.5,
                          border: '1px solid',
                          borderColor: esSeleccionado ? 'primary.main' : 'divider',
                          borderRadius: 2,
                          bgcolor: esSeleccionado ? 'primary.50' : 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: esSeleccionado ? 'primary.50' : 'action.hover'
                          }
                        }}
                      />
                    )
                  })}
                </RadioGroup>
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={exito ? () => { onExito(); onCerrar() } : onCerrar}>
          {exito ? 'Cerrar' : 'Cancelar'}
        </Button>
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
