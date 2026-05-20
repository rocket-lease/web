import { useState } from 'react'
import { Plus, Car, Pencil } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { getCharacteristicLabel } from '@/features/vehiculos/utils/characteristics'
import { GestionReglasSets } from './GestionReglasSets'

const myVehiclesQueryKey = ['vehicles', 'mine'] as const
const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80'
const getVehiclePhotoUrl = (photos: unknown): string => {
  if (Array.isArray(photos) && typeof photos[0] === 'string' && photos[0].length > 0) {
    return photos[0]
  }
  return FALLBACK_PHOTO
}

export function MisVehiculosPage() {
  const [activeTab, setActiveTab] = useState('vehiculos')
  const vehiclesQuery = useQuery({
    queryKey: myVehiclesQueryKey,
    queryFn: () => vehiclesApi.getMyVehicles(),
  })

  const vehicles = vehiclesQuery.data ?? []
  return (
    <div className="flex flex-col">
      <PageHeader
        title={t('misVehiculos.title')}
        actions={
          activeTab === 'vehiculos' && (
            <Link to="/mis-vehiculos/nuevo">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Publicar
              </Button>
            </Link>
          )
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="px-4 py-3 border-b border-surface-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vehiculos">{t('misVehiculos.title')}</TabsTrigger>
            <TabsTrigger value="reglas">
              {t('reservationRules.title')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="vehiculos" className="flex-1">
          {vehiclesQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
              <p className="text-text-secondary">{t('general.loading')}</p>
            </div>
          ) : vehiclesQuery.isError ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
              <p className="text-text-secondary">{t('error.default')}</p>
              <Button variant="secondary" onClick={() => vehiclesQuery.refetch()}>
                {t('general.retry')}
              </Button>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
              <Car className="h-14 w-14 text-text-muted" />
              <p className="text-text-secondary">{t('misVehiculos.empty')}</p>
              <Link to="/mis-vehiculos/nuevo">
                <Button>{t('misVehiculos.emptyAction')}</Button>
              </Link>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-3">
              {vehicles.map(v => {
                const priceCents = v.basePriceCents ?? 0
                return (
                  <Link key={v.id} to="/mis-vehiculos/$id" params={{ id: v.id }} className="block">
                    <article className="card flex gap-4 p-4 transition-transform duration-150 active:scale-[0.99]">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                        <img src={getVehiclePhotoUrl(v.photos)} alt={`${v.brand} ${v.model}`} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-text-primary">
                            {v.brand} {v.model} {v.year}
                          </p>
                          <Badge variant={v.enabled ? 'success' : 'secondary'}>
                            {v.enabled ? t('misVehiculos.active') : t('misVehiculos.inactive')}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">
                          {fmt.currency(priceCents)} {t('vehiculo.perDay')}
                        </p>
                        {v.characteristics?.length ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {v.characteristics.map((item) => (
                              <Badge key={item} variant="secondary" className="text-[10px] px-2 py-0.5">
                                {getCharacteristicLabel(item)}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        {v.city || v.province ? (
                          <p className="mt-2 text-xs text-text-muted">
                            {v.city}
                            {v.city && v.province ? ' · ' : ''}
                            {v.province}
                          </p>
                        ) : null}

                        <div className="mt-3">
                          <Button size="sm" variant="ghost">
                            <Pencil className="h-4 w-4" />
                            Editar vehiculo
                          </Button>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reglas">
          <GestionReglasSets />
        </TabsContent>
      </Tabs>
    </div>
  )
}
