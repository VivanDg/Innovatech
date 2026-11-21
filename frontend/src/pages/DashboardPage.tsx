import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ClipboardPlus,
  Clock,
  Laptop,
  RefreshCw,
  Wrench,
} from 'lucide-react'
import { api } from '../lib/api'
import { diasDesdeHoy, formatearFecha, ROL_LABEL } from '../lib/utils'
import { obtenerFotoEquipo } from '../lib/equipo-fotos'
import { useAuth } from '../context/AuthContext'
import { PageHeader, StatCard } from '../components/ui/Layout'
import { Button, EmptyState, LoadingBlock } from '../components/ui/Controls'
import { EstadoEquipoBadge, EstadoPrestamoBadge } from '../components/Badges'
import { AreasChart, EstadoEquiposChart, TopEquiposChart } from '../components/charts/Charts'
import type {
  Dashboard,
  Equipo,
  EquipoMasUtilizado,
  EquipoPorEstado,
  PagedResult,
  Prestamo,
  PrestamoPorArea,
} from '../types/api'

function saludo(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function Vencimiento({ fecha }: { fecha: string }) {
  const dias = diasDesdeHoy(fecha)
  if (dias < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-danger">
        <AlertTriangle className="size-3.5" /> Vencido hace {-dias} d
      </span>
    )
  }
  if (dias === 0) {
    return <span className="text-xs font-bold text-[#9a7200] dark:text-[#f5c542]">Vence hoy</span>
  }
  if (dias <= 2) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#9a7200] dark:text-[#f5c542]">
        <Clock className="size-3.5" /> En {dias} d
      </span>
    )
  }
  return <span className="text-xs text-muted">En {dias} d</span>
}

