import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  FilterX,
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'
import { api, obtenerMensajeError } from '../lib/api'
import { formatearFecha } from '../lib/utils'
import { PageHeader, Pagination } from '../components/ui/Layout'
import {
  Button,
  EmptyState,
  Input,
  LoadingBlock,
  Select,
} from '../components/ui/Controls'
import { ConfirmDialog, Modal } from '../components/ui/Modal'
import { RolBadge } from '../components/Badges'
import type { PagedResult, Rol, Usuario } from '../types/api'

const OPCIONES_ROL: { valor: Rol; etiqueta: string }[] = [
  { valor: 'Administrador', etiqueta: 'Administrador' },
  { valor: 'ResponsableTecnologia', etiqueta: 'Responsable de TI' },
  { valor: 'Colaborador', etiqueta: 'Colaborador' },
]

const OPCIONES_ESTADO = [
  { valor: 'true', etiqueta: 'Activos' },
  { valor: 'false', etiqueta: 'Inactivos' },
]

const esquemaUsuario = z.object({
  nombres: z.string().trim().min(1, 'Los nombres son obligatorios.').max(100, 'Máximo 100 caracteres.'),
  apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios.').max(100, 'Máximo 100 caracteres.'),
  correo: z.string().trim().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
  area: z.string().trim().min(1, 'El área es obligatoria.').max(100, 'Máximo 100 caracteres.'),
  rol: z.string().min(1, 'Selecciona un rol.'),
  password: z.string().optional(),
})

type FormularioUsuario = z.infer<typeof esquemaUsuario>

const esquemaPassword = z.object({
  nuevaPassword: z
    .string()
    .min(8, 'Debe tener al menos 8 caracteres.')
    .max(72, 'Máximo 72 caracteres.')
    .regex(/[A-Za-z]/, 'Debe incluir al menos una letra.')
    .regex(/[0-9]/, 'Debe incluir al menos un número.'),
})

type FormularioPassword = z.infer<typeof esquemaPassword>

