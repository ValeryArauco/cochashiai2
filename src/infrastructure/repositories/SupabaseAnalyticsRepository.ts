import { supabase } from '../../lib/supabase'
import type { IAnalyticsRepository } from '../../domain/repositories/IAnalyticsRepository'
import type {
    CategoriaCompetida,
    DistribucionVictorias,
    EstadisticasJudoka,
    InscritosPorTorneo,
    JudokaOpcion,
    MedalleroClub,
    WinRatePorTorneo,
} from '../../domain/models/Analytics'

export class SupabaseAnalyticsRepository implements IAnalyticsRepository {

    async listarJudokasOpciones(): Promise<JudokaOpcion[]> {
        const { data, error } = await supabase
            .from('judokas')
            .select(`
                id,
                usuario:usuarios(nombre, apellido_paterno, apellido_materno, activo),
                club:clubes(nombre_club)
            `)
            .eq('usuario.activo', true)

        if (error || !data) return []

        return (data as unknown as Array<{
            id: string
            usuario: { nombre: string; apellido_paterno: string; apellido_materno: string | null; activo: boolean } | null
            club: { nombre_club: string } | null
        }>)
            .filter(j => j.usuario?.activo)
            .map(j => ({
                id: j.id,
                nombre: [j.usuario?.nombre, j.usuario?.apellido_paterno, j.usuario?.apellido_materno]
                    .filter(Boolean).join(' '),
                clubNombre: j.club?.nombre_club ?? 'Sin club',
            }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
    }

    async obtenerEstadisticasJudoka(judokaId: string): Promise<EstadisticasJudoka | null> {
       
        const { data: judokaData } = await supabase
            .from('judokas')
            .select(`
                id,
                usuario:usuarios(nombre, apellido_paterno, apellido_materno),
                club:clubes(nombre_club)
            `)
            .eq('id', judokaId)
            .maybeSingle()

        if (!judokaData) return null

        const judoka = judokaData as unknown as {
            id: string
            usuario: { nombre: string; apellido_paterno: string; apellido_materno: string | null } | null
            club: { nombre_club: string } | null
        }

        const { data: combates } = await supabase
            .from('combates')
            .select(`
                id,
                judoka1_id,
                judoka2_id,
                ganador_id,
                tipo_victoria,
                estado,
                llave:llaves(
                    torneo_categoria:torneo_categoria(
                        torneo:torneos(nombre, fecha_limite_inscripcion)
                    )
                )
            `)
            .or(`judoka1_id.eq.${judokaId},judoka2_id.eq.${judokaId}`)
            .eq('estado', 'finalizado')

        if (!combates || combates.length === 0) {
            return {
                judokaId,
                nombre: [judoka.usuario?.nombre, judoka.usuario?.apellido_paterno, judoka.usuario?.apellido_materno]
                    .filter(Boolean).join(' '),
                clubNombre: judoka.club?.nombre_club ?? 'Sin club',
                totalCombates: 0,
                totalVictorias: 0,
                winRateGlobal: 0,
                distribucionVictorias: [],
                evolucionPorTorneo: [],
            }
        }

        type CombateRaw = {
            id: string
            judoka1_id: string
            judoka2_id: string
            ganador_id: string | null
            tipo_victoria: string | null
            estado: string
            llave: {
                torneo_categoria: {
                    torneo: { nombre: string; fecha_limite_inscripcion: string } | null
                } | null
            } | null
        }

        const rows = combates as unknown as CombateRaw[]

        const totalCombates = rows.length
        const victorias = rows.filter(c => c.ganador_id === judokaId)
        const totalVictorias = victorias.length
        const winRateGlobal = totalCombates > 0 ? Math.round((totalVictorias / totalCombates) * 100) : 0

        const tiposCount: Record<string, number> = {}
        for (const c of victorias) {
            const tipo = c.tipo_victoria ?? 'decision'
            tiposCount[tipo] = (tiposCount[tipo] ?? 0) + 1
        }
        const distribucionVictorias: DistribucionVictorias[] = Object.entries(tiposCount).map(([tipoVictoria, cantidad]) => ({
            tipoVictoria,
            cantidad,
            porcentaje: totalVictorias > 0 ? Math.round((cantidad / totalVictorias) * 100) : 0,
        }))

        const porTorneo: Record<string, { nombre: string; fecha: string; victorias: number; derrotas: number }> = {}
        for (const c of rows) {
            const torneo = c.llave?.torneo_categoria?.torneo
            if (!torneo) continue
            const key = torneo.nombre
            if (!porTorneo[key]) {
                porTorneo[key] = { nombre: torneo.nombre, fecha: torneo.fecha_limite_inscripcion, victorias: 0, derrotas: 0 }
            }
            if (c.ganador_id === judokaId) {
                porTorneo[key].victorias++
            } else {
                porTorneo[key].derrotas++
            }
        }

        const evolucionPorTorneo: WinRatePorTorneo[] = Object.values(porTorneo)
            .sort((a, b) => a.fecha.localeCompare(b.fecha))
            .map(t => ({
                torneoNombre: t.nombre,
                torneoFecha: t.fecha,
                victorias: t.victorias,
                derrotas: t.derrotas,
                winRate: (t.victorias + t.derrotas) > 0
                    ? Math.round((t.victorias / (t.victorias + t.derrotas)) * 100)
                    : 0,
            }))

        return {
            judokaId,
            nombre: [judoka.usuario?.nombre, judoka.usuario?.apellido_paterno, judoka.usuario?.apellido_materno]
                .filter(Boolean).join(' '),
            clubNombre: judoka.club?.nombre_club ?? 'Sin club',
            totalCombates,
            totalVictorias,
            winRateGlobal,
            distribucionVictorias,
            evolucionPorTorneo,
        }
    }

    async obtenerCategoriasMasCompetidas(): Promise<CategoriaCompetida[]> {
        const { data, error } = await supabase
            .from('inscripciones')
            .select(`
                id,
                torneo_categoria:torneo_categoria(
                    categoria:categorias(id, nombre, edad, genero)
                )
            `)
            .eq('estado', 'confirmado')

        if (error || !data) return []

        type InscripcionRaw = {
            id: string
            torneo_categoria: {
                categoria: { id: string; nombre: string; edad: string; genero: string } | null
            } | null
        }

        const rows = data as unknown as InscripcionRaw[]
        const byCategoria: Record<string, CategoriaCompetida> = {}

        for (const row of rows) {
            const cat = row.torneo_categoria?.categoria
            if (!cat) continue
            if (!byCategoria[cat.id]) {
                byCategoria[cat.id] = {
                    categoriaId: cat.id,
                    categoriaNombre: cat.nombre,
                    edad: cat.edad,
                    genero: cat.genero,
                    totalInscritos: 0,
                }
            }
            byCategoria[cat.id].totalInscritos++
        }

        return Object.values(byCategoria).sort((a, b) => b.totalInscritos - a.totalInscritos)
    }

    async obtenerMedalleroClubs(): Promise<MedalleroClub[]> {
        
        const { data: clubes } = await supabase
            .from('clubes')
            .select('id, nombre_club, provincia')
            .eq('activo', true)

        if (!clubes) return []

        const { data: inscripciones } = await supabase
            .from('inscripciones')
            .select(`
                id,
                judoka:judokas(club_id)
            `)
            .eq('estado', 'confirmado')

        type InscripcionClub = { id: string; judoka: { club_id: string } | null }
        const inscRows = (inscripciones ?? []) as unknown as InscripcionClub[]

        const inscritosPorClub: Record<string, number> = {}
        for (const i of inscRows) {
            const clubId = i.judoka?.club_id
            if (!clubId) continue
            inscritosPorClub[clubId] = (inscritosPorClub[clubId] ?? 0) + 1
        }

        const { data: combates } = await supabase
            .from('combates')
            .select(`
                id,
                llave_id,
                ronda,
                judoka1_id,
                judoka2_id,
                ganador_id,
                fase,
                estado,
                judoka1:judokas!combates_judoka1_id_fkey(club_id),
                judoka2:judokas!combates_judoka2_id_fkey(club_id)
            `)
            .eq('estado', 'finalizado')

        type CombateClub = {
            id: string
            llave_id: string
            ronda: number
            judoka1_id: string | null
            judoka2_id: string | null
            ganador_id: string | null
            fase: string | null
            estado: string
            judoka1: { club_id: string } | null
            judoka2: { club_id: string } | null
        }

        const combRows = (combates ?? []) as unknown as CombateClub[]

        const llaveMaxRonda: Record<string, Record<string, number>> = {}
        for (const c of combRows) {
            if (!llaveMaxRonda[c.llave_id]) llaveMaxRonda[c.llave_id] = {}
            const fase = c.fase ?? 'principal'
            if (!llaveMaxRonda[c.llave_id][fase] || c.ronda > llaveMaxRonda[c.llave_id][fase]) {
                llaveMaxRonda[c.llave_id][fase] = c.ronda
            }
        }

        const orosPorClub: Record<string, number> = {}
        const platasPorClub: Record<string, number> = {}
        const broncesPorClub: Record<string, number> = {}

        for (const c of combRows) {
            if (!c.ganador_id) continue
            const fase = c.fase ?? 'principal'
            const maxRonda = llaveMaxRonda[c.llave_id]?.[fase] ?? 0

            if (fase === 'principal' && c.ronda === maxRonda) {
                
                const ganadorClub = c.ganador_id === c.judoka1_id ? c.judoka1?.club_id : c.judoka2?.club_id
                const perdedorId = c.ganador_id === c.judoka1_id ? c.judoka2_id : c.judoka1_id
                const perdedorClub = perdedorId === c.judoka1_id ? c.judoka1?.club_id : c.judoka2?.club_id

                if (ganadorClub) orosPorClub[ganadorClub] = (orosPorClub[ganadorClub] ?? 0) + 1
                if (perdedorClub) platasPorClub[perdedorClub] = (platasPorClub[perdedorClub] ?? 0) + 1
            } else if (fase === 'repesca' && c.ronda === maxRonda) {
                
                const ganadorClub = c.ganador_id === c.judoka1_id ? c.judoka1?.club_id : c.judoka2?.club_id
                if (ganadorClub) broncesPorClub[ganadorClub] = (broncesPorClub[ganadorClub] ?? 0) + 1
            }
        }

        return clubes.map(club => {
            const oros = orosPorClub[club.id] ?? 0
            const platas = platasPorClub[club.id] ?? 0
            const bronces = broncesPorClub[club.id] ?? 0
            const totalMedallas = oros + platas + bronces
            const totalInscritos = inscritosPorClub[club.id] ?? 0
            const eficiencia = totalInscritos > 0 ? Math.round((totalMedallas / totalInscritos) * 100) : 0

            return {
                clubId: club.id,
                clubNombre: club.nombre_club,
                provincia: club.provincia ?? '',
                oros,
                platas,
                bronces,
                totalMedallas,
                totalInscritos,
                eficiencia,
            }
        }).sort((a, b) => b.totalMedallas - a.totalMedallas)
    }

    async obtenerInscritosPorTorneo(): Promise<InscritosPorTorneo[]> {
        const { data, error } = await supabase
            .from('torneos')
            .select(`
                id,
                nombre,
                fecha_limite_inscripcion,
                torneos_fechas(fecha),
                torneo_categoria(
                    inscripciones(id, estado)
                )
            `)
            .eq('activo', true)

        if (error || !data) return []

        type TorneoRaw = {
            id: string
            nombre: string
            fecha_limite_inscripcion: string
            torneos_fechas: { fecha: string }[]
            torneo_categoria: { inscripciones: { id: string; estado: string }[] }[]
        }

        return (data as unknown as TorneoRaw[])
            .map(t => {
                const fechas = (t.torneos_fechas ?? []).map(f => f.fecha).filter(Boolean).sort()
                const fechaInicio = fechas[0] ?? t.fecha_limite_inscripcion
                const date = new Date(fechaInicio)
                const totalInscritos = (t.torneo_categoria ?? [])
                    .flatMap(tc => tc.inscripciones ?? [])
                    .filter(i => i.estado === 'confirmado').length
                return {
                    torneoId: t.id,
                    torneoNombre: t.nombre,
                    fechaInicio,
                    anio: date.getFullYear(),
                    mes: date.getMonth() + 1,
                    totalInscritos,
                }
            })
            .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
    }
}
