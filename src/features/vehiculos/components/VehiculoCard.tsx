import { Link } from '@tanstack/react-router'
import { Gear, Users, MapPin } from '@phosphor-icons/react'
import { Badge } from '@/ui/badge'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { cn } from '@/lib/utils'
import { FavoritoButton } from '@/features/favoritos/components/FavoritoButton'

interface VehiculoCardProps {
  vehiculo: GetVehicleResponse
  className?: string
}

export function VehiculoCard({ vehiculo, className }: VehiculoCardProps) {
  const coverPhoto = vehiculo.photos[0] ?? '/placeholder-car.jpg'

  return (
    <Link
      to="/vehiculos/$id"
      params={{ id: vehiculo.id }}
      className={cn('block', className)}
    >
      <article className="overflow-hidden rounded-xl bg-surface-1 border border-white/6 shadow-card transition-transform duration-150 active:scale-[0.97]">

        {/* Foto con botón de favorito */}
        <div className="relative aspect-video overflow-hidden bg-surface-2">
          <img
            src={coverPhoto}
            alt={`${vehiculo.brand} ${vehiculo.model}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute right-0 top-0">
            <FavoritoButton vehicleId={vehiculo.id} />
          </div>
          {vehiculo.isAccessible && (
            <div className="absolute left-2 bottom-2">
              <Badge variant="secondary" className="text-[10px]">Accesible</Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 space-y-4">

          {/* Nombre + disponibilidad */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-base text-text-primary leading-tight truncate">
                {vehiculo.brand} {vehiculo.model}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{vehiculo.year} · {vehiculo.color}</p>
            </div>
            <Badge
              variant={vehiculo.enabled ? 'success' : 'danger'}
              className="shrink-0 text-[10px] mt-0.5"
            >
              {vehiculo.enabled ? t('vehiculo.disponible') : t('vehiculo.noDisponible')}
            </Badge>
          </div>

          {/* Ubicación */}
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <MapPin size={11} weight="fill" />
            <span>{vehiculo.city}, {vehiculo.province}</span>
          </div>

          {/* Precio */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-text-primary">{fmt.price(vehiculo.basePrice)}</span>
            <span className="text-xs text-text-muted">{t('vehiculo.perDay')}</span>
          </div>

          {/* Características */}
          <div className="flex items-center gap-3 pt-1 border-t border-white/5 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Gear size={12} weight="regular" />
              {vehiculo.transmission === 'Manual' ? t('vehiculo.manual') : t('vehiculo.automatic')}
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span className="flex items-center gap-1">
              <Users size={12} weight="regular" />
              {vehiculo.passengers}
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span>{vehiculo.mileage.toLocaleString('es-AR')} km</span>
          </div>

        </div>
      </article>
    </Link>
  )
}
