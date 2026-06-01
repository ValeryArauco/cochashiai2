import { ILlaveRepository } from '../../../domain/repositories/ILlaveRepository'
import { IInscripcionRepository } from '../../../domain/repositories/IInscripcionRepository'
import { Combate } from '../../../domain/models/Combate'
import { Inscripcion } from '../../../domain/models/Inscripcion'
import { ISeedingStrategy } from './seeding/ISeedingStrategy'
import { CinturonStrategy } from './seeding/CinturonStrategy'
import { nextPow2, getSeedSlots, slotToPool, buildSlots, buildRepesca } from './GenerarLlaves'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type SistemaCompeticion = 'round_robin' | 'single_elimination'

export interface ResultadoCategoria {
  torneoCategoriaId: string
  nombreCategoria: string
  N: number
  sistema: SistemaCompeticion
  ok: boolean
  error?: string
}

export interface ProgresoGeneracion {
  actual: number
  total: number
  categoriaActual: string
}

// ── Builders puros (sin I/O, sin tatami) ─────────────────────────────────────

/**
 * 3 a 5 participantes → Liguilla (todos contra todos).
 * N*(N-1)/2 combates, todos en ronda=1.
 * El tatami se asigna externamente mediante asignarTatamisBalanceados.
 */
function construirRoundRobin(
  sembrados: Inscripcion[],
  tipoSeed: string,
): { combates: Omit<Combate, 'id'>[]; estructura: object } {
  const N = sembrados.length
  const combates: Omit<Combate, 'id'>[] = []
  let pos = 1

  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      combates.push({
        llaveId: '',
        ronda: 1,
        posicion: pos++,
        fase: 'principal',
        judoka1Id: sembrados[i].judokaId,
        judoka2Id: sembrados[j].judokaId,
        judoka1Ippones: 0, judoka1Wazaris: 0, judoka1Shidos: 0,
        judoka2Ippones: 0, judoka2Wazaris: 0, judoka2Shidos: 0,
        estado: 'pendiente',
      })
    }
  }

  const estructura = {
    rondas: 1,
    slots: N,
    byes: 0,
    tipoSeed,
    numTatamis: 0,   // se actualiza tras el balanceo
    participantes: sembrados.map(i => ({
      judokaId: i.judokaId,
      cinturon: i.judoka?.cinturon,
      clubId: i.judoka?.clubId,
      pool: 'A',
    })),
    tieneRepesca: false,
  }
  return { combates, estructura }
}

/**
 * 6+ participantes → Eliminatoria directa con repesca (medallas de bronce).
 * El tatami se asigna externamente mediante asignarTatamisBalanceados.
 */
function construirEliminacion(
  sembrados: Inscripcion[],
  N: number,
  tipoSeed: string,
): { combates: Omit<Combate, 'id'>[]; estructura: object } {
  const S = nextPow2(N)
  const rondas = Math.log2(S)
  const byes = S - N
  const { slots, byeSlots: _byeSlots } = buildSlots(sembrados, S, byes)

  const combates: Omit<Combate, 'id'>[] = []

  // R1
  for (let pos = 1; pos <= S / 2; pos++) {
    const j1 = slots[2 * pos - 1]
    const j2 = slots[2 * pos]
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
    })
  }

  // Rondas 2..rondas (placeholders)
  for (let r = 2; r <= rondas; r++) {
    const count = S / Math.pow(2, r)
    for (let pos = 1; pos <= count; pos++) {
      combates.push({
        llaveId: '', ronda: r, posicion: pos, fase: 'principal',
        judoka1Ippones: 0, judoka1Wazaris: 0, judoka1Shidos: 0,
        judoka2Ippones: 0, judoka2Wazaris: 0, judoka2Shidos: 0,
        estado: 'pendiente',
      })
    }
  }

  // Repesca (medallas de bronce — sistema multi-ronda)
  const repescaEstructura = buildRepesca(S, rondas)

  if (repescaEstructura) {
    for (const rc of repescaEstructura.combates) {
      combates.push({
        llaveId: '',
        ronda: rondas + rc.rondaRepesca,
        posicion: rc.posicion,
        fase: 'repesca',
        judoka1Ippones: 0, judoka1Wazaris: 0, judoka1Shidos: 0,
        judoka2Ippones: 0, judoka2Wazaris: 0, judoka2Shidos: 0,
        estado: 'pendiente',
      })
    }
  }

  const poolMap: Record<string, string> = {}
  for (let s = 1; s <= S; s++) {
    if (slots[s]) poolMap[slots[s]!.judokaId] = slotToPool(s, S)
  }

  const estructura = {
    rondas,
    slots: S,
    byes,
    tipoSeed,
    numTatamis: 0,   // se actualiza tras el balanceo
    participantes: sembrados.map(i => ({
      judokaId: i.judokaId,
      cinturon: i.judoka?.cinturon,
      clubId: i.judoka?.clubId,
      pool: poolMap[i.judokaId],
    })),
    tieneRepesca: repescaEstructura !== null,
    repesca: repescaEstructura ?? null,
  }
  return { combates, estructura }
}

// ── Load balancing ────────────────────────────────────────────────────────────

/**
 * Asigna tatamis a nivel de categoría usando un greedy bin-packing.
 *
 * Principio (JudoShiai): todos los combates de una categoría ocurren
 * en el mismo tatami. El objetivo es que cada tatami tenga una carga
 * similar (medida en número de combates reales, excluyendo byes).
 *
 * Algoritmo:
 *   1. Ordenar categorías por peso descendente (más combates primero).
 *   2. Asignar cada categoría al tatami con menos carga acumulada.
 *   3. Actualizar campo `tatami` en todos los combates no-bye de la categoría.
 *   4. Actualizar campo `numTatamis` en la estructura para que la UI lo use.
 */
