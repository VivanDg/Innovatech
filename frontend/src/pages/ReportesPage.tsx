import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CalendarRange,
  ClipboardList,
  Clock,
  FilterX,
  Laptop,
  Printer,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import { api } from '../lib/api'
import { formatearFechaHora, TIPO_MOVIMIENTO_LABEL } from '../lib/utils'
import { PageHeader, Pagination, StatCard } from '../components/ui/Layout'
import { Button, EmptyState, LoadingBlock, Select } from '../components/ui/Controls'
import { MovimientoBadge } from '../components/Badges'
import { AreasChart, EstadoEquiposChart, TopEquiposChart } from '../components/charts/Charts'
import type {
  Dashboard,
  EquipoMasUtilizado,
  EquipoPorEstado,
  Movimiento,
  PagedResult,
  PrestamoPorArea,
  TipoMovimiento,
} from '../types/api'

const OPCIONES_TIPO: { valor: TipoMovimiento; etiqueta: string }[] = (
  Object.keys(TIPO_MOVIMIENTO_LABEL) as TipoMovimiento[]
).map((tipo) => ({ valor: tipo, etiqueta: TIPO_MOVIMIENTO_LABEL[tipo] }))

const OPCIONES_TOP = [
  { valor: '3', etiqueta: 'Top 3' },
  { valor: '5', etiqueta: 'Top 5' },
  { valor: '10', etiqueta: 'Top 10' },
]