export function UsuariosPage() {
  const queryClient = useQueryClient()
  const [buscarInput, setBuscarInput] = useState('')
  const [buscar, setBuscar] = useState('')
  const [rol, setRol] = useState('')
  const [estado, setEstado] = useState('')
  const [page, setPage] = useState(1)

  const [usuarioFormulario, setUsuarioFormulario] = useState<Usuario | null | undefined>(undefined)
  const [usuarioEstado, setUsuarioEstado] = useState<Usuario | null>(null)
  const [usuarioPassword, setUsuarioPassword] = useState<Usuario | null>(null)

  const filtros = {
    page,
    pageSize: 10,
    buscar: buscar || undefined,
    rol: rol || undefined,
    estado: estado || undefined,
  }

  const usuariosQuery = useQuery({
    queryKey: ['usuarios', filtros],
    queryFn: async () => (await api.get<PagedResult<Usuario>>('/usuarios', { params: filtros })).data,
  })

  const guardarUsuario = useMutation({
    mutationFn: async ({ id, datos }: { id?: string; datos: FormularioUsuario }) => {
      const base = {
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        correo: datos.correo,
        area: datos.area,
        rol: datos.rol as Rol,
      }

      if (id) {
        await api.put(`/usuarios/${id}`, base)
        return
      }

      await api.post('/usuarios', { ...base, password: datos.password })
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.id ? 'Usuario actualizado' : 'Usuario registrado')
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      setUsuarioFormulario(undefined)
    },
    onError: (error) => toast.error(obtenerMensajeError(error)),
  })

  const cambiarEstado = useMutation({
    mutationFn: async ({ id, nuevoEstado }: { id: string; nuevoEstado: boolean }) => {
      await api.patch(`/usuarios/${id}/estado`, { estado: nuevoEstado })
    },
    onSuccess: () => {
      toast.success('Estado del usuario actualizado')
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      setUsuarioEstado(null)
    },
    onError: (error) => toast.error(obtenerMensajeError(error)),
  })

  const cambiarPassword = useMutation({
    mutationFn: async ({ id, nuevaPassword }: { id: string; nuevaPassword: string }) => {
      await api.patch(`/usuarios/${id}/password`, { nuevaPassword })
    },
    onSuccess: () => {
      toast.success('Contraseña restablecida correctamente')
      setUsuarioPassword(null)
    },
    onError: (error) => toast.error(obtenerMensajeError(error)),
  })

  const limpiarFiltros = () => {
    setBuscarInput('')
    setBuscar('')
    setRol('')
    setEstado('')
    setPage(1)
  }

  const datos = usuariosQuery.data

  return (
    <div>
      <PageHeader
        titulo="Usuarios"
        descripcion="Administra las cuentas de Innovatech, sus roles y su acceso al sistema."
        acciones={
          <Button icono={<Plus className="size-4" />} onClick={() => setUsuarioFormulario(null)}>
            Nuevo usuario
          </Button>
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
                placeholder="Buscar por nombre, correo o área…"
                className="sketch-input pl-9"
                aria-label="Buscar usuarios"
              />
            </div>
            <Button type="submit" variante="secondary">
              Buscar
            </Button>
          </form>

          <Select
            aria-label="Filtrar por rol"
            value={rol}
            onChange={(evento) => {
              setRol(evento.target.value)
              setPage(1)
            }}
            opciones={OPCIONES_ROL}
            placeholder="Todos los roles"
            contenedorClassName="lg:w-52"
          />

          <Select
            aria-label="Filtrar por estado"
            value={estado}
            onChange={(evento) => {
              setEstado(evento.target.value)
              setPage(1)
            }}
            opciones={OPCIONES_ESTADO}
            placeholder="Todos los estados"
            contenedorClassName="lg:w-44"
          />

          <Button variante="ghost" icono={<FilterX className="size-4" />} onClick={limpiarFiltros}>
            Limpiar
          </Button>
        </div>
      </div>

      <div className="sketch-card overflow-hidden">
        {usuariosQuery.isLoading ? (
          <LoadingBlock mensaje="Cargando usuarios…" />
        ) : usuariosQuery.isError ? (
          <EmptyState
            icono={<RefreshCw className="size-8" />}
            titulo="No se pudieron cargar los usuarios"
            descripcion="Verifica la conexión con la API e intenta nuevamente."
            accion={
              <Button variante="secondary" onClick={() => void usuariosQuery.refetch()}>
                Reintentar
              </Button>
            }
          />
        ) : !datos?.items.length ? (
          <EmptyState
            icono={<Users className="size-8" />}
            titulo="No hay usuarios que coincidan"
            descripcion="Prueba con otros filtros o registra una cuenta nueva."
            accion={
              <Button icono={<Plus className="size-4" />} onClick={() => setUsuarioFormulario(null)}>
                Registrar usuario
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-sketch">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Área</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Alta</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.items.map((usuario) => (
                    <tr key={usuario.id} className={!usuario.estado ? 'opacity-60' : undefined}>
                      <td>
                        <p className="font-bold">{usuario.nombreCompleto}</p>
                        <p className="text-[0.68rem] text-muted">{usuario.nombres} {usuario.apellidos}</p>
                      </td>
                      <td className="text-xs">{usuario.correo}</td>
                      <td className="text-xs">{usuario.area}</td>
                      <td>
                        <RolBadge rol={usuario.rol} />
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                            usuario.estado
                              ? 'border-success/60 bg-success/10 text-success'
                              : 'border-ink/30 bg-soft text-muted'
                          }`}
                        >
                          {usuario.estado ? <UserCheck className="size-3" /> : <UserX className="size-3" />}
                          {usuario.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap text-xs text-muted">{formatearFecha(usuario.creadoEn)}</td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setUsuarioPassword(usuario)}
                            className="grid size-7 place-items-center rounded-md border-2 border-ink/40 bg-paper transition hover:border-ink hover:bg-soft"
                            title="Restablecer contraseña"
                            aria-label={`Restablecer contraseña de ${usuario.nombreCompleto}`}
                          >
                            <KeyRound className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setUsuarioFormulario(usuario)}
                            className="grid size-7 place-items-center rounded-md border-2 border-ink/40 bg-paper transition hover:border-ink hover:bg-soft"
                            title="Editar usuario"
                            aria-label={`Editar a ${usuario.nombreCompleto}`}
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setUsuarioEstado(usuario)}
                            className={`grid size-7 place-items-center rounded-md border-2 transition ${
                              usuario.estado
                                ? 'border-danger/50 bg-danger/10 text-danger hover:border-danger'
                                : 'border-success/50 bg-success/10 text-success hover:border-success'
                            }`}
                            title={usuario.estado ? 'Deshabilitar cuenta' : 'Habilitar cuenta'}
                            aria-label={usuario.estado ? 'Deshabilitar cuenta' : 'Habilitar cuenta'}
                          >
                            {usuario.estado ? <UserX className="size-3.5" /> : <UserCheck className="size-3.5" />}
                          </button>
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

      <UsuarioFormModal
        abierto={usuarioFormulario !== undefined}
        usuario={usuarioFormulario ?? null}
        guardando={guardarUsuario.isPending}
        onClose={() => setUsuarioFormulario(undefined)}
        onGuardar={(datosFormulario) =>
          guardarUsuario.mutate({ id: usuarioFormulario?.id, datos: datosFormulario })
        }
      />

      <ConfirmDialog
        abierto={Boolean(usuarioEstado)}
        titulo={usuarioEstado?.estado ? 'Deshabilitar cuenta' : 'Habilitar cuenta'}
        textoConfirmar={usuarioEstado?.estado ? 'Sí, deshabilitar' : 'Sí, habilitar'}
        variante={usuarioEstado?.estado ? 'danger' : 'success'}
        cargando={cambiarEstado.isPending}
        onClose={() => setUsuarioEstado(null)}
        onConfirm={() => {
          if (usuarioEstado) {
            cambiarEstado.mutate({ id: usuarioEstado.id, nuevoEstado: !usuarioEstado.estado })
          }
        }}
        mensaje={
          <div className="space-y-2">
            <p>
              {usuarioEstado?.estado ? 'Se deshabilitará' : 'Se habilitará'} la cuenta de{' '}
              <strong>{usuarioEstado?.nombreCompleto}</strong>.
            </p>
            <p className="text-xs text-muted">
              {usuarioEstado?.estado
                ? 'El usuario no podrá iniciar sesión hasta que vuelvas a habilitarlo.'
                : 'El usuario podrá iniciar sesión nuevamente con sus credenciales.'}
            </p>
          </div>
        }
      />

      <CambiarPasswordModal
        abierto={Boolean(usuarioPassword)}
        usuario={usuarioPassword}
        guardando={cambiarPassword.isPending}
        onClose={() => setUsuarioPassword(null)}
        onGuardar={(datos) => {
          if (usuarioPassword) {
            cambiarPassword.mutate({ id: usuarioPassword.id, nuevaPassword: datos.nuevaPassword })
          }
        }}
      />
    </div>
  )
}

function UsuarioFormModal({
  abierto,
  usuario,
  guardando,
  onClose,
  onGuardar,
}: {
  abierto: boolean
  usuario: Usuario | null
  guardando: boolean
  onClose: () => void
  onGuardar: (datos: FormularioUsuario) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormularioUsuario>({
    resolver: zodResolver(esquemaUsuario),
    defaultValues: {
      nombres: '',
      apellidos: '',
      correo: '',
      area: '',
      rol: 'Colaborador',
      password: '',
    },
  })

  useEffect(() => {
    if (!abierto) return
    reset({
      nombres: usuario?.nombres ?? '',
      apellidos: usuario?.apellidos ?? '',
      correo: usuario?.correo ?? '',
      area: usuario?.area ?? '',
      rol: usuario?.rol ?? 'Colaborador',
      password: '',
    })
  }, [abierto, usuario, reset])

  return (
    <Modal
      abierto={abierto}
      titulo={usuario ? 'Editar usuario' : 'Nuevo usuario'}
      descripcion={
        usuario ? 'Actualiza los datos y el rol de la cuenta.' : 'Crea una cuenta con acceso al sistema.'
      }
      onClose={onClose}
      footer={
        <>
          <Button variante="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="formulario-usuario" cargando={guardando}>
            {usuario ? 'Guardar cambios' : 'Registrar usuario'}
          </Button>
        </>
      }
    >
      <form id="formulario-usuario" className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onGuardar)}>
        <Input
          label="Nombres"
          placeholder="María Fernanda"
          error={errors.nombres?.message}
          {...register('nombres')}
        />
        <Input
          label="Apellidos"
          placeholder="Quispe Rojas"
          error={errors.apellidos?.message}
          {...register('apellidos')}
        />
        <Input
          label="Correo institucional"
          type="email"
          placeholder="nombre@innovatech.pe"
          error={errors.correo?.message}
          {...register('correo')}
        />
        <Input
          label="Área"
          placeholder="Ventas"
          error={errors.area?.message}
          {...register('area')}
        />
        <Select
          label="Rol"
          opciones={OPCIONES_ROL.map((opcion) => ({ valor: opcion.valor, etiqueta: opcion.etiqueta }))}
          error={errors.rol?.message}
          {...register('rol')}
        />
        {!usuario && (
          <Input
            label="Contraseña temporal"
            type="password"
            placeholder="Mínimo 8 caracteres, letras y números"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password', {
              validate: (valor) => {
                if (!usuario) {
                  if (!valor) return 'La contraseña es obligatoria.'
                  if (valor.length < 8) return 'Debe tener al menos 8 caracteres.'
                  if (!/[A-Za-z]/.test(valor)) return 'Debe incluir al menos una letra.'
                  if (!/[0-9]/.test(valor)) return 'Debe incluir al menos un número.'
                }
                return true
              },
            })}
          />
        )}
      </form>
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-dashed border-ink/25 bg-soft/60 px-3 py-2 text-xs text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        <span>
          Solo el administrador gestiona cuentas. Los roles definen las acciones disponibles dentro de
          TechAsset.
        </span>
      </div>
    </Modal>
  )
}

function CambiarPasswordModal({
  abierto,
  usuario,
  guardando,
  onClose,
  onGuardar,
}: {
  abierto: boolean
  usuario: Usuario | null
  guardando: boolean
  onClose: () => void
  onGuardar: (datos: FormularioPassword) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormularioPassword>({
    resolver: zodResolver(esquemaPassword),
    defaultValues: {
      nuevaPassword: '',
    },
  })

  useEffect(() => {
    if (abierto) {
      reset({ nuevaPassword: '' })
    }
  }, [abierto, reset])

  return (
    <Modal
      abierto={abierto}
      titulo="Restablecer contraseña"
      descripcion={`Asigna una nueva clave de acceso para ${usuario?.nombreCompleto ?? 'el usuario'}.`}
      onClose={onClose}
      footer={
        <>
          <Button variante="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="formulario-password" cargando={guardando}>
            Actualizar contraseña
          </Button>
        </>
      }
    >
      <form id="formulario-password" className="space-y-4" onSubmit={handleSubmit(onGuardar)}>
        <Input
          label="Nueva contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres, al menos 1 letra y 1 número"
          autoComplete="new-password"
          error={errors.nuevaPassword?.message}
          {...register('nuevaPassword')}
        />
        <div className="flex items-start gap-2 rounded-lg border border-dashed border-ink/25 bg-soft/60 px-3 py-2 text-xs text-muted">
          <KeyRound className="mt-0.5 size-4 shrink-0 text-accent" />
          <span>
            La contraseña debe cumplir con los estándares de seguridad: al menos 8 caracteres, incluir
            letras y números.
          </span>
        </div>
      </form>
    </Modal>
  )
}
