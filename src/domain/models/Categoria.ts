export type GrupoEdad = 'infantil' | 'cadete' | 'senior'
export type GeneroCategoria = 'masculino' | 'femenino' | 'mixto'

export interface Categoria {
  id: string
  nombre: string
  genero: GeneroCategoria
  edad: GrupoEdad
  pesoMinimo?: number
  pesoMaximo?: number
  activo: boolean
}
