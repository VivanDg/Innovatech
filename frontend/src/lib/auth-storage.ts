import type { LoginResponse } from '../types/api'

const CLAVE_SESION = 'techasset.sesion'

export function obtenerSesion(): LoginResponse | null {
  try {
    const crudo = localStorage.getItem(CLAVE_SESION)
    if (!crudo) return null

    const sesion = JSON.parse(crudo) as LoginResponse
    if (!sesion.token || !sesion.usuario || !sesion.expiraEn) {
      localStorage.removeItem(CLAVE_SESION)
      return null
    }

    if (Number.isNaN(Date.parse(sesion.expiraEn)) || Date.parse(sesion.expiraEn) <= Date.now()) {
      localStorage.removeItem(CLAVE_SESION)
      return null
    }

    return sesion
  } catch {
    localStorage.removeItem(CLAVE_SESION)
    return null
  }
}

export function guardarSesion(sesion: LoginResponse): void {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
}

export function limpiarSesion(): void {
  localStorage.removeItem(CLAVE_SESION)
}
