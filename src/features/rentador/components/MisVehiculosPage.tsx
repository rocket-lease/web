import { useState, type CSSProperties } from 'react'
import { Plus, Car, Pencil, Sparkles } from 'lucide-react'
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
import { PromocionarDialog } from '@/features/promocionar/components/PromocionarDialog'
import { VehicleSelectionBar } from './VehicleSelectionBar'
import { BulkPriceDialog } from './BulkPriceDialog'

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
  const [promotingVehicleId, setPromotingVehicleId] = useState<string | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)

  const vehiclesQuery = useQuery({
    queryKey: myVehiclesQueryKey,
    queryFn: () => vehiclesApi.getMyVehicles(),
  })

  const vehicles = vehiclesQuery.data ?? []

  const toggleVehicleSelected = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleEnterSelectionMode = () => {
    setSelectionMode(true)
    setSelectedIds(new Set())
  }

  const handleExitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  const handleContinueToBulk = () => {
    setBulkDialogOpen(true)
  }

  const handleBulkDialogClose = () => {
    setBulkDialogOpen(false)
    handleExitSelectionMode()
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={t('misVehiculos.title')}
        actions={
          activeTab === 'vehiculos' && (
            <div className="flex gap-2">
              {vehicles.length > 0 && !selectionMode && (
                <Button size="sm" variant="secondary" onClick={handleEnterSelectionMode}>
                  {t('bulkPrice.enterSelectionMode')}
                </Button>
              )}
              {selectionMode && vehicles.length > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (selectedIds.size === vehicles.length) {
                      setSelectedIds(new Set())
                    } else {
                      setSelectedIds(new Set(vehicles.map(v => v.id)))
                    }
                  }}
                >
                  {selectedIds.size === vehicles.length
                    ? t('bulkPrice.deselectAll')
                    : t('bulkPrice.selectAll')}
                </Button>
              )}
              {!selectionMode && (
                <Link to="/mis-vehiculos/nuevo">
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Publicar
                  </Button>
                </Link>
              )}
            </div>
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
            <div className={`px-4 py-4 space-y-3 ${selectionMode ? 'pb-40' : ''}`}>
              {vehicles.map(v => {
                const priceCents = v.basePriceCents ?? 0
                const isSelected = selectedIds.has(v.id)
                const cardClass = `card flex gap-4 p-4 transition-all duration-150 ${
                  selectionMode ? '' : 'active:scale-[0.99]'
                }`
                const selectedStyle: CSSProperties | undefined = selectionMode
                  ? isSelected
                    ? {
                        borderColor: 'var(--color-brand-500)',
                        borderWidth: '2px',
                        boxShadow:
                          '0 0 0 4px rgba(124, 58, 237, 0.25), 0 10px 30px rgba(124, 58, 237, 0.45)',
                      }
                    : { opacity: 0.55 }
                  : undefined
                const cardBody = (
                  <article className={cardClass} style={selectedStyle}>
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                      <img src={getVehiclePhotoUrl(v.photos)} alt={`${v.brand} ${v.model}`} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-text-primary">
                          {v.brand} {v.model} {v.year}
                        </p>
                        <div className="flex gap-1.5 shrink-0">
                          {v.isPromoted && (
                            <Badge variant="warning">
                              <Sparkles className="h-3 w-3" />
                              {t('promocionar.active')}
                            </Badge>
                          )}
                          <Badge variant={v.enabled ? 'success' : 'secondary'}>
                            {v.enabled ? t('misVehiculos.active') : t('misVehiculos.inactive')}
                          </Badge>
                        </div>
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

                      {!selectionMode && (
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.preventDefault(); setPromotingVehicleId(v.id) }}>
                            <Sparkles className="h-4 w-4 text-owner" />
                            Promocionar
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Pencil className="h-4 w-4" />
                            Editar vehiculo
                          </Button>
                        </div>
                      )}
                    </div>
                  </article>
                )

                if (selectionMode) {
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVehicleSelected(v.id)}
                      aria-pressed={isSelected}
                      aria-label={`${isSelected ? 'Deseleccionar' : 'Seleccionar'} ${v.brand} ${v.model}`}
                      className="block w-full text-left"
                    >
                      {cardBody}
                    </button>
                  )
                }

                return (
                  <Link key={v.id} to="/mis-vehiculos/$id" params={{ id: v.id }} className="block">
                    {cardBody}
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

      <PromocionarDialog
        open={promotingVehicleId !== null}
        onOpenChange={(open) => { if (!open) setPromotingVehicleId(null) }}
        vehicleId={promotingVehicleId ?? ''}
      />

      {selectionMode && (
        <VehicleSelectionBar
          selectedCount={selectedIds.size}
          totalCount={vehicles.length}
          onCancel={handleExitSelectionMode}
          onContinue={handleContinueToBulk}
        />
      )}

      <BulkPriceDialog
        open={bulkDialogOpen}
        onClose={handleBulkDialogClose}
        vehicles={vehicles.map(v => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          year: v.year,
          basePriceCents: v.basePriceCents ?? 0,
        }))}
        selectedIds={selectedIds}
      />
    </div>
  )
}
