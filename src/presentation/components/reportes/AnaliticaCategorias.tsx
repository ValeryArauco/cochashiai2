'use client'
import { Box, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material'
import CategoryIcon from '@mui/icons-material/Category'
import { BarChart } from '@mui/x-charts/BarChart'
import { useState } from 'react'
import type { CategoriaCompetida } from '@/domain/models/Analytics'

const COLOR_EDAD: Record<string, string> = {
    infantil: '#2e7d32',
    cadete: '#1565c0',
    senior: '#e65100',
}

interface Props {
    categorias: CategoriaCompetida[]
    cargando: boolean
}

export function AnaliticaCategorias({ categorias, cargando }: Props) {
    const [filtroGenero, setFiltroGenero] = useState<string>('todos')

    const filtradas = categorias.filter(c =>
        filtroGenero === 'todos' || c.genero === filtroGenero
    )

    const topCategorias = filtradas.slice(0, 20)

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h6">Categorías más competidas</Typography>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Género</InputLabel>
                    <Select
                        value={filtroGenero}
                        label="Género"
                        onChange={e => setFiltroGenero(e.target.value)}
                    >
                        <MenuItem value="todos">Todos</MenuItem>
                        <MenuItem value="masculino">Masculino</MenuItem>
                        <MenuItem value="femenino">Femenino</MenuItem>
                        <MenuItem value="mixto">Mixto</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {cargando && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {!cargando && topCategorias.length > 0 && (
                <Paper sx={{ p: 3 }} className="print-section">
                    <BarChart
                        layout="horizontal"
                        yAxis={[{
                            data: topCategorias.map(c => c.categoriaNombre),
                            scaleType: 'band',
                            colorMap: {
                                type: 'ordinal',
                                colors: topCategorias.map(c => COLOR_EDAD[c.edad] ?? '#1565c0')
                            }
                        }]}
                        series={[{
                            data: topCategorias.map(c => c.totalInscritos),
                            label: 'Atletas inscritos',
                            valueFormatter: (v: number | null) => `${v ?? 0} atletas`,
                        }]}
                        xAxis={[{ label: 'Cantidad de atletas confirmados' }]}
                        height={Math.max(300, topCategorias.length * 36)}
                        margin={{ left: 180, right: 40 }}
                    />

                    <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                        {Object.entries(COLOR_EDAD).map(([edad, color]) => (
                            <Box key={edad} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color }} />
                                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{edad}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            )}

            {!cargando && topCategorias.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CategoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                        No hay inscripciones confirmadas para mostrar
                    </Typography>
                </Box>
            )}
        </Box>
    )
}
