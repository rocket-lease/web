import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { useBulkUpdatePrices } from '@/features/rentador/hooks/useBulkUpdatePrices'
import { useActiveReservationsCount } from '@/features/rentador/hooks/useActiveReservationsCount'
import type { BulkPriceOperation } from '@rocket-lease/contracts'
import type { ProblemDetails } from '@rocket-lease/contracts'

type Step = 'form' | 'preview'
type OperationType = 'SET' | 'PERCENTAGE'

interface VehicleSummary {
  id: string
  brand: string
  model: string
  year: number
  basePriceCents: number
}

interface BulkPriceDialogProps {
  open: boolean
  onClose: () => void
  vehicles: VehicleSummary[]
  selectedIds: Set<string>
}

function computeNewPrice(basePriceCents: number, operation: BulkPriceOperation): number {
  if (operation.type === 'SET') {
    return operation.valueCents
  }
  return Math.round(basePriceCents * (1 + operation.delta / 100))
}

function buildOperation(type: OperationType, rawValue: string): BulkPriceOperation | null {
  const num = Number(rawValue)
  if (!Number.isInteger(num) || isNaN(num)) return null
  if (type === 'SET') {
    if (num <= 0) return null
    return { type: 'SET', valueCents: num * 100 }
  }
  if (num < -99 || num > 1000) return null
  return { type: 'PERCENTAGE', delta: num }
}

const ERROR_CODE_MAP: Record<string, string> = {
  BULK_PRICE_VEHICLE_NOT_OWNED: t('bulkPrice.errors.notOwned'),
  BULK_PRICE_VEHICLE_UNAVAILABLE: t('bulkPrice.errors.unavailable'),
  BULK_PRICE_RESULT_INVALID: t('bulkPrice.errors.resultInvalid'),
}

/**
 * Dialog de dos pasos para ajustar precios de múltiples vehículos.
 * Step 'form': elige operación + valor.
 * Step 'preview': muestra tabla con precio actual → nuevo y alerta de reservas activas.
 */
