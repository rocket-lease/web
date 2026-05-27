import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface SectionCardProps {
  title: string
  summary: ReactNode
  onEdit: () => void
  disabled?: boolean
}

/**
 * Tarjeta read-only que resume una sección del vehículo. Al click abre el
 * sheet correspondiente.
 */
export function SectionCard({ title, summary, onEdit, disabled }: SectionCardProps) {
  return (
    <button
      type="button"
      onClick={onEdit}
      disabled={disabled}
      className="group flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-surface-1 px-4 py-4 text-left transition-colors hover:border-brand-600/40 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <div className="text-sm text-text-secondary">{summary}</div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-text-muted transition-colors group-hover:text-brand-400" />
    </button>
  )
}
