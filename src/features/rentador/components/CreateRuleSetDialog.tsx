import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'
import { Switch } from '@/ui/switch'
import { Slider } from '@/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { t } from '@/i18n/es'
import { useCreateReservationRuleSet } from '@/features/rentador/hooks/useReservationRules'
import {
  useRuleSetScopePreference,
  type RuleSetScope,
} from '@/features/rentador/hooks/useRuleSetScopePreference'
import { getCancellationPolicyLabel } from '@/features/vehiculos/utils/rules-formatter'
import { RuleSetScopeDialog } from './RuleSetScopeDialog'
import type {
  CancellationPolicy,
  CreateReservationRuleSetRequest,
  CreateReservationRuleSetResponse,
} from '@rocket-lease/contracts'

interface CreateRuleSetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * Si está seteado, al guardar se ofrece elegir entre crear el set como
   * privado de este vehículo o como compartido. Si no se setea, el set se
   * crea siempre como compartido (`vehicleId: null`).
   */
  vehicleIdForPrivateOption?: string
  /**
   * Nombre del vehículo para mostrar en el modal de scope.
   */
  vehicleNameForScopeDialog?: string
  /**
   * Callback al guardar exitosamente. Útil para autoseleccionar el set
   * recién creado en un selector externo.
   */
  onCreated?: (response: CreateReservationRuleSetResponse, scope: RuleSetScope) => void
}

const DEFAULT_DEPOSIT_PERCENTAGE = 30

