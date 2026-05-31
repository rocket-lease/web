import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import {
  Gear,
  Users,
  MapPin,
  Shield,
  Calendar,
  Gauge,
  Cube,
  Star,
  CheckCircle,
  WarningCircle,
  ChatCircleText,
  CaretRight,
} from '@phosphor-icons/react'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Badge } from '@/ui/badge'
import { Avatar } from '@/ui/avatar'
import { fmt } from '@/lib/formatters'
import { t, type I18nKey } from '@/i18n/es'
import { vehiclesApi } from '../api/vehiculos.api'
import { VehicleLocationMap } from '@/features/mapa/components/VehicleLocationMap'
import { getCharacteristicLabel } from '../utils/characteristics'
import {
  getCancellationPolicyLabel,
  getCancellationPolicyDescription,
  getDepositLabel,
  formatMaxKilometrage,
  formatRentalTimeConstraints,
} from '../utils/rules-formatter'
import { FavoritoButton } from '@/features/favoritos/components/FavoritoButton'
import { useAuth } from '@/features/auth/hooks/useAuth'

const SWIPE_THRESHOLD_PX = 40

export function VehiculoDetailPage() {
  const { id } = useParams({ from: '/_app/vehiculos/$id' })
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [photoIndex, setPhotoIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesApi.getById(id),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader title="Detalle del vehículo" showBack sticky />
        <div className="aspect-4/3 bg-surface-2 animate-pulse" />
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
        <PageHeader title="Detalle del vehículo" showBack sticky />
        <div className="flex items-center justify-center flex-1 py-24">
          <p className="text-sm text-danger">{t('buscar.error')}</p>
        </div>
      </div>
    )
  }

  const photos = vehicle.photos.length > 0 ? vehicle.photos : ['/placeholder-car.jpg']
  const currentPhoto = photos[Math.min(photoIndex, photos.length - 1)]
  const isOwnVehicle = !!user && vehicle.ownerId === user.id

  const handleReservarClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated) {
      e.preventDefault()
      navigate({ to: '/login', search: { returnTo: `/vehiculos/${vehicle.id}/reservar` } })
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || photos.length < 2) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return
    setPhotoIndex((i) => {
      if (dx < 0) return Math.min(i + 1, photos.length - 1)
      return Math.max(i - 1, 0)
    })
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Detalle del vehículo" showBack sticky />

      {/* Galería */}
      <div
        className="aspect-4/3 bg-surface-2 relative overflow-hidden touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentPhoto}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="h-full w-full object-cover pointer-events-none"
          draggable={false}
        />
        <div className="absolute right-2 top-2">
          <FavoritoButton vehicleId={vehicle.id} />
        </div>
        {vehicle.isAccessible && (
          <div className="absolute left-3 bottom-3">
            <Badge variant="secondary">Accesible</Badge>
          </div>
        )}
        {photos.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 pb-2">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-[width,background-color] ${
                  i === photoIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {photos.map((url, i) => (
            <button
              key={`${url}-${i}`}
              onClick={() => setPhotoIndex(i)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === photoIndex ? 'border-brand-500' : 'border-transparent opacity-70'
              }`}
            >
              <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

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
              <MapPin size={14} className="text-text-muted" weight="regular" />
            <span className="text-sm text-text-muted">{vehicle.city}, {vehicle.province}</span>
          </div>
        </div>

        {/* CTA Reservar + precio (hero) */}
        <div className="rounded-2xl border border-white/8 bg-surface-1 p-4 shadow-elevated">
          {!vehicle.enabled && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2">
              <WarningCircle size={16} className="text-warning shrink-0 mt-0.5" weight="regular" />
              <p className="text-xs text-warning">{t('vehiculo.unavailableNotice')}</p>
            </div>
          )}
          {isOwnVehicle && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2">
              {/* <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" /> */}
              <p className="text-xs text-warning">{t('vehiculo.ownNotice')}</p>
            </div>
          )}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-text-muted">Tarifa</p>
              <p className="text-2xl font-bold text-text-primary leading-tight">{fmt.currency(vehicle.basePriceCents)}</p>
              <p className="text-xs text-text-muted">{t('vehiculo.perDay')}</p>
            </div>
            {!vehicle.enabled ? (
              <Button size="lg" disabled className="shrink-0">
                {t('vehiculo.noDisponible')}
              </Button>
            ) : isOwnVehicle ? (
              <Button size="lg" disabled className="shrink-0">
                {t('vehiculo.esMio')}
              </Button>
            ) : (
              <Link
                to="/vehiculos/$id/reservar"
                params={{ id: vehicle.id }}
                className="shrink-0"
                onClick={handleReservarClick}
              >
                <Button size="lg">{t('vehiculo.reservar')}</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Características principales */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 py-3">
            <Gear size={20} className="text-brand-400" weight="regular" />
            <span className="text-xs text-text-muted text-center">{vehicle.transmission}</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 py-3">
            <Users size={20} className="text-brand-400" weight="regular" />
            <span className="text-xs text-text-muted">{vehicle.passengers} asientos</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 py-3">
            <Shield size={20} className="text-brand-400" weight="regular" />
            <span className="text-xs text-text-muted">{vehicle.isAccessible ? 'Accesible' : 'Estándar'}</span>
          </div>
        </div>

        {/* Datos técnicos */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-3">
            <Gauge size={16} className="text-text-muted shrink-0" weight="regular" />
            <div>
              <p className="text-[10px] text-text-muted">Kilometraje</p>
              <p className="text-sm font-semibold text-text-primary">{vehicle.mileage.toLocaleString('es-AR')} km</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-3">
            <Cube size={16} className="text-text-muted shrink-0" weight="regular" />
            <div>
              <p className="text-[10px] text-text-muted">Maletero</p>
              <p className="text-sm font-semibold text-text-primary">{vehicle.trunkLiters} L</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-3 col-span-2">
            <Calendar size={16} className="text-text-muted shrink-0" weight="regular" />
            <div>
              <p className="text-[10px] text-text-muted">Disponible desde</p>
              <p className="text-sm font-semibold text-text-primary">{fmt.dateShort(vehicle.availableFrom)}</p>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <Separator />
        <div>
          <p className="text-sm text-text-muted mb-2">{t('vehiculo.location')}</p>
          <VehicleLocationMap
            latitude={vehicle.latitude}
            longitude={vehicle.longitude}
            address={vehicle.address}
            city={vehicle.city}
            province={vehicle.province}
          />
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

        <Separator />
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-text-muted">{t('vehiculo.rules')}</p>
            {vehicle.reservationRuleSet && (
              <Badge variant="secondary">{t('vehiculo.rulesActive')}</Badge>
            )}
          </div>
          {vehicle.reservationRuleSet ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
              <div className="col-span-2">
                <dt className="text-xs text-text-secondary">{t('reservationRules.cancellationPolicy')}</dt>
                <dd className="mt-1 text-sm font-semibold text-text-primary">
                  {getCancellationPolicyLabel(vehicle.reservationRuleSet.cancellationPolicy)}
                </dd>
                <dd className="mt-0.5 text-xs text-text-secondary">
                  {getCancellationPolicyDescription(vehicle.reservationRuleSet.cancellationPolicy)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-secondary">{t('reservationRules.deposit')}</dt>
                <dd className="mt-1 text-sm font-semibold text-text-primary">
                  {getDepositLabel(vehicle.reservationRuleSet.depositPercentage)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-secondary">{t('reservationRules.maxKilometrage')}</dt>
                <dd className="mt-1 text-sm font-semibold text-text-primary">
                  {formatMaxKilometrage(vehicle.reservationRuleSet.maxKilometrage)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-text-secondary">{t('reservationRules.rentalTime')}</dt>
                <dd className="mt-1 text-sm font-semibold text-text-primary">
                  {formatRentalTimeConstraints(vehicle.reservationRuleSet.rentalTimeConstraints)}
                </dd>
              </div>
            </dl>
          ) : vehicle.reservationRuleSetId ? (
            <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-4">
              <p className="text-sm font-medium text-warning">{t('vehiculo.rulesUnavailableTitle')}</p>
              <p className="mt-1 text-sm text-warning/90">{t('vehiculo.rulesUnavailableDesc')}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-surface-2 px-4 py-4">
              <p className="text-sm font-medium text-text-primary">{t('vehiculo.rulesEmptyTitle')}</p>
              <p className="mt-1 text-sm text-text-secondary">{t('vehiculo.rulesEmptyDesc')}</p>
            </div>
          )}
        </div>

        {vehicle.owner && (
          <>
            <Separator />
            <div>
              <p className="text-sm text-text-muted mb-3">{t('vehiculo.owner')}</p>
              <Link
                to="/perfil/$id"
                params={{ id: vehicle.owner.id }}
                aria-label={`Ver perfil de ${vehicle.owner.name}`}
                className="flex items-center gap-3 -mx-2 px-2 py-2 rounded-xl hover:bg-surface-2 transition-colors active:scale-[0.99]"
              >
                <Avatar
                  src={vehicle.owner.avatarUrl ?? undefined}
                  fallback={vehicle.owner.name.slice(0, 2).toUpperCase()}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-text-primary truncate">{vehicle.owner.name}</p>
                    {vehicle.owner.verified && (
                      <CheckCircle size={16} className="text-success shrink-0" weight="fill" aria-label="Verificado" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Star size={14} className="text-warning" weight="fill" />
                      {fmt.rating(vehicle.owner.reputationScore)}
                    </span>
                    <Badge variant="default">
                      {t(`perfil.level.${vehicle.owner.level}` as I18nKey)}
                    </Badge>
                  </div>
                </div>
                <CaretRight size={16} className="text-text-muted shrink-0" weight="regular" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}

        {/* Reseñas del vehículo (empty state hasta que exista el módulo de reviews) */}
        <Separator />
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-text-muted">{t('vehiculo.reviewsTitle')}</p>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Star size={14} className="text-text-muted" weight="regular" />
              <span>0.0</span>
              <span>·</span>
              <span>{t('vehiculo.reviewsCount').replace('{count}', '0')}</span>
            </div>
          </div>
          <div className="rounded-xl bg-surface-2 border border-white/5 px-4 py-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-1">
              <ChatCircleText size={20} className="text-text-muted" weight="regular" />
            </div>
            <p className="text-sm font-medium text-text-secondary">{t('vehiculo.reviewsEmpty')}</p>
            <p className="mt-1 text-xs text-text-muted">{t('vehiculo.reviewsEmptyHint')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
