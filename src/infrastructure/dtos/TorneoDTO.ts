export interface TorneoFechaDTO {
  id: string
  torneo_id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  descripcion?: string
}

export interface TorneoCategoriaDTO {
  id: string
  torneo_id: string
  categoria_id: string
  fecha_torneo_id?: string
  categoria: {
    id: string
    nombre: string
    genero: string
    edad: string
    peso_minimo?: number
    peso_maximo?: number
    activo: boolean
  }
}

export interface TorneoDTO {
  id: string
  nombre: string
  fecha_limite_inscripcion: string
  hora_limite_inscripcion?: string
  ubicacion: string
  num_tatamis: number
  organizado_por?: string
  activo: boolean
  torneos_fechas: TorneoFechaDTO[]
  torneo_categoria: TorneoCategoriaDTO[]
}
