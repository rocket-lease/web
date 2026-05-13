import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Settings, Users, MapPin, Shield, Calendar, Gauge, Box } from 'lucide-react'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Badge } from '@/ui/badge'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { vehiclesApi } from '../api/vehiculos.api'
import { getCharacteristicLabel } from '../utils/characteristics'

export function VehiculoDetailPage() {
  const { id } = useParams({ from: '/_app/vehiculos/$id' })

  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesApi.getById(id),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader title="Detalle del vehículo" showBack />
        <div className="aspect-[4/3] bg-surface-2 animate-pulse" />
        <div className="px-4 py-5 space-y-4">
          <div className="h-7 w-2/3 rounded-lg bg-surface-2 animate-pulse" />
          <div className="h-4 w-1/3 rounded-lg bg-surface-2 animate-pulse" />
        </div>
      </div>
    )
  }

  if (isError || !vehicle) {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader title="Detalle del vehículo" showBack />
        <div className="flex items-center justify-center flex-1 py-24">
          <p className="text-sm text-danger">{t('buscar.error')}</p>
        </div>
      </div>
    )
  }

  const coverPhoto = vehicle.photos[0] ?? '/placeholder-car.jpg'

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Detalle del vehículo" showBack />

      {/* Fotos */}
      <div className="aspect-[4/3] bg-surface-2 relative overflow-hidden">
        <img
          src={coverPhoto}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="h-full w-full object-cover"
        />
        {vehicle.isAccessible && (
          <div className="absolute left-3 bottom-3">
            <Badge variant="secondary">Accesible</Badge>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-5 space-y-5">

        {/* Título */}
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {vehicle.brand} {vehicle.model} {vehicle.year}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {fmt.plate(vehicle.plate)} · {vehicle.color}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin className="h-3.5 w-3.5 text-text-muted" />
            <span className="text-sm text-text-muted">{vehicle.city}, {vehicle.province}</span>
          </div>
        </div>

        {/* Características principales */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 py-3">
            <Settings className="h-5 w-5 text-brand-400" />
            <span className="text-xs text-text-muted text-center">{vehicle.transmission}</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 py-3">
            <Users className="h-5 w-5 text-brand-400" />
            <span className="text-xs text-text-muted">{vehicle.passengers} asientos</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 py-3">
            <Shield className="h-5 w-5 text-brand-400" />
            <span className="text-xs text-text-muted">{vehicle.isAccessible ? 'Accesible' : 'Estándar'}</span>
          </div>
        </div>

        {/* Datos técnicos */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-3">
            <Gauge className="h-4 w-4 text-text-muted shrink-0" />
            <div>
              <p className="text-[10px] text-text-muted">Kilometraje</p>
              <p className="text-sm font-semibold text-text-primary">{vehicle.mileage.toLocaleString('es-AR')} km</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-3">
            <Box className="h-4 w-4 text-text-muted shrink-0" />
            <div>
              <p className="text-[10px] text-text-muted">Maletero</p>
              <p className="text-sm font-semibold text-text-primary">{vehicle.trunkLiters} L</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-3 col-span-2">
            <Calendar className="h-4 w-4 text-text-muted shrink-0" />
            <div>
              <p className="text-[10px] text-text-muted">Disponible desde</p>
              <p className="text-sm font-semibold text-text-primary">{fmt.dateShort(vehicle.availableFrom)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Precio */}
        <div>
          <p className="text-sm text-text-muted mb-2">Tarifas</p>
          <div className="rounded-xl bg-surface-2 flex-1 p-3 text-center">
            <p className="text-lg font-bold text-text-primary">{fmt.price(vehicle.basePrice)}</p>
            <p className="text-xs text-text-muted">por día</p>
          </div>
        </div>

        {vehicle.description && (
          <>
            <Separator />
            <div>
              <p className="text-sm text-text-muted mb-2">{t('vehiculo.description')}</p>
              <p className="text-sm text-text-secondary leading-relaxed">{vehicle.description}</p>
            </div>
          </>
        )}

        {vehicle.characteristics && vehicle.characteristics.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm text-text-muted mb-2">{t('vehiculo.features')}</p>
              <div className="flex flex-wrap gap-2">
                {vehicle.characteristics.map(c => (
                  <Badge key={c} variant="secondary">{getCharacteristicLabel(c)}</Badge>
                ))}
              </div>
            </div>
          </>
        )}
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
