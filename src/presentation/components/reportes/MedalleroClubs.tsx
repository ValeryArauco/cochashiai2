'use client'
import {
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'
import GroupsIcon from '@mui/icons-material/Groups'
import { ScatterChart } from '@mui/x-charts/ScatterChart'
import type { MedalleroClub } from '@/domain/models/Analytics'

interface Props {
    medallero: MedalleroClub[]
    cargando: boolean
}

export function MedalleroClubs({ medallero, cargando }: Props) {
    const conDatos = medallero.filter(c => c.totalInscritos > 0)

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Medallero por Club</Typography>

            {cargando && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {!cargando && medallero.length > 0 && (
                <>
                    <TableContainer component={Paper} className="print-section">
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                    <TableCell>#</TableCell>
                                    <TableCell>Club</TableCell>
                                    <TableCell>Provincia</TableCell>
                                    <TableCell align="center">Inscritos</TableCell>
                                    <TableCell align="center" sx={{ color: '#f9a825' }}>🥇</TableCell>
                                    <TableCell align="center" sx={{ color: '#90a4ae' }}>🥈</TableCell>
                                    <TableCell align="center" sx={{ color: '#a1887f' }}>🥉</TableCell>
                                    <TableCell align="center"><strong>Total</strong></TableCell>
                                    <TableCell align="center">Eficiencia</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {medallero.map((club, idx) => (
                                    <TableRow key={club.clubId} hover>
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell><strong>{club.clubNombre}</strong></TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>{club.provincia || '—'}</TableCell>
                                        <TableCell align="center">{club.totalInscritos}</TableCell>
                                        <TableCell align="center">{club.oros || '—'}</TableCell>
                                        <TableCell align="center">{club.platas || '—'}</TableCell>
                                        <TableCell align="center">{club.bronces || '—'}</TableCell>
                                        <TableCell align="center"><strong>{club.totalMedallas}</strong></TableCell>
                                        <TableCell align="center">
                                            {club.totalInscritos > 0 ? `${club.eficiencia}%` : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {conDatos.length >= 2 && (
                        <Paper sx={{ p: 3 }} className="print-section">
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Índice de Eficiencia: Inscritos vs Medallas
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Clubes en la esquina superior izquierda tienen mayor eficiencia (pocas inscripciones, muchas medallas)
                            </Typography>
                            <ScatterChart
                                series={[{
                                    data: conDatos.map((c, i) => ({
                                        id: i,
                                        x: c.totalInscritos,
                                        y: c.totalMedallas,
                                    })),
                                    label: 'Clubes',
                                    color: '#1565c0',
                                    valueFormatter: (value) => {
                                        if (!value) return ''
                                        const club = conDatos.find(c => c.totalInscritos === value.x && c.totalMedallas === value.y)
                                        return `${club?.clubNombre ?? ''}: ${value.x} inscritos, ${value.y} medallas`
                                    },
                                }]}
                                xAxis={[{ label: 'Total de atletas inscritos' }]}
                                yAxis={[{ label: 'Total de medallas' }]}
                                height={320}
                            />
                        </Paper>
                    )}
                </>
            )}

            {!cargando && medallero.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <GroupsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                        No hay datos de clubes para mostrar
                    </Typography>
                </Box>
            )}
        </Box>
    )
}
