import { Button } from '@/ui/button'
import { t } from '@/i18n/es'

interface VehicleSelectionBarProps {
  selectedCount: number
  totalCount: number
  onCancel: () => void
  onContinue: () => void
}

/**
 * Barra sticky en la parte inferior de la pantalla que aparece cuando
 * el rentador está en modo selección para el ajuste masivo de precios.
 */
export function VehicleSelectionBar({
  selectedCount,
  totalCount,
  onCancel,
  onContinue,
}: VehicleSelectionBarProps) {
  const label = t('bulkPrice.selectedCount')
    .replace('{count}', String(selectedCount))
    .replace('{total}', String(totalCount))

  return (
    <div
      className="fixed left-0 right-0 z-[60] border-t border-surface-2 bg-surface-1 p-4 flex items-center justify-between gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)' }}
    >
      <p className="text-sm text-text-secondary">{label}</p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          {t('bulkPrice.exitSelectionMode')}
        </Button>
        <Button size="sm" disabled={selectedCount === 0} onClick={onContinue}>
          {t('bulkPrice.continue')}
        </Button>
      </div>
    </div>
  )
}
