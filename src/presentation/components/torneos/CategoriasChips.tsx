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
        return (
          <Box key={grupo} sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              {ETIQUETA_EDAD[grupo]}:
            </Typography>
            {cats.map(cat => (
              <Chip
                key={cat.id}
                label={cat.nombre}
                size="small"
                color={COLOR_EDAD[grupo]}
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )
      })}
    </Box>
  )
}
