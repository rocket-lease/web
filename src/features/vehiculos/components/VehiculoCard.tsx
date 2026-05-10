import { Link } from '@tanstack/react-router'
import { Star, Settings, Users } from 'lucide-react'
import { Badge } from '@/ui/badge'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import type { Vehiculo } from '../types'
import { cn } from '@/lib/utils'

interface VehiculoCardProps {
  vehiculo: Vehiculo
  className?: string
}

const fuelIcon: Record<string, string> = {
  nafta: 'Naf.',
  diesel: 'Diésel',
  gnc: 'GNC',
  electrico: 'Elé.',
  hibrido: 'Híb.',
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
      <article className="card overflow-hidden transition-transform duration-150 active:scale-[0.98]">
        {/* Photo */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
          <img
            src={coverPhoto}
            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {/* Price pill */}
          <div className="absolute bottom-3 right-3 rounded-full bg-surface-0/90 px-3 py-1 backdrop-blur-sm border border-white/10">
            <span className="text-sm font-bold text-text-primary">{fmt.currency(precio)}</span>
            <span className="text-xs text-text-muted">{t('vehiculo.perDay')}</span>
          </div>
          {/* Availability dot */}
          <div className="absolute left-3 top-3">
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm border',
                vehiculo.disponible
                  ? 'bg-success-bg border-success/20 text-success'
                  : 'bg-danger-bg border-danger/20 text-danger',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  vehiculo.disponible ? 'bg-success' : 'bg-danger',
                )}
              />
              {vehiculo.disponible ? t('vehiculo.disponible') : t('vehiculo.noDisponible')}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-text-primary truncate">
                {vehiculo.marca} {vehiculo.modelo}
              </p>
              <p className="text-sm text-text-muted">{vehiculo.anio}</p>
            </div>
            {/* Rating */}
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              <span className="text-sm font-semibold text-text-primary">{fmt.rating(vehiculo.rating)}</span>
              <span className="text-xs text-text-muted">({vehiculo.reviewCount})</span>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-3 flex items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Settings className="h-3.5 w-3.5" />
              {vehiculo.transmission === 'automatic' ? t('vehiculo.automatic') : t('vehiculo.manual')}
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {vehiculo.asientos} {t('vehiculo.seats')}
            </span>
            <span className="h-3 w-px bg-white/10" />
            <span>{fuelIcon[vehiculo.combustible]}</span>
          </div>

          {/* Tags */}
          {vehiculo.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {vehiculo.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
