import { z } from 'zod'

export const perfilSchema = z.object({
    fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
    celular: z.string().regex(/^\d{8}$/, 'El número debe tener 8 dígitos'),
    genero: z.enum(['Masculino', 'Femenino', 'Prefiero no decir'], 'El género es requerido'),
    contactoEmergencia: z.string().regex(/^\d{8}$/, 'El número debe tener 8 dígitos'),
    relacionContactoEmergencia: z.enum(['madre', 'padre', 'tutor', 'hermano/a', 'conyuge', 'amigo/a', 'otro'], 'La relación es requerida'),
    tipoSangre: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 'El tipo de sangre es requerido'),
})

export type PerfilData = z.infer<typeof perfilSchema>
