import type {
  CategoriaCompetida,
  DistribucionVictorias,
  WinRatePorTorneo,
} from '../../../domain/models/Analytics'


export function calcularWinRate(victorias: number, totalCombates: number): number {
  if (totalCombates === 0) return 0
  return Math.round((victorias / totalCombates) * 100)
}

export function calcularDistribucionVictorias(
  tiposGanados: (string | null)[],
): DistribucionVictorias[] {
  if (tiposGanados.length === 0) return []

  const conteo: Record<string, number> = {}
  for (const tipo of tiposGanados) {
    const key = tipo ?? 'decision'
    conteo[key] = (conteo[key] ?? 0) + 1
  }

  const total = tiposGanados.length
  return Object.entries(conteo).map(([tipoVictoria, cantidad]) => ({
    tipoVictoria,
    cantidad,
    porcentaje: Math.round((cantidad / total) * 100),
  }))
}

export interface CombateConTorneo {
  ganadorId: string | null
  torneoNombre: string | null
  torneoFecha: string | null
}

export function calcularEvolucionPorTorneo(
  combates: CombateConTorneo[],
  judokaId: string,
): WinRatePorTorneo[] {
  const porTorneo: Record<string, { nombre: string; fecha: string; victorias: number; derrotas: number }> = {}

  for (const c of combates) {
    if (!c.torneoNombre || !c.torneoFecha) continue
    if (!porTorneo[c.torneoNombre]) {
      porTorneo[c.torneoNombre] = {
        nombre: c.torneoNombre,
        fecha: c.torneoFecha,
        victorias: 0,
        derrotas: 0,
      }
    }
    if (c.ganadorId === judokaId) {
      porTorneo[c.torneoNombre].victorias++
    } else {
      porTorneo[c.torneoNombre].derrotas++
    }
  }

  return Object.values(porTorneo)
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
}


export interface DatoCategoria {
  categoriaId: string | null
  categoriaNombre: string | null
  edad: string | null
  genero: string | null
}

export function agruparInscriptosPorCategoria(
  rows: DatoCategoria[],
): CategoriaCompetida[] {
  const byCategoria: Record<string, CategoriaCompetida> = {}

  for (const row of rows) {
    if (!row.categoriaId || !row.categoriaNombre || !row.edad || !row.genero) continue
    if (!byCategoria[row.categoriaId]) {
      byCategoria[row.categoriaId] = {
        categoriaId: row.categoriaId,
        categoriaNombre: row.categoriaNombre,
        edad: row.edad,
        genero: row.genero,
        totalInscritos: 0,
      }
    }
    byCategoria[row.categoriaId].totalInscritos++
  }

  return Object.values(byCategoria).sort((a, b) => b.totalInscritos - a.totalInscritos)
}


export interface CombateMedallero {
  llaveId: string
  ronda: number
  fase: string | null
  judoka1Id: string | null
  judoka2Id: string | null
  ganadorId: string | null
  club1Id: string | null
  club2Id: string | null
}

export function calcularMaxRondaPorLlave(
  combates: CombateMedallero[],
): Record<string, Record<string, number>> {
  const maxRonda: Record<string, Record<string, number>> = {}

  for (const c of combates) {
    const fase = c.fase ?? 'principal'
    if (!maxRonda[c.llaveId]) maxRonda[c.llaveId] = {}
    if (!maxRonda[c.llaveId][fase] || c.ronda > maxRonda[c.llaveId][fase]) {
      maxRonda[c.llaveId][fase] = c.ronda
    }
  }

  return maxRonda
}

export interface Medallas {
  oros: Record<string, number>
  platas: Record<string, number>
  bronces: Record<string, number>
}


export function asignarMedallas(
  combates: CombateMedallero[],
  maxRondas: Record<string, Record<string, number>>,
): Medallas {
  const oros: Record<string, number> = {}
  const platas: Record<string, number> = {}
  const bronces: Record<string, number> = {}

  for (const c of combates) {
    if (!c.ganadorId) continue

    const fase = c.fase ?? 'principal'
    const maxRonda = maxRondas[c.llaveId]?.[fase] ?? 0
    if (c.ronda !== maxRonda) continue

    const esGanadorJ1 = c.ganadorId === c.judoka1Id
    const ganadorClub = esGanadorJ1 ? c.club1Id : c.club2Id
    const perdedorClub = esGanadorJ1 ? c.club2Id : c.club1Id

    if (fase === 'principal') {
      if (ganadorClub) oros[ganadorClub] = (oros[ganadorClub] ?? 0) + 1
      if (perdedorClub) platas[perdedorClub] = (platas[perdedorClub] ?? 0) + 1
    } else if (fase === 'repesca') {
      if (ganadorClub) bronces[ganadorClub] = (bronces[ganadorClub] ?? 0) + 1
    }
  }

  return { oros, platas, bronces }
}
