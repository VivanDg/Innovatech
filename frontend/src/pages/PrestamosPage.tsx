import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CalendarDays,
  Check,
  ClipboardList,
  ClipboardPlus,
  Eye,
  FilterX,
  RefreshCw,
  Search,
  Undo2,
  X,
} from 'lucide-react'
import { api, obtenerMensajeError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  cn,
  diasDesdeHoy,
  fechaHoyISO,
  formatearFecha,
  formatearFechaHora,
} from '../lib/utils'
import { obtenerFotoEquipo } from '../lib/equipo-fotos'
import { PageHeader, Pagination } from '../components/ui/Layout'
import {
  Button,
  EmptyState,
  Input,
  LoadingBlock,
  Select,
  Textarea,
} from '../components/ui/Controls'
import { ConfirmDialog, Modal } from '../components/ui/Modal'
import { EstadoPrestamoBadge } from '../components/Badges'
import type {
  EstadoPrestamo,
  PagedResult,
  Prestamo,
} from '../types/api'

const OPCIONES_ESTADO: { valor: EstadoPrestamo; etiqueta: string }[] = [
  { valor: 'Pendiente', etiqueta: 'Pendiente' },
  { valor: 'Aprobado', etiqueta: 'Aprobado' },
  { valor: 'Rechazado', etiqueta: 'Rechazado' },
  { valor: 'Devuelto', etiqueta: 'Devuelto' },
]

const esquemaRechazo = z.object({
  motivo: z
    .string()
    .trim()
    .min(1, 'El motivo del rechazo es obligatorio.')
    .max(500, 'Máximo 500 caracteres.'),
})

const esquemaDevolucion = z.object({
  observacion: z
    .string()
    .trim()
    .min(1, 'Registra las observaciones de la devolución.')
    .max(500, 'Máximo 500 caracteres.'),
  fechaDevolucion: z.string().min(1, 'La fecha de devolución es obligatoria.'),
})

type FormularioRechazo = z.infer<typeof esquemaRechazo>
type FormularioDevolucion = z.infer<typeof esquemaDevolucion>

