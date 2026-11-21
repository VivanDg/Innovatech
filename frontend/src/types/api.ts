export type Rol = 'Administrador' | 'ResponsableTecnologia' | 'Colaborador'

export type EstadoEquipo = 'Disponible' | 'Prestado' | 'Mantenimiento' | 'Baja'

export type CategoriaEquipo =
  | 'Laptop'
  | 'ComputadoraEscritorio'
  | 'Monitor'
  | 'Impresora'
  | 'Tablet'
  | 'ProyectorMultimedia'
  | 'EquipoRed'

export type EstadoPrestamo = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Devuelto'

export type TipoMovimiento =
  | 'Alta'
  | 'Actualizacion'
  | 'CambioEstado'
  | 'Prestamo'
  | 'Devolucion'
  | 'Baja'

export interface UsuarioSesion {
  id: string
  nombreCompleto: string
  correo: string
  area: string
  rol: Rol
}

export interface LoginResponse {
  token: string
  expiraEn: string
  usuario: UsuarioSesion
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  tieneAnterior: boolean
  tieneSiguiente: boolean
}

export interface ApiError {
  codigo: string
  mensaje: string
}

export interface ApiErrorResponse {
  errores: ApiError[]
}

export interface Usuario {
  id: string
  nombres: string
  apellidos: string
  nombreCompleto: string
  correo: string
  area: string
  estado: boolean
  rol: Rol
  creadoEn: string
}

export interface Equipo {
  id: string
  codigoPatrimonial: string
  nombre: string
  categoria: CategoriaEquipo
  marca: string
  modelo: string | null
  numeroSerie: string | null
  estado: EstadoEquipo
  creadoEn: string
}

export interface EquipoResumen {
  id: string
  codigoPatrimonial: string
  nombre: string
  categoria: CategoriaEquipo
}

export interface UsuarioResumen {
  id: string
  nombreCompleto: string
  correo: string
  area: string
}

export interface Prestamo {
  id: string
  equipo: EquipoResumen
  solicitante: UsuarioResumen
  aprobador: UsuarioResumen | null
  fechaPrestamo: string
  fechaDevolucionProgramada: string
  fechaDevolucionReal: string | null
  estado: EstadoPrestamo
  observacion: string
  observacionDevolucion: string | null
  motivoRechazo: string | null
  fechaAprobacion: string | null
  creadoEn: string
}

export interface Movimiento {
  id: string
  equipoId: string
  codigoPatrimonial: string
  equipoNombre: string
  tipo: TipoMovimiento
  descripcion: string
  usuario: string
  fecha: string
}

export interface AreaMayorUso {
  area: string
  cantidad: number
}

export interface Dashboard {
  totalEquipos: number
  equiposDisponibles: number
  equiposPrestados: number
  equiposMantenimiento: number
  totalPrestamos: number
  prestamosActivos: number
  prestamosPendientes: number
  areaMayorUso: AreaMayorUso | null
}

export interface EquipoPorEstado {
  estado: EstadoEquipo
  cantidad: number
}

export interface EquipoMasUtilizado {
  equipoId: string
  codigoPatrimonial: string
  nombre: string
  categoria: CategoriaEquipo
  totalPrestamos: number
}

export interface PrestamoPorArea {
  area: string
  totalPrestamos: number
}
