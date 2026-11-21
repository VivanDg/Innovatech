import { useEffect, useState, type MouseEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  Eye,
  EyeOff,
  Headphones,
  KeyRound,
  Laptop,
  Mail,
  Monitor,
  Moon,
  Printer,
  Router,
  ShieldCheck,
  Sun,
  Tablet,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../lib/theme'
import { obtenerMensajeError } from '../lib/api'
import { Logo } from '../components/Logo'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Controls'

const esquema = z.object({
  correo: z
    .string()
    .min(1, 'El correo institucional es obligatorio.')
    .email('Ingresa un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
  recordar: z.boolean().optional(),
})

type FormularioLogin = z.infer<typeof esquema>

const CARACTERISTICAS = [
  {
    icono: Boxes,
    titulo: 'Inventario Patrimonial Automatizado',
    detalle: 'Control centralizado de laptops, servidores y dispositivos con estados en tiempo real.',
  },
  {
    icono: ClipboardList,
    titulo: 'Flujo de Préstamos y Devoluciones',
    detalle: 'Asignación trazable a colaboradores con aprobaciones y registro de observaciones.',
  },
  {
    icono: BarChart3,
    titulo: 'Indicadores y Reportería Ejecutiva',
    detalle: 'Métricas de disponibilidad por área, equipos más requeridos y bitácora de auditoría.',
  },
]

export function LoginPage() {
  const { autenticado, iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const { oscuro, alternar } = useTheme()
  const [verPassword, setVerPassword] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const [modalOlvido, setModalOlvido] = useState(false)

  // Coordenadas para animación interactiva que sigue el cursor
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const parametros = new URLSearchParams(ubicacion.search)
  const sesionExpirada = parametros.get('expirada') === '1'

  const correoGuardado = localStorage.getItem('techasset_recordar_correo') ?? ''

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormularioLogin>({
    resolver: zodResolver(esquema),
    defaultValues: {
      correo: correoGuardado,
      password: '',
      recordar: Boolean(correoGuardado),
    },
  })

  useEffect(() => {
    if (correoGuardado) {
      setValue('correo', correoGuardado)
      setValue('recordar', true)
    }
  }, [correoGuardado, setValue])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  if (autenticado) {
    return <Navigate to="/" replace />
  }

  const enviar = async (datos: FormularioLogin) => {
    setErrorServidor(null)
    try {
      if (datos.recordar) {
        localStorage.setItem('techasset_recordar_correo', datos.correo)
      } else {
        localStorage.removeItem('techasset_recordar_correo')
      }

      await iniciarSesion(datos.correo, datos.password)
      toast.success('Sesión iniciada correctamente')
      const destino = (ubicacion.state as { from?: { pathname?: string } })?.from?.pathname ?? '/'
      navegar(destino, { replace: true })
    } catch (error) {
      const mensaje = obtenerMensajeError(error)
      setErrorServidor(mensaje)
      toast.error(mensaje)
    }
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden bg-canvas lg:grid lg:grid-cols-2"
    >
      {/* Luz ambiental interactiva que sigue el cursor */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.07), transparent 80%)`,
        }}
      />

      {/* Columna Izquierda: Formulario de Login */}
      <div className="relative z-10 flex min-h-screen flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="flex items-center justify-between">
          <Link
            to="/landing"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-paper px-3 py-1.5 text-xs font-semibold text-muted shadow-xs transition hover:bg-soft hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            <span>Volver a la presentación</span>
          </Link>
          <button
            type="button"
            onClick={alternar}
            className="grid size-9 place-items-center rounded-lg border border-border text-muted transition hover:bg-soft hover:text-ink"
            aria-label={oscuro ? 'Modo claro' : 'Modo oscuro'}
            title={oscuro ? 'Modo claro' : 'Modo oscuro'}
          >
            {oscuro ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>

        <div className="mx-auto my-10 w-full max-w-md">
          <div className="mb-8">
            <Logo className="mb-6" />
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Portal de Acceso</h1>
            <p className="mt-2 text-sm text-muted">
              Ingresa tus credenciales institucionales para gestionar y consultar activos.
            </p>
          </div>

          {sesionExpirada && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold">Tu sesión ha finalizado</p>
                <p className="mt-0.5">Por motivos de seguridad, ingresa nuevamente con tu clave institucional.</p>
              </div>
            </div>
          )}

          {errorServidor && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
              <span>{errorServidor}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(enviar)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                Correo Institucional
              </label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  placeholder="nombre@innovatech.pe"
                  autoComplete="email"
                  className="sketch-input pl-10"
                  {...register('correo')}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
              </div>
              {errors.correo && <p className="mt-1 text-xs text-danger">{errors.correo.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setModalOlvido(true)}
                  className="text-xs font-semibold text-primary transition hover:text-primary-hover hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  type={verPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="sketch-input pl-10 pr-10"
                  {...register('password')}
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {verPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border text-primary focus:ring-primary/20"
                  {...register('recordar')}
                />
                <span>Recordar mi correo</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verificando credenciales…' : 'Iniciar Sesión'}</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Soporte y ayuda */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted border-t border-border pt-6">
            <Headphones className="size-4 text-primary" />
            <span>¿Requieres asistencia? Contacta a Soporte TI: <strong className="text-ink">soporte@innovatech.pe</strong></span>
          </div>
        </div>

        <div className="text-center text-xs text-muted">
          Innovatech Solutions S.A.C. · TechAsset Enterprise 2026
        </div>
      </div>

      {/* Columna Derecha: Panel Corporativo con Imagen de Fondo Tecnológica Vibrante */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-l border-border bg-slate-950 p-12 text-white lg:flex">
        {/* Imagen de fondo con opacidad alta y excelente contraste */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 hover:scale-105 opacity-90"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=85')`,
          }}
        />
        {/* Overlay con viñeta suave que deja ver los servidores y luces claramente */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-blue-950/50 backdrop-blur-[0.5px]" />

        {/* Brillo reactivo al cursor sobre el fondo */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `radial-gradient(550px circle at ${mousePos.x - 700}px ${mousePos.y}px, rgba(59, 130, 246, 0.25), transparent 70%)`,
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-slate-950/60 px-4 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-md">
            <ShieldCheck className="size-4 text-emerald-400" />
            Control Patrimonial y Seguridad
          </span>
          <div className="flex gap-3 text-white drop-shadow-md">
            <Laptop className="size-5" />
            <Monitor className="size-5" />
            <Printer className="size-5" />
            <Router className="size-5" />
            <Tablet className="size-5" />
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="space-y-3">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-sky-400 drop-shadow-sm">
              SISTEMA INTEGRADO DE GESTIÓN
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white xl:text-4xl drop-shadow-md">
              Administración Inteligente de Activos y Préstamos
            </h2>
            <p className="text-sm text-slate-100 leading-relaxed font-medium drop-shadow-sm">
              Plataforma desarrollada para optimizar la trazabilidad del equipamiento, eliminar la pérdida de
              activos y agilizar los préstamos de más de 500 colaboradores en Innovatech Solutions.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {CARACTERISTICAS.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 rounded-xl border border-white/20 bg-slate-950/55 p-4 shadow-lg backdrop-blur-md transition-all hover:bg-slate-950/70 hover:border-blue-400/50"
              >
                <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-blue-600/50 text-blue-300 shadow-xs">
                  <item.icono className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white drop-shadow-xs">{item.titulo}</h3>
                  <p className="mt-0.5 text-xs text-slate-200 font-medium leading-relaxed">{item.detalle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-6 text-xs text-slate-300">
          <span className="font-medium drop-shadow-xs">Construcción de Software · 2026</span>
          <span className="font-bold text-white drop-shadow-xs">Innovatech Solutions S.A.C.</span>
        </div>
      </div>

      {/* Modal de Recuperación de Contraseña */}
      <Modal
        abierto={modalOlvido}
        titulo="Recuperación de Contraseña"
        descripcion="Procedimiento para restablecimiento de clave institucional."
        onClose={() => setModalOlvido(false)}
        ancho="sm"
        footer={
          <Button variante="primary" onClick={() => setModalOlvido(false)}>
            Entendido
          </Button>
        }
      >
        <div className="space-y-4 text-sm text-ink/80">
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
            <KeyRound className="size-5 shrink-0 text-blue-600 mt-0.5" />
            <div>
              <p className="font-bold">Política de Seguridad Corporativa</p>
              <p className="mt-1">
                Por políticas de auditoría institucional, el restablecimiento de contraseñas es gestionado de manera
                centralizada por el Administrador del Sistema o la Mesa de Ayuda de TI.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <p className="font-bold text-ink">Canales de Atención Directa:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted">
              <li>Envía un correo desde tu cuenta a: <strong className="text-ink">soporte.ti@innovatech.pe</strong></li>
              <li>Comunícate al anexo interno: <strong className="text-ink">Ext. 4402 (Mesa de Ayuda TI)</strong></li>
              <li>O solicita al Administrador que use la opción <em>Restablecer contraseña</em> en el panel de usuarios.</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  )
}
