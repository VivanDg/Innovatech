import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  History,
  Layers,
  Lock,
  Moon,
  ShieldAlert,
  Sparkles,
  Sun,
  Users2,
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { useTheme } from '../lib/theme'
import { FOTOS_CATEGORIA } from '../lib/equipo-fotos'

const MODULOS = [
  {
    icono: Boxes,
    titulo: 'Inventario Patrimonial',
    descripcion:
      'Catálogo unificado de laptops, estaciones, monitores, proyectores y equipos de red con código patrimonial único y ficha técnica.',
    caracteristicas: ['Código patrimonial único', 'Estados: Disponible, Prestado, Mantenimiento y Baja', 'Búsqueda por marca y serie'],
    color: 'from-blue-600 to-indigo-600',
  },
  {
    icono: ClipboardCheck,
    titulo: 'Control de Préstamos y Devoluciones',
    descripcion:
      'Flujo de aprobación ágil para colaboradores y responsables de tecnología con fechas programadas y registro mandatorio de observaciones.',
    caracteristicas: ['Solicitud autónoma del colaborador', 'Aprobación / rechazo formal con motivo', 'Inspección física en la devolución'],
    color: 'from-emerald-600 to-teal-600',
  },
  {
    icono: BarChart3,
    titulo: 'Dashboard y Reportería Ejecutiva',
    descripcion:
      'Toma de decisiones respaldada por datos: indicadores de disponibilidad, análisis de demanda por área funcional y equipos más usados.',
    caracteristicas: ['KPIs en tiempo real', 'Gráficos de barras y dona', 'Exportación e impresión de reportes'],
    color: 'from-violet-600 to-purple-600',
  },
  {
    icono: History,
    titulo: 'Auditoría y Bitácora Inmutable',
    descripcion:
      'Trazabilidad integral que registra cada alta, modificación, préstamo y devolución con sello de tiempo UTC y responsable.',
    caracteristicas: ['Historial cronológico de movimientos', 'Identificación de usuario ejecutor', 'Cumplimiento normativo y seguridad'],
    color: 'from-amber-600 to-orange-600',
  },
]

const CATEGORIAS_SHOWCASE = [
  { nombre: 'Laptops Corporativas', cant: 'Lenovo ThinkPad, MacBook Pro, Dell Latitude', foto: FOTOS_CATEGORIA.Laptop },
  { nombre: 'Computadoras de Escritorio', cant: 'Dell OptiPlex, HP EliteDesk i7/i9', foto: FOTOS_CATEGORIA.ComputadoraEscritorio },
  { nombre: 'Monitores de Alta Resolución', cant: 'Dell UltraSharp 27", LG UltraFine 4K', foto: FOTOS_CATEGORIA.Monitor },
  { nombre: 'Tablets y Móviles', cant: 'Apple iPad Air, Samsung Galaxy Tab S9', foto: FOTOS_CATEGORIA.Tablet },
  { nombre: 'Infraestructura de Red', cant: 'Cisco Catalyst Switches, Routers Wi-Fi 6', foto: FOTOS_CATEGORIA.EquipoRed },
  { nombre: 'Proyectores Multimedia', cant: 'Epson PowerLite 3LCD, BenQ Láser', foto: FOTOS_CATEGORIA.ProyectorMultimedia },
]

