'use client'
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box, Button, TextField, Typography, MenuItem,
  Select, FormControl, InputLabel, Alert, CircularProgress, Divider
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { Judoka, TipoSangre, RelacionContacto } from '../../../domain/models/Judoka'
import { Genero } from '../../../domain/models/Usuario'
import { PerfilData, perfilSchema } from './perfilSchema'
import { PerfilMapper } from './perfilMapper'


interface Props {
  judoka: Judoka
  guardando: boolean
  error: string | null
  exito: boolean
  onGuardar: (datos: Partial<Judoka>) => void
}

const generos: Genero[] = ['Masculino', 'Femenino', 'Prefiero no decir']
const tiposSangre: TipoSangre[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const relaciones: RelacionContacto[] = ['madre', 'padre', 'tutor', 'hermano/a', 'conyuge', 'amigo/a', 'otro']

export function FormPerfil({ judoka, guardando, error, exito, onGuardar }: Props) {
  const { handleSubmit, reset, control, formState: { errors } } = useForm<PerfilData>({
    resolver: zodResolver(perfilSchema),
  })

  useEffect(() => {
    reset({
      fechaNacimiento: judoka.usuario.fechaNacimiento ?? '',
      celular: judoka.usuario.celular ?? '',
      genero: judoka.usuario.genero as Genero | undefined,
      contactoEmergencia: judoka.contactoEmergencia ?? '',
      relacionContactoEmergencia: judoka.relacionContacto as RelacionContacto | undefined,
      tipoSangre: judoka.tipoSangre as TipoSangre | undefined,
    })
  }, [judoka, reset])

  const onSubmit = (data: PerfilData) => onGuardar(PerfilMapper.toJudoka(data, judoka))

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Typography variant="h5" mb={2}>Información Personal</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {exito && <Alert severity="success" sx={{ mb: 2 }}>Perfil actualizado correctamente</Alert>}

      <Typography variant="h6" color="text.secondary" mb={1}>
        Información de Contacto y Demografía
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Controller
          name="fechaNacimiento"
          control={control}
          render={({ field }) => (
            <TextField
              label="Fecha de Nacimiento"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...field}
              value={field.value ?? ''}
              error={!!errors.fechaNacimiento}
              helperText={errors.fechaNacimiento?.message}
              disabled={guardando}
            />
          )}
        />

        <Controller
          name="celular"
          control={control}
          render={({ field }) => (
            <TextField
              label="Celular"
              {...field}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
              error={!!errors.celular}
              helperText={errors.celular?.message}
              disabled={guardando}
              inputProps={{ maxLength: 8 }}
            />
          )}
        />

        <Controller
          name="genero"
          control={control}
          render={({ field }) => (
            <FormControl disabled={guardando}>
              <InputLabel>Género</InputLabel>
              <Select label="Género" {...field} value={field.value ?? ''}>
                {generos.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="h6" color="text.secondary" mb={1}>
        Información Médica y de Emergencia
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
        <Controller
          name="tipoSangre"
          control={control}
          render={({ field }) => (
            <FormControl disabled={guardando}>
              <InputLabel>Tipo de sangre</InputLabel>
              <Select label="Tipo de sangre" {...field} value={field.value ?? ''}>
                {tiposSangre.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        />
        
        <Controller
          name="contactoEmergencia"
          control={control}
          render={({ field }) => (
            <TextField
              label="Contacto de Emergencia"
              {...field}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
              error={!!errors.contactoEmergencia}
              helperText={errors.contactoEmergencia?.message}
              disabled={guardando}
              inputProps={{ maxLength: 8 }}
            />
          )}
        />

        <Controller
          name="relacionContactoEmergencia"
          control={control}
          render={({ field }) => (
            <FormControl disabled={guardando}>
              <InputLabel>Relación</InputLabel>
              <Select label="Relación" {...field} value={field.value ?? ''}>
                {relaciones.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        />

        
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', flex: 1, alignItems: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={guardando}
          startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </Box>
    </Box>
  )
}