import { Link } from '@tanstack/react-router'
import { Star, Gear, Users } from '@phosphor-icons/react'
import { Badge } from '@/ui/badge'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import type { Vehiculo } from '../types'
import { cn } from '@/lib/utils'
import { FavoritoButton } from '@/features/favoritos/components/FavoritoButton'

interface VehiculoCardProps {
  vehiculo: Vehiculo
  className?: string
}

const fuelLabel: Record<string, string> = {
  nafta:     t('vehiculo.fuel.nafta'),
  diesel:    t('vehiculo.fuel.diesel'),
  gnc:       t('vehiculo.fuel.gnc'),
  electrico: t('vehiculo.fuel.electrico'),
  hibrido:   t('vehiculo.fuel.hibrido'),
}

export function VehiculoCard({ vehiculo, className }: VehiculoCardProps) {
  const coverPhoto = vehiculo.fotos[0]?.url ?? '/placeholder-car.jpg'
  const precio = vehiculo.tarifa.daily

  return (
    <Link
      to="/vehiculos/$id"
      params={{ id: vehiculo.id }}
      className={cn('block', className)}
    >
      <article className="overflow-hidden rounded-xl bg-surface-1 border border-white/6 shadow-card transition-transform duration-150 active:scale-[0.97]">

        {/* Photo con botón de favorito */}
        <div className="relative aspect-video overflow-hidden bg-surface-2">
          <img
            src={coverPhoto}
            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute right-2 top-2">
            <FavoritoButton vehicleId={vehiculo.id} />
          </div>
        </div>

        {/* Info */}
        <div className="p-5 space-y-4">

          {/* Name + availability */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-base text-text-primary leading-tight truncate">
                {vehiculo.marca} {vehiculo.modelo}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{vehiculo.anio}</p>
            </div>
            <Badge
              variant={vehiculo.disponible ? 'success' : 'danger'}
              className="shrink-0 text-[10px] mt-0.5"
            >
              {vehiculo.disponible ? t('vehiculo.disponible') : t('vehiculo.noDisponible')}
            </Badge>
          </div>

          {vehiculo.owner?.name && (
            <span className="text-xs text-text-muted">por {vehiculo.owner.name}</span>
          )}

          {/* Price — protagonista */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-text-primary">{fmt.currency(precio)}</span>
              <span className="text-xs text-text-muted">{t('vehiculo.perDay')}</span>
            </div>
            {/* Rating */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-warning">
                <Star size={13} weight="fill" />
              </span>
              <span className="text-sm font-semibold text-text-primary">{fmt.rating(vehiculo.rating)}</span>
              <span className="text-xs text-text-muted">({vehiculo.reviewCount})</span>
            </div>
          </div>

          {/* Meta + tags */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Gear size={12} weight="regular" />
                {vehiculo.transmission === 'automatic' ? t('vehiculo.automatic') : t('vehiculo.manual')}
              </span>
              <span className="h-3 w-px bg-white/10" />
              <span
                className="flex items-center gap-1"
                aria-label={`${t('vehiculo.seats')}: ${vehiculo.asientos}`}
                title={`${t('vehiculo.seats')}: ${vehiculo.asientos}`}
              >
                <Users size={12} weight="regular" />
                <span className="sr-only">{t('vehiculo.seats')}: </span>
                {vehiculo.asientos}
              </span>
              <span className="h-3 w-px bg-white/10" />
              <span>{fuelLabel[vehiculo.combustible] ?? vehiculo.combustible}</span>
            </div>

            {vehiculo.tags.length > 0 && (
              <div className="flex gap-1.5 shrink-0">
                {vehiculo.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

        </div>
      </article>
    </Link>
  )
}
