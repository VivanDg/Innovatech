import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Boxes,
  CalendarDays,
  ClipboardPlus,
  FilterX,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
} from 'lucide-react'
import { api, obtenerMensajeError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  CATEGORIA_LABEL,
  fechaHoyISO,
  formatearFecha,
  sumarDiasISO,
} from '../lib/utils'
import {
  guardarFotoPersonalizada,
  obtenerFotoEquipo,
  obtenerFotoPersonalizada,
} from '../lib/equipo-fotos'
import { PageHeader, Pagination } from '../components/ui/Layout'
import {
  Button,
  EmptyState,
  Input,
  LoadingBlock,
  Select,
  Textarea,
} from '../components/ui/Controls'
import { Modal } from '../components/ui/Modal'
import { EstadoEquipoBadge } from '../components/Badges'
import type {
  CategoriaEquipo,
  Equipo,
  EstadoEquipo,
  PagedResult,
} from '../types/api'

const OPCIONES_ESTADO: { valor: EstadoEquipo; etiqueta: string }[] = [
  { valor: 'Disponible', etiqueta: 'Disponible' },
  { valor: 'Prestado', etiqueta: 'Prestado' },
  { valor: 'Mantenimiento', etiqueta: 'Mantenimiento' },
  { valor: 'Baja', etiqueta: 'Baja' },
]

const OPCIONES_CATEGORIA = (Object.keys(CATEGORIA_LABEL) as CategoriaEquipo[]).map((categoria) => ({
  valor: categoria,
  etiqueta: CATEGORIA_LABEL[categoria],
}))

const esquemaEquipo = z.object({
  codigoPatrimonial: z
    .string()
    .trim()
    .min(1, 'El código patrimonial es obligatorio.')
    .max(50, 'Máximo 50 caracteres.'),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'Máximo 100 caracteres.'),
  categoria: z.string().min(1, 'Selecciona una categoría.'),
  marca: z.string().trim().min(1, 'La marca es obligatoria.').max(50, 'Máximo 50 caracteres.'),
  modelo: z.string().trim().max(50, 'Máximo 50 caracteres.').optional(),
  numeroSerie: z.string().trim().max(50, 'Máximo 50 caracteres.').optional(),
  imagenUrl: z.string().trim().optional(),
})

type FormularioEquipo = z.infer<typeof esquemaEquipo>

const esquemaSolicitud = z.object({
  fechaDevolucionProgramada: z.string().min(1, 'La fecha de devolución es obligatoria.'),
  observacion: z.string().trim().max(500, 'Máximo 500 caracteres.').optional(),
})

type FormularioSolicitud = z.infer<typeof esquemaSolicitud>

