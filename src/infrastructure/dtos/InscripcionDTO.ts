export interface InscripcionDTO {
  id: string
  torneo_categoria_id: string
  judoka_id: string
  peso_oficial?: number
  aprobado_por_sensei_id?: string
  fecha_aprobacion_sensei?: string
  estado: string
  judoka?: {
    id: string
    usuario_id: string
    cinturon_actual?: string
    peso_competitivo?: number
    usuario: {
      id: string
      nombre: string
      apellido_paterno?: string
      apellido_materno?: string
      correo: string
      fecha_nacimiento?: string
      genero?: string
      avatar_url?: string
      rol: string
    }
  }
  torneo_categoria?: {
    id: string
    torneo_id: string
    categoria_id: string
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
}
