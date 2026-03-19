'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Box,
    Container,
    Tab,
    Tabs,
    Typography,
    Alert,
} from '@mui/material'
import BarChartIcon from '@mui/icons-material/BarChart'
import CategoryIcon from '@mui/icons-material/Category'
import GroupsIcon from '@mui/icons-material/Groups'
import PersonIcon from '@mui/icons-material/Person'
import { useAuth } from '@/presentation/context/AuthContext'
import { useAnalytics } from '@/presentation/hooks/useAnalytics'
import { EstadisticasAtleta } from '@/presentation/components/reportes/EstadisticasAtleta'
import { AnaliticaCategorias } from '@/presentation/components/reportes/AnaliticaCategorias'
import { MedalleroClubs } from '@/presentation/components/reportes/MedalleroClubs'
import { ExportarReporte } from '@/presentation/components/reportes/ExportarReporte'

export default function ReportesPage() {
    const { usuario, cargando: cargandoAuth } = useAuth()
    const router = useRouter()
    const [tabActual, setTabActual] = useState(0)

    const {
        judokas,
        estadisticasJudoka,
        categorias,
        medallero,
        cargandoJudokas,
        cargandoAtleta,
        cargandoGlobal,
        error,
        cargarDatosGlobales,
        cargarEstadisticasJudoka,
    } = useAnalytics()

    // Role guard
    useEffect(() => {
        if (!cargandoAuth && usuario?.rol !== 'admin') {
            router.replace('/torneos')
        }
    }, [cargandoAuth, usuario, router])

    // Load global data when switching to relevant tabs
    useEffect(() => {
        if (tabActual === 1 || tabActual === 2) {
            if (categorias.length === 0 && medallero.length === 0) {
                cargarDatosGlobales()
            }
        }
    }, [tabActual, categorias.length, medallero.length, cargarDatosGlobales])

    if (cargandoAuth || usuario?.rol !== 'admin') return null

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <BarChartIcon color="primary" sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Reportes y Analítica
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Panel centralizado de inteligencia deportiva
                        </Typography>
                    </Box>
                </Box>
                <ExportarReporte />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            <Tabs
                value={tabActual}
                onChange={(_, v) => setTabActual(v)}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                className="no-print"
            >
                <Tab icon={<PersonIcon />} iconPosition="start" label="Atletas" />
                <Tab icon={<CategoryIcon />} iconPosition="start" label="Categorías" />
                <Tab icon={<GroupsIcon />} iconPosition="start" label="Clubes" />
            </Tabs>

            {tabActual === 0 && (
                <EstadisticasAtleta
                    judokas={judokas}
                    estadisticas={estadisticasJudoka}
                    cargandoJudokas={cargandoJudokas}
                    cargandoAtleta={cargandoAtleta}
                    onSeleccionarJudoka={cargarEstadisticasJudoka}
                />
            )}

            {tabActual === 1 && (
                <AnaliticaCategorias
                    categorias={categorias}
                    cargando={cargandoGlobal}
                />
            )}

            {tabActual === 2 && (
                <MedalleroClubs
                    medallero={medallero}
                    cargando={cargandoGlobal}
                />
            )}
        </Container>
    )
}
