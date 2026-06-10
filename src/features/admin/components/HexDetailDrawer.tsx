import { useEffect, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Drawer as VaulDrawer } from 'vaul'
import type { AdminPricingZone, GetVehicleResponse } from '@rocket-lease/contracts'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { cn } from '@/lib/utils'
import {
  MULTIPLIER_TEXT_CLASS,
  multiplierLevel,
} from '@/features/admin/lib/multiplier-scale'

interface HexDetailDrawerProps {
  zone: AdminPricingZone | null
  onClose: () => void
}

type SnapPoint = string | number

const SNAP_POINTS: SnapPoint[] = ['220px', 0.7]

function multiplierToneClass(multiplier: number): string {
  return MULTIPLIER_TEXT_CLASS[multiplierLevel(multiplier)]
}

/**
 * Formatea la demanda ponderada para el detalle. La demanda de un barrio se
 * reparte entre sus celdas (1/n), así que un valor menor a uno es esperable:
 * se muestra con decimales en vez de redondear a cero y aparentar sin señales.
 */
function formatSignals(value: number): string {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(2).replace(/\.?0+$/, '')
}

function buildHeadline(zone: AdminPricingZone): string | null {
  if (zone.supplyCount === 0 && zone.demandCount > 0) {
    return t('admin.pricing.headline.demandNoSupply')
  }
  if (zone.supplyCount > 0 && zone.demandCount === 0) {
    return t('admin.pricing.headline.supplyIdle')
  }
  if (zone.supplyCount > 0 && zone.ratio >= 2) {
    return t('admin.pricing.headline.highDemand').replace(
      '{ratio}',
      zone.ratio.toFixed(1),
    )
  }
  if (zone.supplyCount > 0 && zone.ratio <= 0.5 && zone.demandCount > 0) {
    return t('admin.pricing.headline.lowDemand')
  }
  return null
}

/**
 * Bottom sheet con el detalle de la celda H3 seleccionada. Lidera con el
 * `multiplier` aplicado en la zona (color según rango) y una línea de
 * insight derivada de la relación oferta/demanda. Debajo lista vehículos
 * de muestra con marca, modelo y patente legible. Usa Vaul con dos snap
 * points y `modal={false}` para no bloquear la interacción con el mapa.
 */
export function HexDetailDrawer({ zone, onClose }: HexDetailDrawerProps) {
  const [snap, setSnap] = useState<SnapPoint | null>(SNAP_POINTS[0]!)

  useEffect(() => {
    if (zone) setSnap(SNAP_POINTS[0]!)
  }, [zone])

  const sampleIds = zone?.vehicleSampleIds ?? []
  const vehicleQueries = useQueries({
    queries: sampleIds.map((id) => ({
      queryKey: ['vehicle', id] as const,
      queryFn: () => vehiclesApi.getById(id),
      staleTime: 60_000,
      enabled: zone !== null,
    })),
  })
  const vehicles = vehicleQueries
    .map((q) => q.data)
    .filter((v): v is GetVehicleResponse => Boolean(v))
  const vehiclesLoading = vehicleQueries.some((q) => q.isLoading)

  const headline = zone ? buildHeadline(zone) : null
  const open = zone !== null

  useEffect(() => {
    if (!open) return

    const allowMapInteractions = () => {
      // Vaul/Radix leaves body with pointer-events: none while the drawer is open.
      // This drawer is non-modal, so the map above it must stay interactive.
      document.body.style.pointerEvents = 'auto'
    }

    allowMapInteractions()
    const frame = requestAnimationFrame(allowMapInteractions)

    return () => {
      cancelAnimationFrame(frame)
      if (document.body.style.pointerEvents === 'auto') {
        document.body.style.pointerEvents = ''
      }
    }
  }, [open])

  return (
    <VaulDrawer.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      modal={false}
      noBodyStyles
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Content className="fixed inset-x-0 bottom-0 z-20 flex h-dvh flex-col rounded-t-3xl border-t border-white/8 bg-surface-1 outline-none shadow-2xl">
          <VaulDrawer.Title className="sr-only">
            {t('admin.pricing.drawer.title')}
          </VaulDrawer.Title>

          {zone && (
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pb-8 pt-6">
              <div>
                <p
                  className={cn(
                    'text-5xl font-bold leading-none tabular-nums',
                    multiplierToneClass(zone.avgMultiplier),
                  )}
                >
                  ×{zone.avgMultiplier.toFixed(2)}
                </p>
                {headline && (
                  <p className="mt-2 text-sm text-text-secondary">{headline}</p>
                )}
              </div>

              <div className="flex items-baseline gap-6 text-sm">
                <Stat
                  label={t('admin.pricing.oferta')}
                  value={zone.supplyCount}
                  unit={t('admin.pricing.unit.vehicles')}
                />
                <span className="text-text-muted">·</span>
                <Stat
                  label={t('admin.pricing.demanda')}
                  value={formatSignals(zone.demandCount)}
                  unit={t('admin.pricing.unit.signals')}
                />
              </div>

              {sampleIds.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-wider text-text-muted">
                    {t('admin.pricing.enZona')}
                  </p>
                  {vehiclesLoading && vehicles.length === 0 ? (
                    <p className="text-xs text-text-muted">
                      {t('general.loading')}
                    </p>
                  ) : (
                    <ul className="divide-y divide-white/5">
                      {vehicles.map((v) => (
                        <li
                          key={v.id}
                          className="flex items-baseline justify-between gap-3 py-2 text-sm"
                        >
                          <span className="truncate text-text-primary">
                            {v.brand} {v.model}
                          </span>
                          <span className="shrink-0 font-mono text-xs text-text-muted">
                            {fmt.plate(v.plate)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  )
}

interface StatProps {
  label: string
  value: string | number
  unit: string
}

function Stat({ label, value, unit }: StatProps) {
  return (
    <span className="text-text-primary">
      <span className="font-semibold tabular-nums">{value}</span>{' '}
      <span className="text-text-muted">
        {unit} · {label}
      </span>
    </span>
  )
}
