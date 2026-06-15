'use client'

import {
  Box, Grid, Typography, CircularProgress, Alert, Fab,
  useMediaQuery, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItem, ListItemIcon, ListItemText, Divider,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import GroupsIcon from '@mui/icons-material/Groups'
import BarChartIcon from '@mui/icons-material/BarChart'
import TableChartIcon from '@mui/icons-material/TableChart'
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi'
import PersonIcon from '@mui/icons-material/Person'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useState } from 'react'
import { useTorneos } from '@/presentation/hooks/useTorneos'
import { useAuth } from '@/presentation/context/AuthContext'
import { FiltrosTorneos } from '@/presentation/components/torneos/FiltrosTorneos'
import { TorneoCard } from '@/presentation/components/torneos/TorneoCard'
import { CrearTorneoModal } from '@/presentation/components/torneos/CrearTorneoModal'
import { SupabaseTorneoRepository } from '@/infrastructure/repositories/SupabaseTorneoRepository'
import { EliminarTorneo } from '@/application/use-cases/torneos/EliminarTorneo'
import { Torneo } from '@/domain/models/Torneo'
import { RolUsuario } from '@/domain/models/Usuario'

const eliminarTorneoUseCase = new EliminarTorneo(new SupabaseTorneoRepository())

interface GuiaItem {
  icon: React.ReactNode
  titulo: string
  descripcion: string
}

const GUIAS: Record<string, { titulo: string; subtitulo: string; items: GuiaItem[] }> = {
  admin: {
    titulo: 'Guía de Administración',
    subtitulo: 'Como administrador, tienes control total del sistema.',
    items: [
      {
        icon: <EmojiEventsIcon color="primary" />,
        titulo: 'Gestionar torneos',
        descripcion: 'Crea torneos con el botón "+" de esta pantalla. Toca la tarjeta de un torneo para ver sus detalles, o usa el ícono de eliminar para borrarlo.',
      },
      {
        icon: <AssignmentIcon color="warning" />,
        titulo: 'Solicitudes e inscripciones',
        descripcion: 'Dentro de cada torneo usa "Gestionar solicitudes" para aprobar inscripciones, registrar el peso oficial y confirmar pagos.',
      },
      {
        icon: <SportsKabaddiIcon color="secondary" />,
        titulo: 'Generar llaves',
        descripcion: 'Cuando las inscripciones estén confirmadas, usa "Generar llaves" para crear los brackets de cada categoría automáticamente.',
      },
      {
        icon: <GroupsIcon color="info" />,
        titulo: 'Gestionar mesa',
        descripcion: 'Asigna a cada operador de mesa su tatami correspondiente desde el botón "Gestionar mesa" dentro del torneo.',
      },
      {
        icon: <BarChartIcon color="success" />,
        titulo: 'Reportes y estadísticas',
        descripcion: 'Accede al medallero, estadísticas por judoka y resumen de torneos desde el ícono de reportes en la barra superior.',
      },
      {
        icon: <TableChartIcon />,
        titulo: 'Tablero en vivo',
        descripcion: 'Visualiza los marcadores en tiempo real desde "Ver Tablero" dentro de cada torneo. Es de acceso público, sin necesidad de sesión.',
      },
    ],
  },
  sensei: {
    titulo: 'Guía para Sensei',
    subtitulo: 'Gestiona la participación de los judokas de tu club en los torneos.',
    items: [
      {
        icon: <EmojiEventsIcon color="primary" />,
        titulo: 'Explorar torneos',
        descripcion: 'Navega por la lista de torneos disponibles. Toca cualquiera para ver sus detalles, fechas y categorías.',
      },
      {
        icon: <CheckCircleOutlineIcon color="success" />,
        titulo: 'Aprobar solicitudes',
        descripcion: 'Dentro de un torneo, usa "Ver solicitudes" para revisar las inscripciones de tu club. Puedes aprobar o rechazar cada una antes de que pase a revisión del administrador.',
      },
      {
        icon: <SportsKabaddiIcon color="secondary" />,
        titulo: 'Seguir los brackets',
        descripcion: 'Una vez generadas las llaves, puedes visualizar los brackets de competencia para seguir el avance de tus judokas en tiempo real.',
      },
    ],
  },
  judoka: {
    titulo: 'Guía para Judoka',
    subtitulo: 'Participa en torneos y lleva el control de tus inscripciones.',
    items: [
      {
        icon: <EmojiEventsIcon color="primary" />,
        titulo: 'Explorar torneos',
        descripcion: 'Navega por la lista de torneos y toca cualquiera para ver sus fechas y categorías disponibles.',
      },
      {
        icon: <AssignmentIcon color="warning" />,
        titulo: 'Inscribirte',
        descripcion: 'Dentro de un torneo con inscripciones abiertas, usa el botón "Inscribirse" y selecciona tu categoría. Tu sensei deberá aprobar la solicitud.',
      },
      {
        icon: <CheckCircleOutlineIcon color="info" />,
        titulo: 'Estado de tu inscripción',
        descripcion: 'Una vez inscrito, verás el estado de tu solicitud directamente en la tarjeta del torneo: pendiente, aprobado por sensei, pendiente de pago o confirmado.',
      },
      {
        icon: <PersonIcon color="secondary" />,
        titulo: 'Tu perfil',
        descripcion: 'Mantén tu perfil actualizado (cinturón, peso, tipo de sangre, club) usando el menú de tu avatar en la barra superior → "Mi perfil".',
      },
      {
        icon: <SportsKabaddiIcon />,
        titulo: 'Ver tu bracket',
        descripcion: 'Cuando las llaves estén generadas, podrás ver tu posición en el bracket y seguir el avance de la competencia dentro del torneo.',
      },
    ],
  },
  mesa: {
    titulo: 'Guía para Operador de Mesa',
    subtitulo: 'Gestiona los combates de tu tatami asignado.',
    items: [
      {
        icon: <EmojiEventsIcon color="primary" />,
        titulo: 'Acceder a tu tatami',
        descripcion: 'Abre el torneo en el que estás asignado. Serás llevado directamente a la vista de tu tatami con los combates programados.',
      },
      {
        icon: <PlayArrowIcon color="success" />,
        titulo: 'Iniciar combates',
        descripcion: 'Usa el botón "Iniciar" en cada combate para marcarlo como en curso. Esto actualiza el tablero en vivo.',
      },
      {
        icon: <AssignmentIcon color="warning" />,
        titulo: 'Registrar resultados',
        descripcion: 'Al finalizar un combate, registra los ippones, waza-aris, shidos y el tipo de victoria (ippon, waza-ari, shido, etc.) de cada judoka.',
      },
      {
        icon: <TableChartIcon color="info" />,
        titulo: 'Tablero en vivo',
        descripcion: 'El tablero público muestra los marcadores en tiempo real. Es accesible desde "Ver Tablero" dentro del torneo, sin necesidad de iniciar sesión.',
      },
      {
        icon: <AccountBalanceWalletIcon />,
        titulo: 'Inmovilizaciones (osae-komi)',
        descripcion: 'Usa el cronómetro de inmovilización en el modal de resultado: ≥20 s = ippon, 10–19 s = waza-ari. Presiona "Liberar" para detener el tiempo.',
      },
    ],
  },
}

