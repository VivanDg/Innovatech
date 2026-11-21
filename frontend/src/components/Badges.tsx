import { Badge } from './ui/Controls'
import { TIPO_MOVIMIENTO_LABEL } from '../lib/utils'
import type { EstadoEquipo, EstadoPrestamo, Rol, TipoMovimiento } from '../types/api'

const TONO_EQUIPO: Record<EstadoEquipo, 'success' | 'info' | 'warning' | 'neutral'> = {
  Disponible: 'success',
  Prestado: 'info',
  Mantenimiento: 'warning',
  Baja: 'neutral',
}

const TONO_PRESTAMO: Record<EstadoPrestamo, 'warning' | 'info' | 'danger' | 'success'> = {
  Pendiente: 'warning',
  Aprobado: 'info',
  Rechazado: 'danger',
  Devuelto: 'success',
}

const TONO_MOVIMIENTO: Record<TipoMovimiento, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  Alta: 'success',
  Actualizacion: 'info',
  CambioEstado: 'warning',
  Prestamo: 'info',
  Devolucion: 'success',
  Baja: 'danger',
}

export function EstadoEquipoBadge({ estado }: { estado: EstadoEquipo }) {
  return <Badge tono={TONO_EQUIPO[estado]}>{estado}</Badge>
}

export function EstadoPrestamoBadge({ estado }: { estado: EstadoPrestamo }) {
  return <Badge tono={TONO_PRESTAMO[estado]}>{estado}</Badge>
}

export function MovimientoBadge({ tipo }: { tipo: TipoMovimiento }) {
  return <Badge tono={TONO_MOVIMIENTO[tipo]}>{TIPO_MOVIMIENTO_LABEL[tipo]}</Badge>
}

export function RolBadge({ rol }: { rol: Rol }) {
  const etiqueta = rol === 'ResponsableTecnologia' ? 'Responsable TI' : rol
  const tono = rol === 'Administrador' ? 'danger' : rol === 'ResponsableTecnologia' ? 'info' : 'neutral'
  return <Badge tono={tono}>{etiqueta}</Badge>
}