export function CreateRuleSetDialog({
  open,
  onOpenChange,
  vehicleIdForPrivateOption,
  vehicleNameForScopeDialog = '',
  onCreated,
}: CreateRuleSetDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>('FLEXIBLE')
  const [depositEnabled, setDepositEnabled] = useState(false)
  const [depositPercentage, setDepositPercentage] = useState<number>(DEFAULT_DEPOSIT_PERCENTAGE)
  const [depositInput, setDepositInput] = useState(String(DEFAULT_DEPOSIT_PERCENTAGE))
  const [kmType, setKmType] = useState<'UNLIMITED' | 'LIMITED'>('UNLIMITED')
  const [kmValue, setKmValue] = useState('1000')
  const [minDays, setMinDays] = useState('')
  const [maxDays, setMaxDays] = useState('')

  const [scopePromptOpen, setScopePromptOpen] = useState(false)
  const scopePref = useRuleSetScopePreference()

  const createMutation = useCreateReservationRuleSet()

  const commitDeposit = () => {
    const parsed = Number(depositInput)
    if (isNaN(parsed)) { setDepositInput(String(depositPercentage)); return }
    const snapped = Math.round(parsed / 5) * 5
    const clamped = Math.min(50, Math.max(10, snapped))
    setDepositPercentage(clamped)
    setDepositInput(String(clamped))
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setCancellationPolicy('FLEXIBLE')
    setDepositEnabled(false)
    setDepositPercentage(DEFAULT_DEPOSIT_PERCENTAGE)
    setDepositInput(String(DEFAULT_DEPOSIT_PERCENTAGE))
    setKmType('UNLIMITED')
    setKmValue('1000')
    setMinDays('')
    setMaxDays('')
  }

  const buildPayload = (scope: RuleSetScope): CreateReservationRuleSetRequest => {
    const vehicleId =
      scope === 'PRIVATE' && vehicleIdForPrivateOption ? vehicleIdForPrivateOption : null

    return {
      name: name.trim(),
      description: description.trim() || undefined,
      cancellationPolicy,
      depositPercentage: depositEnabled ? depositPercentage : null,
      maxKilometrage:
        kmType === 'UNLIMITED'
          ? { type: 'UNLIMITED' }
          : { type: 'LIMITED', value: parseInt(kmValue, 10) },
      rentalTimeConstraints: {
        minDays: minDays ? parseInt(minDays, 10) : undefined,
        maxDays: maxDays ? parseInt(maxDays, 10) : undefined,
      },
      vehicleId,
    }
  }

  const submitWithScope = (scope: RuleSetScope) => {
    const payload = buildPayload(scope)
    createMutation.mutate(payload, {
      onSuccess: (response) => {
        onCreated?.(response, scope)
        resetForm()
        onOpenChange(false)
      },
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error(t('reservationRules.nameRequired'))
      return
    }

    if (!vehicleIdForPrivateOption) {
      submitWithScope('SHARED')
      return
    }

    const stored = scopePref.get()
    if (stored) {
      submitWithScope(stored)
      return
    }

    setScopePromptOpen(true)
  }

  const handleScopeChoose = (scope: RuleSetScope, remember: boolean) => {
    if (remember) {
      scopePref.set(scope)
    }
    setScopePromptOpen(false)
    submitWithScope(scope)
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-overlay-in"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-2xl bg-surface-1 border-t border-white/8 max-h-[85svh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <p className="font-semibold text-text-primary">{t('reservationRules.createNew')}</p>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-4 space-y-4 pb-8">
          <div className="space-y-2">
            <Label htmlFor="name">{t('reservationRules.name')}</Label>
            <Input
              id="name"
              placeholder={t('reservationRules.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={createMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('reservationRules.createDescription')}</Label>
            <Textarea
              id="description"
              placeholder={t('reservationRules.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createMutation.isPending}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>{t('reservationRules.cancellationPolicy')}</Label>
            <Select value={cancellationPolicy} onValueChange={(v) => setCancellationPolicy(v as CancellationPolicy)}>
              <SelectTrigger disabled={createMutation.isPending}>
                <SelectValue>{getCancellationPolicyLabel(cancellationPolicy)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FLEXIBLE">{getCancellationPolicyLabel('FLEXIBLE')}</SelectItem>
                <SelectItem value="MODERATE">{getCancellationPolicyLabel('MODERATE')}</SelectItem>
                <SelectItem value="STRICT">{getCancellationPolicyLabel('STRICT')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sección de seña: switch + slider */}
          <div className="space-y-3 rounded-xl border border-white/8 bg-surface-2 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="deposit-switch">{t('reservationRules.deposit.enable')}</Label>
                {!depositEnabled && (
                  <p className="text-xs text-text-muted">{t('reservationRules.deposit.none')}</p>
                )}
              </div>
              <Switch
                id="deposit-switch"
                checked={depositEnabled}
                onCheckedChange={setDepositEnabled}
                disabled={createMutation.isPending}
                aria-label={t('reservationRules.deposit.enable')}
              />
            </div>
            {depositEnabled && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {t('reservationRules.deposit.label')}
                  </span>
                  <span
                    className="flex items-baseline gap-0.5 text-base font-semibold text-brand-400"
                    aria-live="polite"
                    data-testid="deposit-percentage-display"
                  >
                    <input
                      type="number"
                      inputMode="numeric"
                      min={10}
                      max={50}
                      step={5}
                      value={depositInput}
                      onChange={(e) => setDepositInput(e.target.value)}
                      onBlur={commitDeposit}
                      onKeyDown={(e) => e.key === 'Enter' && commitDeposit()}
                      disabled={createMutation.isPending}
                      className="w-8 bg-transparent text-right text-base font-semibold text-brand-400 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    %
                  </span>
                </div>
                <Slider
                  value={depositPercentage}
                  onValueChange={(v) => { setDepositPercentage(v); setDepositInput(String(v)) }}
                  min={10}
                  max={50}
                  step={5}
                  disabled={createMutation.isPending}
                  aria-label={t('reservationRules.deposit.label')}
                />
                <p className="text-xs text-text-muted">{t('reservationRules.deposit.sliderHint')}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('reservationRules.maxKilometrage')}</Label>
            <div className="flex gap-2">
              <Select value={kmType} onValueChange={(v) => setKmType(v as 'UNLIMITED' | 'LIMITED')}>
                <SelectTrigger className="flex-1" disabled={createMutation.isPending}>
                  <SelectValue>{kmType === 'UNLIMITED' ? t('reservationRules.kilometrage.unlimited') : t('reservationRules.kilometrage.limited')}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNLIMITED">{t('reservationRules.kilometrage.unlimited')}</SelectItem>
                  <SelectItem value="LIMITED">{t('reservationRules.kilometrage.limited')}</SelectItem>
                </SelectContent>
              </Select>
              {kmType === 'LIMITED' && (
                <Input
                  type="number"
                  placeholder="1000"
                  value={kmValue}
                  onChange={(e) => setKmValue(e.target.value)}
                  disabled={createMutation.isPending}
                  min="1"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="minDays">{t('reservationRules.minDays')}</Label>
              <Input
                id="minDays"
                type="number"
                placeholder="1"
                value={minDays}
                onChange={(e) => setMinDays(e.target.value)}
                disabled={createMutation.isPending}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDays">{t('reservationRules.maxDays')}</Label>
              <Input
                id="maxDays"
                type="number"
                placeholder="1"
                value={maxDays}
                onChange={(e) => setMaxDays(e.target.value)}
                disabled={createMutation.isPending}
                min="1"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {t('general.cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="flex-1">
              {createMutation.isPending ? t('general.saving') : t('reservationRules.create')}
            </Button>
          </div>
        </form>
      </div>

      <RuleSetScopeDialog
        open={scopePromptOpen}
        vehicleName={vehicleNameForScopeDialog}
        onChoose={handleScopeChoose}
        onCancel={() => setScopePromptOpen(false)}
      />
    </>
  )
}
