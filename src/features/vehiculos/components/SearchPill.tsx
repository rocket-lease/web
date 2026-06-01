import { MagnifyingGlass } from '@phosphor-icons/react'

interface SearchPillProps {
  city?:    string
  start?:   string
  end?:     string
  onClick:  () => void
}

const MONTH_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function formatDateRange(start?: string, end?: string): string | null {
  if (!start && !end) return null
  const fmt = (iso: string) => {
    const [, m, d] = iso.split('-')
    return `${parseInt(d, 10)} ${MONTH_SHORT[parseInt(m, 10) - 1]}`
  }
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  return fmt(start ?? end!)
}

/**
 * Pill compacta de búsqueda primaria. Reemplaza los controles separados de
 * ciudad y fechas por un único trigger que abre el `SearchOverlay`.
 *
 * Cuando no hay criterios muestra un placeholder neutro; cuando los hay
 * los condensa en una sola línea ("Buenos Aires · 12 mar – 15 mar").
 */
export function SearchPill({ city, start, end, onClick }: SearchPillProps) {
  const datesLabel = formatDateRange(start, end)
  const summary = city && datesLabel
    ? `${city} · ${datesLabel}`
    : city ?? datesLabel ?? 'Empezá tu búsqueda'

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 rounded-full bg-surface-1 px-5 h-11 shadow-[0_4px_20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.07)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-[box-shadow,transform] duration-200 ease-[var(--ease-out)]"
    >
      <MagnifyingGlass size={16} weight="regular" className="text-text-secondary shrink-0" />
      <span className="text-sm font-normal text-text-secondary truncate">{summary}</span>
    </button>
  )
}
