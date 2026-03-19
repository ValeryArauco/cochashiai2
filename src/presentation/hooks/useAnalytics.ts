'use client'
import { useCallback, useEffect, useState } from 'react'
import { SupabaseAnalyticsRepository } from '@/infrastructure/repositories/SupabaseAnalyticsRepository'
import type { CategoriaCompetida, EstadisticasJudoka, JudokaOpcion, MedalleroClub } from '@/domain/models/Analytics'

const repo = new SupabaseAnalyticsRepository()

export function useAnalytics() {
    const [judokas, setJudokas] = useState<JudokaOpcion[]>([])
    const [estadisticasJudoka, setEstadisticasJudoka] = useState<EstadisticasJudoka | null>(null)
    const [categorias, setCategorias] = useState<CategoriaCompetida[]>([])
    const [medallero, setMedallero] = useState<MedalleroClub[]>([])
    const [cargandoJudokas, setCargandoJudokas] = useState(false)
    const [cargandoAtleta, setCargandoAtleta] = useState(false)
    const [cargandoGlobal, setCargandoGlobal] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setCargandoJudokas(true)
        repo.listarJudokasOpciones()
            .then(setJudokas)
            .catch(() => setError('Error al cargar lista de atletas'))
            .finally(() => setCargandoJudokas(false))
    }, [])

    const cargarDatosGlobales = useCallback(async () => {
        setCargandoGlobal(true)
        setError(null)
        try {
            const [cats, med] = await Promise.all([
                repo.obtenerCategoriasMasCompetidas(),
                repo.obtenerMedalleroClubs(),
            ])
            setCategorias(cats)
            setMedallero(med)
        } catch {
            setError('Error al cargar datos de analítica')
        } finally {
            setCargandoGlobal(false)
        }
    }, [])

    const cargarEstadisticasJudoka = useCallback(async (judokaId: string) => {
        setCargandoAtleta(true)
        setError(null)
        setEstadisticasJudoka(null)
        try {
            const stats = await repo.obtenerEstadisticasJudoka(judokaId)
            setEstadisticasJudoka(stats)
        } catch {
            setError('Error al cargar estadísticas del atleta')
        } finally {
            setCargandoAtleta(false)
        }
    }, [])

    return {
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
    }
}
