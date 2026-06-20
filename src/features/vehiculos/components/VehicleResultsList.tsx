import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { t } from '@/i18n/es'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/ui/empty-state'
import { VehiculoCard, VehiculoCardSkeleton } from './VehiculoCard'

interface VehicleResultsListProps {
  vehicles:        GetVehicleResponse[]
  isLoading:       boolean
  isError:         boolean
  from?:           string
  to?:             string
  hasDateFilter:   boolean
  hasActiveFilter: boolean
  onClearFilters:  () => void
  /** Id del vehículo resaltado (sync con el mapa). */
  selectedId?:     string | null
  onHoverVehicle?: (id: string | null) => void
  onClickVehicle?: (id: string) => void
  /** Layout de la grilla. `single` colapsa a 1 columna (para split-pane). */
  columns?:        'auto' | 'single'
  /** Oculta el header "N resultados" — útil cuando el contenedor (drawer)
   *  ya muestra el count por su cuenta. */
  hideCountHeader?: boolean
  levelDiscountPercentage?: number
  className?:      string
}

/**
 * Listado de resultados de búsqueda de vehículos. Maneja loading, error y
 * empty state. El sync con el mapa se hace via `selectedId` + callbacks de
 * hover/click — pasarlos solo cuando hay un mapa adyacente.
 */
export function VehicleResultsList({
  vehicles, isLoading, isError, from, to, hasDateFilter, hasActiveFilter,
  onClearFilters, selectedId, onHoverVehicle, onClickVehicle,
  columns = 'auto', hideCountHeader, levelDiscountPercentage, className,
}: VehicleResultsListProps) {
  if (isError) {
    return (
      <div className={cn('px-5 py-8', className)}>
        <p className="text-sm text-danger text-center">{t('buscar.error')}</p>
      </div>
    )
  }

  const gridClass = columns === 'single'
    ? 'grid grid-cols-1 gap-6'
    : 'grid grid-cols-1 gap-8 sm:grid-cols-2'

  if (isLoading) {
    return (
      <div className={cn('px-5 pt-4 pb-2', className)}>
        <div className={gridClass}>
          {Array.from({ length: 4 }).map((_, i) => (
            <VehiculoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('px-5 pt-4 pb-2', className)}>
      {!hideCountHeader && (
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs text-text-muted">
            <span className="font-semibold text-text-primary">{vehicles.length}</span>{' '}
            {t('buscar.results')}
          </p>
          {hasActiveFilter && (
            <>
              <span className="text-xs text-text-muted">·</span>
              <button onClick={onClearFilters} className="text-xs text-client font-semibold">
                {t('buscar.filter.clearAll')}
              </button>
            </>
          )}
        </div>
      )}

      {vehicles.length === 0 ? (
        <EmptyState
          icon={<MagnifyingGlass size={26} weight="regular" className="text-text-muted" />}
          title={t('buscar.noResults')}
          description={hasDateFilter ? t('buscar.noResultsDatesHint') : t('buscar.noResultsHint')}
          action={
            hasActiveFilter ? (
              <button onClick={onClearFilters} className="text-sm font-semibold text-brand-400">
                {t('buscar.filter.clearAll')}
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className={gridClass}>
          {vehicles.map(v => (
            <div
              key={v.id}
              data-vehicle-id={v.id}
              data-vaul-no-drag
              onMouseEnter={() => onHoverVehicle?.(v.id)}
              onMouseLeave={() => onHoverVehicle?.(null)}
              onClick={() => onClickVehicle?.(v.id)}
              className={cn(
                'rounded-3xl transition-all duration-200',
                selectedId === v.id && 'ring-2 ring-brand-500/60 ring-offset-2 ring-offset-surface-0',
              )}
            >
              <VehiculoCard vehiculo={v} from={from} to={to} levelDiscountPercentage={levelDiscountPercentage} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
