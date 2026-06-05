import { X } from 'lucide-react'
import type { AdminPricingZone } from '@rocket-lease/contracts'
import { t } from '@/i18n/es'

interface HexDetailDrawerProps {
  zone: AdminPricingZone | null
  onClose: () => void
}

/**
 * Panel lateral con el detalle de la celda H3 seleccionada en el mapa de
 * pricing del admin: oferta, demanda, ratio y multiplier promedio.
 */
export function HexDetailDrawer({ zone, onClose }: HexDetailDrawerProps) {
  if (!zone) return null

  const ratioLabel = zone.supplyCount === 0
    ? '—'
    : zone.ratio.toFixed(2)

  return (
    <aside
      role="dialog"
      aria-label={t('admin.pricing.drawer.title')}
      className="pointer-events-auto absolute right-4 top-4 flex w-80 max-w-[calc(100%-2rem)] flex-col gap-4 rounded-2xl border border-white/8 bg-surface-1 p-5 shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-text-muted">
            {t('admin.pricing.drawer.cell')}
          </p>
          <p className="truncate text-sm font-mono text-text-primary">{zone.h3Cell}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('admin.pricing.drawer.close')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-2 hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric label={t('admin.pricing.oferta')} value={zone.supplyCount.toString()} />
        <Metric label={t('admin.pricing.demanda')} value={zone.demandCount.toString()} />
        <Metric label={t('admin.pricing.drawer.ratio')} value={ratioLabel} />
        <Metric
          label={t('admin.pricing.multiplierPromedio')}
          value={`×${zone.avgMultiplier.toFixed(2)}`}
        />
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-text-muted">
          {t('admin.pricing.drawer.topVehiculos')}
        </p>
        {zone.vehicleSampleIds.length === 0 ? (
          <p className="text-xs text-text-muted">{t('admin.pricing.sinDatos')}</p>
        ) : (
          <ul className="space-y-1">
            {zone.vehicleSampleIds.map((id) => (
              <li
                key={id}
                className="truncate font-mono text-xs text-text-secondary"
                title={id}
              >
                {id}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}

interface MetricProps {
  label: string
  value: string
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-white/8 bg-surface-2 p-3">
      <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold text-text-primary">{value}</p>
    </div>
  )
}
