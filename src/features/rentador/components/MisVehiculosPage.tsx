import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { cn } from '@/lib/utils'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { GestionReglasSets } from './GestionReglasSets'
import { PromocionarDialog } from '@/features/promocionar/components/PromocionarDialog'
import { VehicleSelectionBar } from './VehicleSelectionBar'
import { BulkPriceDialog } from './BulkPriceDialog'
import { Plus, Car, Sparkle, Warning, MapPin } from '@phosphor-icons/react'

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
      if (next.has(id)) next.delete(id)
      else next.add(id)
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

  const handleBulkDialogClose = () => {
    setBulkDialogOpen(false)
    handleExitSelectionMode()
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={t('misVehiculos.title')}
        actions={
          activeTab === 'vehiculos' ? (
            selectionMode ? (
              <button
                type="button"
                onClick={handleExitSelectionMode}
                className="text-sm font-medium text-brand-400 px-1"
              >
                Cancelar
              </button>
            ) : (
              <Link to="/mis-vehiculos/nuevo">
                <button
                  type="button"
                  aria-label="Publicar nuevo vehículo"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2/80 text-text-secondary hover:text-text-primary transition-colors active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </Link>
            )
          ) : undefined
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="px-4 py-3 border-b border-surface-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vehiculos">{t('misVehiculos.title')}</TabsTrigger>
            <TabsTrigger value="reglas">{t('reservationRules.title')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="vehiculos" className="flex-1">
          {vehiclesQuery.isLoading ? (
            <div className="flex items-center justify-center py-24 px-6">
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
              <Car size={56} className="text-text-muted" />
              <p className="text-text-secondary">{t('misVehiculos.empty')}</p>
              <Link to="/mis-vehiculos/nuevo">
                <Button>{t('misVehiculos.emptyAction')}</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Contextual controls bar */}
              <div className="flex items-center justify-between px-5 pt-3 pb-1">
                {selectionMode ? (
                  <>
                    <span className="text-sm text-text-muted">{selectedIds.size} seleccionados</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedIds.size === vehicles.length) setSelectedIds(new Set())
                        else setSelectedIds(new Set(vehicles.map(v => v.id)))
                      }}
                      className="text-xs font-medium text-brand-400"
                    >
                      {selectedIds.size === vehicles.length ? t('bulkPrice.deselectAll') : t('bulkPrice.selectAll')}
                    </button>
                  </>
                ) : (
                  <>
                    <span />
                    <button
                      type="button"
                      onClick={handleEnterSelectionMode}
                      className="text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
                    >
                      {t('bulkPrice.enterSelectionMode')}
                    </button>
                  </>
                )}
              </div>

              <div className={cn('px-5 py-3 space-y-6', selectionMode && 'pb-40')}>
                {vehicles.map(v => {
                  const priceCents = v.basePriceCents ?? 0
                  const isSelected = selectedIds.has(v.id)
                  const ds = v.documentStatus
                  const needsDocs = ds === 'none' || ds === 'rejected'

                  const inner = (
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-2">
                      <img
                        src={getVehiclePhotoUrl(v.photos)}
                        alt={`${v.brand} ${v.model}`}
                        className="h-full w-full object-cover"
                      />

                      {v.isPromoted && (
                        <span className="absolute left-2.5 top-2.5 flex h-7 items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm px-2.5 text-xs font-semibold text-white">
                          <Sparkle size={11} weight="fill" className="text-warning" />
                          {t('promocionar.active')}
                        </span>
                      )}

                      {needsDocs && (
                        <span className="absolute bottom-2.5 left-2.5 flex h-7 items-center gap-1 rounded-full bg-warning/90 px-2.5 text-xs font-semibold text-black">
                          <Warning size={11} weight="fill" />
                          Subir documentación
                        </span>
                      )}

                      {selectionMode && (
                        <div className={cn(
                          'absolute inset-0 rounded-xl border-2 transition-all duration-150',
                          isSelected ? 'border-brand-500 bg-brand-500/10' : 'border-transparent',
                        )} />
                      )}
                    </div>
                  )

                  const caption = (
                    <div className="mt-2.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-semibold text-sm text-text-primary leading-snug truncate">
                          {v.brand} {v.model} · {v.year}
                        </p>
                        <span className="shrink-0 text-sm font-semibold text-text-primary">
                          {fmt.currency(priceCents)}
                          <span className="text-xs font-normal text-text-muted"> / día</span>
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between">
                        {(v.city || v.province) && (
                          <p className="flex items-center gap-1 text-xs text-text-muted">
                            <MapPin size={10} weight="fill" className="shrink-0" />
                            {v.city}{v.city && v.province ? ' · ' : ''}{v.province}
                          </p>
                        )}
                        <span className={cn(
                          'text-xs font-medium',
                          v.enabled ? 'text-success' : 'text-text-muted',
                        )}>
                          {v.enabled ? t('misVehiculos.active') : t('misVehiculos.inactive')}
                        </span>
                      </div>
                    </div>
                  )

                  return (
                    <article key={v.id} className={cn('relative', selectionMode && !isSelected && 'opacity-55')}>
                      {selectionMode ? (
                        <button
                          type="button"
                          onClick={() => toggleVehicleSelected(v.id)}
                          aria-pressed={isSelected}
                          aria-label={`${isSelected ? 'Deseleccionar' : 'Seleccionar'} ${v.brand} ${v.model}`}
                          className="block w-full text-left"
                        >
                          {inner}
                          {caption}
                        </button>
                      ) : (
                        <Link
                          to="/mis-vehiculos/$id"
                          params={{ id: v.id }}
                          className="block active:scale-[0.98] transition-transform duration-150"
                        >
                          {inner}
                          {caption}
                        </Link>
                      )}

                      {!selectionMode && (
                        <button
                          type="button"
                          aria-label="Promocionar vehículo"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPromotingVehicleId(v.id) }}
                          className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 backdrop-blur-sm transition-all active:scale-90"
                        >
                          <Sparkle
                            size={14}
                            weight="fill"
                            color={v.isPromoted ? '#F59E0B' : 'white'}
                          />
                        </button>
                      )}
                    </article>
                  )
                })}
              </div>
            </>
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
          onContinue={() => setBulkDialogOpen(true)}
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
