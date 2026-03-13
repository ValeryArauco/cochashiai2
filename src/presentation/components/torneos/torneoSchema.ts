import { z } from 'zod'

export const torneoFechaSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  horaInicio: z.string().min(1, 'La hora de inicio es requerida'),
  horaFin: z.string().optional(),
  descripcion: z.string().optional(),
})

export const torneoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  clubId: z.string().min(1, 'Selecciona un club como ubicación'),
  fechaLimiteInscripcion: z.string().min(1, 'La fecha límite de inscripción es requerida'),
  horaLimiteInscripcion: z.string().optional(),
  numTatamis: z.number({ error: 'Ingresa un número válido' }).int().min(1, 'Debe haber al menos 1 tatami'),
  fechas: z.array(torneoFechaSchema).min(1, 'Debe agregar al menos una fecha'),
})

export type TorneoFormData = z.infer<typeof torneoSchema>
export type TorneoFechaFormData = z.infer<typeof torneoFechaSchema>