export function EquiposPage() {
  const { tieneRol } = useAuth()
  const queryClient = useQueryClient()
  const [parametros, setParametros] = useSearchParams()
  const puedeGestionar = tieneRol('Administrador', 'ResponsableTecnologia')
  const puedeSolicitar = tieneRol('Colaborador')

  const [buscarInput, setBuscarInput] = useState('')
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState(parametros.get('estado') ?? '')
  const [categoria, setCategoria] = useState('')
  const [page, setPage] = useState(1)

  const [equipoFormulario, setEquipoFormulario] = useState<Equipo | null | undefined>(undefined)
  const [equipoEstado, setEquipoEstado] = useState<Equipo | null>(null)
  const [equipoSolicitud, setEquipoSolicitud] = useState<Equipo | null>(null)

  const filtros = {
    page,
    pageSize: 10,
    buscar: buscar || undefined,
    estado: estado || undefined,
    categoria: categoria || undefined,
  }

  const equiposQuery = useQuery({
    queryKey: ['equipos', filtros],
    queryFn: async () => (await api.get<PagedResult<Equipo>>('/equipos', { params: filtros })).data,
  })

  // Permite abrir directamente el modal de solicitar préstamo si se pasa ?solicitar=ID
  useEffect(() => {
    const solicitarId = parametros.get('solicitar')
    if (!solicitarId || !puedeSolicitar) return

    const existente = equiposQuery.data?.items.find((item) => item.id === solicitarId)
    if (existente) {
      if (existente.estado === 'Disponible') {
        setEquipoSolicitud(existente)
      } else {
        toast.error('El equipo seleccionado no se encuentra disponible para préstamo.')
        const siguiente = new URLSearchParams(parametros)
        siguiente.delete('solicitar')
        setParametros(siguiente, { replace: true })
      }
      return
    }

    if (equiposQuery.isLoading) return

    api
      .get<Equipo>(`/equipos/${solicitarId}`)
      .then((resp) => {
        if (resp.data.estado === 'Disponible') {
          setEquipoSolicitud(resp.data)
        } else {
          toast.error('El equipo seleccionado no se encuentra disponible para préstamo.')
        }
      })
      .catch(() => {
        toast.error('No se pudo encontrar el equipo seleccionado.')
      })
      .finally(() => {
        const siguiente = new URLSearchParams(parametros)
        siguiente.delete('solicitar')
        setParametros(siguiente, { replace: true })
      })
  }, [parametros, equiposQuery.data?.items, equiposQuery.isLoading, puedeSolicitar, setParametros])

  const guardarEquipo = useMutation({
    mutationFn: async ({ id, datos }: { id?: string; datos: FormularioEquipo }) => {
      const payload = {
        ...datos,
        categoria: datos.categoria as CategoriaEquipo,
        modelo: datos.modelo?.trim() || null,
        numeroSerie: datos.numeroSerie?.trim() || null,
      }
      if (id) {
        await api.put(`/equipos/${id}`, payload)
        if (datos.imagenUrl !== undefined) {
          guardarFotoPersonalizada(id, datos.imagenUrl)
          guardarFotoPersonalizada(datos.codigoPatrimonial, datos.imagenUrl)
        }
      } else {
        const resp = await api.post<Equipo>('/equipos', payload)
        if (datos.imagenUrl) {
          if (resp.data?.id) guardarFotoPersonalizada(resp.data.id, datos.imagenUrl)
          guardarFotoPersonalizada(datos.codigoPatrimonial, datos.imagenUrl)
        }
      }
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.id ? 'Equipo actualizado' : 'Equipo registrado')
      void queryClient.invalidateQueries({ queryKey: ['equipos'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['reportes'] })
      setEquipoFormulario(undefined)
    },
    onError: (error) => toast.error(obtenerMensajeError(error)),
  })

  const cambiarEstado = useMutation({
    mutationFn: async ({ id, nuevoEstado }: { id: string; nuevoEstado: EstadoEquipo }) => {
      await api.patch(`/equipos/${id}/estado`, { estado: nuevoEstado })
    },
    onSuccess: () => {
      toast.success('Estado del equipo actualizado')
      void queryClient.invalidateQueries({ queryKey: ['equipos'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['reportes'] })
      setEquipoEstado(null)
    },
    onError: (error) => toast.error(obtenerMensajeError(error)),
  })

  const cerrarSolicitud = () => {
    setEquipoSolicitud(null)
    if (parametros.get('solicitar')) {
      const siguiente = new URLSearchParams(parametros)
      siguiente.delete('solicitar')
      setParametros(siguiente, { replace: true })
    }
  }

  const solicitarPrestamo = useMutation({
    mutationFn: async ({ equipoId, datos }: { equipoId: string; datos: FormularioSolicitud }) => {
      await api.post('/prestamos', {
        equipoId,
        fechaDevolucionProgramada: datos.fechaDevolucionProgramada,
        observacion: datos.observacion?.trim() || null,
      })
    },
    onSuccess: () => {
      toast.success('Solicitud de préstamo registrada')
      void queryClient.invalidateQueries({ queryKey: ['equipos'] })
      void queryClient.invalidateQueries({ queryKey: ['prestamos'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      cerrarSolicitud()
    },
    onError: (error) => toast.error(obtenerMensajeError(error)),
  })

  const limpiarFiltros = () => {
    setBuscarInput('')
    setBuscar('')
    setEstado('')
    setCategoria('')
    setPage(1)
  }

  const datos = equiposQuery.data

  return (
    <div>
      <PageHeader
        titulo="Inventario de equipos"
        descripcion={
          puedeGestionar
            ? 'Registra equipos, controla su estado y mantén el inventario al día.'
            : 'Consulta la disponibilidad de los equipos antes de solicitar un préstamo.'
        }
        acciones={
          puedeGestionar ? (
            <Button icono={<Plus className="size-4" />} onClick={() => setEquipoFormulario(null)}>
              Nuevo equipo
            </Button>
          ) : undefined
        }
      />

      <div className="sketch-card-flat mb-4 p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
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
                placeholder="Buscar por código, nombre o marca…"
                className="sketch-input pl-9"
                aria-label="Buscar equipos"
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
            opciones={OPCIONES_ESTADO.map((opcion) => ({ valor: opcion.valor, etiqueta: opcion.etiqueta }))}
            placeholder="Todos los estados"
            contenedorClassName="lg:w-48"
          />

          <Select
            aria-label="Filtrar por categoría"
            value={categoria}
            onChange={(evento) => {
              setCategoria(evento.target.value)
              setPage(1)
            }}
            opciones={OPCIONES_CATEGORIA}
            placeholder="Todas las categorías"
            contenedorClassName="lg:w-56"
          />

          <Button variante="ghost" icono={<FilterX className="size-4" />} onClick={limpiarFiltros}>
            Limpiar
          </Button>
        </div>
      </div>

      <div className="sketch-card overflow-hidden">
        {equiposQuery.isLoading ? (
          <LoadingBlock mensaje="Cargando inventario…" />
        ) : equiposQuery.isError ? (
          <EmptyState
            icono={<RefreshCw className="size-8" />}
            titulo="No se pudo cargar el inventario"
            descripcion="Verifica la conexión con la API e intenta nuevamente."
            accion={
              <Button variante="secondary" onClick={() => void equiposQuery.refetch()}>
                Reintentar
              </Button>
            }
          />
        ) : !datos?.items.length ? (
          <EmptyState
            icono={<Boxes className="size-8" />}
            titulo="No hay equipos que coincidan"
            descripcion="Prueba con otros filtros o registra un equipo nuevo."
            accion={
              puedeGestionar ? (
                <Button icono={<Plus className="size-4" />} onClick={() => setEquipoFormulario(null)}>
                  Registrar equipo
                </Button>
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
                    <th>Código</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                    <th>Registrado</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.items.map((equipo) => (
                    <tr key={equipo.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <img
                            src={obtenerFotoEquipo(equipo.categoria, equipo.id)}
                            alt={equipo.nombre}
                            className="size-11 shrink-0 rounded-lg border border-border object-cover shadow-xs transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-ink leading-tight">{equipo.nombre}</p>
                            <p className="text-xs text-muted truncate">
                              {equipo.marca}
                              {equipo.modelo ? ` · ${equipo.modelo}` : ''}
                              {equipo.numeroSerie ? ` · S/N ${equipo.numeroSerie}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-ink bg-soft px-2 py-0.5 rounded border border-border">
                          {equipo.codigoPatrimonial}
                        </span>
                      </td>
                      <td className="text-xs font-medium">{CATEGORIA_LABEL[equipo.categoria]}</td>
                      <td>
                        <EstadoEquipoBadge estado={equipo.estado} />
                      </td>
                      <td className="whitespace-nowrap text-xs text-muted">{formatearFecha(equipo.creadoEn)}</td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          {puedeSolicitar && equipo.estado === 'Disponible' && (
                            <button
                              type="button"
                              onClick={() => setEquipoSolicitud(equipo)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-[0.98]"
                            >
                              <ClipboardPlus className="size-3.5 text-white" />
                              <span>Solicitar</span>
                            </button>
                          )}
                          {puedeGestionar && (
                            <>
                              <button
                                type="button"
                                onClick={() => setEquipoFormulario(equipo)}
                                className="grid size-8 place-items-center rounded-lg border border-border bg-paper text-muted transition hover:border-primary hover:bg-soft hover:text-ink shadow-2xs"
                                title="Editar equipo"
                                aria-label={`Editar ${equipo.codigoPatrimonial}`}
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEquipoEstado(equipo)}
                                className="grid size-8 place-items-center rounded-lg border border-border bg-paper text-muted transition hover:border-primary hover:bg-soft hover:text-ink shadow-2xs"
                                title="Cambiar estado"
                                aria-label={`Cambiar estado de ${equipo.codigoPatrimonial}`}
                              >
                                <Settings2 className="size-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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

      <EquipoFormModal
        abierto={equipoFormulario !== undefined}
        equipo={equipoFormulario ?? null}
        guardando={guardarEquipo.isPending}
        onClose={() => setEquipoFormulario(undefined)}
        onGuardar={(datosFormulario) =>
          guardarEquipo.mutate({ id: equipoFormulario?.id, datos: datosFormulario })
        }
      />

      <CambiarEstadoModal
        equipo={equipoEstado}
        guardando={cambiarEstado.isPending}
        onClose={() => setEquipoEstado(null)}
        onConfirmar={(nuevoEstado) => {
          if (equipoEstado) {
            cambiarEstado.mutate({ id: equipoEstado.id, nuevoEstado })
          }
        }}
      />

      <SolicitarEquipoModal
        equipo={equipoSolicitud}
        enviando={solicitarPrestamo.isPending}
        onClose={cerrarSolicitud}
        onSolicitar={(datosFormulario) => {
          if (equipoSolicitud) {
            solicitarPrestamo.mutate({ equipoId: equipoSolicitud.id, datos: datosFormulario })
          }
        }}
      />
    </div>
  )
}

function EquipoFormModal({
  abierto,
  equipo,
  guardando,
  onClose,
  onGuardar,
}: {
  abierto: boolean
  equipo: Equipo | null
  guardando: boolean
  onClose: () => void
  onGuardar: (datos: FormularioEquipo) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormularioEquipo>({
    resolver: zodResolver(esquemaEquipo),
    defaultValues: {
      codigoPatrimonial: '',
      nombre: '',
      categoria: '',
      marca: '',
      modelo: '',
      numeroSerie: '',
      imagenUrl: '',
    },
  })

  const categoriaActual = watch('categoria') as CategoriaEquipo | undefined
  const imagenActual = watch('imagenUrl')

  useEffect(() => {
    if (!abierto) return
    const fotoGuardada = equipo ? (obtenerFotoPersonalizada(equipo.id) ?? obtenerFotoPersonalizada(equipo.codigoPatrimonial) ?? '') : ''
    reset({
      codigoPatrimonial: equipo?.codigoPatrimonial ?? '',
      nombre: equipo?.nombre ?? '',
      categoria: equipo?.categoria ?? '',
      marca: equipo?.marca ?? '',
      modelo: equipo?.modelo ?? '',
      numeroSerie: equipo?.numeroSerie ?? '',
      imagenUrl: fotoGuardada,
    })
  }, [abierto, equipo, reset])

  return (
    <Modal
      abierto={abierto}
      titulo={equipo ? 'Editar equipo' : 'Nuevo equipo'}
      descripcion={
        equipo ? 'Actualiza los datos y la fotografía del equipo seleccionado.' : 'Registra un equipo con su fotografía en el inventario.'
      }
      onClose={onClose}
      footer={
        <>
          <Button variante="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="formulario-equipo" cargando={guardando}>
            {equipo ? 'Guardar cambios' : 'Registrar equipo'}
          </Button>
        </>
      }
    >
      <form id="formulario-equipo" className="space-y-4" onSubmit={handleSubmit(onGuardar)}>
        {/* Previsualización de la Imagen */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-soft/40 p-3">
          <img
            src={imagenActual?.trim() || (categoriaActual ? obtenerFotoEquipo(categoriaActual) : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80')}
            alt="Vista previa del equipo"
            className="size-16 shrink-0 rounded-lg border border-border object-cover shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink">Fotografía del Activo</p>
            <p className="text-[0.68rem] text-muted truncate">
              {imagenActual?.trim() ? 'URL personalizada asignada' : categoriaActual ? 'Foto automática según categoría' : 'Ingresa una URL o usa el catálogo'}
            </p>
            {categoriaActual && (
              <button
                type="button"
                onClick={() => setValue('imagenUrl', obtenerFotoEquipo(categoriaActual))}
                className="mt-1 text-[0.65rem] font-semibold text-primary hover:underline"
              >
                Cargar foto sugerida de {CATEGORIA_LABEL[categoriaActual]}
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Código patrimonial"
            placeholder="TA-LAP-003"
            error={errors.codigoPatrimonial?.message}
            {...register('codigoPatrimonial')}
          />
          <Input
            label="Nombre del equipo"
            placeholder="Laptop HP EliteBook 840"
            error={errors.nombre?.message}
            {...register('nombre')}
          />
          <Select
            label="Categoría"
            placeholder="Selecciona una categoría"
            opciones={OPCIONES_CATEGORIA}
            error={errors.categoria?.message}
            {...register('categoria')}
          />
          <Input label="Marca" placeholder="HP" error={errors.marca?.message} {...register('marca')} />
          <Input label="Modelo (opcional)" placeholder="EliteBook 840 G10" error={errors.modelo?.message} {...register('modelo')} />
          <Input
            label="Número de serie (opcional)"
            placeholder="SN-XXXX"
            error={errors.numeroSerie?.message}
            {...register('numeroSerie')}
          />
        </div>

        <Input
          label="URL de la Fotografía del Equipo"
          placeholder="https://images.unsplash.com/... o pega el enlace de la imagen"
          ayuda="Puedes ingresar el enlace de una foto en alta resolución para identificar este activo."
          error={errors.imagenUrl?.message}
          {...register('imagenUrl')}
        />
      </form>
    </Modal>
  )
}

function CambiarEstadoModal({
  equipo,
  guardando,
  onClose,
  onConfirmar,
}: {
  equipo: Equipo | null
  guardando: boolean
  onClose: () => void
  onConfirmar: (estado: EstadoEquipo) => void
}) {
  const [nuevoEstado, setNuevoEstado] = useState<EstadoEquipo>('Disponible')

  useEffect(() => {
    if (equipo) {
      setNuevoEstado(equipo.estado === 'Baja' ? 'Baja' : 'Disponible')
    }
  }, [equipo])

  return (
    <Modal
      abierto={Boolean(equipo)}
      titulo="Cambiar estado del equipo"
      descripcion={equipo ? `${equipo.codigoPatrimonial} · ${equipo.nombre}` : undefined}
      onClose={onClose}
      ancho="sm"
      footer={
        <>
          <Button variante="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button cargando={guardando} onClick={() => onConfirmar(nuevoEstado)} disabled={nuevoEstado === equipo?.estado}>
            Actualizar estado
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-lg border-2 border-dashed border-ink/25 bg-soft/70 px-3 py-2">
          <span className="text-xs font-bold text-muted">Estado actual</span>
          {equipo && <EstadoEquipoBadge estado={equipo.estado} />}
        </div>
        <Select
          label="Nuevo estado"
          value={nuevoEstado}
          onChange={(evento) => setNuevoEstado(evento.target.value as EstadoEquipo)}
          opciones={OPCIONES_ESTADO.filter((opcion) => opcion.valor !== 'Prestado')}
        />
        <p className="text-xs text-muted">
          El estado <strong>Prestado</strong> solo se asigna automáticamente al aprobar un préstamo.
        </p>
      </div>
    </Modal>
  )
}

function SolicitarEquipoModal({
  equipo,
  enviando,
  onClose,
  onSolicitar,
}: {
  equipo: Equipo | null
  enviando: boolean
  onClose: () => void
  onSolicitar: (datos: FormularioSolicitud) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormularioSolicitud>({
    resolver: zodResolver(esquemaSolicitud),
    defaultValues: {
      fechaDevolucionProgramada: sumarDiasISO(7),
      observacion: '',
    },
  })

  useEffect(() => {
    if (equipo) {
      reset({ fechaDevolucionProgramada: sumarDiasISO(7), observacion: '' })
    }
  }, [equipo, reset])

  return (
    <Modal
      abierto={Boolean(equipo)}
      titulo="Solicitar préstamo"
      descripcion={equipo ? `${equipo.codigoPatrimonial} · ${equipo.nombre}` : undefined}
      onClose={onClose}
      footer={
        <>
          <Button variante="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="formulario-solicitud" cargando={enviando}>
            Enviar solicitud
          </Button>
        </>
      }
    >
      {equipo && (
        <div className="mb-4 flex items-center gap-3.5 rounded-xl border border-border bg-soft/50 p-3">
          <img
            src={obtenerFotoEquipo(equipo.categoria, equipo.id)}
            alt={equipo.nombre}
            className="size-16 rounded-lg border border-border object-cover shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-ink bg-paper px-2 py-0.5 rounded border border-border">
                {equipo.codigoPatrimonial}
              </span>
              <span className="text-[0.7rem] font-semibold text-muted">
                {CATEGORIA_LABEL[equipo.categoria]}
              </span>
            </div>
            <p className="mt-1 text-sm font-bold text-ink truncate">{equipo.nombre}</p>
            <p className="text-xs text-muted">
              {equipo.marca}
              {equipo.modelo ? ` · ${equipo.modelo}` : ''}
              {equipo.numeroSerie ? ` · S/N: ${equipo.numeroSerie}` : ''}
            </p>
          </div>
        </div>
      )}
      <form id="formulario-solicitud" className="space-y-4" onSubmit={handleSubmit(onSolicitar)}>
        <div className="rounded-lg border-2 border-dashed border-ink/25 bg-soft/70 px-3 py-2 text-xs text-muted">
          <CalendarDays className="mr-1 inline size-3.5" />
          Fecha de préstamo: <strong className="text-ink">{formatearFecha(fechaHoyISO())}</strong>. La
          devolución debe ser posterior a hoy.
        </div>
        <Input
          label="Fecha de devolución programada"
          type="date"
          min={sumarDiasISO(1)}
          error={errors.fechaDevolucionProgramada?.message}
          {...register('fechaDevolucionProgramada')}
        />
        <Textarea
          label="Motivo del préstamo (opcional)"
          placeholder="Describe para qué necesitas el equipo…"
          error={errors.observacion?.message}
          {...register('observacion')}
        />
      </form>
    </Modal>
  )
}
