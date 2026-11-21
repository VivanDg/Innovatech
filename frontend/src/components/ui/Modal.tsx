import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useBloquearScroll, useCerrarConEscape } from './Controls'
import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  titulo: string
  descripcion?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  ancho?: 'sm' | 'md' | 'lg'
}

const ANCHOS = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

export function Modal({ abierto, titulo, descripcion, children, footer, onClose, ancho = 'md' }: ModalProps) {
  useBloquearScroll(abierto)
  useCerrarConEscape(abierto, onClose)

  if (!abierto) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={cn(
          'relative z-10 my-auto w-full overflow-hidden rounded-2xl border border-border bg-paper shadow-2xl transition-all',
          ANCHOS[ancho],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/30 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink sm:text-xl">{titulo}</h2>
            {descripcion && <p className="mt-1 text-xs sm:text-sm text-muted">{descripcion}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition hover:bg-soft hover:text-ink"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border bg-slate-50/50 dark:bg-slate-900/30 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

interface ConfirmDialogProps {
  abierto: boolean
  titulo: string
  mensaje: ReactNode
  textoConfirmar?: string
  variante?: 'primary' | 'danger' | 'success'
  cargando?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  variante = 'primary',
  cargando,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      abierto={abierto}
      titulo={titulo}
      onClose={onClose}
      ancho="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-paper px-4 py-2 text-xs sm:text-sm font-semibold text-ink shadow-sm transition hover:bg-soft"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={cargando}
            className={cn(
              'rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50',
              variante === 'danger' && 'bg-danger hover:bg-red-700',
              variante === 'success' && 'bg-success hover:bg-emerald-700',
              variante === 'primary' && 'bg-primary hover:bg-primary-hover',
            )}
          >
            {cargando ? 'Procesando…' : textoConfirmar}
          </button>
        </>
      }
    >
      <div className="text-sm text-ink/85">{mensaje}</div>
    </Modal>
  )
}
