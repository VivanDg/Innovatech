import axios from 'axios'
import type { ApiError, ApiErrorResponse } from '../types/api'
import { limpiarSesion, obtenerSesion } from './auth-storage'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5169/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const sesion = obtenerSesion()
  if (sesion?.token) {
    config.headers.Authorization = `Bearer ${sesion.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const esLogin = error.config?.url?.includes('/auth/login')
      if (!esLogin) {
        limpiarSesion()
        if (window.location.pathname !== '/login') {
          window.location.assign('/login?expirada=1')
        }
      }
    }
    return Promise.reject(error)
  },
)

export function obtenerErroresApi(error: unknown): ApiError[] {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (error.response?.data?.errores?.length) {
      return error.response.data.errores
    }
    if (!error.response) {
      return [{ codigo: 'CONEXION', mensaje: 'No se pudo conectar con el servidor. Verifica que la API esté en ejecución.' }]
    }
  }

  return [{ codigo: 'ERROR', mensaje: 'Ocurrió un error inesperado. Intenta nuevamente.' }]
}

export function obtenerMensajeError(error: unknown): string {
  return obtenerErroresApi(error)[0]?.mensaje ?? 'Ocurrió un error inesperado.'
}
