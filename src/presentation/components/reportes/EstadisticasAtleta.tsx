'use client'
import {
    Autocomplete,
    Box,
    Chip,
    CircularProgress,
    Paper,
    TextField,
    Typography,
} from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import SportsIcon from '@mui/icons-material/Sports'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { PieChart } from '@mui/x-charts/PieChart'
import { LineChart } from '@mui/x-charts/LineChart'
import type { EstadisticasJudoka, JudokaOpcion } from '@/domain/models/Analytics'

const ETIQUETAS_VICTORIA: Record<string, string> = {
    ippon: 'Ippon',
    wazari: 'Waza-ari',
    decision: 'Decisión',
    descalificacion: 'Hansoku-make',
    wo: 'Fusen-gachi (W/O)',
}

const COLORES_VICTORIA = ['#1565c0', '#2e7d32', '#f57f17', '#c62828', '#6a1b9a']

interface Props {
    judokas: JudokaOpcion[]
    estadisticas: EstadisticasJudoka | null
    cargandoJudokas: boolean
    cargandoAtleta: boolean
    onSeleccionarJudoka: (id: string) => void
}

export function EstadisticasAtleta({ judokas, estadisticas, cargandoJudokas, cargandoAtleta, onSeleccionarJudoka }: Props) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Autocomplete
                options={judokas}
                getOptionLabel={j => `${j.nombre} — ${j.clubNombre}`}
                loading={cargandoJudokas}
                onChange={(_, value) => { if (value) onSeleccionarJudoka(value.id) }}
                renderInput={params => (
                    <TextField
                        {...params}
                        label="Buscar atleta"
                        placeholder="Escribe el nombre del judoka..."
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {cargandoJudokas && <CircularProgress size={18} />}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                sx={{ maxWidth: 500 }}
            />

            {cargandoAtleta && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {!cargandoAtleta && estadisticas && (
                <>
                    {/* Summary chips */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ mr: 1 }}>
                            {estadisticas.nombre}
                        </Typography>
                        <Chip label={estadisticas.clubNombre} variant="outlined" size="small" />
                        <Chip
                            icon={<SportsIcon />}
                            label={`${estadisticas.totalCombates} combates`}
                            color="default"
                            size="small"
                        />
                        <Chip
                            icon={<EmojiEventsIcon />}
                            label={`${estadisticas.totalVictorias} victorias`}
                            color="success"
                            size="small"
                        />
                        <Chip
                            icon={<TrendingUpIcon />}
                            label={`Win Rate: ${estadisticas.winRateGlobal}%`}
                            color={estadisticas.winRateGlobal >= 50 ? 'primary' : 'warning'}
                            size="small"
                        />
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {/* Victory distribution donut */}
                        <Paper sx={{ p: 3, flex: '1 1 320px', minWidth: 280 }} className="print-section">
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Distribución de Victorias
                            </Typography>
                            {estadisticas.distribucionVictorias.length > 0 ? (
                                <PieChart
                                    series={[{
                                        data: estadisticas.distribucionVictorias.map((d, i) => ({
                                            id: i,
                                            value: d.cantidad,
                                            label: `${ETIQUETAS_VICTORIA[d.tipoVictoria] ?? d.tipoVictoria} (${d.porcentaje}%)`,
                                            color: COLORES_VICTORIA[i % COLORES_VICTORIA.length],
                                        })),
                                        innerRadius: 55,
                                        paddingAngle: 3,
                                        cornerRadius: 4,
                                    }]}
                                    height={240}
                                    margin={{ right: 20 }}
                                />
                            ) : (
                                <Typography color="text.secondary" variant="body2">
                                    Sin victorias registradas
                                </Typography>
                            )}
                        </Paper>

                        {/* Win rate evolution line chart */}
                        <Paper sx={{ p: 3, flex: '2 1 400px', minWidth: 300 }} className="print-section">
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Evolución del Win Rate por Torneo
                            </Typography>
                            {estadisticas.evolucionPorTorneo.length > 1 ? (
                                <LineChart
                                    xAxis={[{
                                        data: estadisticas.evolucionPorTorneo.map((_, i) => i),
                                        valueFormatter: (i: number) => estadisticas.evolucionPorTorneo[i]?.torneoNombre ?? '',
                                        scaleType: 'point',
                                    }]}
                                    series={[{
                                        data: estadisticas.evolucionPorTorneo.map(t => t.winRate),
                                        label: 'Win Rate (%)',
                                        color: '#1565c0',
                                        curve: 'linear',
                                        showMark: true,
                                    }]}
                                    yAxis={[{ min: 0, max: 100 }]}
                                    height={240}
                                />
                            ) : (
                                <Typography color="text.secondary" variant="body2">
                                    Se necesitan al menos 2 torneos para mostrar la evolución
                                </Typography>
                            )}
                        </Paper>
                    </Box>
                </>
            )}

            {!cargandoAtleta && !estadisticas && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <SportsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                        Selecciona un atleta para ver sus estadísticas
                    </Typography>
                </Box>
            )}
        </Box>
    )
}
