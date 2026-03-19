import { ILlaveRepository } from '../../../domain/repositories/ILlaveRepository'
import { IInscripcionRepository } from '../../../domain/repositories/IInscripcionRepository'
import { Llave, TipoBracket } from '../../../domain/models/Llave'
import { Combate } from '../../../domain/models/Combate'
import { Inscripcion } from '../../../domain/models/Inscripcion'
import { ISeedingStrategy } from './seeding/ISeedingStrategy'
import { CinturonStrategy, JERARQUIA_CINTURON } from './seeding/CinturonStrategy'
import { Cinturon } from '../../../domain/models/Judoka'

// ── Helpers (exported for reuse in GenerarLlavesTorneo) ───────────────────────

export function nextPow2(n: number): number {
  if (n <= 2) return 2
  return Math.pow(2, Math.ceil(Math.log2(n)))
}

/**
 * Posiciones canónicas para los 8 primeros sembrados en un cuadro de tamaño S.
 *
 * Pool A (sup. izq.)  head → seed 1   tail → seed 5
 * Pool C (sup. der.)  head → seed 2   tail → seed 7
 * Pool D (inf. der.)  head → seed 3   tail → seed 8
 * Pool B (inf. izq.)  head → seed 4   tail → seed 6
 */
export function getSeedSlots(S: number): number[] {
  const heads = [
    1,               // Pool A head → seed 1
    S / 2 + 1,       // Pool C head → seed 2
    3 * S / 4 + 1,   // Pool D head → seed 3
    S / 4 + 1,       // Pool B head → seed 4
  ]
  if (S <= 4) return heads  // con S=4 cada pool tiene solo 1 slot; no hay tails

  const tails = [
    S / 4,           // Pool A tail → seed 5
    S / 2,           // Pool B tail → seed 6
    3 * S / 4,       // Pool C tail → seed 7
    S,               // Pool D tail → seed 8
  ]
  return [...heads, ...tails]
}

export function slotToPool(slot: number, S: number): 'A' | 'B' | 'C' | 'D' {
  if (slot <= S / 4) return 'A'
  if (slot <= S / 2) return 'B'
  if (slot <= 3 * S / 4) return 'C'
  return 'D'
}

/**
 * Dos judokas tienen mismatch de cinturón prohibido cuando la diferencia
 * de rango es >= 5 (ej. Blanco=7 vs Café=2 → diff 5).
 */
function esMismatchCinturon(a: Inscripcion | null, b: Inscripcion | null): boolean {
  if (!a || !b) return false
  const ra = JERARQUIA_CINTURON[a.judoka?.cinturon as Cinturon] ?? 4
  const rb = JERARQUIA_CINTURON[b.judoka?.cinturon as Cinturon] ?? 4
  return Math.abs(ra - rb) >= 5
}

/**
 * Elige el mejor candidato de `pool` para enfrentar a `oponente` en R1.
 * Prioridad (mayor = mejor):
 *   3 = club diferente + cinturones compatibles
 *   2 = solo cinturones compatibles
 *   1 = solo club diferente
 *   0 = ninguna condición cumplida (forzado)
 */
function elegirCandidato(pool: Inscripcion[], oponente: Inscripcion | null): number {
  if (!pool.length || !oponente) return 0
  let bestIdx = 0
  let bestScore = -1
  for (let i = 0; i < pool.length; i++) {
    const c = pool[i]
    const diffClub = !oponente.judoka?.clubId || c.judoka?.clubId !== oponente.judoka.clubId
    const beltOk = !esMismatchCinturon(c, oponente)
    const score = (beltOk ? 2 : 0) + (diffClub ? 1 : 0)
    if (score > bestScore) { bestScore = score; bestIdx = i }
  }
  return bestIdx
}

/**
 * Construye el array de slots (1-indexed, tamaño S+1).
 * Devuelve los slots asignados y el conjunto de byeSlots (vacíos).
 */