export function PrestamosPage() {
  const { tieneRol } = useAuth()
  const queryClient = useQueryClient()
  const [parametros] = useSearchParams()
  const navegar = useNavigate()
  const esGestor = tieneRol('Administrador', 'ResponsableTecnologia')
  const esColaborador = tieneRol('Colaborador')

  const [buscarInput, setBuscarInput] = useState('')
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState('')
  const [page, setPage] = useState(1)

  const [prestamoDetalle, setPrestamoDetalle] = useState<Prestamo | null>(null)
  const [prestamoAprobar, setPrestamoAprobar] = useState<Prestamo | null>(null)
  const [prestamoRechazar, setPrestamoRechazar] = useState<Prestamo | null>(null)
  const [prestamoDevolver, setPrestamoDevolver] = useState<Prestamo | null>(null)

  useEffect(() => {
    if (parametros.get('nuevo') === '1') {
      const eq = parametros.get('equipo')
      if (eq) {
        navegar(`/equipos?solicitar=${eq}`, { replace: true })
      } else {
        navegar('/equipos?estado=Disponible', { replace: true })
      }
    }
  }, [parametros, navegar])

  const filtros = {
    page,
    pageSize: 10,
    buscar: buscar || undefined,
    estado: estado || undefined,
  }

  const prestamosQuery = useQuery({
    queryKey: ['prestamos', esGestor ? 'todos' : 'mios', filtros],
    queryFn: async () => {
      const url = esGestor ? '/prestamos' : '/prestamos/mios'
      return (await api.get<PagedResult<Prestamo>>(url, { params: filtros })).data
    },
  })

  const invalidarDatos = () => {
    void queryClient.invalidateQueries({ queryKey: ['prestamos'] })
    void queryClient.invalidateQueries({ queryKey: ['equipos'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    void queryClient.invalidateQueries({ queryKey: ['reportes'] })
  }

  const aprobar = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/prestamos/${id}/aprobar`)
    },
    onSuccess: () => {
      toast.success('Préstamo aprobado. El equipo quedó marcado como prestado.')
      setPrestamoAprobar(null)
      invalidarDatos()
    },
    onError: (error) => toast.error(obtenerMensajeError(error)),
  })

  const rechazar = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      await api.patch(`/prestamos/${id}/rechazar`, { motivo })
    },
    onSuccess: () => {
      toast.success('Préstamo rechazado')
      setPrestamoRechazar(null)
      invalidarDatos()
    },
    onError: (error) => toast.error(obtenerMensajeError(error)),
  })

  const devolver = useMutation({
    mutationFn: async ({ id, datos }: { id: string; datos: FormularioDevolucion }) => {
      await api.patch(`/prestamos/${id}/devolver`, {
        observacion: datos.observacion,
        fechaDevolucion: datos.fechaDevolucion,
      })
    },
    onSuccess: () => {
      toast.success('Devolución registrada. El equipo volvió a estar disponible.')
      setPrestamoDevolver(null)
      invalidarDatos()
    },
    onError: (error) => toast.error(obtenerMensajeError(error)),
  })

  const limpiarFiltros = () => {
    setBuscarInput('')
    setBuscar('')
    setEstado('')
    setPage(1)
  }

  const datos = prestamosQuery.data
  const puedeAprobar = esGestor && tieneRol('ResponsableTecnologia')

  return (
    <div>
      <PageHeader
        titulo={esGestor ? 'Gestión de préstamos' : 'Mis préstamos'}
        descripcion={
          esGestor
            ? 'Aprueba solicitudes, registra devoluciones y consulta el historial completo.'
            : 'Consulta el estado de tus solicitudes y solicita nuevos equipos.'
        }
        acciones={
          esColaborador ? (
            <Link
              to="/equipos?estado=Disponible"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 active:scale-[0.98]"
            >
              <ClipboardPlus className="size-4" /> Solicitar préstamo
            </Link>
          ) : undefined
        }
      />

      <div className="sketch-card-flat mb-4 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(evento) => {
              evento.preventDefault()
              setBuscar(buscarInput.trim())
              setPage(1)
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                value={buscarInput}
                onChange={(evento) => setBuscarInput(evento.target.value)}
                placeholder="Buscar por equipo o solicitante…"
                className="sketch-input pl-9"
                aria-label="Buscar préstamos"
              />
            </div>
            <Button type="submit" variante="secondary">
              Buscar
            </Button>
          </form>

          <Select
            aria-label="Filtrar por estado"
            value={estado}
            onChange={(evento) => {
              setEstado(evento.target.value)
              setPage(1)
            }}
            opciones={OPCIONES_ESTADO}
            placeholder="Todos los estados"
            contenedorClassName="sm:w-48"
          />

          <Button variante="ghost" icono={<FilterX className="size-4" />} onClick={limpiarFiltros}>
            Limpiar
          </Button>
        </div>
      </div>

      <div className="sketch-card overflow-hidden">
        {prestamosQuery.isLoading ? (
          <LoadingBlock mensaje="Cargando préstamos…" />
        ) : prestamosQuery.isError ? (
          <EmptyState
            icono={<RefreshCw className="size-8" />}
            titulo="No se pudieron cargar los préstamos"
            descripcion="Verifica la conexión con la API e intenta nuevamente."
            accion={
              <Button variante="secondary" onClick={() => void prestamosQuery.refetch()}>
                Reintentar
              </Button>
            }
          />
        ) : !datos?.items.length ? (
          <EmptyState
            icono={<ClipboardList className="size-8" />}
            titulo={esGestor ? 'No hay préstamos registrados' : 'Todavía no tienes préstamos'}
            descripcion={
              esGestor
                ? 'Cuando los colaboradores soliciten equipos, aparecerán aquí.'
                : 'Solicita un equipo desde el inventario para comenzar.'
            }
            accion={
              esColaborador ? (
                <Link
                  to="/equipos?estado=Disponible"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500 active:scale-[0.98]"
                >
                  <ClipboardPlus className="size-4" /> Solicitar préstamo
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-sketch">
                <thead>
                  <tr>
                    <th>Equipo</th>
                    {esGestor && <th>Solicitante</th>}
                    <th>Préstamo</th>
                    <th>Devolución</th>
                    <th>Estado</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.items.map((prestamo) => {
                    const vencido =
                      prestamo.estado === 'Aprobado' &&
                      diasDesdeHoy(prestamo.fechaDevolucionProgramada) < 0
                    return (
                      <tr key={prestamo.id} className={cn(vencido && 'bg-rose-50/50 dark:bg-rose-950/20')}>
                        <td>
                          <div className="flex items-center gap-3">
                            <img
                              src={obtenerFotoEquipo(prestamo.equipo.categoria, prestamo.equipo.id)}
                              alt={prestamo.equipo.nombre}
                              className="size-10 shrink-0 rounded-lg border border-border object-cover shadow-2xs"
                              loading="lazy"
                            />
                            <div className="min-w-0">
                              <span className="font-mono text-xs font-bold text-ink bg-soft px-2 py-0.5 rounded border border-border">
                                {prestamo.equipo.codigoPatrimonial}
                              </span>
                              <p className="max-w-[15rem] truncate text-xs text-muted font-medium mt-0.5">
                                {prestamo.equipo.nombre}
                              </p>
                            </div>
                          </div>
                        </td>
                        {esGestor && (
                          <td>
                            <p className="text-xs font-bold text-ink">{prestamo.solicitante.nombreCompleto}</p>
                            <p className="text-[0.68rem] text-muted">{prestamo.solicitante.area}</p>
                          </td>
                        )}
                        <td className="whitespace-nowrap text-xs">{formatearFecha(prestamo.fechaPrestamo)}</td>
                        <td className="whitespace-nowrap">
                          <p className="text-xs font-medium text-ink">{formatearFecha(prestamo.fechaDevolucionProgramada)}</p>
                          {prestamo.fechaDevolucionReal && (
                            <p className="text-[0.68rem] font-semibold text-emerald-600 dark:text-emerald-400">
                              Real: {formatearFecha(prestamo.fechaDevolucionReal)}
                            </p>
                          )}
                          {vencido && <p className="text-[0.68rem] font-bold text-rose-600 dark:text-rose-400">Vencido</p>}
                        </td>
                        <td>
                          <EstadoPrestamoBadge estado={prestamo.estado} />
                        </td>
                        <td>
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPrestamoDetalle(prestamo)}
                              className="grid size-8 place-items-center rounded-lg border border-border bg-paper text-muted transition hover:border-primary hover:bg-soft hover:text-ink shadow-2xs"
                              title="Ver detalle"
                              aria-label="Ver detalle"
                            >
                              <Eye className="size-3.5" />
                            </button>
                            {esGestor && prestamo.estado === 'Pendiente' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setPrestamoAprobar(prestamo)}
                                  disabled={!puedeAprobar}
                                  className="grid size-8 place-items-center rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs disabled:cursor-not-allowed disabled:opacity-40"
                                  title="Aprobar"
                                  aria-label="Aprobar préstamo"
                                >
                                  <Check className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPrestamoRechazar(prestamo)}
                                  disabled={!puedeAprobar}
                                  className="grid size-8 place-items-center rounded-lg border border-rose-300 bg-rose-50 text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300 shadow-2xs disabled:cursor-not-allowed disabled:opacity-40"
                                  title="Rechazar"
                                  aria-label="Rechazar préstamo"
                                >
                                  <X className="size-3.5" />
                                </button>
                              </>
                            )}
                            {esGestor && prestamo.estado === 'Aprobado' && (
                              <button
                                type="button"
                                onClick={() => setPrestamoDevolver(prestamo)}
                                disabled={!puedeAprobar}
                                className="grid size-8 place-items-center rounded-lg border border-sky-300 bg-sky-50 text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs disabled:cursor-not-allowed disabled:opacity-40"
                                title="Registrar devolución"
                                aria-label="Registrar devolución"
                              >
                                <Undo2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={datos.page}
              totalPages={datos.totalPages}
              totalCount={datos.totalCount}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <PrestamoDetalleModal prestamo={prestamoDetalle} onClose={() => setPrestamoDetalle(null)} />

      <ConfirmDialog
        abierto={Boolean(prestamoAprobar)}
        titulo="Aprobar préstamo"
        textoConfirmar="Sí, aprobar"
        variante="success"
        cargando={aprobar.isPending}
        onClose={() => setPrestamoAprobar(null)}
        onConfirm={() => {
          if (prestamoAprobar) aprobar.mutate(prestamoAprobar.id)
        }}
        mensaje={
          <div className="space-y-2">
            <p>
              Se aprobará el préstamo de <strong>{prestamoAprobar?.equipo.nombre}</strong> a{' '}
              <strong>{prestamoAprobar?.solicitante.nombreCompleto}</strong>.
            </p>
            <p className="rounded-md border border-info/50 bg-info/10 px-2.5 py-1.5 text-xs text-info">
              El equipo se marcará automáticamente como <strong>Prestado</strong>.
            </p>
          </div>
        }
      />

      <RechazarModal
        prestamo={prestamoRechazar}
        cargando={rechazar.isPending}
        onClose={() => setPrestamoRechazar(null)}
        onRechazar={(motivo) => {
          if (prestamoRechazar) rechazar.mutate({ id: prestamoRechazar.id, motivo })
        }}
      />

      <DevolucionModal
        prestamo={prestamoDevolver}
        cargando={devolver.isPending}
        onClose={() => setPrestamoDevolver(null)}
        onDevolver={(datos) => {
          if (prestamoDevolver) devolver.mutate({ id: prestamoDevolver.id, datos })
        }}
      />
    </div>
  )
}

function RechazarModal({
  prestamo,
  cargando,
  onClose,
  onRechazar,
}: {
  prestamo: Prestamo | null
  cargando: boolean
  onClose: () => void
  onRechazar: (motivo: string) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormularioRechazo>({
    resolver: zodResolver(esquemaRechazo),
    defaultValues: { motivo: '' },
  })

  useEffect(() => {
    if (prestamo) reset({ motivo: '' })
  }, [prestamo, reset])

  return (
    <Modal
      abierto={Boolean(prestamo)}
      titulo="Rechazar préstamo"
      descripcion={prestamo ? `${prestamo.equipo.codigoPatrimonial} · ${prestamo.solicitante.nombreCompleto}` : undefined}
      onClose={onClose}
      footer={
        <>
          <Button variante="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="formulario-rechazo" variante="danger" cargando={cargando}>
            Rechazar solicitud
          </Button>
        </>
      }
    >
      <form id="formulario-rechazo" onSubmit={handleSubmit((datos) => onRechazar(datos.motivo))}>
        <Textarea
          label="Motivo del rechazo"
          placeholder="Explica al colaborador por qué no se puede atender la solicitud…"
          error={errors.motivo?.message}
          {...register('motivo')}
        />
      </form>
    </Modal>
  )
}

function DevolucionModal({
  prestamo,
  cargando,
  onClose,
  onDevolver,
}: {
  prestamo: Prestamo | null
  cargando: boolean
  onClose: () => void
  onDevolver: (datos: FormularioDevolucion) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormularioDevolucion>({
    resolver: zodResolver(esquemaDevolucion),
    defaultValues: { observacion: '', fechaDevolucion: fechaHoyISO() },
  })

  useEffect(() => {
    if (prestamo) {
      reset({ observacion: '', fechaDevolucion: fechaHoyISO() })
    }
  }, [prestamo, reset])

  return (
    <Modal
      abierto={Boolean(prestamo)}
      titulo="Registrar devolución"
      descripcion={prestamo ? `${prestamo.equipo.codigoPatrimonial} · ${prestamo.solicitante.nombreCompleto}` : undefined}
      onClose={onClose}
      footer={
        <>
          <Button variante="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="formulario-devolucion" variante="success" cargando={cargando}>
            Confirmar devolución
          </Button>
        </>
      }
    >
      <form id="formulario-devolucion" className="space-y-4" onSubmit={handleSubmit(onDevolver)}>
        <div className="rounded-lg border-2 border-dashed border-ink/25 bg-soft/70 px-3 py-2 text-xs text-muted">
          <CalendarDays className="mr-1 inline size-3.5" />
          Devolución programada: <strong className="text-ink">{formatearFecha(prestamo?.fechaDevolucionProgramada)}</strong>
        </div>
        <Input
          label="Fecha real de devolución"
          type="date"
          min={prestamo?.fechaPrestamo}
          max={fechaHoyISO()}
          error={errors.fechaDevolucion?.message}
          {...register('fechaDevolucion')}
        />
        <Textarea
          label="Observaciones de la devolución"
          placeholder="Estado del equipo, accesorios incluidos, incidencias…"
          error={errors.observacion?.message}
          {...register('observacion')}
        />
      </form>
    </Modal>
  )
}

function PrestamoDetalleModal({ prestamo, onClose }: { prestamo: Prestamo | null; onClose: () => void }) {
  return (
    <Modal
      abierto={Boolean(prestamo)}
      titulo="Detalle del préstamo"
      descripcion={prestamo ? `Préstamo registrado el ${formatearFecha(prestamo.fechaPrestamo)}` : undefined}
      onClose={onClose}
      footer={
        <Button variante="secondary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {prestamo && (
        <div className="space-y-4">
          {/* Ficha fotográfica del equipo prestado */}
          <div className="flex items-center gap-3.5 rounded-xl border border-border bg-soft/50 p-3">
            <img
              src={obtenerFotoEquipo(prestamo.equipo.categoria, prestamo.equipo.id)}
              alt={prestamo.equipo.nombre}
              className="size-16 shrink-0 rounded-lg border border-border object-cover shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <span className="font-mono text-xs font-bold text-ink bg-paper px-2 py-0.5 rounded border border-border">
                {prestamo.equipo.codigoPatrimonial}
              </span>
              <p className="mt-1 text-sm font-bold text-ink">{prestamo.equipo.nombre}</p>
              <p className="text-xs text-muted">{prestamo.equipo.categoria}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-muted mb-1">Estado</span>
              <EstadoPrestamoBadge estado={prestamo.estado} />
            </div>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold text-muted">Solicitante</dt>
              <dd>{prestamo.solicitante.nombreCompleto}</dd>
              <dd className="text-xs text-muted">{prestamo.solicitante.area}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted">Aprobador</dt>
              <dd>{prestamo.aprobador?.nombreCompleto ?? 'Pendiente de gestión'}</dd>
              {prestamo.fechaAprobacion && (
                <dd className="text-xs text-muted">{formatearFechaHora(prestamo.fechaAprobacion)}</dd>
              )}
            </div>
            <div>
              <dt className="text-xs font-bold text-muted">Fecha de préstamo</dt>
              <dd>{formatearFecha(prestamo.fechaPrestamo)}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted">Devolución programada</dt>
              <dd>{formatearFecha(prestamo.fechaDevolucionProgramada)}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted">Devolución real</dt>
              <dd>{formatearFecha(prestamo.fechaDevolucionReal)}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted">Registrado</dt>
              <dd>{formatearFechaHora(prestamo.creadoEn)}</dd>
            </div>
          </dl>

          <div>
            <p className="text-xs font-bold text-muted">Observación de la solicitud</p>
            <p className="mt-1 rounded-lg border border-ink/15 bg-soft/60 px-3 py-2 text-sm">
              {prestamo.observacion || 'Sin observaciones.'}
            </p>
          </div>

          {prestamo.observacionDevolucion && (
            <div>
              <p className="text-xs font-bold text-muted">Observación de devolución</p>
              <p className="mt-1 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm">
                {prestamo.observacionDevolucion}
              </p>
            </div>
          )}

          {prestamo.motivoRechazo && (
            <div>
              <p className="text-xs font-bold text-muted">Motivo del rechazo</p>
              <p className="mt-1 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm">
                {prestamo.motivoRechazo}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
