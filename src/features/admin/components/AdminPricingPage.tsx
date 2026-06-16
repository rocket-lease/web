import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import type { AdminPricingZone } from '@rocket-lease/contracts'
import { Button } from '@/ui/button'
import { cn } from '@/lib/utils'
import { t } from '@/i18n/es'
import { useAdminPricingZones } from '../hooks/useAdminPricingZones'
import { PricingHexMap } from './PricingHexMap'
import { HexDetailDrawer } from './HexDetailDrawer'
import {
  PRICING_DEBUG_ENABLED,
  PricingDebugPanel,
} from './PricingDebugPanel'

export function AdminPricingPage() {
  const { data, isLoading, isError, isFetching, refetch } = useAdminPricingZones()
  const [selected, setSelected] = useState<AdminPricingZone | null>(null)

  const zones = data?.zones ?? []
  const hasZones = zones.length > 0

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">

      <div className="relative flex min-h-0 flex-1 flex-col">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center px-6 py-24">
            <p className="text-sm text-text-muted">{t('admin.pricing.cargando')}</p>
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
            <p className="text-sm text-text-secondary">{t('admin.pricing.errorCarga')}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              {t('general.retry')}
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="relative flex-1 overflow-hidden">
            <div className="absolute inset-0">
              <PricingHexMap
                zones={zones}
                onHexClick={setSelected}
                onMapClick={() => setSelected(null)}
                selectedH3Cell={selected?.h3Cell ?? null}
              />
            </div>

            {!hasZones && (
              <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-full border border-white/8 bg-surface-1/90 px-4 py-2 text-xs text-text-muted backdrop-blur">
                {t('admin.pricing.sinZonas')}
              </div>
            )}

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Actualizar"
              className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-1/90 px-3 py-1.5 text-xs font-medium text-text-secondary backdrop-blur transition-colors hover:text-text-primary disabled:opacity-60"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Actualizar
            </button>

            {PRICING_DEBUG_ENABLED && (
              <PricingDebugPanel
                selectedZone={selected}
                onChanged={() => refetch()}
              />
            )}

            <HexDetailDrawer zone={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>
    </div>
  )
}
