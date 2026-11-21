import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

export function PageHeader({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string
  descripcion?: string
  acciones?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
      <div>
        <p className="text-[0.68rem] font-bold uppercase tracking-widest text-primary">Gestión Corporativa</p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{titulo}</h1>
        {descripcion && <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2.5">{acciones}</div>}
    </div>
  )
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted">
        <span>{totalCount} registro(s) en total</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-paper px-4 py-3">
      <span className="text-xs text-muted">
        Mostrando página <strong className="text-ink">{page}</strong> de <strong className="text-ink">{totalPages}</strong> ({totalCount} registros)
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-paper px-3 py-1.5 text-xs font-semibold text-ink shadow-sm transition hover:bg-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-3.5" /> Anterior
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-paper px-3 py-1.5 text-xs font-semibold text-ink shadow-sm transition hover:bg-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

export function StatCard({
  titulo,
  valor,
  detalle,
  icono,
  acento = 'info',
}: {
  titulo: string
  valor: string | number
  detalle?: string
  icono: ReactNode
  acento?: 'info' | 'success' | 'warning' | 'danger' | 'neutral'
}) {
  const acentos = {
    info: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border-blue-100 dark:border-blue-900/40',
    success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-100 dark:border-amber-900/40',
    danger: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-100 dark:border-rose-900/40',
    neutral: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-100 dark:border-slate-700',
  }

  return (
    <div className="sketch-card-flat flex items-start justify-between gap-3 p-4.5 transition-all duration-200 hover:shadow-md">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{titulo}</p>
        <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">{valor}</p>
        {detalle && <p className="mt-1 text-xs text-muted">{detalle}</p>}
      </div>
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl border ${acentos[acento]}`}>
        {icono}
      </span>
    </div>
  )
}
