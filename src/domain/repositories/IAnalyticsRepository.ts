import type { CategoriaCompetida, EstadisticasJudoka, JudokaOpcion, MedalleroClub } from '@/domain/models/Analytics'

export interface IAnalyticsRepository {
    listarJudokasOpciones(): Promise<JudokaOpcion[]>
    obtenerEstadisticasJudoka(judokaId: string): Promise<EstadisticasJudoka | null>
    obtenerCategoriasMasCompetidas(): Promise<CategoriaCompetida[]>
    obtenerMedalleroClubs(): Promise<MedalleroClub[]>
}
