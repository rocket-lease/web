import { Link } from '@tanstack/react-router'
import { Gear, Users, MapPin, Lightning, Sparkle, Gauge } from '@phosphor-icons/react'
import { Skeleton } from '@/ui/skeleton'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import type { GetVehicleResponse } from '@rocket-lease/contracts'
import { cn } from '@/lib/utils'
import { FavoritoButton } from '@/features/favoritos/components/FavoritoButton'

export function VehiculoCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('', className)}>
      <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
      <div className="mt-2.5 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3.5 w-1/5 shrink-0" />
        </div>
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/5" />
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
    <article className={cn('relative', className)}>
      <Link
        to="/vehiculos/$id"
        params={{ id: vehiculo.id }}
        className="block active:scale-[0.98] transition-transform duration-150"
      >
        {/* Foto */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-surface-2 shadow-[0_4px_20px_rgba(0,0,0,0.55)]">
          <img
            src={coverPhoto}
            alt={`${vehiculo.brand} ${vehiculo.model}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />

          {/* Badges overlay — top left */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {vehiculo.isPromoted && (
              <span className="flex h-7 items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm px-2.5 text-xs font-semibold text-white">
                <Sparkle size={11} weight="fill" className="text-warning" />
                {t('promocionar.active')}
              </span>
            )}
            {vehiculo.isAccessible && (
              <span className="flex h-7 items-center rounded-full bg-black/70 backdrop-blur-sm px-2.5 text-xs font-semibold text-white">
                Accesible
              </span>
            )}
          </div>

          {/* Auto-aceptar — bottom left */}
          {vehiculo.autoAccept && (
            <div className="absolute bottom-2.5 left-2.5">
              <span className="flex h-7 items-center gap-1 rounded-full bg-owner/90 backdrop-blur-sm px-2.5 text-xs font-semibold text-black">
                <Lightning size={11} weight="fill" />
                {t('vehiculo.instantBook')}
              </span>
            </div>
          )}

          {/* No disponible — bottom right */}
          {!vehiculo.enabled && (
            <div className="absolute bottom-2.5 right-2.5">
              <span className="flex h-7 items-center rounded-full bg-black/70 backdrop-blur-sm px-2.5 text-xs font-semibold text-white/70">
                {t('vehiculo.noDisponible')}
              </span>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="mt-2.5">
          {/* Fila 1: título + precio */}
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-semibold text-sm text-text-primary leading-snug truncate">
              {vehiculo.brand} {vehiculo.model} · {vehiculo.year}
            </p>
            <div className="shrink-0 text-right">
              {days > 0 ? (
                <span className="text-sm font-semibold text-text-primary">
                  {fmt.currency(vehiculo.basePriceCents * days)}
                  <span className="text-xs font-normal text-text-muted"> / {days === 1 ? '1 día' : `${days} días`}</span>
                </span>
              ) : (
                <span className="text-sm font-semibold text-text-primary">
                  {fmt.currency(vehiculo.basePriceCents)}
                  <span className="text-xs font-normal text-text-muted"> / día</span>
                </span>
              )}
            </div>
          </div>

          {/* Fila 2: ubicación */}
          <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
            <MapPin size={11} weight="fill" className="shrink-0" />
            {vehiculo.city}, {vehiculo.province}
          </p>

          {/* Fila 3: specs */}
          <p className="mt-0.5 text-xs text-text-muted flex items-center gap-1.5">
            <Gear size={11} />
            {vehiculo.transmission === 'Manual' ? t('vehiculo.manual') : t('vehiculo.automatic')}
            <span className="text-white/15">·</span>
            <Users size={11} />
            {vehiculo.passengers}
            <span className="text-white/15">·</span>
            <Gauge size={11} />
            {vehiculo.mileage.toLocaleString('es-AR')} km
          </p>
        </div>
      </Link>

      {/* Favorito — overlay top right de la foto */}
      <div className="absolute right-2.5 top-2.5 z-10">
        <FavoritoButton vehicleId={vehiculo.id} />
      </div>
    </article>
  )
}
