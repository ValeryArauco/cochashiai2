'use client'
import {
  Box, TextField, Typography, Button, MenuItem, Select,
  FormControl, InputLabel, FormHelperText, IconButton, Divider,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { torneoSchema, TorneoFormData } from './torneoSchema'
import { Club } from '../../../domain/models/Club'
import { useClubes } from '../../hooks/useClubes'

interface Props {
  defaultValues?: TorneoFormData
  onSiguiente: (data: TorneoFormData, club: Club) => void
}

export function TorneoFormStep({ defaultValues, onSiguiente }: Props) {
  const { clubes, cargando: cargandoClubes } = useClubes()
  const { control, handleSubmit, watch, formState: { errors } } = useForm<TorneoFormData>({
    resolver: zodResolver(torneoSchema),
    defaultValues: defaultValues ?? {
      nombre: '',
      clubId: '',
      fechaLimiteInscripcion: '',
      horaLimiteInscripcion: '',
      numTatamis: 1,
      fechas: [{ fecha: '', horaInicio: '', horaFin: '', descripcion: '' }],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'fechas' })
  const clubIdSeleccionado = watch('clubId')
  const fechaLimite = watch('fechaLimiteInscripcion')
  const horaLimite = watch('horaLimiteInscripcion')
  const fechasWatch = watch('fechas')

  function getConstraints(idx: number) {
    const prev = idx > 0 ? fechasWatch[idx - 1] : null
    const curr = fechasWatch[idx]

    const minFecha = prev?.fecha && prev.fecha > (fechaLimite ?? '')
      ? prev.fecha
      : fechaLimite || undefined

    let minHoraInicio: string | undefined
    if (curr?.fecha && fechaLimite && curr.fecha === fechaLimite) {
      minHoraInicio = horaLimite || '00:00'
    }
    if (prev && curr?.fecha && prev.fecha && curr.fecha === prev.fecha) {
      minHoraInicio = prev.horaFin || '23:59'
    }

    const minHoraFin = curr?.horaInicio || undefined

    return { minFecha, minHoraInicio, minHoraFin }
  }

  const onSubmit = (data: TorneoFormData) => {
    const club = clubes.find(c => c.id === data.clubId)
    if (club) onSiguiente(data, club)
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Controller
        name="nombre"
        control={control}
        render={({ field }) => (
          <TextField label="Nombre del torneo" {...field} error={!!errors.nombre} helperText={errors.nombre?.message} fullWidth />
        )}
      />

      <Controller
        name="clubId"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.clubId}>
            <InputLabel>Ubicación (club)</InputLabel>
            <Select label="Ubicación (club)" {...field} value={field.value ?? ''} disabled={cargandoClubes}>
              {clubes.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  <Box>
                    <Typography variant="body2">{c.nombreClub}</Typography>
                    {c.direccion && <Typography variant="caption" color="text.secondary">{c.direccion}</Typography>}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.clubId && <FormHelperText>{errors.clubId.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
        <Controller
          name="fechaLimiteInscripcion"
          control={control}
          render={({ field }) => (
            <TextField
              label="Fecha límite inscripción"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              {...field}
              value={field.value ?? ''}
              error={!!errors.fechaLimiteInscripcion}
              helperText={errors.fechaLimiteInscripcion?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="horaLimiteInscripcion"
          control={control}
          render={({ field }) => (
            <TextField
              label="Hora límite (opcional)"
              type="time"
              slotProps={{ inputLabel: { shrink: true } }}
              {...field}
              value={field.value ?? ''}
              fullWidth
            />
          )}
        />
        <Controller
          name="numTatamis"
          control={control}
          render={({ field }) => (
            <TextField
              label="Número de tatamis"
              type="number"
              {...field}
              onChange={e => field.onChange(Number(e.target.value))}
              error={!!errors.numTatamis}
              helperText={errors.numTatamis?.message}
              fullWidth
              inputProps={{ min: 1 }}
            />
          )}
        />
      </Box>

      <Divider />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight={600}>Fechas del torneo</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => append({ fecha: '', horaInicio: '', horaFin: '', descripcion: '' })}
        >
          Agregar fecha
        </Button>
      </Box>

      {errors.fechas && typeof errors.fechas.message === 'string' && (
        <Typography color="error" variant="caption">{errors.fechas.message}</Typography>
      )}

      {fields.map((field, idx) => {
        const { minFecha, minHoraInicio, minHoraFin } = getConstraints(idx)
        return (
        <Box
          key={field.id}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
              Día {idx + 1}
            </Typography>
            <IconButton
              onClick={() => remove(idx)}
              disabled={fields.length === 1}
              color="error"
              size="small"
              sx={{ m: -1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.5fr 1fr 1fr' }, gap: 2 }}>
            <Controller
              name={`fechas.${idx}.fecha`}
              control={control}
              render={({ field: f }) => (
                <TextField
                  label="Fecha"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: minFecha } }}
                  {...f}
                  value={f.value ?? ''}
                  error={!!errors.fechas?.[idx]?.fecha}
                  helperText={errors.fechas?.[idx]?.fecha?.message}
                  size="small"
                  fullWidth
                />
              )}
            />
            <Controller
              name={`fechas.${idx}.horaInicio`}
              control={control}
              render={({ field: f }) => (
                <TextField
                  label="Hora inicio"
                  type="time"
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: minHoraInicio } }}
                  {...f}
                  value={f.value ?? ''}
                  error={!!errors.fechas?.[idx]?.horaInicio}
                  helperText={errors.fechas?.[idx]?.horaInicio?.message}
                  size="small"
                  fullWidth
                />
              )}
            />
            <Controller
              name={`fechas.${idx}.horaFin`}
              control={control}
              render={({ field: f }) => (
                <TextField
                  label="Hora fin"
                  type="time"
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: minHoraFin } }}
                  {...f}
                  value={f.value ?? ''}
                  error={!!errors.fechas?.[idx]?.horaFin}
                  helperText={errors.fechas?.[idx]?.horaFin?.message}
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>

          <Controller
            name={`fechas.${idx}.descripcion`}
            control={control}
            render={({ field: f }) => (
              <TextField
                label="Descripción (opcional)"
                {...f}
                value={f.value ?? ''}
                size="small"
                fullWidth
                placeholder="Ej: Pesaje, Competencias, Premiación…"
              />
            )}
          />
        </Box>
      )})}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
        <Button type="submit" variant="contained">Siguiente →</Button>
      </Box>
    </Box>
  )
}
