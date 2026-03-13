'use client'
import { Box, Chip, Typography } from '@mui/material'
import { Categoria, GrupoEdad } from '../../../domain/models/Categoria'

const ETIQUETA_EDAD: Record<GrupoEdad, string> = { infantil: 'Infantil', cadete: 'Cadete', senior: 'Senior' }
const COLOR_EDAD: Record<GrupoEdad, 'primary' | 'secondary' | 'success'> = {
  infantil: 'primary', cadete: 'secondary', senior: 'success',
}

export function CategoriasChips({ categorias }: { categorias: Categoria[] }) {
  const grupos: GrupoEdad[] = ['infantil', 'cadete', 'senior']

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>Categorías habilitadas</Typography>
      {grupos.map(grupo => {
        const cats = categorias.filter(c => c.edad === grupo)
        if (cats.length === 0) return null

        // Agrupar por género
        const porGenero = cats.reduce((acc, cat) => {
          const gen = cat.genero || 'Mixto'
          if (!acc[gen]) acc[gen] = []
          acc[gen].push(cat)
          return acc
        }, {} as Record<string, Categoria[]>)

        return (
          <Box key={grupo} sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
              {ETIQUETA_EDAD[grupo]}
            </Typography>
            
            {Object.entries(porGenero).map(([genero, categoriasGenero]) => (
              <Box key={genero} sx={{ mb: 1, ml: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1, minWidth: 70 }}>
                  {genero}:
                </Typography>
                {categoriasGenero.map(cat => (
                  <Chip
                    key={cat.id}
                    label={cat.nombre.split(' ')[2]}
                    size="small"
                    color={COLOR_EDAD[grupo]}
                    variant="outlined"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            ))}
          </Box>
        )
      })}
    </Box>
  )
}