export function buildSlots(sembrados: Inscripcion[], S: number, byes: number): {
  slots: (Inscripcion | null)[]
  byeSlots: Set<number>
} {
  const slots: (Inscripcion | null)[] = new Array(S + 1).fill(null)
  const SEED_SLOTS = getSeedSlots(S)

  // Los heads siempre son impares → su par = head + 1
  const headPositions = [1, S / 2 + 1, 3 * S / 4 + 1, S / 4 + 1]
  const byeSlots = new Set<number>()
  for (let i = 0; i < Math.min(byes, headPositions.length); i++) {
    byeSlots.add(headPositions[i] + 1)
  }

  // Posiciones disponibles para sembrados (sin conflictos de bye)
  const available = SEED_SLOTS.filter(s => s >= 1 && s <= S && !byeSlots.has(s))

  // Colocar sembrados
  const remaining = [...sembrados]
  for (let i = 0; i < Math.min(remaining.length, available.length); i++) {
    slots[available[i]] = remaining[i]
  }
  const unplaced = remaining.slice(available.length)

  // Slots vacíos no-bye: llenar con los restantes (club + cinturón)
  const emptySlots: number[] = []
  for (let s = 1; s <= S; s++) {
    if (!slots[s] && !byeSlots.has(s)) emptySlots.push(s)
  }

  const pool = [...unplaced]
  for (const slot of emptySlots) {
    if (!pool.length) break
    const pairSlot = slot % 2 === 1 ? slot + 1 : slot - 1
    const oponente = pairSlot >= 1 && pairSlot <= S ? slots[pairSlot] : null
    const idx = elegirCandidato(pool, oponente)
    slots[slot] = pool[idx]
    pool.splice(idx, 1)
  }

  return { slots, byeSlots }
}

// ── Use Case ──────────────────────────────────────────────────────────────────

export class GenerarLlaves {
  constructor(
    private readonly llaveRepo: ILlaveRepository,
    private readonly inscripcionRepo: IInscripcionRepository,
    private readonly seedingStrategy: ISeedingStrategy = new CinturonStrategy()
  ) {}

