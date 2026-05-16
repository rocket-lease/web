import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'
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
  getCancellationPolicyLabel,
  getDepositLabel,
} from '@/features/vehiculos/utils/rules-formatter'
import type {
  CancellationPolicy,
  Deposit,
  CreateReservationRuleSetRequest,
} from '@rocket-lease/contracts'

interface CreateRuleSetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRuleSetDialog({ open, onOpenChange }: CreateRuleSetDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>('FLEXIBLE')
  const [deposit, setDeposit] = useState<Deposit>('NONE')
  const [kmType, setKmType] = useState<'UNLIMITED' | 'LIMITED'>('UNLIMITED')
  const [kmValue, setKmValue] = useState('1000')
  const [minDays, setMinDays] = useState('')
  const [maxDays, setMaxDays] = useState('')

  const createMutation = useCreateReservationRuleSet()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert(t('reservationRules.nameRequired'))
      return
    }

    const payload: CreateReservationRuleSetRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      cancellationPolicy,
      deposit,
      maxKilometrage:
        kmType === 'UNLIMITED'
          ? { type: 'UNLIMITED' }
          : { type: 'LIMITED', value: parseInt(kmValue, 10) },
      rentalTimeConstraints: {
        minDays: minDays ? parseInt(minDays, 10) : undefined,
        maxDays: maxDays ? parseInt(maxDays, 10) : undefined,
      },
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        setName('')
        setDescription('')
        setCancellationPolicy('FLEXIBLE')
        setDeposit('NONE')
        setKmType('UNLIMITED')
        setKmValue('1000')
        setMinDays('')
        setMaxDays('')
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('reservationRules.createNew')}</DialogTitle>
          <DialogDescription>{t('reservationRules.createDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
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

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('reservationRules.createDescription')}</Label>
            <Textarea
              id="description"
              placeholder={t('reservationRules.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createMutation.isPending}
              rows={2}
            />
          </div>

          {/* Política de cancelación */}
          <div className="space-y-2">
            <Label>{t('reservationRules.cancellationPolicy')}</Label>
            <Select value={cancellationPolicy} onValueChange={(v) => setCancellationPolicy(v as CancellationPolicy)}>
              <SelectTrigger disabled={createMutation.isPending}>
                <SelectValue>{cancellationPolicy ? getCancellationPolicyLabel(cancellationPolicy) : ''}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FLEXIBLE">{getCancellationPolicyLabel('FLEXIBLE')}</SelectItem>
                <SelectItem value="MODERATE">{getCancellationPolicyLabel('MODERATE')}</SelectItem>
                <SelectItem value="STRICT">{getCancellationPolicyLabel('STRICT')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seña */}
          <div className="space-y-2">
            <Label>{t('reservationRules.deposit')}</Label>
            <Select value={deposit} onValueChange={(v) => setDeposit(v as Deposit)}>
              <SelectTrigger disabled={createMutation.isPending}>
                <SelectValue>{deposit ? getDepositLabel(deposit) : ''}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">{getDepositLabel('NONE')}</SelectItem>
                <SelectItem value="TEN_PERCENT">{getDepositLabel('TEN_PERCENT')}</SelectItem>
                <SelectItem value="FIFTY_PERCENT">{getDepositLabel('FIFTY_PERCENT')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Kilometraje */}
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
                  min="0"
                />
              )}
            </div>
          </div>

          {/* Tiempo mínimo/máximo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="minDays">{t('reservationRules.minDays')}</Label>
              <Input
                id="minDays"
                type="number"
                placeholder="0"
                value={minDays}
                onChange={(e) => setMinDays(e.target.value)}
                disabled={createMutation.isPending}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDays">{t('reservationRules.maxDays')}</Label>
              <Input
                id="maxDays"
                type="number"
                placeholder="0"
                value={maxDays}
                onChange={(e) => setMaxDays(e.target.value)}
                disabled={createMutation.isPending}
                min="0"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
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
      </DialogContent>
    </Dialog>
  )
}
