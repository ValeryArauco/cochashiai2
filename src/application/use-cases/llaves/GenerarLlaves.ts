import { ILlaveRepository } from '../../../domain/repositories/ILlaveRepository'
import { IInscripcionRepository } from '../../../domain/repositories/IInscripcionRepository'
import { Llave, TipoBracket } from '../../../domain/models/Llave'
import { Combate, EstadoCombate } from '../../../domain/models/Combate'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export class GenerarLlaves {
  constructor(
    private readonly llaveRepo: ILlaveRepository,
    private readonly inscripcionRepo: IInscripcionRepository
  ) {}

  async execute(
    torneoId: string,
    torneoCategoriaId: string,
    tipoBracket: TipoBracket,
    numTatamis: number,
    generadoPor: string
  ): Promise<Llave> {
    if (!torneoCategoriaId) throw new Error('La categoría es requerida')

    const inscripciones = await this.inscripcionRepo.listarPorTorneo(torneoId, ['confirmado'])
    const delCategoria = inscripciones.filter(i => i.torneoCategoriaId === torneoCategoriaId)

    if (delCategoria.length < 2) {
      throw new Error('Se necesitan al menos 2 participantes para generar llaves')
    }

    const judokaIds = shuffleArray(delCategoria.map(i => i.judokaId))
    const n = judokaIds.length
    const rondas = Math.ceil(Math.log2(n))
    const slots = Math.pow(2, rondas)
    const byes = slots - n

    const combates: Omit<Combate, 'id'>[] = []
    let indiceGlobal = 0

    // Ronda 1
    const combatesPorRonda: number[] = [slots / 2]
    for (let r = 2; r <= rondas; r++) {
      combatesPorRonda.push(Math.pow(2, rondas - r))
    }

    let judokaIndex = 0
    for (let pos = 1; pos <= combatesPorRonda[0]; pos++) {
      const esBye = pos <= byes
      const judoka1Id = judokaIds[judokaIndex++]
      const judoka2Id = esBye ? undefined : judokaIds[judokaIndex++]
      const estado: EstadoCombate = esBye ? 'bye' : 'pendiente'
      const ganadorId = esBye ? judoka1Id : undefined
      const tatami = numTatamis > 0 ? (indiceGlobal % numTatamis) + 1 : undefined

      combates.push({
        llaveId: '',
        ronda: 1,
        posicion: pos,
        judoka1Id,
        judoka2Id,
        ganadorId,
        judoka1Ippones: 0,
        judoka1Wazaris: 0,
        judoka1Shidos: 0,
        judoka2Ippones: 0,
        judoka2Wazaris: 0,
        judoka2Shidos: 0,
        estado,
        tatami,
      })
      indiceGlobal++
    }

    // Rondas siguientes (placeholders)
    for (let r = 2; r <= rondas; r++) {
      for (let pos = 1; pos <= combatesPorRonda[r - 1]; pos++) {
        combates.push({
          llaveId: '',
          ronda: r,
          posicion: pos,
          judoka1Ippones: 0,
          judoka1Wazaris: 0,
          judoka1Shidos: 0,
          judoka2Ippones: 0,
          judoka2Wazaris: 0,
          judoka2Shidos: 0,
          estado: 'pendiente',
        })
      }
    }

    const estructura = {
      rondas,
      slots,
      participantes: judokaIds,
      combatesPorRonda,
    }

    return await this.llaveRepo.crear(
      torneoCategoriaId,
      combates,
      tipoBracket,
      n,
      estructura,
      generadoPor
    )
  }
}