function asignarTatamisBalanceados(
  items: Array<{ combates: Omit<Combate, 'id'>[]; estructura: Record<string, unknown> }>,
  numTatamis: number,
): void {
  const T = Math.max(1, numTatamis)
  const carga = new Array<number>(T).fill(0)

  // Peso = combates reales (no byes)
  const pesos = items.map(item =>
    item.combates.filter(c => c.estado !== 'bye').length
  )

  // Ordenar por peso desc → greedy asigna primero los más pesados
  const orden = pesos
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p - a.p)

  for (const { p, i } of orden) {
    // Tatami con menos carga (índice 0-based)
    const tatamiIdx = carga.indexOf(Math.min(...carga))
    const tatamiNum = tatamiIdx + 1
    carga[tatamiIdx] += p

    // Asignar tatami a todos los combates reales de la categoría
    for (const c of items[i].combates) {
      if (c.estado !== 'bye') {
        c.tatami = tatamiNum
      }
    }

    // Actualizar metadata de la estructura
    items[i].estructura.numTatamis = T
    items[i].estructura.tatamiAsignado = tatamiNum
  }
}

// ── Use Case ──────────────────────────────────────────────────────────────────

type CatBuilt = {
  tc: { id: string; nombre: string }
  combates: Omit<Combate, 'id'>[]
  estructura: Record<string, unknown>
  N: number
  sistema: SistemaCompeticion
}

type CatFailed = {
  tc: { id: string; nombre: string }
  error: string
  N: number
  sistema: SistemaCompeticion
}

/**
 * Genera llaves para TODAS las categorías de un torneo en un solo clic.
 *
 * Reglas de sistema (por IJF/JudoShiai):
 *   N ≤ 5  → Liguilla (round_robin): todos contra todos
 *   N ≥ 6  → Eliminatoria directa con repesca de bronces
 *
 * Fases:
 *   1. BUILD  — construye combates/estructura de cada categoría (sin I/O)
 *   2. BALANCE — distribuye categorías entre tatamis con greedy bin-packing
 *   3. INSERT  — persiste en la BD con callback de progreso
 */
export class GenerarLlavesTorneo {
  constructor(
    private readonly llaveRepo: ILlaveRepository,
    private readonly inscripcionRepo: IInscripcionRepository,
    private readonly strategy: ISeedingStrategy = new CinturonStrategy(),
  ) {}

  async execute(
    torneoId: string,
    torneoCategorias: Array<{ id: string; nombre: string }>,
    numTatamis: number,
    generadoPor: string,
    onProgreso?: (resultado: ResultadoCategoria, idx: number, total: number) => void,
  ): Promise<ResultadoCategoria[]> {

    // ── Fase 1: Una sola consulta + build en memoria ───────────────────────
    const todas = await this.inscripcionRepo.listarPorTorneo(torneoId, ['confirmado'])

    const builds: (CatBuilt | CatFailed)[] = []

    for (const tc of torneoCategorias) {
      const elegibles = todas.filter(i => i.torneoCategoriaId === tc.id && i.pagado === true)
      const N = elegibles.length
      const sistema: SistemaCompeticion = N <= 5 ? 'round_robin' : 'single_elimination'

      if (N < 2) {
        builds.push({
          tc,
          error: N === 0
            ? 'Sin participantes elegibles (confirmados y pagados)'
            : 'Solo 1 participante elegible (mínimo 2)',
          N,
          sistema,
        })
        continue
      }

      try {
        const sembrados = this.strategy.ordenar(elegibles)
        const { combates, estructura } = sistema === 'round_robin'
          ? construirRoundRobin(sembrados, this.strategy.nombre)
          : construirEliminacion(sembrados, N, this.strategy.nombre)
        builds.push({ tc, combates, estructura: estructura as Record<string, unknown>, N, sistema })
      } catch (e) {
        builds.push({
          tc,
          error: e instanceof Error ? e.message : 'Error al construir el cuadro',
          N,
          sistema,
        })
      }
    }

    // ── Fase 2: Load balancing de tatamis (greedy bin-packing) ────────────
    const exitosos = builds.filter((b): b is CatBuilt => 'combates' in b)
    asignarTatamisBalanceados(exitosos, numTatamis)

    // ── Fase 3: Persistir en BD con callback de progreso ──────────────────
    const resultados: ResultadoCategoria[] = []

    for (let idx = 0; idx < builds.length; idx++) {
      const b = builds[idx]
      let resultado: ResultadoCategoria

      if (!('combates' in b)) {
        resultado = {
          torneoCategoriaId: b.tc.id,
          nombreCategoria: b.tc.nombre,
          N: b.N,
          sistema: b.sistema,
          ok: false,
          error: b.error,
        }
      } else {
        try {
          await this.llaveRepo.crear(b.tc.id, b.combates, b.sistema, b.N, b.estructura, generadoPor)
          resultado = {
            torneoCategoriaId: b.tc.id,
            nombreCategoria: b.tc.nombre,
            N: b.N,
            sistema: b.sistema,
            ok: true,
          }
        } catch (e) {
          resultado = {
            torneoCategoriaId: b.tc.id,
            nombreCategoria: b.tc.nombre,
            N: b.N,
            sistema: b.sistema,
            ok: false,
            error: e instanceof Error ? e.message : 'Error al guardar',
          }
        }
      }

      resultados.push(resultado)
      onProgreso?.(resultado, idx + 1, builds.length)
    }

    return resultados
  }
}
