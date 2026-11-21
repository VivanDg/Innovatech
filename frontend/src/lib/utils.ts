import { clsx, type ClassValue } from 'clsx'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'
import type { CategoriaEquipo, Rol, TipoMovimiento } from '../types/api'

export function cn(...entradas: ClassValue[]): string {
  return twMerge(clsx(entradas))
}

export const CATEGORIA_LABEL: Record<CategoriaEquipo, string> = {
  Laptop: 'Laptop',
  ComputadoraEscritorio: 'Computadora de escritorio',
  Monitor: 'Monitor',
  Impresora: 'Impresora',
  Tablet: 'Tablet',
  ProyectorMultimedia: 'Proyector multimedia',
  EquipoRed: 'Equipo de red',
}

export const ROL_LABEL: Record<Rol, string> = {
  Administrador: 'Administrador',
  ResponsableTecnologia: 'Responsable de TI',
  Colaborador: 'Colaborador',
}

export const TIPO_MOVIMIENTO_LABEL: Record<TipoMovimiento, string> = {
  Alta: 'Alta',
  Actualizacion: 'Actualización',
  CambioEstado: 'Cambio de estado',
  Prestamo: 'Préstamo',
  Devolucion: 'Devolución',
  Baja: 'Baja',
}

export function parsearFecha(valor: string): Date {
  return parseISO(valor)
}

export function formatearFecha(valor?: string | null): string {
  if (!valor) return '—'
  try {
    return format(parsearFecha(valor), 'dd MMM yyyy', { locale: es })
  } catch {
    return valor
  }
}

export function formatearFechaHora(valor?: string | null): string {
  if (!valor) return '—'
  try {
    return format(parsearFecha(valor), 'dd MMM yyyy · HH:mm', { locale: es })
  } catch {
    return valor
  }
}

export function fechaHoyISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function sumarDiasISO(dias: number): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return format(fecha, 'yyyy-MM-dd')
}

export function diasDesdeHoy(valor: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const objetivo = parsearFecha(valor)
  objetivo.setHours(0, 0, 0, 0)
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86_400_000)
}

export function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}
