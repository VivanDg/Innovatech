import { useEffect, useId, type ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../lib/utils'

type Variante = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  cargando?: boolean
  icono?: ReactNode
}

const VARIANTES: Record<Variante, string> = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary-hover active:bg-blue-800 focus-visible:ring-2 focus-visible:ring-primary/40',
  secondary:
    'bg-paper text-ink border border-border shadow-sm hover:bg-soft hover:text-ink active:bg-border/60 focus-visible:ring-2 focus-visible:ring-border',
  danger:
    'bg-danger text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus-visible:ring-2 focus-visible:ring-danger/40',
  success:
    'bg-success text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-success/40',
  ghost:
    'bg-transparent text-muted hover:bg-soft hover:text-ink border-transparent shadow-none',
}

export function Button({
  variante = 'primary',
  cargando = false,
  icono,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-150',
        'outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        VARIANTES[variante],
        className,
      )}
      {...props}
    >
      {cargando ? <LoaderCircle className="size-4 animate-spin" /> : icono}
      {children}
    </button>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  ayuda?: string
  contenedorClassName?: string
}

export function Input({ label, error, ayuda, className, id, contenedorClassName, ...props }: InputProps) {
  const generado = useId()
  const inputId = id ?? generado

  return (
    <div className={cn('space-y-1.5', contenedorClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn('sketch-input', error && 'sketch-input-error', className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : ayuda ? (
        <p className="text-xs text-muted">{ayuda}</p>
      ) : null}
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  opciones: { valor: string; etiqueta: string }[]
  placeholder?: string
  contenedorClassName?: string
}

export function Select({
  label,
  error,
  opciones,
  placeholder,
  className,
  id,
  contenedorClassName,
  ...props
}: SelectProps) {
  const generado = useId()
  const selectId = id ?? generado

  return (
    <div className={cn('space-y-1.5', contenedorClassName)}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold uppercase tracking-wider text-muted">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn('sketch-input appearance-none pr-8', error && 'sketch-input-error', className)}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  contenedorClassName?: string
}

export function Textarea({
  label,
  error,
  className,
  id,
  contenedorClassName,
  ...props
}: TextareaProps) {
  const generado = useId()
  const textareaId = id ?? generado

  return (
    <div className={cn('space-y-1.5', contenedorClassName)}>
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-bold uppercase tracking-wider text-muted">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn('sketch-input sketch-textarea', error && 'sketch-input-error', className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}

type Tono = 'success' | 'danger' | 'info' | 'warning' | 'neutral'

const TONOS: Record<Tono, string> = {
  success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
  danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
  info: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/60',
  warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
  neutral: 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
}

const DOTS: Record<Tono, string> = {
  success: 'bg-emerald-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  warning: 'bg-amber-500',
  neutral: 'bg-slate-400',
}

export function Badge({ children, tono = 'neutral' }: { children: ReactNode; tono?: Tono }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-0.5 text-xs font-semibold',
        TONOS[tono],
      )}
    >
      <span className={cn('size-1.5 rounded-full', DOTS[tono])} />
      {children}
    </span>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn('size-5 animate-spin text-muted', className)} />
}

export function LoadingBlock({ mensaje = 'Cargando información…' }: { mensaje?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <Spinner className="size-7 text-primary" />
      <p className="text-sm font-semibold">{mensaje}</p>
    </div>
  )
}

export function EmptyState({
  icono,
  titulo,
  descripcion,
  accion,
}: {
  icono?: ReactNode
  titulo: string
  descripcion?: string
  accion?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
      {icono && (
        <div className="mb-3 grid size-12 place-items-center rounded-xl bg-soft text-muted">
          {icono}
        </div>
      )}
      <h3 className="text-base font-bold text-ink">{titulo}</h3>
      {descripcion && <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted">{descripcion}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}

export function useBloquearScroll(activo: boolean) {
  useEffect(() => {
    if (!activo) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [activo])
}

export function useCerrarConEscape(activo: boolean, cerrar: () => void) {
  useEffect(() => {
    if (!activo) return
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [activo, cerrar])
}