  async execute(
    torneoId: string,
    torneoCategoriaId: string,
    tipoBracket: TipoBracket,
    numTatamis: number,
    generadoPor: string
  ): Promise<Llave> {
    if (!torneoCategoriaId) throw new Error('La categoría es requerida')

    // ── 1. Solo participantes: confirmado + pagado=true ───────────────────────
    const todas = await this.inscripcionRepo.listarPorTorneo(torneoId, ['confirmado'])
    const elegibles = todas.filter(
      i => i.torneoCategoriaId === torneoCategoriaId && i.pagado === true
    )
    const N = elegibles.length
    if (N < 2) throw new Error(
      'Se necesitan al menos 2 participantes con estado confirmado y pago registrado'
    )

    // ── 2. Aplicar estrategia de sembrado ─────────────────────────────────────
    const sembrados = this.seedingStrategy.ordenar(elegibles)

    // ── 3. Tamaño del cuadro ──────────────────────────────────────────────────
    const S = nextPow2(N)
    const rondas = Math.log2(S)
    const byes = S - N

    // ── 4. Asignar slots ──────────────────────────────────────────────────────
    const { slots, byeSlots } = buildSlots(sembrados, S, byes)

    const combates: Omit<Combate, 'id'>[] = []
    let tatamiIdx = 0

    // ── 5. Combates R1 ────────────────────────────────────────────────────────
    for (let pos = 1; pos <= S / 2; pos++) {
      const j1 = slots[2 * pos - 1]
      const j2 = slots[2 * pos]   // null = bye slot
      const esBye = j2 === null

      combates.push({
        llaveId: '',
        ronda: 1,
        posicion: pos,
        fase: 'principal',
        judoka1Id: j1?.judokaId,
        judoka2Id: j2?.judokaId,
        ganadorId: esBye ? j1!.judokaId : undefined,
        judoka1Ippones: 0, judoka1Wazaris: 0, judoka1Shidos: 0,
        judoka2Ippones: 0, judoka2Wazaris: 0, judoka2Shidos: 0,
        estado: esBye ? 'bye' : 'pendiente',
        tatami: numTatamis > 0 && !esBye ? (tatamiIdx % numTatamis) + 1 : undefined,
      })
      if (!esBye) tatamiIdx++
    }

    // ── 6. Rondas 2..N (placeholders) ────────────────────────────────────────
    for (let r = 2; r <= rondas; r++) {
      const count = S / Math.pow(2, r)
      for (let pos = 1; pos <= count; pos++) {
        combates.push({
          llaveId: '',
          ronda: r,
          posicion: pos,
          fase: 'principal',
          judoka1Ippones: 0, judoka1Wazaris: 0, judoka1Shidos: 0,
          judoka2Ippones: 0, judoka2Wazaris: 0, judoka2Shidos: 0,
          estado: 'pendiente',
        })
      }
    }

    // ── 7. Repesca (medallas de bronce) ───────────────────────────────────────
    // S >= 8 → QF existe → 2 bronces (Pool A/B losers, Pool C/D losers)
    // S = 4  → SF directa → 1 bronce (los 2 perdedores de la SF)
    // S = 2  → solo final, sin repesca
    const numBronce = S >= 8 ? 2 : S >= 4 ? 1 : 0

    // Ronda de cuartos de final que alimenta la repesca:
    //   S=4:  ronda 1 (2 SF combates, losers → 1 bronce)
    //   S=8:  ronda 1 (4 QF combates, losers → 2 bronces)
    //   S=16: ronda 2 (4 QF combates, losers → 2 bronces)
    //   S=32: ronda 3, etc.
    const qfRonda = S >= 16 ? rondas - 2 : 1

    type RepescaEntry = { bronce: number; alimentadoPorQF: { ronda: number; posicion: number }[] }
    const repescaMap: RepescaEntry[] = []

    for (let i = 1; i <= numBronce; i++) {
      combates.push({
        llaveId: '',
        ronda: rondas + 1,   // ronda > rondas principales = fase de repesca
        posicion: i,
        fase: 'repesca',
        judoka1Ippones: 0, judoka1Wazaris: 0, judoka1Shidos: 0,
        judoka2Ippones: 0, judoka2Wazaris: 0, judoka2Shidos: 0,
        estado: 'pendiente',
      })
      // Bronce 1: perdedores de QF posiciones 1 y 2 (lado izquierdo)
      // Bronce 2: perdedores de QF posiciones 3 y 4 (lado derecho)
      repescaMap.push({
        bronce: i,
        alimentadoPorQF: [
          { ronda: qfRonda, posicion: i * 2 - 1 },
          { ronda: qfRonda, posicion: i * 2 },
        ],
      })
    }

    // ── 8. Estructura (metadata para la UI) ──────────────────────────────────
    const poolMap: Record<string, string> = {}
    for (let s = 1; s <= S; s++) {
      if (slots[s]) poolMap[slots[s]!.judokaId] = slotToPool(s, S)
    }

    const estructura = {
      rondas,
      slots: S,
      byes,
      tipoSeed: this.seedingStrategy.nombre,
      numTatamis,
      participantes: sembrados.map(i => ({
        judokaId: i.judokaId,
        cinturon: i.judoka?.cinturon,
        clubId: i.judoka?.clubId,
        pool: poolMap[i.judokaId],
      })),
      tieneRepesca: numBronce > 0,
      repesca: numBronce > 0 ? { qfRonda, combatesBronce: repescaMap } : null,
    }

    return await this.llaveRepo.crear(
      torneoCategoriaId,
      combates,
      tipoBracket,
      N,
      estructura,
      generadoPor
    )
  }
}
