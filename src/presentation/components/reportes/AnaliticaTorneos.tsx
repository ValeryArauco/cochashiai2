'use client'
import { useMemo, useState } from 'react'
import {
    Box, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Typography
} from '@mui/material'
import EventIcon from '@mui/icons-material/Event'
import { LineChart } from '@mui/x-charts/LineChart'
import { BarChart } from '@mui/x-charts/BarChart'
import type { InscritosPorTorneo } from '@/domain/models/Analytics'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const COLORES = [
    '#1565c0', '#2e7d32', '#c62828', '#e65100',
    '#6a1b9a', '#00695c', '#ad1457', '#4527a0',
    '#37474f', '#f9a825', '#0277bd', '#558b2f',
]

const getTrimestre = (anio: number, mes: number) => `T${Math.ceil(mes / 3)} ${anio}`

const sortTrimestres = (a: string, b: string) => {
    const [qA, yA] = a.split(' ')
    const [qB, yB] = b.split(' ')
    if (yA !== yB) return parseInt(yA) - parseInt(yB)
    return parseInt(qA[1]) - parseInt(qB[1])
}

interface Props {
    datos: InscritosPorTorneo[]
    cargando: boolean
}

export function AnaliticaTorneos({ datos, cargando }: Props) {
    const anos = useMemo(() => Array.from(new Set(datos.map(t => t.anio))).sort(), [datos])

    const [anoInicio, setAnoInicio] = useState<number | 'todos'>('todos')
    const [anoFin, setAnoFin] = useState<number | 'todos'>('todos')

    const filtrados = useMemo(() => datos.filter(t => {
        if (anoInicio !== 'todos' && t.anio < (anoInicio as number)) return false
        if (anoFin !== 'todos' && t.anio > (anoFin as number)) return false
        return true
    }), [datos, anoInicio, anoFin])

    
    const { lineLabels, lineValues, porMes } = useMemo(() => {
        const byMes: Record<string, { count: number; nombres: string[] }> = {}
        for (const t of filtrados) {
            const key = `${MESES[t.mes - 1]} ${t.anio}`
            if (!byMes[key]) byMes[key] = { count: 0, nombres: [] }
            byMes[key].count++
            byMes[key].nombres.push(t.torneoNombre)
        }
        const sorted = Object.entries(byMes).sort(([a], [b]) => {
            const [mA, yA] = a.split(' ')
            const [mB, yB] = b.split(' ')
            if (yA !== yB) return parseInt(yA) - parseInt(yB)
            return MESES.indexOf(mA) - MESES.indexOf(mB)
        })
        return {
            lineLabels: sorted.map(([label]) => label),
            lineValues: sorted.map(([, d]) => d.count),
            porMes: Object.fromEntries(sorted.map(([k, d]) => [k, d])),
        }
    }, [filtrados])

    
    const { trimestres, seriesInscritos } = useMemo(() => {
        const triArr = Array.from(new Set(filtrados.map(t => getTrimestre(t.anio, t.mes)))).sort(sortTrimestres)

        const torneosPorTri: Record<string, InscritosPorTorneo[]> = {}
        for (const t of filtrados) {
            const tri = getTrimestre(t.anio, t.mes)
            if (!torneosPorTri[tri]) torneosPorTri[tri] = []
            torneosPorTri[tri].push(t)
        }

        const maxPorTri = Math.max(1, ...Object.values(torneosPorTri).map(v => v.length))

        const series = Array.from({ length: maxPorTri }, (_, pos) => {
            const dataMap = triArr.map(tri => torneosPorTri[tri]?.[pos] ?? null)
            return {
                data: dataMap.map(t => t?.totalInscritos ?? null),
                label: `Torneo ${pos + 1}`,
                color: COLORES[pos % COLORES.length],
                valueFormatter: (v: number | null, ctx: { dataIndex: number }) => {
                    const torneo = dataMap[ctx.dataIndex]
                    if (!torneo || v === null) return ''
                    return `${torneo.torneoNombre}: ${v} inscrito${v !== 1 ? 's' : ''}`
                },
            }
        })

        return { trimestres: triArr, seriesInscritos: series }
    }, [filtrados])

    const sinDatos = !cargando && filtrados.length === 0

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h6">Análisis de Torneos</Typography>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>Año inicio</InputLabel>
                    <Select
                        value={anoInicio}
                        label="Año inicio"
                        onChange={e => setAnoInicio(e.target.value as number | 'todos')}
                    >
                        <MenuItem value="todos">Todos</MenuItem>
                        {anos.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>Año fin</InputLabel>
                    <Select
                        value={anoFin}
                        label="Año fin"
                        onChange={e => setAnoFin(e.target.value as number | 'todos')}
                    >
                        <MenuItem value="todos">Todos</MenuItem>
                        {anos.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>

            {cargando && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {!cargando && datos.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <EventIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">No hay datos de torneos para mostrar</Typography>
                </Box>
            )}

            {!cargando && lineLabels.length > 0 && (
                <Paper sx={{ p: 3 }} className="print-section">
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                        Torneos por mes
                    </Typography>
                    <LineChart
                        xAxis={[{ data: lineLabels, scaleType: 'point' }]}
                        series={[{
                            data: lineValues,
                            label: 'Torneos',
                            color: '#1565c0',
                            valueFormatter: (v, { dataIndex }) => {
                                const label = lineLabels[dataIndex]
                                const nombres = porMes[label]?.nombres ?? []
                                return `${v} torneo${v !== 1 ? 's' : ''}: ${nombres.join(', ')}`
                            },
                        }]}
                        yAxis={[{ label: 'Cantidad de torneos', tickMinStep: 1 }]}
                        height={300}
                        margin={{ left: 60 }}
                    />
                </Paper>
            )}

            {!cargando && trimestres.length > 0 && (
                <Paper sx={{ p: 3 }} className="print-section">
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                        Inscritos confirmados por torneo
                    </Typography>
                    <BarChart
                        xAxis={[{ data: trimestres, scaleType: 'band', label: 'Trimestre' }]}
                        series={seriesInscritos}
                        yAxis={[{ label: 'Inscritos confirmados', tickMinStep: 1 }]}
                        slotProps={{ tooltip: { trigger: 'item' } }}
                        height={380}
                        margin={{ left: 60, bottom: 40 }}
                    />
                </Paper>
            )}

            {sinDatos && datos.length > 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">
                        No hay torneos en el rango de años seleccionado
                    </Typography>
                </Box>
            )}
        </Box>
    )
}
