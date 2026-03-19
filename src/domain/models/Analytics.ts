export interface DistribucionVictorias {
    tipoVictoria: string
    cantidad: number
    porcentaje: number
}

export interface WinRatePorTorneo {
    torneoNombre: string
    torneoFecha: string
    victorias: number
    derrotas: number
    winRate: number
}

export interface EstadisticasJudoka {
    judokaId: string
    nombre: string
    clubNombre: string
    totalCombates: number
    totalVictorias: number
    winRateGlobal: number
    distribucionVictorias: DistribucionVictorias[]
    evolucionPorTorneo: WinRatePorTorneo[]
}

export interface CategoriaCompetida {
    categoriaId: string
    categoriaNombre: string
    edad: string
    genero: string
    totalInscritos: number
}

export interface MedalleroClub {
    clubId: string
    clubNombre: string
    provincia: string
    oros: number
    platas: number
    bronces: number
    totalMedallas: number
    totalInscritos: number
    eficiencia: number
}

export interface JudokaOpcion {
    id: string
    nombre: string
    clubNombre: string
}
