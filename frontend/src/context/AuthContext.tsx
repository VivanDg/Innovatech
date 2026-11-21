import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, Navigate } from 'react-router-dom'
import { api } from '../lib/api'
import { guardarSesion, limpiarSesion, obtenerSesion } from '../lib/auth-storage'
import type { LoginResponse, Rol, UsuarioSesion } from '../types/api'

interface AuthContextValue {
  sesion: LoginResponse | null
  usuario: UsuarioSesion | null
  autenticado: boolean
  iniciarSesion: (correo: string, password: string) => Promise<LoginResponse>
  cerrarSesion: () => void
  tieneRol: (...roles: Rol[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<LoginResponse | null>(() => obtenerSesion())
  const queryClient = useQueryClient()

  const iniciarSesion = useCallback(
    async (correo: string, password: string) => {
      const { data } = await api.post<LoginResponse>('/auth/login', { correo, password })
      guardarSesion(data)
      queryClient.clear()
      setSesion(data)
      return data
    },
    [queryClient],
  )

  const cerrarSesion = useCallback(() => {
    limpiarSesion()
    queryClient.clear()
    setSesion(null)
  }, [queryClient])

  const tieneRol = useCallback(
    (...roles: Rol[]) => Boolean(sesion && roles.includes(sesion.usuario.rol)),
    [sesion],
  )

  const valor = useMemo<AuthContextValue>(
    () => ({
      sesion,
      usuario: sesion?.usuario ?? null,
      autenticado: Boolean(sesion),
      iniciarSesion,
      cerrarSesion,
      tieneRol,
    }),
    [sesion, iniciarSesion, cerrarSesion, tieneRol],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.')
  }
  return contexto
}

export function RutaProtegida({ children }: { children: ReactNode }) {
  const { autenticado } = useAuth()
  const ubicacion = useLocation()

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  }

  return children
}

export function RutaPorRol({ roles, children }: { roles: Rol[]; children: ReactNode }) {
  const { tieneRol } = useAuth()

  if (!tieneRol(...roles)) {
    return <Navigate to="/" replace />
  }

  return children
}
