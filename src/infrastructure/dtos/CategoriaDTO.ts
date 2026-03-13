export interface CategoriaDTO {
  id: string
  nombre: string
  genero: string
  edad: string
  peso_minimo?: number
  peso_maximo?: number
  activo: boolean
}