function GuiaFab({ rol }: { rol: RolUsuario }) {
  const theme = useTheme()
  const esDesktop = useMediaQuery(theme.breakpoints.up('sm'))
  const [abierto, setAbierto] = useState(false)

  const clave = rol === 'asociacion' ? 'admin' : rol
  const guia = GUIAS[clave]
  if (!guia) return null

  return (
    <>
      <Fab
        color="primary"
        variant={esDesktop ? 'extended' : 'circular'}
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setAbierto(true)}
        aria-label="Ayuda"
      >
        <HelpOutlineIcon sx={esDesktop ? { mr: 1 } : undefined} />
        {esDesktop && '¿Cómo usar el sistema?'}
      </Fab>

      <Dialog
        open={abierto}
        onClose={() => setAbierto(false)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle component="div">
          <Typography variant="h6" fontWeight="bold" component="p">{guia.titulo}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {guia.subtitulo}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <List disablePadding>
            {guia.items.map((item, i) => (
              <Box key={i}>
                <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight="bold">
                        {item.titulo}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" mt={0.25}>
                        {item.descripcion}
                      </Typography>
                    }
                  />
                </ListItem>
                {i < guia.items.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAbierto(false)} variant="contained">
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default function TorneosPage() {
  const { usuario } = useAuth()
  const { torneos, cargando, error, filtros, setFiltros, orden, setOrden, recargar } = useTorneos()
  const [modalCrear, setModalCrear] = useState(false)
  const [torneoEliminar, setTorneoEliminar] = useState<Torneo | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)

  const esAdminOAsociacion = usuario?.rol === 'admin' || usuario?.rol === 'asociacion'

  const handleEliminar = async () => {
    if (!torneoEliminar) return
    setEliminando(true)
    setErrorEliminar(null)
    try {
      await eliminarTorneoUseCase.execute(torneoEliminar.id)
      setTorneoEliminar(null)
      recargar()
    } catch (e: unknown) {
      setErrorEliminar(e instanceof Error ? e.message : 'Error al eliminar')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Torneos
      </Typography>

      <FiltrosTorneos filtros={filtros} onChange={setFiltros} orden={orden} onOrdenChange={setOrden} />

      <Box sx={{ mt: 3 }}>
        {cargando && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!cargando && error && (
          <Alert severity="error">{error}</Alert>
        )}

        {!cargando && !error && torneos.length === 0 && (
          <Typography color="text.secondary" textAlign="center" mt={6}>
            No hay torneos para el período seleccionado.
          </Typography>
        )}

        {!cargando && torneos.length > 0 && (
          <Grid container spacing={2}>
            {torneos.map(torneo => (
              <Grid key={torneo.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <TorneoCard
                  torneo={torneo}
                  onEliminar={esAdminOAsociacion ? () => setTorneoEliminar(torneo) : undefined}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {usuario && <GuiaFab rol={usuario.rol} />}

      {esAdminOAsociacion && (
        <Fab
          color="secondary"
          variant="extended"
          sx={{ position: 'fixed', bottom: 104, right: 32 }}
          onClick={() => setModalCrear(true)}
          aria-label="Crear torneo"
        >
          <AddIcon sx={{ mr: 1 }} />
          Crear torneo
        </Fab>
      )}

      <CrearTorneoModal
        abierto={modalCrear}
        onCerrar={() => setModalCrear(false)}
        onExito={() => { setModalCrear(false); recargar() }}
      />

      <Dialog open={!!torneoEliminar} onClose={() => !eliminando && setTorneoEliminar(null)}>
        <DialogTitle>¿Eliminar torneo?</DialogTitle>
        <DialogContent>
          <Typography>
            &ldquo;{torneoEliminar?.nombre}&rdquo; se eliminará permanentemente.
          </Typography>
          {errorEliminar && <Alert severity="error" sx={{ mt: 2 }}>{errorEliminar}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTorneoEliminar(null)} disabled={eliminando}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={handleEliminar} disabled={eliminando}>
            {eliminando ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
