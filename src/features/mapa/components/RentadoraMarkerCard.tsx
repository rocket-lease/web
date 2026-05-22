import type { RentadoraMarker } from '@rocket-lease/contracts'
import { Link } from '@tanstack/react-router'
import { Star, SealCheck, X, Car } from '@phosphor-icons/react'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'

interface RentadoraMarkerCardProps {
  marker: RentadoraMarker
  onClose: () => void
}

/**
 * Tarjeta expandible que aparece al tocar un pin de rentadora. Muestra los
 * datos del criterio de aceptación: nombre, autos disponibles, precio desde
 * y reputación promedio.
 */
export function RentadoraMarkerCard({
  marker,
  onClose,
}: RentadoraMarkerCardProps) {
  return (
    <div className="absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-white/10 bg-surface-1 p-4 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-text-primary">
            {marker.rentadorName}
          </h3>
          {marker.verified && (
            <SealCheck
              size={18}
              weight="fill"
              className="text-client"
              aria-label="Verificado"
            />
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:bg-surface-2"
        >
          <X size={16} />
        </button>
      </div>

      <span className="mt-1 inline-block rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary">
        {marker.level}
      </span>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-surface-2 p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-text-primary">
            <Car size={14} weight="duotone" />
            <span className="text-sm font-bold">
              {marker.availableVehicleCount}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-text-muted">
            {t('mapa.card.availableCars')}
          </p>
        </div>
        <div className="rounded-xl bg-surface-2 p-2.5 text-center">
          <span className="text-sm font-bold text-text-primary">
            {fmt.currency(marker.minPriceCents)}
          </span>
          <p className="mt-0.5 text-[10px] text-text-muted">
            {t('mapa.card.priceFrom')}
          </p>
        </div>
        <div className="rounded-xl bg-surface-2 p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-text-primary">
            <Star size={14} weight="fill" className="text-amber-400" />
            <span className="text-sm font-bold">
              {fmt.rating(marker.reputationScore)}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-text-muted">
            {t('mapa.card.reputation')}
          </p>
        </div>
      </div>

      <Link
        to="/perfil/$id"
        params={{ id: marker.rentadorId }}
        className="mt-3 flex w-full items-center justify-center rounded-full bg-brand-500 py-2.5 text-sm font-semibold text-white active:scale-95"
      >
        {t('mapa.card.viewVehicles')}
      </Link>
    </div>
  )
}
