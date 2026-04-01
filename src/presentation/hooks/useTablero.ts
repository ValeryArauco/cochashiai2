'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'


export interface JugadorTablero {
  id: string
  nombre: string
  apellido: string
  club: string
  avatarUrl: string | null
  peso: number | null
}

export interface BoardData {
  combateId: string
  categoria: string
  estado: 'pendiente' | 'en_curso'
  judoka1: JugadorTablero | null
  judoka2: JugadorTablero | null
  judoka1Ippones: number
  judoka1Wazaris: number
  judoka1Shidos: number
  judoka2Ippones: number
  judoka2Wazaris: number
  judoka2Shidos: number
}

export interface TorneoTablero {
  nombre: string
  numTatamis: number
}

function jugadorFromRaw(raw: any, clubMap: Map<string, string>): JugadorTablero | null {
  if (!raw) return null
  return {
    id: raw.id,
    nombre: raw.usuario?.nombre ?? '',
    apellido: raw.usuario?.apellido_paterno ?? '',
    club: (raw.club_id && clubMap.get(raw.club_id)) || 'Sin club',
    avatarUrl: raw.usuario?.avatar_url ?? null,
    peso: raw.peso_competitivo ?? null,
  }
}

function categoriaLabel(cat: any): string {
  if (!cat) return 'Sin categoría'
  const edad = (cat.edad as string).charAt(0).toUpperCase() + (cat.edad as string).slice(1)
  const genero = (cat.genero as string).charAt(0).toUpperCase() + (cat.genero as string).slice(1)
  return `${edad} ${genero} ${cat.nombre}`
}

const SELECT_TABLERO = `
  id, llave_id, tatami, estado,
  judoka1_ippones, judoka1_wazaris, judoka1_shidos,
  judoka2_ippones, judoka2_wazaris, judoka2_shidos,
  judoka1:judokas!combates_judoka1_id_fkey(
    id, club_id, peso_competitivo,
    usuario:usuarios(nombre, apellido_paterno, avatar_url)
  ),
  judoka2:judokas!combates_judoka2_id_fkey(
    id, club_id, peso_competitivo,
    usuario:usuarios(nombre, apellido_paterno, avatar_url)
  )
`


export function useTablero(torneoId: string) {
  const [torneo, setTorneo] = useState<TorneoTablero | null>(null)
  const [boards, setBoards] = useState<Map<number, BoardData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRef = useRef<() => void>(() => {})

  useEffect(() => {
    let cancelled = false
    let debounce: ReturnType<typeof setTimeout> | null = null
    let fetchGen = 0

    async function fetchData() {
      if (cancelled) return
      const gen = ++fetchGen
      try {
        
        const { data: torneoData, error: torneoError } = await supabase
          .from('torneos')
          .select('id, nombre, num_tatamis')
          .eq('id', torneoId)
          .single()

        if (cancelled || gen !== fetchGen) return
        if (torneoError || !torneoData) { setError('No se encontró el torneo'); return }
        setTorneo({ nombre: torneoData.nombre, numTatamis: torneoData.num_tatamis })

        
        const { data: llavesData, error: llavesError } = await supabase
          .from('llaves')
          .select('id, torneo_categoria!inner(torneo_id, categoria:categorias(nombre, genero, edad))')
          .eq('torneo_categoria.torneo_id', torneoId)

        if (cancelled || gen !== fetchGen) return
        if (llavesError) { setError(`Error llaves: ${llavesError.message}`); return }

        const rawLlaves = (llavesData ?? []) as any[]
        const llaveIds: string[] = rawLlaves.map(l => l.id)
        const categoriaByLlave = new Map<string, string>()
        for (const l of rawLlaves) {
          categoriaByLlave.set(l.id, categoriaLabel(l.torneo_categoria?.categoria))
        }

        if (llaveIds.length === 0) { setBoards(new Map()); setError(null); return }

        const { data: combatesData, error: combatesError } = await supabase
          .from('combates')
          .select(SELECT_TABLERO)
          .in('estado', ['pendiente', 'en_curso'])
          .not('tatami', 'is', null)
          .in('llave_id', llaveIds)

        if (cancelled || gen !== fetchGen) return
        if (combatesError) { setError(`Error combates: ${combatesError.message}`); return }

        const rawList = (combatesData ?? []) as any[]
        const clubIds = [...new Set(
          rawList.flatMap(c => [c.judoka1?.club_id, c.judoka2?.club_id]).filter(Boolean) as string[]
        )]
        const clubMap = new Map<string, string>()
        if (clubIds.length > 0) {
          const { data: clubsData } = await supabase
            .from('clubs').select('id, nombre_club').in('id', clubIds)
          for (const cl of (clubsData ?? [])) clubMap.set(cl.id, cl.nombre_club)
        }

        const map = new Map<number, BoardData>()
        for (const raw of rawList) {
          const tatami: number = raw.tatami
          const existing = map.get(tatami)
          if (existing && existing.estado === 'en_curso') continue
          map.set(tatami, {
            combateId: raw.id,
            categoria: categoriaByLlave.get(raw.llave_id) ?? 'Sin categoría',
            estado: raw.estado,
            judoka1: jugadorFromRaw(raw.judoka1, clubMap),
            judoka2: jugadorFromRaw(raw.judoka2, clubMap),
            judoka1Ippones: raw.judoka1_ippones,
            judoka1Wazaris: raw.judoka1_wazaris,
            judoka1Shidos:  raw.judoka1_shidos,
            judoka2Ippones: raw.judoka2_ippones,
            judoka2Wazaris: raw.judoka2_wazaris,
            judoka2Shidos:  raw.judoka2_shidos,
          })
        }

        if (cancelled || gen !== fetchGen) return
        setBoards(map)
        setError(null)
      } catch (e) {
        if (!cancelled && gen === fetchGen) setError(`Error inesperado: ${String(e)}`)
      } finally {
        if (!cancelled && gen === fetchGen) setLoading(false)
      }
    }
    
    function debouncedFetch() {
      if (debounce) clearTimeout(debounce)
      debounce = setTimeout(fetchData, 300)
    }

    fetchRef.current = fetchData

    fetchData()

    const channel = supabase
      .channel(`tablero-${torneoId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'combates' }, debouncedFetch)
      .subscribe()

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return
      fetchData()
      if (channel.state !== 'joined') {
        supabase.removeChannel(channel)
        channel.subscribe()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      if (debounce) clearTimeout(debounce)
      document.removeEventListener('visibilitychange', handleVisibility)
      supabase.removeChannel(channel)
    }
  }, [torneoId])

  return { torneo, boards, loading, error, refetch: () => fetchRef.current() }
}
