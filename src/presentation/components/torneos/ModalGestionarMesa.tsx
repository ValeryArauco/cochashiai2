'use client'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Stack, Alert, CircularProgress,
  Select, MenuItem, FormControl, Chip, Box,
} from '@mui/material'
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant'
import { useGestionarMesa } from '../../hooks/useGestionarMesa'

interface Props {
  abierto: boolean
  onCerrar: () => void
  numTatamis: number
}

export function ModalGestionarMesa({ abierto, onCerrar, numTatamis }: Props) {
  const { usuarios, cargando, guardando, error, asignarTatami } = useGestionarMesa()

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <TableRestaurantIcon fontSize="small" />
          <span>Operadores de mesa</span>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : usuarios.length === 0 ? (
          <Alert severity="info">
            No hay usuarios con rol <strong>mesa</strong> registrados.
            Crea la cuenta del operador normalmente y luego ejecuta en Supabase:
            <br />
            <code>UPDATE usuarios SET rol = &apos;mesa&apos; WHERE correo = &apos;...&apos;;</code>
          </Alert>
        ) : (
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {usuarios.map(u => (
              <Stack
                key={u.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                {/* Info usuario */}
                <Box flex={1} minWidth={0}>
                  <Typography variant="body2" fontWeight="medium" noWrap>
                    {u.nombre} {u.apellidoPaterno ?? ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {u.correo}
                  </Typography>
                </Box>

                {/* Selector tatami */}
                <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                  {guardando === u.id && <CircularProgress size={16} />}
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                      value={u.tatamiAsignado ?? 0}
                      disabled={guardando === u.id}
                      onChange={e => {
                        const val = Number(e.target.value)
                        asignarTatami(u.id, val === 0 ? null : val)
                      }}
                    >
                      <MenuItem value={0}>
                        <Chip label="Sin asignar" size="small" color="default" variant="outlined" />
                      </MenuItem>
                      {Array.from({ length: numTatamis }, (_, i) => i + 1).map(t => (
                        <MenuItem key={t} value={t}>Tatami {t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCerrar}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
