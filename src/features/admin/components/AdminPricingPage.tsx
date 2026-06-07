import { useState } from 'react'
import type { AdminPricingZone } from '@rocket-lease/contracts'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'
import { useAdminPricingZones } from '../hooks/useAdminPricingZones'
import { PricingHexMap } from './PricingHexMap'
import { HexDetailDrawer } from './HexDetailDrawer'

export function AdminPricingPage() {
  const { data, isLoading, isError, refetch } = useAdminPricingZones()
  const [selected, setSelected] = useState<AdminPricingZone | null>(null)

  const zones = data?.zones ?? []
  const hasZones = zones.length > 0

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <PageHeader title={t('admin.pricing.titulo')} subtitle={t('admin.pricing.subtitulo')} showBack />

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

            <HexDetailDrawer zone={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>
    </div>
  )
}
