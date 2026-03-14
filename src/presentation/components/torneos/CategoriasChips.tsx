'use client'
import { useState } from 'react'
import { Box, Chip, Typography } from '@mui/material'
import { Categoria, GrupoEdad } from '../../../domain/models/Categoria'

const ETIQUETA_EDAD: Record<GrupoEdad, string> = { infantil: 'Infantil', cadete: 'Cadete', senior: 'Senior' }
const COLOR_EDAD: Record<GrupoEdad, 'primary' | 'secondary' | 'success'> = {
  infantil: 'primary', cadete: 'secondary', senior: 'success',
}

export function CategoriasChips({ categorias }: { categorias: Categoria[] }) {
  const grupos: GrupoEdad[] = ['infantil', 'cadete', 'senior']
  const gruposHabilitados = grupos.filter(g => categorias.some(c => c.edad === g))
  
  const [edadSeleccionada, setEdadSeleccionada] = useState<GrupoEdad | null>(gruposHabilitados[0] || null)

  if (gruposHabilitados.length === 0) return null

  const categoriasMostradas = edadSeleccionada 
    ? categorias.filter(c => c.edad === edadSeleccionada)
    : []

  const porGenero = categoriasMostradas.reduce((acc, cat) => {
    const gen = cat.genero || 'Mixto'
    if (!acc[gen]) acc[gen] = []
    acc[gen].push(cat)
    return acc
  }, {} as Record<string, Categoria[]>)

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>Categorías habilitadas</Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {gruposHabilitados.map(grupo => (
          <Chip
            key={`selector-${grupo}`}
            label={ETIQUETA_EDAD[grupo]}
            onClick={() => setEdadSeleccionada(grupo)}
            color={edadSeleccionada === grupo ? COLOR_EDAD[grupo] : 'default'}
            variant={edadSeleccionada === grupo ? 'filled' : 'outlined'}
          />
        ))}
      </Box>

      {edadSeleccionada && (
        <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          {Object.entries(porGenero).map(([genero, categoriasGenero]) => (
            <Box key={genero} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {genero}
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: 'repeat(5, 1fr)', 
                  sm: 'repeat(3, 1fr)', 
                  md: 'repeat(auto-fill, minmax(100px, 1fr))' 
                }, 
                gap: { xs: 1, sm: 1.5 },
                width: '100%'
              }}>
                {categoriasGenero.map(cat => (
                  <Box
                    key={cat.id}
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="body2" fontWeight={500} color={`${COLOR_EDAD[edadSeleccionada]}.main`}>
                      {cat.nombre.split(' ')[2] || cat.nombre}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
