import { Link } from '@tanstack/react-router'
import { Gear, Users, MapPin, Lightning, Sparkle } from '@phosphor-icons/react'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { cn } from '@/lib/utils'
import { FavoritoButton } from '@/features/favoritos/components/FavoritoButton'

export function VehiculoCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-xl bg-surface-1 border border-white/6 shadow-card', className)}>
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
        </div>
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-7 w-1/3" />
        <div className="flex items-center gap-3 pt-1 border-t border-white/5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

interface VehiculoCardProps {
  vehiculo: GetVehicleResponse
  from?: string
  to?: string
  className?: string
}

export function VehiculoCard({ vehiculo, from, to, className }: VehiculoCardProps) {
  const coverPhoto = vehiculo.photos[0] ?? '/placeholder-car.jpg'
  const days = from && to ? Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) : 0

  return (
    <article className={cn('relative overflow-hidden rounded-xl bg-surface-1 border border-white/6 shadow-card transition-transform duration-150 active:scale-[0.97]', className)}>
      <Link
        to="/vehiculos/$id"
        params={{ id: vehiculo.id }}
        className="block"
      >
        {/* Foto */}
        <div className="relative aspect-video overflow-hidden bg-surface-2">
          <img
            src={coverPhoto}
            alt={`${vehiculo.brand} ${vehiculo.model}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {vehiculo.isPromoted && (
            <div className="absolute left-2 top-2">
              <Badge variant="warning" className="text-[10px] gap-0.5">
                <Sparkle size={10} weight="fill" />
                {t('promocionar.active')}
              </Badge>
            </div>
          )}
          {vehiculo.isAccessible && (
            <div className="absolute left-2 bottom-2">
              <Badge variant="secondary" className="text-[10px]">Accesible</Badge>
            </div>
          )}
          {vehiculo.autoAccept && (
            <div className="absolute right-2 bottom-2">
              <span className="flex items-center gap-1 rounded-full bg-owner/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-black">
                <Lightning size={10} weight="fill" />
                {t('vehiculo.instantBook')}
              </span>
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

          {/* Rentador */}
          {vehiculo.owner?.name && (
            <span className="text-xs text-text-muted">por {vehiculo.owner.name}</span>
          )}

          {/* Precio */}
          <div className="flex items-baseline gap-1">
            {days > 0 ? (
              <>
                <span className="text-2xl font-bold text-text-primary">{fmt.currency(vehiculo.basePriceCents * days)}</span>
                <span className="text-xs text-text-muted">{days === 1 ? '1 día' : `${days} días`}</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-text-primary">{fmt.currency(vehiculo.basePriceCents)}</span>
                <span className="text-xs text-text-muted">{t('vehiculo.perDay')}</span>
              </>
            )}
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
      </Link>

      <div className="absolute right-1 top-1 z-10">
        <FavoritoButton vehicleId={vehiculo.id} />
      </div>
    </article>
  )
}
