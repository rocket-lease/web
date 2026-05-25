import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/ui/card'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { photosApi } from '@/features/photos/api/photos.api'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { SectionCard } from './EditarVehiculo/SectionCard'
import { DetallesSheet } from './EditarVehiculo/DetallesSheet'
import { DisponibilidadSheet } from './EditarVehiculo/DisponibilidadSheet'
import { FotosSheet } from './EditarVehiculo/FotosSheet'
import { ReglasSheet } from './EditarVehiculo/ReglasSheet'
import { usePrivateRuleSetForVehicle, useReservationRuleSets } from '../hooks/useReservationRules'

const myVehiclesQueryKey = ['vehicles', 'mine'] as const
const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80'

const vehicleQueryKey = (vehicleId: string) => ['vehicles', vehicleId] as const

type SheetKey = 'detalles' | 'disponibilidad' | 'fotos' | 'reglas'

interface EditarVehiculoPageProps {
  vehicleId: string
}

export function EditarVehiculoPage({ vehicleId }: EditarVehiculoPageProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [openSheet, setOpenSheet] = useState<SheetKey | null>(null)

  const vehicleQuery = useQuery({
    queryKey: vehicleQueryKey(vehicleId),
    queryFn: () => vehiclesApi.getVehicleById(vehicleId),
  })
  const vehicle = vehicleQuery.data

  const ruleSetsQuery = useReservationRuleSets()
  const privateRuleSetQuery = usePrivateRuleSetForVehicle(vehicleId)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!vehicle) throw new Error('Vehicle not ready')
      await vehiclesApi.deleteVehicle(vehicle.id)
      await Promise.allSettled(vehicle.photos.map((url: string) => photosApi.deleteVehicleImage(url)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVehiclesQueryKey })
      queryClient.removeQueries({ queryKey: vehicleQueryKey(vehicleId) })
      toast.success(t('editVehiculo.deleteSuccess'))
      navigate({ to: '/mis-vehiculos' })
    },
    onError: () => toast.error(t('error.default')),
  })

  if (vehicleQuery.isLoading) {
    return (
      <div className="flex min-h-full flex-col">
        <PageHeader title={t('editVehiculo.title')} showBack />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <p className="text-text-secondary">{t('general.loading')}</p>
        </div>
      </div>
    )
  }

  if (vehicleQuery.isError) {
    return (
      <div className="flex min-h-full flex-col">
        <PageHeader title={t('editVehiculo.title')} showBack />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <p className="text-text-secondary">{t('error.default')}</p>
          <Button variant="secondary" onClick={() => vehicleQuery.refetch()}>
            {t('general.retry')}
          </Button>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="flex min-h-full flex-col">
        <PageHeader title={t('editVehiculo.title')} showBack />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <p className="text-text-secondary">{t('editVehiculo.notFound')}</p>
          <Link to="/mis-vehiculos">
            <Button variant="secondary">{t('editVehiculo.backToList')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  const mainPhoto = vehicle.photos[0] ?? FALLBACK_PHOTO
  const isDeleting = deleteMutation.isPending

  const detallesParts = [
    vehicle.color,
    vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : null,
    vehicle.isAccessible ? t('editVehiculo.field.isAccessible') : null,
    vehicle.city || vehicle.province
      ? `${vehicle.city ?? ''}${vehicle.city && vehicle.province ? ', ' : ''}${vehicle.province ?? ''}`
      : null,
    vehicle.characteristics && vehicle.characteristics.length > 0
      ? `${vehicle.characteristics.length} ${vehicle.characteristics.length === 1 ? 'característica' : 'características'}`
      : null,
  ].filter(Boolean)
  const detallesSummary = detallesParts.length
    ? detallesParts.join(' · ')
    : t('editVehiculo.section.details.summary.empty')

  const disponibilidadSummary = [
    vehicle.enabled ? t('misVehiculos.active') : t('misVehiculos.inactive'),
    vehicle.basePriceCents ? `${fmt.currency(vehicle.basePriceCents)}/día` : null,
    vehicle.availableFrom ? `Desde ${vehicle.availableFrom}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const fotosSummary = t('editVehiculo.section.photos.summary').replace(
    '{count}',
    String(vehicle.photos.length),
  )

  const sharedRuleSet = ruleSetsQuery.data?.find(
    (s) => s.id === (vehicle as typeof vehicle & { reservationRuleSetId?: string }).reservationRuleSetId,
  )
  const privateRuleSet = privateRuleSetQuery.data
  const reglasSummary = privateRuleSet
    ? t('editVehiculo.section.rules.summary.private')
    : sharedRuleSet
    ? t('editVehiculo.section.rules.summary.shared').replace('{name}', sharedRuleSet.name)
    : t('editVehiculo.section.rules.summary.none')

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title={t('editVehiculo.title')} subtitle={t('editVehiculo.subtitle')} showBack />

      <div className="space-y-3 px-4 py-4">
        <Card className="overflow-hidden">
          <div className="aspect-16/10 overflow-hidden bg-surface-2">
            <img src={mainPhoto} alt={`${vehicle.brand} ${vehicle.model}`} className="h-full w-full object-cover" />
          </div>
          <CardContent className="space-y-1 pt-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="truncate">
                  {vehicle.brand} {vehicle.model} {vehicle.year}
                </CardTitle>
                <CardDescription className="mt-1">{vehicle.plate}</CardDescription>
              </div>
              <Badge variant={vehicle.enabled ? 'success' : 'secondary'}>
                {vehicle.enabled ? t('misVehiculos.active') : t('misVehiculos.inactive')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <SectionCard
          title={t('editVehiculo.section.details.title')}
          summary={detallesSummary}
          onEdit={() => setOpenSheet('detalles')}
          disabled={isDeleting}
        />
        <SectionCard
          title={t('editVehiculo.section.availability.title')}
          summary={disponibilidadSummary}
          onEdit={() => setOpenSheet('disponibilidad')}
          disabled={isDeleting}
        />
        <SectionCard
          title={t('editVehiculo.photosTitle')}
          summary={fotosSummary}
          onEdit={() => setOpenSheet('fotos')}
          disabled={isDeleting}
        />
        <SectionCard
          title={t('editVehiculo.section.rules.title')}
          summary={reglasSummary}
          onEdit={() => setOpenSheet('reglas')}
          disabled={isDeleting}
        />

        <Card className="mt-6 border-destructive/30 bg-destructive/5">
          <CardContent className="space-y-3 pt-4 pb-4">
            <CardTitle className="text-base text-destructive">
              {t('editVehiculo.danger.title')}
            </CardTitle>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (window.confirm(t('editVehiculo.deleteConfirm'))) {
                  deleteMutation.mutate()
                }
              }}
              disabled={isDeleting}
            >
              {t('editVehiculo.deleteVehicle')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <DetallesSheet open={openSheet === 'detalles'} onOpenChange={(o) => setOpenSheet(o ? 'detalles' : null)} vehicle={vehicle} />
      <DisponibilidadSheet open={openSheet === 'disponibilidad'} onOpenChange={(o) => setOpenSheet(o ? 'disponibilidad' : null)} vehicle={vehicle} />
      <FotosSheet open={openSheet === 'fotos'} onOpenChange={(o) => setOpenSheet(o ? 'fotos' : null)} vehicle={vehicle} />
      <ReglasSheet open={openSheet === 'reglas'} onOpenChange={(o) => setOpenSheet(o ? 'reglas' : null)} vehicle={vehicle} />
    </div>
  )
}