export function LandingPage() {
  const { oscuro, alternar } = useTheme()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-x-hidden bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white"
    >
      {/* IMAGEN DE FONDO PRINCIPAL VIBRANTE Y NÍTIDA */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 dark:opacity-75 transition-opacity duration-500 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2200&q=85')`,
        }}
      />

      {/* Overlay sutil para garantizar legibilidad del texto sin apagar la imagen */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-100/60 via-slate-100/80 to-slate-100/95 transition-colors duration-300 dark:from-slate-950/65 dark:via-slate-950/80 dark:to-slate-950/95" />

      {/* Trama de cuadrícula tecnológica con mezcla suave */}
      <div
        className="fixed inset-0 z-0 opacity-20 dark:opacity-25"
        style={{
          backgroundImage: oscuro
            ? `linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px)`
            : `linear-gradient(rgba(15, 23, 42, 0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.10) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Foco de luz interactivo que sigue el cursor del mouse */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: oscuro
            ? `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.22), transparent 75%)`
            : `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.15), transparent 75%)`,
        }}
      />

      {/* Navbar Superior con acabado Glassmorphism de alta definición */}
      <header className="sticky top-0 z-40 border-b border-slate-300/70 bg-white/85 backdrop-blur-lg shadow-xs transition-colors duration-300 dark:border-white/15 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={alternar}
              className="grid size-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-xs transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15 dark:hover:text-white"
              aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={oscuro ? 'Modo claro' : 'Modo oscuro'}
            >
              {oscuro ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-700" />}
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-500 active:scale-[0.98]"
            >
              <span>Acceder al Sistema</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/15 px-4 py-1.5 text-xs font-bold text-blue-800 dark:text-blue-300 mb-6 backdrop-blur-md animate-pulse">
            <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
            <span>Plataforma Oficial de Innovatech Solutions S.A.C.</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl leading-tight drop-shadow-xs">
            Gestión Inteligente de{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 dark:from-blue-400 dark:via-sky-300 dark:to-indigo-400 bg-clip-text text-transparent">
              Inventario y Préstamo
            </span>{' '}
            de Equipos
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed drop-shadow-xs">
            Elimina la pérdida de información y las hojas de cálculo manuales. TechAsset centraliza
            la administración de activos tecnológicos, controla la disponibilidad en tiempo real y
            agiliza la asignación de equipos para más de 500 colaboradores.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-500 active:scale-[0.98]"
            >
              <span>Ingresar a TechAsset</span>
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#modulos"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300/90 bg-white/90 px-6 py-3.5 text-sm font-bold text-slate-800 shadow-md backdrop-blur-md transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              <span>Ver funcionalidades</span>
              <ChevronRight className="size-4" />
            </a>
          </div>

          {/* Comparación: Problema vs Solución Adaptable */}
          <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 text-left">
            <div className="rounded-2xl border border-rose-300 bg-white/90 p-6 backdrop-blur-md shadow-md dark:border-rose-500/40 dark:bg-slate-900/85">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm mb-3">
                <ShieldAlert className="size-4.5" />
                <span>Problemática Anterior</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-rose-200">
                <li className="flex items-center gap-2 font-medium">❌ Registros dispersos en hojas de cálculo y papel.</li>
                <li className="flex items-center gap-2 font-medium">❌ Pérdida y duplicidad de equipos tecnológicos.</li>
                <li className="flex items-center gap-2 font-medium">❌ Desconocimiento del estado y ubicación de activos.</li>
                <li className="flex items-center gap-2 font-medium">❌ Falta de indicadores para la toma de decisiones.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-300 bg-white/90 p-6 backdrop-blur-md shadow-md dark:border-emerald-500/40 dark:bg-slate-900/85">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-3">
                <CheckCircle2 className="size-4.5" />
                <span>Solución con TechAsset</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-emerald-200">
                <li className="flex items-center gap-2 font-medium">✔ Base de datos relacional y código patrimonial único.</li>
                <li className="flex items-center gap-2 font-medium">✔ Control estricto de solicitudes, préstamos y devoluciones.</li>
                <li className="flex items-center gap-2 font-medium">✔ Disponibilidad, mantenimiento y bajas en tiempo real.</li>
                <li className="flex items-center gap-2 font-medium">✔ Dashboard analítico con reportes por área funcional.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos del Sistema */}
      <section
        id="modulos"
        className="relative z-10 border-t border-slate-300/80 bg-slate-100/80 py-20 backdrop-blur-lg transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/85"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Arquitectura y Alcance
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Módulos Integrados del Sistema
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
              Diseñado siguiendo estándares de construcción de software, programación orientada a objetos
              y arquitectura limpia en capas.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {MODULOS.map((m, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-300/90 bg-white/95 p-7 shadow-md backdrop-blur-md transition-all duration-200 hover:border-blue-500 hover:shadow-xl dark:border-white/15 dark:bg-slate-900/85 dark:hover:border-blue-400 dark:hover:bg-slate-900"
              >
                <div className={`mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-tr ${m.color} text-white shadow-md`}>
                  <m.icono className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{m.titulo}</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {m.descripcion}
                </p>

                <div className="mt-5 border-t border-slate-200 dark:border-white/10 pt-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Capacidades:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    {m.caracteristicas.map((c, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catálogo Visual de Equipos con Fotos 100% Nítidas */}
      <section className="relative z-10 border-t border-slate-300/80 bg-white/70 py-20 backdrop-blur-lg transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Activos Soportados
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Catálogo Tecnológico Institucional
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Identificación fotográfica y técnica de los equipos disponibles para préstamo.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIAS_SHOWCASE.map((cat, idx) => (
              <div
                key={idx}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-white/15 dark:bg-slate-950/90 dark:hover:border-blue-500/50"
              >
                {/* Contenedor de foto sin overlays oscuros densos */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={cat.foto}
                    alt={cat.nombre}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
                  <span className="absolute bottom-3 left-3 text-sm font-bold text-white drop-shadow-md">
                    {cat.nombre}
                  </span>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{cat.cant}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles de Usuarios */}
      <section className="relative z-10 border-t border-slate-300/80 bg-slate-100/85 py-20 backdrop-blur-lg transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/85">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Seguridad por Roles
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Tres Niveles de Acceso Jerárquico
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Cumplimiento de las reglas de negocio RN-05, RN-09 y control de permisos mediante JWT.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-300/90 bg-white/95 p-6 text-center shadow-md dark:border-white/15 dark:bg-slate-900/90 backdrop-blur-md">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30 shadow-xs">
                <Lock className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Administrador</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Control total del sistema: gestión de cuentas de usuario, habilitación/deshabilitación,
                políticas de acceso e indicadores globales.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-300/90 bg-white/95 p-6 text-center shadow-md dark:border-white/15 dark:bg-slate-900/90 backdrop-blur-md">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-blue-100 text-blue-600 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30 shadow-xs">
                <Layers className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Responsable de TI</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Administración del parque tecnológico: alta y baja de equipos, aprobación o rechazo de
                préstamos y recepción física de devoluciones.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-300/90 bg-white/95 p-6 text-center shadow-md dark:border-white/15 dark:bg-slate-900/90 backdrop-blur-md">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 shadow-xs">
                <Users2 className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Colaborador</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Autonomía institucional: consulta de equipos disponibles en el catálogo, solicitud de
                préstamo en línea y seguimiento de sus préstamos vigentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 border-t border-slate-300/80 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 py-16 text-center text-white dark:border-white/10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl text-white">¿Listo para comenzar a gestionar los activos?</h2>
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-slate-300">
            Ingresa al portal con tu cuenta corporativa y accede a tus herramientas de trabajo.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-500 active:scale-[0.98]"
            >
              <span>Acceder al Portal TechAsset</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-300/80 bg-white py-8 text-center text-xs text-slate-500 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo compacto />
          <p>Innovatech Solutions S.A.C. · TechAsset Enterprise 2026 · Construcción de Software</p>
          <Link to="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
            Acceso al Sistema
          </Link>
        </div>
      </footer>
    </div>
  )
}
