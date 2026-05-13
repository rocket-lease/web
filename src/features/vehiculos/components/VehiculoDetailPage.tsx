import { useParams } from '@tanstack/react-router'
import { Star, Settings, Users, MapPin, Shield } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Avatar } from '@/ui/avatar'
import { Separator } from '@/ui/separator'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { vehiclesApi } from '../api/vehiculos.api'
import { fromApiToVehiculo } from '../utils/map-vehicle'
import { findVehiculo } from '../data/mock-vehiculos'

export function VehiculoDetailPage() {
  const { id } = useParams({ from: '/_app/vehiculos/$id' })
  const mockVehiculo = findVehiculo(id)

  const vehicleQuery = useQuery({
    queryKey: ['vehiculos', id],
    queryFn: () => vehiclesApi.getVehicleById(id),
    enabled: !mockVehiculo,
  })

  if (!mockVehiculo && vehicleQuery.isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader title="Cargando..." showBack />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary">{t('general.loading')}</p>
        </div>
      </div>
    )
  }

  if (!mockVehiculo && (vehicleQuery.isError || !vehicleQuery.data)) {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader title="Error" showBack />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-text-secondary">{t('error.default')}</p>
          <Button onClick={() => vehicleQuery.refetch()}>{t('general.retry')}</Button>
        </div>
      </div>
    )
  }

  const vehiculo = mockVehiculo || fromApiToVehiculo(vehicleQuery.data!)

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Detalle del vehículo" showBack />

      {/* Photo */}
      <div className="aspect-[4/3] bg-surface-2 relative overflow-hidden">
        <img
          src={vehiculo.fotos[0]?.url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80'}
          alt={`${vehiculo.marca} ${vehiculo.modelo}`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex-1 px-4 py-5 space-y-5">
        {/* Title + rating */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="h-3.5 w-3.5 text-text-muted" />
              <span className="text-sm text-text-muted">
                {vehiculo.ubicacion.ciudad || vehiculo.ubicacion.direccion}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-bold text-text-primary">{fmt.rating(vehiculo.rating)}</span>
            <span className="text-sm text-text-muted">({vehiculo.reviewCount})</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-surface-2 py-3">
            <Settings className="h-5 w-5 text-brand-400" />
            <span className="text-xs text-text-muted">
              {vehiculo.transmission === 'automatic' ? t('vehiculo.automatic') : t('vehiculo.manual')}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-surface-2 py-3">
            <Users className="h-5 w-5 text-brand-400" />
            <span className="text-xs text-text-muted">{vehiculo.asientos} {t('vehiculo.seats')}</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-surface-2 py-3">
            <Shield className="h-5 w-5 text-brand-400" />
            <span className="text-xs text-text-muted">Asegurado</span>
          </div>
        </div>

        <Separator />

        {/* Price */}
        <div>
          <p className="text-sm text-text-muted mb-2">Tarifas</p>
          <div className="flex gap-3">
            <div className="rounded-xl bg-surface-2 flex-1 p-3 text-center">
              <p className="text-lg font-bold text-text-primary">{fmt.currency(vehiculo.tarifa.daily)}</p>
              <p className="text-xs text-text-muted">{t('vehiculo.perDay')}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Rentador */}
        <div>
          <p className="text-sm text-text-muted mb-3">{t('vehiculo.owner')}</p>
          <div className="items-center flex gap-3">
            <Avatar fallback={vehiculo.rentador.nombre?.slice(0, 2).toUpperCase() || 'LM'} size="md" />
            <div className="flex-1">
              <p className="font-semibold text-text-primary">{vehiculo.rentador.nombre || 'Lucas M.'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="text-sm text-text-muted">
                  {fmt.rating(vehiculo.rentador.rating)} · {vehiculo.rentador.reviewCount} {t('vehiculo.reviews')}
                </span>
              </div>
            </div>
            <Badge variant="default">
              {/* @ts-ignore */}
              {t(`perfil.level.${vehiculo.rentador.level}`)}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <p className="text-sm text-text-muted mb-2">{t('vehiculo.description')}</p>
          <p className="text-sm text-text-secondary leading-relaxed">
            {vehiculo.descripcion}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {vehiculo.tags.map(tag => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* CTA sticky */}
      <div
        className="sticky bottom-0 bg-surface-0/95 backdrop-blur-xl border-t border-white/6 px-4 py-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        <Button className="w-full" size="lg">
          {t('vehiculo.reservar')}
        </Button>
      </div>
    </div>
  )
}