export function BulkPriceDialog({ open, onClose, vehicles, selectedIds }: BulkPriceDialogProps) {
  const [step, setStep] = useState<Step>('form')
  const [operationType, setOperationType] = useState<OperationType>('SET')
  const [rawValue, setRawValue] = useState('')

  const mutation = useBulkUpdatePrices()

  const selectedVehicles = vehicles.filter(v => selectedIds.has(v.id))
  const selectedVehicleIds = selectedVehicles.map(v => v.id)

  const reservationsQuery = useActiveReservationsCount(selectedVehicleIds, step === 'preview')
  const counts = reservationsQuery.data?.counts ?? {}

  const totalActiveReservations = Object.values(counts).reduce((acc, n) => acc + n, 0)

  const operation = buildOperation(operationType, rawValue)

  const previews = selectedVehicles.map(v => {
    const newPrice = operation ? computeNewPrice(v.basePriceCents, operation) : 0
    return {
      ...v,
      newPriceCents: newPrice,
      isInvalid: newPrice <= 0,
    }
  })

  const hasInvalid = previews.some(p => p.isInvalid)

  const handleGoToPreview = () => {
    if (!operation) return
    setStep('preview')
  }

  const handleConfirm = () => {
    if (!operation || hasInvalid) return
    mutation.mutate(
      { vehicleIds: selectedVehicleIds, operation },
      {
        onSuccess: (data) => {
          toast.success(
            t('bulkPrice.successToast').replace('{count}', String(data.updated.length)),
          )
          handleClose()
        },
        onError: (err) => {
          const pd = err as unknown as ProblemDetails
          const message = ERROR_CODE_MAP[pd.code ?? ''] ?? t('error.default')
          toast.error(message)
        },
      },
    )
  }

  const handleClose = () => {
    setStep('form')
    setOperationType('SET')
    setRawValue('')
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-overlay-in"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-price-dialog-title"
        className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-2xl bg-surface-1 border-t border-white/8 max-h-[85svh] flex flex-col animate-slide-up"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <p id="bulk-price-dialog-title" className="font-semibold text-text-primary">{t('bulkPrice.dialogTitle')}</p>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4 pb-8">
          {step === 'form' && (
            <>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-text-primary mb-2">
                  {t('bulkPrice.dialogTitle')}
                </legend>
                <div className="grid grid-cols-2 gap-2" role="radiogroup">
                  {(['SET', 'PERCENTAGE'] as const).map((opt) => {
                    const selected = operationType === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => {
                          setOperationType(opt)
                          setRawValue('')
                        }}
                        className={`rounded-xl px-3 py-3 text-sm text-left transition-all ${
                          selected
                            ? 'bg-brand-500/15 text-text-primary'
                            : 'bg-surface-2 text-text-secondary hover:bg-surface-2/70'
                        }`}
                        style={
                          selected
                            ? {
                                borderWidth: '2px',
                                borderColor: 'var(--color-brand-500)',
                                boxShadow:
                                  '0 0 0 3px rgba(124,58,237,0.2), 0 6px 18px rgba(124,58,237,0.35)',
                              }
                            : { borderWidth: '2px', borderColor: 'transparent' }
                        }
                      >
                        {opt === 'SET'
                          ? t('bulkPrice.operationSet')
                          : t('bulkPrice.operationPercentage')}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="bulk-price-value">
                  {operationType === 'SET'
                    ? t('bulkPrice.inputAmountLabel')
                    : t('bulkPrice.inputPercentageLabel')}
                </Label>
                <Input
                  id="bulk-price-value"
                  type="number"
                  value={rawValue}
                  onChange={e => setRawValue(e.target.value)}
                  placeholder={operationType === 'SET' ? '5000' : '15'}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  className="flex-1"
                >
                  {t('general.cancel')}
                </Button>
                <Button
                  type="button"
                  disabled={!operation}
                  onClick={handleGoToPreview}
                  className="flex-1"
                >
                  {t('bulkPrice.viewPreview')}
                </Button>
              </div>
            </>
          )}

          {step === 'preview' && (
            <>
              <p className="text-sm font-medium text-text-primary">{t('bulkPrice.previewTitle')}</p>

              {reservationsQuery.isPending ? (
                <div className="flex items-center gap-2 rounded-lg bg-surface-2 border border-white/8 p-3 text-sm text-text-secondary">
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                  <span>{t('bulkPrice.checkingReservations')}</span>
                </div>
              ) : (
                totalActiveReservations > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 text-sm text-yellow-600">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      {t('bulkPrice.activeReservationsWarning').replace(
                        '{count}',
                        String(totalActiveReservations),
                      )}
                    </span>
                  </div>
                )
              )}

              <div className="space-y-2">
                {previews.map(p => (
                  <div
                    key={p.id}
                    className={`rounded-lg border p-3 flex items-center justify-between gap-2 ${
                      p.isInvalid
                        ? 'border-red-500/50 bg-red-500/10'
                        : 'border-surface-2 bg-surface-2'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {p.brand} {p.model} {p.year}
                      </p>
                      {p.isInvalid && (
                        <p className="text-xs text-red-500 mt-0.5">{t('bulkPrice.invalidPriceRow')}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-text-muted line-through">
                        {fmt.currency(p.basePriceCents)}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          p.isInvalid ? 'text-red-500' : 'text-text-primary'
                        }`}
                      >
                        {p.isInvalid ? '—' : fmt.currency(p.newPriceCents)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep('form')}
                  className="flex-1"
                  disabled={mutation.isPending}
                >
                  {t('general.back')}
                </Button>
                <Button
                  type="button"
                  disabled={hasInvalid || mutation.isPending || reservationsQuery.isPending}
                  onClick={handleConfirm}
                  className="flex-1"
                >
                  {t('bulkPrice.confirm').replace('{count}', String(selectedVehicles.length))}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
