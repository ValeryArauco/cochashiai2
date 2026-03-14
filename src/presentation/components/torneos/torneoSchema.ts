import { z } from 'zod'

export const torneoFechaSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  horaInicio: z.string().min(1, 'La hora de inicio es requerida'),
  horaFin: z.string().optional(),
  descripcion: z.string().optional(),
})

function toTs(fecha: string, hora: string): number {
  return new Date(`${fecha}T${hora || '23:59'}:00`).getTime()
}

export const torneoSchema = z
  .object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    clubId: z.string().min(1, 'Selecciona un club como ubicación'),
    fechaLimiteInscripcion: z.string().min(1, 'La fecha límite de inscripción es requerida'),
    horaLimiteInscripcion: z.string().optional(),
    numTatamis: z.number({ error: 'Ingresa un número válido' }).int().min(1, 'Debe haber al menos 1 tatami'),
    fechas: z.array(torneoFechaSchema).min(1, 'Debe agregar al menos una fecha'),
  })
  .superRefine((data, ctx) => {
    const { fechaLimiteInscripcion, horaLimiteInscripcion, fechas } = data

    if (!fechaLimiteInscripcion) return

    const limiteTs = toTs(fechaLimiteInscripcion, horaLimiteInscripcion ?? '00:00')
    fechas.forEach((f, i) => {
      if (!f.fecha || !f.horaInicio) return
      const inicioTs = toTs(f.fecha, f.horaInicio)
      if (inicioTs < limiteTs) {
        ctx.addIssue({
          code: 'custom',
          path: ['fechas', i, 'horaInicio'],
          message: `Debe ser después del cierre de inscripción (${fechaLimiteInscripcion} ${horaLimiteInscripcion ?? '00:00'})`,
        })
      }
    })

    fechas.forEach((f, i) => {
      if (!f.fecha || !f.horaInicio || !f.horaFin) return
      if (toTs(f.fecha, f.horaFin) <= toTs(f.fecha, f.horaInicio)) {
        ctx.addIssue({
          code: 'custom',
          path: ['fechas', i, 'horaFin'],
          message: 'La hora de fin debe ser posterior a la hora de inicio',
        })
      }
    })

    for (let i = 1; i < fechas.length; i++) {
      const prev = fechas[i - 1]
      const curr = fechas[i]
      if (prev.fecha && prev.horaInicio && curr.fecha && curr.horaInicio) {
        const finPrevTs = toTs(prev.fecha, prev.horaFin || '23:59')
        const inicioCurrTs = toTs(curr.fecha, curr.horaInicio)
        if (inicioCurrTs < finPrevTs) {
          ctx.addIssue({
            code: 'custom',
            path: ['fechas', i, 'horaInicio'],
            message: `Debe ser después del fin del día ${i} (${prev.fecha} ${prev.horaFin || '23:59'})`,
          })
        }
      }
    }
  })

export type TorneoFormData = z.infer<typeof torneoSchema>
export type TorneoFechaFormData = z.infer<typeof torneoFechaSchema>
