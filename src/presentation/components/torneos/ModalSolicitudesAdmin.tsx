'use client'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Avatar, CircularProgress,
  TextField, Alert, Chip, Divider, IconButton, Tooltip,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import EditIcon from '@mui/icons-material/Edit'
import PaymentsIcon from '@mui/icons-material/Payments'
import BlockIcon from '@mui/icons-material/Block'
import ScaleIcon from '@mui/icons-material/Scale'
import { useState } from 'react'
import { useSolicitudesAdmin } from '../../hooks/useSolicitudesAdmin'
import { Inscripcion } from '../../../domain/models/Inscripcion'
import { Categoria } from '../../../domain/models/Categoria'

interface Props {
  abierto: boolean
  onCerrar: () => void
  torneoId: string
}

const pesoKey = (min?: number, max?: number) => `${min ?? ''}-${max ?? ''}`
const pesoLabel = (min?: number, max?: number) => {
  if (min && max) return `${min} – ${max} kg`
  if (min) return `> ${min} kg`
  if (max) return `< ${max} kg`
  return 'Sin límite'
}

const dentroDeRango = (peso: number, cat?: Categoria) => {
  if (!cat) return true
  if (cat.pesoMinimo != null && peso < cat.pesoMinimo) return false
  if (cat.pesoMaximo != null && peso > cat.pesoMaximo) return false
  return true
}

interface DialogCambio {
  ins: Inscripcion
  peso: number
}