export function ReportesPage() {
  const [desdeInput, setDesdeInput] = useState('')
  const [hastaInput, setHastaInput] = useState('')
  const [rango, setRango] = useState({ desde: '', hasta: '' })
  const [top, setTop] = useState('5')
  const [tipo, setTipo] = useState('')
  const [page, setPage] = useState(1)

  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<Dashboard>('/reportes/dashboard')).data,
  })

  const estadosQuery = useQuery({
    queryKey: ['reportes', 'equipos-por-estado'],
    queryFn: async () => (await api.get<EquipoPorEstado[]>('/reportes/equipos-por-estado')).data,
  })

  const topQuery = useQuery({
    queryKey: ['reportes', 'equipos-mas-utilizados', top, rango],
    queryFn: async () =>
      (
        await api.get<EquipoMasUtilizado[]>('/reportes/equipos-mas-utilizados', {
          params: {
            top: Number(top),
            desde: rango.desde || undefined,
            hasta: rango.hasta || undefined,
          },
        })
      ).data,
  })

  const areasQuery = useQuery({
    queryKey: ['reportes', 'prestamos-por-area', rango],
    queryFn: async () =>
      (
        await api.get<PrestamoPorArea[]>('/reportes/prestamos-por-area', {
          params: {
            desde: rango.desde || undefined,
            hasta: rango.hasta || undefined,
          },
        })
      ).data,
  })

  const movimientosQuery = useQuery({
    queryKey: ['reportes', 'movimientos', rango, tipo, page],
    queryFn: async () =>
      (
        await api.get<PagedResult<Movimiento>>('/reportes/movimientos', {
          params: {
            page,
            pageSize: 8,
            desde: rango.desde || undefined,
            hasta: rango.hasta || undefined,
            tipo: tipo || undefined,
          },
        })
      ).data,
  })

  const aplicarFiltros = () => {
    setRango({ desde: desdeInput, hasta: hastaInput })
    setPage(1)
  }

  const limpiarFiltros = () => {
    setDesdeInput('')
    setHastaInput('')
    setRango({ desde: '', hasta: '' })
    setTipo('')
    setPage(1)
  }

  const dashboard = dashboardQuery.data

  return (
    <div>
      <PageHeader
        titulo="Reportes e indicadores"
        descripcion="Analiza el uso del inventario, la demanda por área y la trazabilidad de los movimientos."
        acciones={
          <Button
            variante="secondary"
            icono={<RefreshCw className="size-4" />}
            onClick={() => {
              void dashboardQuery.refetch()
              void estadosQuery.refetch()
              void topQuery.refetch()
              void areasQuery.refetch()
              void movimientosQuery.refetch()
            }}
          >
            Actualizar
          </Button>
        }
      />

      <div className="sketch-card-flat mb-4 p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <label className="flex-1 text-xs font-bold text-muted">
              Desde
              <input
                type="date"
                value={desdeInput}
                max={hastaInput || undefined}
                onChange={(evento) => setDesdeInput(evento.target.value)}
                className="sketch-input mt-1"
              />
            </label>
            <label className="flex-1 text-xs font-bold text-muted">
              Hasta
              <input
                type="date"
                value={hastaInput}
                min={desdeInput || undefined}
                onChange={(evento) => setHastaInput(evento.target.value)}
                className="sketch-input mt-1"
              />
            </label>
            <Select
              label="Ranking"
              value={top}
              onChange={(evento) => setTop(evento.target.value)}
              opciones={OPCIONES_TOP}
              contenedorClassName="sm:w-32"
            />
          </div>

          <Button icono={<CalendarRange className="size-4" />} onClick={aplicarFiltros}>
            Aplicar
          </Button>
          <Button variante="ghost" icono={<FilterX className="size-4" />} onClick={limpiarFiltros}>
            Limpiar
          </Button>
        </div>
        <p className="mt-2 text-[0.68rem] text-muted">
          {rango.desde || rango.hasta
            ? `Rango aplicado: ${rango.desde || 'inicio'} → ${rango.hasta || 'hoy'}.`
            : 'Sin rango de fechas: se considera todo el historial.'}
        </p>
      </div>

      {dashboardQuery.isLoading ? (
        <div className="sketch-card mb-4">
          <LoadingBlock mensaje="Calculando indicadores…" />
        </div>
      ) : dashboard ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Total equipos"
            valor={dashboard.totalEquipos}
            detalle={`${dashboard.equiposDisponibles} disponibles`}
            icono={<Boxes className="size-5" />}
            acento="neutral"
          />
          <StatCard
            titulo="Préstamos activos"
            valor={dashboard.prestamosActivos}
            detalle={`${dashboard.prestamosPendientes} pendientes`}
            icono={<Laptop className="size-5" />}
            acento="info"
          />
          <StatCard
            titulo="Préstamos totales"
            valor={dashboard.totalPrestamos}
            detalle="Histórico registrado"
            icono={<ClipboardList className="size-5" />}
            acento="warning"
          />
          <StatCard
            titulo="Área con mayor uso"
            valor={dashboard.areaMayorUso?.cantidad ?? 0}
            detalle={dashboard.areaMayorUso?.area ?? 'Aún sin datos'}
            icono={<TrendingUp className="size-5" />}
            acento="success"
          />
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-2 rounded-lg border-2 border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertTriangle className="size-4" /> No se pudieron cargar los indicadores.
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="sketch-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-2xl leading-none">Inventario por estado</h2>
              <p className="mt-1 text-xs text-muted">Distribución actual</p>
            </div>
            <Boxes className="size-5 text-muted" />
          </div>
          {estadosQuery.isLoading ? (
            <LoadingBlock />
          ) : estadosQuery.data?.length ? (
            <EstadoEquiposChart datos={estadosQuery.data} />
          ) : (
            <EmptyState titulo="Sin equipos registrados" />
          )}
        </div>

        <div className="sketch-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-2xl leading-none">Equipos más usados</h2>
              <p className="mt-1 text-xs text-muted">{rango.desde || rango.hasta ? 'En el rango elegido' : 'Histórico completo'}</p>
            </div>
            <BarChart3 className="size-5 text-muted" />
          </div>
          {topQuery.isLoading ? (
            <LoadingBlock />
          ) : topQuery.data?.length ? (
            <TopEquiposChart datos={topQuery.data} />
          ) : (
            <EmptyState titulo="Sin préstamos en el rango" />
          )}
        </div>

        <div className="sketch-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-2xl leading-none">Demanda por área</h2>
              <p className="mt-1 text-xs text-muted">Solicitudes no rechazadas</p>
            </div>
            <Clock className="size-5 text-muted" />
          </div>
          {areasQuery.isLoading ? (
            <LoadingBlock />
          ) : areasQuery.data?.length ? (
            <AreasChart datos={areasQuery.data} />
          ) : (
            <EmptyState titulo="Sin datos en el rango" />
          )}
        </div>
      </div>

      <div className="sketch-card mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-soft px-4 py-3">
          <div>
            <h2 className="text-2xl leading-none">Bitácora de movimientos</h2>
            <p className="mt-1 text-xs text-muted">Trazabilidad de altas, préstamos, devoluciones y bajas.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              aria-label="Filtrar movimientos por tipo"
              value={tipo}
              onChange={(evento) => {
                setTipo(evento.target.value)
                setPage(1)
              }}
              opciones={OPCIONES_TIPO}
              placeholder="Todos los tipos"
              contenedorClassName="w-48"
            />
            <button
              type="button"
              onClick={() => window.print()}
              className="grid size-9 place-items-center rounded-md border-2 border-ink bg-paper transition hover:bg-soft"
              title="Imprimir reporte"
              aria-label="Imprimir reporte"
            >
              <Printer className="size-4" />
            </button>
          </div>
        </div>

        {movimientosQuery.isLoading ? (
          <LoadingBlock mensaje="Cargando movimientos…" />
        ) : movimientosQuery.isError ? (
          <EmptyState
            icono={<RefreshCw className="size-8" />}
            titulo="No se pudo cargar la bitácora"
            descripcion="Verifica la conexión con la API."
            accion={
              <Button variante="secondary" onClick={() => void movimientosQuery.refetch()}>
                Reintentar
              </Button>
            }
          />
        ) : !movimientosQuery.data?.items.length ? (
          <EmptyState
            icono={<ClipboardList className="size-8" />}
            titulo="No hay movimientos"
            descripcion="Prueba con otro rango de fechas o tipo de movimiento."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-sketch">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Equipo</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosQuery.data.items.map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td className="whitespace-nowrap text-xs">{formatearFechaHora(movimiento.fecha)}</td>
                      <td>
                        <span className="font-mono text-xs font-bold text-ink bg-soft px-2 py-0.5 rounded border border-border">
                          {movimiento.codigoPatrimonial}
                        </span>
                        <p className="max-w-[16rem] truncate text-[0.68rem] text-muted">{movimiento.equipoNombre}</p>
                      </td>
                      <td>
                        <MovimientoBadge tipo={movimiento.tipo} />
                      </td>
                      <td className="max-w-md text-xs">{movimiento.descripcion}</td>
                      <td className="text-xs">{movimiento.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={movimientosQuery.data.page}
              totalPages={movimientosQuery.data.totalPages}
              totalCount={movimientosQuery.data.totalCount}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
