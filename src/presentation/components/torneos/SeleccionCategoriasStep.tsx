'use client'
import {
  Box, Typography, Checkbox, FormControlLabel, Divider, Chip,
  Button, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Categoria, GrupoEdad, GeneroCategoria } from '../../../domain/models/Categoria'
import { useCategorias } from '../../hooks/useCategorias'

const GRUPOS: GrupoEdad[] = ['infantil', 'cadete', 'senior']
const GENEROS: GeneroCategoria[] = ['femenino', 'masculino', 'mixto']
const ETIQUETA_GENERO: Record<GeneroCategoria, string> = { femenino: 'Femenino', masculino: 'Masculino', mixto: 'Mixto' }
const ETIQUETA_EDAD: Record<GrupoEdad, string> = { infantil: 'Infantil', cadete: 'Cadete', senior: 'Senior' }

interface Props {
  seleccionadas: string[]
  onChange: (ids: string[]) => void
  onVolver: () => void
  onGuardar: () => void
  guardando: boolean
  error: string | null
}

function triState(total: number, seleccionados: number): boolean | 'indeterminate' {
  if (seleccionados === 0) return false
  if (seleccionados === total) return true
  return 'indeterminate'
}

export function SeleccionCategoriasStep({ seleccionadas, onChange, onVolver, onGuardar, guardando, error }: Props) {
  const { categorias, cargando } = useCategorias()

  const toggle = (id: string) => {
    onChange(seleccionadas.includes(id) ? seleccionadas.filter(s => s !== id) : [...seleccionadas, id])
  }

  const toggleGrupo = (grupo: GrupoEdad, genero: GeneroCategoria) => {
    const ids = categorias.filter(c => c.edad === grupo && c.genero === genero).map(c => c.id)
    const todos = ids.every(id => seleccionadas.includes(id))
    if (todos) onChange(seleccionadas.filter(id => !ids.includes(id)))
    else onChange([...new Set([...seleccionadas, ...ids])])
  }

  const toggleEdad = (grupo: GrupoEdad) => {
    const ids = categorias.filter(c => c.edad === grupo).map(c => c.id)
    const todos = ids.every(id => seleccionadas.includes(id))
    if (todos) onChange(seleccionadas.filter(id => !ids.includes(id)))
    else onChange([...new Set([...seleccionadas, ...ids])])
  }

  const toggleTodo = () => {
    if (seleccionadas.length === categorias.length) onChange([])
    else onChange(categorias.map(c => c.id))
  }

  if (cargando) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>

  const estadoTodo = triState(categorias.length, seleccionadas.length)

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <FormControlLabel
        control={
          <Checkbox
            checked={estadoTodo === true}
            indeterminate={estadoTodo === 'indeterminate'}
            onChange={toggleTodo}
          />
        }
        label={<Typography fontWeight={600}>Seleccionar todas las categorías</Typography>}
      />
      <Divider sx={{ mb: 2 }} />

      {GRUPOS.map(grupo => {
        const catGrupo = categorias.filter(c => c.edad === grupo)
        if (catGrupo.length === 0) return null
        const selGrupo = catGrupo.filter(c => seleccionadas.includes(c.id)).length
        const estadoGrupo = triState(catGrupo.length, selGrupo)

        return (
          <Accordion key={grupo} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <FormControlLabel
                onClick={e => e.stopPropagation()}
                control={
                  <Checkbox
                    checked={estadoGrupo === true}
                    indeterminate={estadoGrupo === 'indeterminate'}
                    onChange={() => toggleEdad(grupo)}
                  />
                }
                label={<Typography fontWeight={600}>{ETIQUETA_EDAD[grupo]}</Typography>}
              />
            </AccordionSummary>
            <AccordionDetails>
              {GENEROS.map(genero => {
                const catGen = catGrupo.filter(c => c.genero === genero)
                if (catGen.length === 0) return null
                const selGen = catGen.filter(c => seleccionadas.includes(c.id)).length
                const estadoGen = triState(catGen.length, selGen)

                return (
                  <Box key={genero} sx={{ ml: 2, mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={estadoGen === true}
                          indeterminate={estadoGen === 'indeterminate'}
                          onChange={() => toggleGrupo(grupo, genero)}
                        />
                      }
                      label={<Typography fontWeight={500}>{ETIQUETA_GENERO[genero]}</Typography>}
                    />
                    <Box sx={{ ml: 3, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {catGen.map((cat: Categoria) => (
                        <Chip
                          key={cat.id}
                          label={cat.nombre.split(' ')[2]}
                          size="small"
                          onClick={() => toggle(cat.id)}
                          color={seleccionadas.includes(cat.id) ? 'primary' : 'default'}
                          variant={seleccionadas.includes(cat.id) ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Box>
                  </Box>
                )
              })}
            </AccordionDetails>
          </Accordion>
        )
      })}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onVolver} disabled={guardando}>← Volver</Button>
        <Button
          variant="contained"
          onClick={onGuardar}
          disabled={guardando || seleccionadas.length === 0}
          startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {guardando ? 'Creando torneo...' : `Crear torneo (${seleccionadas.length} categorías)`}
        </Button>
      </Box>
    </Box>
  )
}