export function DashboardPage() {
  const { usuario, tieneRol } = useAuth()
  const esGestor = tieneRol('Administrador', 'ResponsableTecnologia')

  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<Dashboard>('/reportes/dashboard')).data,
    enabled: esGestor,
  })

  const estadosQuery = useQuery({
    queryKey: ['reportes', 'equipos-por-estado'],
    queryFn: async () => (await api.get<EquipoPorEstado[]>('/reportes/equipos-por-estado')).data,
    enabled: esGestor,
  })

  const topQuery = useQuery({
    queryKey: ['reportes', 'equipos-mas-utilizados', 5],
    queryFn: async () =>
      (await api.get<EquipoMasUtilizado[]>('/reportes/equipos-mas-utilizados', { params: { top: 5 } })).data,
    enabled: esGestor,
  })

  const areasQuery = useQuery({
    queryKey: ['reportes', 'prestamos-por-area'],
    queryFn: async () => (await api.get<PrestamoPorArea[]>('/reportes/prestamos-por-area')).data,
    enabled: esGestor,
  })

  const activosQuery = useQuery({
    queryKey: ['prestamos', 'activos'],
    queryFn: async () => (await api.get<Prestamo[]>('/prestamos/activos')).data,
    enabled: esGestor,
  })

  const miosQuery = useQuery({
    queryKey: ['prestamos', 'mios', 'dashboard'],
    queryFn: async () =>
      (await api.get<PagedResult<Prestamo>>('/prestamos/mios', { params: { pageSize: 5 } })).data,
    enabled: !esGestor,
  })

  const disponiblesQuery = useQuery({
    queryKey: ['equipos', 'disponibles', 'dashboard'],
    queryFn: async () =>
      (await api.get<PagedResult<Equipo>>('/equipos', { params: { estado: 'Disponible', pageSize: 6 } })).data,
    enabled: !esGestor,
  })

  const resumenQuery = useQuery({
    queryKey: ['prestamos', 'mi-resumen'],
    queryFn: async () => {
      const [activos, pendientes, devueltos] = await Promise.all([
        api.get<PagedResult<Prestamo>>('/prestamos/mios', { params: { estado: 'Aprobado', pageSize: 1 } }),
        api.get<PagedResult<Prestamo>>('/prestamos/mios', { params: { estado: 'Pendiente', pageSize: 1 } }),
        api.get<PagedResult<Prestamo>>('/prestamos/mios', { params: { estado: 'Devuelto', pageSize: 1 } }),
      ])
      return {
        activos: activos.data.totalCount,
        pendientes: pendientes.data.totalCount,
        devueltos: devueltos.data.totalCount,
      }
    },
    enabled: !esGestor,
  })

  if (!usuario) return null

  const nombreCorto = usuario.nombreCompleto.split(' ')[0]
  const dashboard = dashboardQuery.data

  return (
    <div>
      <PageHeader
        titulo={`${saludo()}, ${nombreCorto}`}
        descripcion={
          esGestor
            ? 'Este es el pulso del inventario y de los préstamos de Innovatech.'
            : 'Revisa tus préstamos y encuentra el próximo equipo que necesitas.'
        }
        acciones={
          esGestor ? (
            <Link
              to="/reportes"
              className="inline-flex items-center gap-2 rounded-[10px_8px_11px_7px] border-2 border-ink bg-paper px-4 py-2 text-sm font-bold shadow-sketch-sm transition hover:bg-soft"
            >
              <BarChart3 className="size-4" /> Ver reportes
            </Link>
          ) : (
            <Link
              to="/equipos?estado=Disponible"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 active:scale-[0.98]"
            >
              <ClipboardPlus className="size-4" /> Solicitar préstamo
            </Link>
          )
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[12px_9px_13px_8px] border-2 border-dashed border-ink/30 bg-soft/70 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full border-2 border-ink bg-paper">
            <CalendarClock className="size-4" />
          </span>
          <p className="text-sm">
            <span className="font-bold">Hoy es {formatearFecha(new Date().toISOString())}</span>
            <span className="text-muted"> · {usuario.area}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
          {esGestor ? 'Perfil: ' + ROL_LABEL[usuario.rol] : 'Portal del Colaborador'}
        </span>
      </div>

      {esGestor ? (
        dashboardQuery.isLoading ? (
          <div className="sketch-card">
            <LoadingBlock mensaje="Preparando el tablero…" />
          </div>
        ) : dashboardQuery.isError || !dashboard ? (
          <div className="sketch-card flex flex-col items-center gap-3 px-6 py-12 text-center">
            <AlertTriangle className="size-8 text-danger" />
            <h2 className="text-2xl">No se pudo cargar el tablero</h2>
            <p className="text-sm text-muted">Revisa que la API esté disponible e intenta nuevamente.</p>
            <Button icono={<RefreshCw className="size-4" />} onClick={() => void dashboardQuery.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                titulo="Total equipos"
                valor={dashboard.totalEquipos}
                detalle={`${dashboard.equiposMantenimiento} en mantenimiento`}
                icono={<Boxes className="size-5" />}
                acento="neutral"
              />
              <StatCard
                titulo="Disponibles"
                valor={dashboard.equiposDisponibles}
                detalle="Listos para prestar"
                icono={<CheckCircle2 className="size-5" />}
                acento="success"
              />
              <StatCard
                titulo="Prestados"
                valor={dashboard.equiposPrestados}
                detalle="Actualmente en uso"
                icono={<Laptop className="size-5" />}
                acento="info"
              />
              <StatCard
                titulo="Pendientes"
                valor={dashboard.prestamosPendientes}
                detalle={`${dashboard.totalPrestamos} préstamos registrados`}
                icono={<Clock className="size-5" />}
                acento="warning"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="sketch-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl leading-none">Equipos por estado</h2>
                    <p className="mt-1 text-xs text-muted">Foto actual del inventario</p>
                  </div>
                  <Boxes className="size-5 text-muted" />
                </div>
                {estadosQuery.data ? (
                  <EstadoEquiposChart datos={estadosQuery.data} />
                ) : (
                  <LoadingBlock mensaje="Cargando estados…" />
                )}
              </div>

              <div className="sketch-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl leading-none">Equipos más utilizados</h2>
                    <p className="mt-1 text-xs text-muted">Top 5 por número de préstamos</p>
                  </div>
                  <ArrowUpRight className="size-5 text-muted" />
                </div>
                {topQuery.data ? (
                  topQuery.data.length ? (
                    <TopEquiposChart datos={topQuery.data} />
                  ) : (
                    <EmptyState titulo="Aún no hay préstamos" descripcion="Los equipos aparecerán aquí cuando se usen." />
                  )
                ) : (
                  <LoadingBlock mensaje="Calculando ranking…" />
                )}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="sketch-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl leading-none">Préstamos por área</h2>
                    <p className="mt-1 text-xs text-muted">Demanda acumulada por área</p>
                  </div>
                  <BarChart3 className="size-5 text-muted" />
                </div>
                {areasQuery.data ? (
                  areasQuery.data.length ? (
                    <AreasChart datos={areasQuery.data} />
                  ) : (
                    <EmptyState titulo="Sin datos todavía" descripcion="Cuando existan préstamos verás la distribución." />
                  )
                ) : (
                  <LoadingBlock />
                )}
              </div>

              <div className="sketch-card overflow-hidden">
                <div className="flex items-center justify-between border-b-2 border-ink bg-soft px-4 py-3">
                  <div>
                    <h2 className="text-2xl leading-none">Préstamos activos</h2>
                    <p className="mt-1 text-xs text-muted">Equipos que deben volver</p>
                  </div>
                  <Link to="/prestamos" className="text-xs font-bold underline decoration-dashed underline-offset-4">
                    Ver todos
                  </Link>
                </div>
                {activosQuery.isLoading ? (
                  <LoadingBlock />
                ) : activosQuery.data?.length ? (
                  <div className="overflow-x-auto">
                    <table className="table-sketch">
                      <thead>
                        <tr>
                          <th>Equipo</th>
                          <th>Solicitante</th>
                          <th>Devolución</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activosQuery.data.slice(0, 6).map((prestamo) => (
                          <tr key={prestamo.id}>
                            <td>
                              <p className="font-bold">{prestamo.equipo.codigoPatrimonial}</p>
                              <p className="max-w-[14rem] truncate text-xs text-muted">{prestamo.equipo.nombre}</p>
                            </td>
                            <td className="text-xs">{prestamo.solicitante.nombreCompleto}</td>
                            <td>
                              <p className="text-xs">{formatearFecha(prestamo.fechaDevolucionProgramada)}</p>
                              <Vencimiento fecha={prestamo.fechaDevolucionProgramada} />
                            </td>
                            <td>
                              <EstadoPrestamoBadge estado={prestamo.estado} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icono={<CheckCircle2 className="size-8" />}
                    titulo="Todo devuelto"
                    descripcion="No hay préstamos activos en este momento."
                  />
                )}
              </div>
            </div>

            {dashboard.areaMayorUso && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
                <div className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white">
                  <Wrench className="size-4.5" />
                </div>
                <p className="text-sm">
                  <span className="font-bold">Área con mayor asignación de recursos:</span>{' '}
                  <strong className="underline decoration-blue-400 underline-offset-2">{dashboard.areaMayorUso.area}</strong> con{' '}
                  <strong>{dashboard.areaMayorUso.cantidad} préstamo(s) activos/registrados</strong>.
                </p>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              titulo="Préstamos activos"
              valor={resumenQuery.data?.activos ?? '—'}
              detalle="Equipos en tu poder"
              icono={<Laptop className="size-5" />}
              acento="info"
            />
            <StatCard
              titulo="Solicitudes pendientes"
              valor={resumenQuery.data?.pendientes ?? '—'}
              detalle="Esperando aprobación"
              icono={<Clock className="size-5" />}
              acento="warning"
            />
            <StatCard
              titulo="Devoluciones"
              valor={resumenQuery.data?.devueltos ?? '—'}
              detalle="Historial completado"
              icono={<CheckCircle2 className="size-5" />}
              acento="success"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="sketch-card overflow-hidden">
              <div className="flex items-center justify-between border-b-2 border-ink bg-soft px-4 py-3">
                <div>
                  <h2 className="text-2xl leading-none">Mis préstamos recientes</h2>
                  <p className="mt-1 text-xs text-muted">Últimos movimientos de tus solicitudes</p>
                </div>
                <Link to="/prestamos" className="text-xs font-bold underline decoration-dashed underline-offset-4">
                  Ver todos
                </Link>
              </div>
              {miosQuery.isLoading ? (
                <LoadingBlock />
              ) : miosQuery.data?.items.length ? (
                <div className="overflow-x-auto">
                  <table className="table-sketch">
                    <thead>
                      <tr>
                        <th>Equipo</th>
                        <th>Desde</th>
                        <th>Devolución</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {miosQuery.data.items.map((prestamo) => (
                        <tr key={prestamo.id}>
                          <td>
                            <p className="font-bold">{prestamo.equipo.codigoPatrimonial}</p>
                            <p className="max-w-[16rem] truncate text-xs text-muted">{prestamo.equipo.nombre}</p>
                          </td>
                          <td className="text-xs">{formatearFecha(prestamo.fechaPrestamo)}</td>
                          <td className="text-xs">{formatearFecha(prestamo.fechaDevolucionProgramada)}</td>
                          <td>
                            <EstadoPrestamoBadge estado={prestamo.estado} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icono={<ClipboardList className="size-8" />}
                  titulo="Todavía no tienes préstamos"
                  descripcion="Cuando solicites un equipo, aparecerá aquí con su estado."
                  accion={
                    <Link
                      to="/equipos?estado=Disponible"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500 active:scale-[0.98]"
                    >
                      <ClipboardPlus className="size-3.5" /> Solicitar préstamo
                    </Link>
                  }
                />
              )}
            </div>

            <div className="sketch-card overflow-hidden">
              <div className="flex items-center justify-between border-b-2 border-ink bg-soft px-4 py-3">
                <div>
                  <h2 className="text-2xl leading-none">Disponibles ahora</h2>
                  <p className="mt-1 text-xs text-muted">Elige un equipo para solicitar</p>
                </div>
                <Link to="/equipos?estado=Disponible" className="text-xs font-bold underline decoration-dashed underline-offset-4">
                  Inventario
                </Link>
              </div>
              {disponiblesQuery.isLoading ? (
                <LoadingBlock />
              ) : disponiblesQuery.data?.items.length ? (
                <div className="grid gap-2 p-3 sm:grid-cols-2">
                  {disponiblesQuery.data.items.map((equipo) => (
                    <Link
                      key={equipo.id}
                      to={`/equipos?solicitar=${equipo.id}`}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-paper p-2.5 shadow-2xs transition hover:border-primary/50 hover:shadow-xs"
                    >
                      <img
                        src={obtenerFotoEquipo(equipo.categoria, equipo.id)}
                        alt={equipo.nombre}
                        className="size-12 shrink-0 rounded-lg border border-border object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[0.65rem] font-bold text-ink bg-soft px-1.5 py-0.5 rounded border border-border">
                            {equipo.codigoPatrimonial}
                          </span>
                          <EstadoEquipoBadge estado={equipo.estado} />
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs font-bold text-ink">{equipo.nombre}</p>
                        <p className="truncate text-[0.68rem] text-muted">{equipo.marca}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icono={<Boxes className="size-8" />}
                  titulo="Sin equipos disponibles"
                  descripcion="En este momento todos los equipos están en uso o mantenimiento."
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