export function ModalSolicitudesAdmin({ abierto, onCerrar, torneoId }: Props) {
  const { inscripciones, torneoCategorias, cargando, error, registrarPeso, registrarPago, deshacerPago, cambiarCategoriaYRegistrarPeso, descalificarPorPeso, eliminar } = useSolicitudesAdmin(torneoId)

  const [pesos, setPesos] = useState<Record<string, string>>({})
  const [pesoFueraDeRango, setPesoFueraDeRango] = useState<Record<string, number>>({})
  const [dialogCambio, setDialogCambio] = useState<DialogCambio | null>(null)
  const [selectedTCId, setSelectedTCId] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroCinturon, setFiltroCinturon] = useState('')
  const [filtroEdad, setFiltroEdad] = useState('')
  const [filtroGenero, setFiltroGenero] = useState('')
  const [filtroPeso, setFiltroPeso] = useState('')
  const [filtroClub, setFiltroClub] = useState('')

  const cinturones = Array.from(new Set(
    inscripciones.map(i => i.judoka?.cinturon).filter(Boolean) as string[]
  )).sort()
  const clubs = Array.from(new Map(
    inscripciones
      .filter(i => i.judoka?.clubId && i.judoka?.clubNombre)
      .map(i => [i.judoka!.clubId!, i.judoka!.clubNombre!])
  ).entries()).sort(([, a], [, b]) => a.localeCompare(b))
  const pesosUnicos = Array.from(
    new Map(
      inscripciones
        .map(i => i.torneoCategoria?.categoria)
        .filter(Boolean)
        .map(c => [pesoKey(c!.pesoMinimo, c!.pesoMaximo), { min: c!.pesoMinimo, max: c!.pesoMaximo }])
    ).entries()
  ).sort(([a], [b]) => (Number(a.split('-')[0]) || 0) - (Number(b.split('-')[0]) || 0))

  const filtrar = (lista: Inscripcion[]) =>
    lista.filter(i => {
      const nombre = `${i.judoka?.usuario.nombre ?? ''} ${i.judoka?.usuario.apellidoPaterno ?? ''}`.toLowerCase()
      if (busqueda && !nombre.includes(busqueda.toLowerCase())) return false
      if (filtroCinturon && i.judoka?.cinturon !== filtroCinturon) return false
      if (filtroClub && i.judoka?.clubId !== filtroClub) return false
      if (filtroEdad && i.torneoCategoria?.categoria.edad !== filtroEdad) return false
      if (filtroGenero && i.torneoCategoria?.categoria.genero !== filtroGenero) return false
      if (filtroPeso) {
        const cat = i.torneoCategoria?.categoria
        if (pesoKey(cat?.pesoMinimo, cat?.pesoMaximo) !== filtroPeso) return false
      }
      return true
    })

  const handleRegistrarPeso = async (ins: Inscripcion) => {
    const peso = parseFloat(pesos[ins.id] ?? '0')
    if (!peso || peso <= 0) return

    if (!dentroDeRango(peso, ins.torneoCategoria?.categoria)) {
      setPesoFueraDeRango(prev => ({ ...prev, [ins.id]: peso }))
      return
    }

    await registrarPeso(ins, peso)
    setPesos(prev => { const n = { ...prev }; delete n[ins.id]; return n })
  }

  const handleEliminar = async (id: string) => {
    if (confirm('¿Eliminar este participante del torneo?')) {
      await eliminar(id)
      setPesoFueraDeRango(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  const handleDescalificarPorPeso = async (ins: Inscripcion) => {
    const peso = pesoFueraDeRango[ins.id]
    if (!peso) return
    if (!confirm(`¿Confirmar descalificación por peso? ${ins.judoka?.usuario.nombre} pesó ${peso} kg (fuera de categoría). Seguirá en el bracket pero perderá su primer combate por W.O.`)) return
    await descalificarPorPeso(ins, peso)
    setPesoFueraDeRango(prev => { const n = { ...prev }; delete n[ins.id]; return n })
    setPesos(prev => { const n = { ...prev }; delete n[ins.id]; return n })
  }

  const handleAbrirCambioCategoria = (ins: Inscripcion) => {
    setDialogCambio({ ins, peso: pesoFueraDeRango[ins.id] })
    setSelectedTCId('')
  }

  const handleConfirmarCambio = async () => {
    if (!dialogCambio || !selectedTCId) return
    await cambiarCategoriaYRegistrarPeso(dialogCambio.ins, selectedTCId, dialogCambio.peso)
    setPesoFueraDeRango(prev => { const n = { ...prev }; delete n[dialogCambio.ins.id]; return n })
    setPesos(prev => { const n = { ...prev }; delete n[dialogCambio.ins.id]; return n })
    setDialogCambio(null)
    setSelectedTCId('')
  }

  const ordenarAlfa = (lista: Inscripcion[]) =>
    [...lista].sort((a, b) => {
      const na = `${a.judoka?.usuario.nombre ?? ''} ${a.judoka?.usuario.apellidoPaterno ?? ''}`.toLowerCase()
      const nb = `${b.judoka?.usuario.nombre ?? ''} ${b.judoka?.usuario.apellidoPaterno ?? ''}`.toLowerCase()
      return na.localeCompare(nb, 'es')
    })

  const listaFiltrada = ordenarAlfa(filtrar(inscripciones))

  const catActual = dialogCambio?.ins.torneoCategoria?.categoria
  const categoriasCompatibles = dialogCambio
    ? torneoCategorias.filter(tc =>
        tc.id !== dialogCambio.ins.torneoCategoriaId &&
        dentroDeRango(dialogCambio.peso, tc.categoria) &&
        tc.categoria.edad === catActual?.edad &&
        tc.categoria.genero === catActual?.genero
      )
    : []

  return (
    <>
      <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth>
        <DialogTitle>Gestión de inscripciones</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {!cargando && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                sx={{ flex: 1, minWidth: 160 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Cinturón</InputLabel>
                <Select label="Cinturón" value={filtroCinturon} onChange={(e: SelectChangeEvent) => setFiltroCinturon(e.target.value)}>
                  <MenuItem value="">Todos</MenuItem>
                  {cinturones.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel>Edad</InputLabel>
                <Select label="Edad" value={filtroEdad} onChange={(e: SelectChangeEvent) => setFiltroEdad(e.target.value)}>
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="infantil">Infantil</MenuItem>
                  <MenuItem value="cadete">Cadete</MenuItem>
                  <MenuItem value="senior">Senior</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Género</InputLabel>
                <Select label="Género" value={filtroGenero} onChange={(e: SelectChangeEvent) => setFiltroGenero(e.target.value)}>
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="femenino">Femenino</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Peso</InputLabel>
                <Select label="Peso" value={filtroPeso} onChange={(e: SelectChangeEvent) => setFiltroPeso(e.target.value)}>
                  <MenuItem value="">Todos</MenuItem>
                  {pesosUnicos.map(([key, { min, max }]) => (
                    <MenuItem key={key} value={key}>{pesoLabel(min, max)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {clubs.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Club</InputLabel>
                  <Select label="Club" value={filtroClub} onChange={(e: SelectChangeEvent) => setFiltroClub(e.target.value)}>
                    <MenuItem value="">Todos</MenuItem>
                    {clubs.map(([id, nombre]) => (
                      <MenuItem key={id} value={id}>{nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}

          {cargando ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
          ) : listaFiltrada.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={3}>
              No hay inscripciones
            </Typography>
          ) : (
            listaFiltrada.map((ins: Inscripcion) => {
              const u = ins.judoka?.usuario
              const nombreCompleto = `${u?.nombre ?? ''} ${u?.apellidoPaterno ?? ''}`.trim()
              const inicial = u?.nombre?.[0]?.toUpperCase() ?? '?'
              const confirmado = ins.estado === 'confirmado' || ins.estado === 'pendiente_pago'
              const sinPeso = ins.estado === 'aprobado_entrenador'
              const fueraDeRango = pesoFueraDeRango[ins.id]
              const esDQ = ins.descalificadoPeso

              return (
                <Box key={ins.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                    <Avatar src={u?.avatarUrl}>{inicial}</Avatar>
                    <Box flex={1}>
                      <Typography fontWeight={500}>{nombreCompleto}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ins.torneoCategoria?.categoria.nombre ?? '—'}
                        {ins.judoka?.clubNombre ? ` · ${ins.judoka.clubNombre}` : ''}
                        {ins.pesoOficial ? ` · Peso: ${ins.pesoOficial} kg` : ''}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {confirmado && esDQ ? (
                        <>
                          <Chip label="Desc. por peso" color="error" size="small" icon={<BlockIcon />} />
                          <Chip
                            label={`${ins.pesoOficial} kg (${pesoLabel(ins.torneoCategoria?.categoria.pesoMinimo, ins.torneoCategoria?.categoria.pesoMaximo)})`}
                            color="warning"
                            size="small"
                            icon={<ScaleIcon />}
                          />
                        </>
                      ) : confirmado ? (
                        <Chip label="Pesaje ✓" color="info" size="small" icon={<CheckCircleIcon />} />
                      ) : sinPeso && fueraDeRango != null ? (
                        <>
                          <Chip
                            icon={<WarningAmberIcon />}
                            label={`${fueraDeRango} kg – fuera de rango (${pesoLabel(ins.torneoCategoria?.categoria.pesoMinimo, ins.torneoCategoria?.categoria.pesoMaximo)})`}
                            color="warning"
                            size="small"
                          />
                          <Tooltip title="Cambiar a una categoría compatible">
                            <IconButton color="primary" size="small" onClick={() => handleAbrirCambioCategoria(ins)}>
                              <SwapHorizIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Corregir el peso ingresado">
                            <IconButton size="small" onClick={() => setPesoFueraDeRango(prev => { const n = { ...prev }; delete n[ins.id]; return n })}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Descalificar por peso (queda en bracket pero pierde su primer combate por W.O.)">
                            <IconButton color="error" size="small" onClick={() => handleDescalificarPorPeso(ins)}>
                              <BlockIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <TextField
                            label="Peso (kg)"
                            type="number"
                            size="small"
                            sx={{ width: 110 }}
                            value={pesos[ins.id] ?? ''}
                            onChange={e => setPesos(prev => ({ ...prev, [ins.id]: e.target.value }))}
                            slotProps={{ input: { inputProps: { min: 0, step: 0.1 } } }}
                          />
                          <Tooltip title="Registrar peso">
                            <span>
                              <IconButton
                                color="success"
                                onClick={() => handleRegistrarPeso(ins)}
                                disabled={!pesos[ins.id] || parseFloat(pesos[ins.id]) <= 0}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      )}

                      {ins.pagado ? (
                        <Tooltip title="Deshacer pago">
                          <Chip
                            label="Pagado"
                            color="success"
                            size="small"
                            icon={<PaymentsIcon />}
                            onDelete={() => deshacerPago(ins.id)}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Registrar pago">
                          <IconButton color="primary" size="small" onClick={() => registrarPago(ins.id)}>
                            <PaymentsIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Eliminar participante">
                        <IconButton color="error" size="small" onClick={() => handleEliminar(ins.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Divider />
                </Box>
              )
            })
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrar}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!dialogCambio} onClose={() => setDialogCambio(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar categoría</DialogTitle>
        <DialogContent>
          {dialogCambio && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                El peso registrado ({dialogCambio.peso} kg) está fuera del rango de{' '}
                <strong>{dialogCambio.ins.torneoCategoria?.categoria.nombre}</strong>{' '}
                ({pesoLabel(catActual?.pesoMinimo, catActual?.pesoMaximo)}).
              </Alert>
              {categoriasCompatibles.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  No hay otras categorías {catActual?.edad} {catActual?.genero} en este torneo donde {dialogCambio.peso} kg sea válido.
                </Typography>
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Nueva categoría</InputLabel>
                  <Select
                    label="Nueva categoría"
                    value={selectedTCId}
                    onChange={(e: SelectChangeEvent) => setSelectedTCId(e.target.value)}
                  >
                    {categoriasCompatibles.map(tc => (
                      <MenuItem key={tc.id} value={tc.id}>
                        {tc.categoria.nombre} ({pesoLabel(tc.categoria.pesoMinimo, tc.categoria.pesoMaximo)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogCambio(null)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleConfirmarCambio}
            disabled={!selectedTCId || categoriasCompatibles.length === 0}
          >
            Confirmar cambio
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
