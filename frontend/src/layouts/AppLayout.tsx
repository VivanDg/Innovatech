import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../lib/theme'
import { cn, iniciales, ROL_LABEL } from '../lib/utils'
import { Logo } from '../components/Logo'

interface ItemNav {
  ruta: string
  etiqueta: string
  icono: typeof LayoutDashboard
  roles?: string[]
}

const ITEMS_NAV: ItemNav[] = [
  { ruta: '/', etiqueta: 'Dashboard', icono: LayoutDashboard },
  { ruta: '/equipos', etiqueta: 'Inventario Equipos', icono: Boxes },
  { ruta: '/prestamos', etiqueta: 'Control de Préstamos', icono: ClipboardList },
  { ruta: '/usuarios', etiqueta: 'Gestión de Usuarios', icono: Users, roles: ['Administrador'] },
  {
    ruta: '/reportes',
    etiqueta: 'Reportes y Métricas',
    icono: BarChart3,
    roles: ['Administrador', 'ResponsableTecnologia'],
  },
]

const TITULOS: Record<string, string> = {
  '/': 'Dashboard Principal',
  '/equipos': 'Inventario de Equipos Tecnológicos',
  '/prestamos': 'Control y Registro de Préstamos',
  '/usuarios': 'Administración de Usuarios y Permisos',
  '/reportes': 'Reportes Ejecutivos e Indicadores',
}

export function AppLayout({ children }: { children?: ReactNode } = {}) {
  const { usuario, cerrarSesion } = useAuth()
  const { oscuro, alternar } = useTheme()
  const ubicacion = useLocation()
  const navegar = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    setMenuAbierto(false)
  }, [ubicacion.pathname])

  if (!usuario) return null

  const itemsVisibles = ITEMS_NAV.filter((item) => !item.roles || item.roles.includes(usuario.rol))
  const titulo = TITULOS[ubicacion.pathname] ?? 'TechAsset'

  const salir = () => {
    cerrarSesion()
    navegar('/login', { replace: true })
  }

  const navegacion = (
    <>
      <div className="px-3 pb-6 pt-2">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2">
        <p className="px-3 pb-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted">
          Menú Corporativo
        </p>
        {itemsVisibles.map((item) => (
          <NavLink
            key={item.ruta}
            to={item.ruta}
            end={item.ruta === '/'}
            className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}
          >
            <item.icono className="size-4.5 shrink-0" />
            <span>{item.etiqueta}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-t border-border px-3 pt-4">
        <button
          type="button"
          onClick={salir}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-paper py-2.5 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-rose-950/40"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-paper px-3 py-5 lg:flex">
        {navegacion}
      </aside>

      {menuAbierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMenuAbierto(false)}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-[17rem] max-w-[85vw] flex-col border-r border-border bg-paper px-3 py-5 shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-4 rounded-lg p-1.5 text-muted hover:bg-soft hover:text-ink"
              onClick={() => setMenuAbierto(false)}
              aria-label="Cerrar menú"
            >
              <X className="size-5" />
            </button>
            {navegacion}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-paper/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              className="rounded-lg border border-border p-1.5 text-muted hover:bg-soft hover:text-ink lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">
                Área de {usuario.area}
              </span>
              <p className="text-sm font-bold text-ink leading-tight">{titulo}</p>
            </div>
            <div className="sm:hidden">
              <Logo compacto />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={alternar}
              className="grid size-9 place-items-center rounded-lg border border-border text-muted transition hover:bg-soft hover:text-ink"
              aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={oscuro ? 'Modo claro' : 'Modo oscuro'}
            >
              {oscuro ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <div className="hidden h-5 w-px bg-border sm:block" />
            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                {iniciales(usuario.nombreCompleto)}
              </span>
              <div className="leading-tight">
                <p className="max-w-[12rem] truncate text-xs font-bold text-ink">{usuario.nombreCompleto}</p>
                <p className="text-[0.65rem] text-muted">{ROL_LABEL[usuario.rol]}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[88rem] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children ?? <Outlet />}
        </main>

        <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted">
          TechAsset Enterprise · Sistema de Gestión de Activos y Préstamos · Innovatech Solutions S.A.C.
        </footer>
      </div>
    </div>
  )
}
