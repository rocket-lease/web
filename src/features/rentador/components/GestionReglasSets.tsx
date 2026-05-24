import { useState } from 'react'
import { Plus, Trash2, Pencil, Gauge, Clock, Car } from 'lucide-react'
import { Button } from '@/ui/button'
import { Badge, type BadgeProps } from '@/ui/badge'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { t } from '@/i18n/es'
import {
  useReservationRuleSets,
  useDeleteReservationRuleSet,
} from '@/features/rentador/hooks/useReservationRules'
import {
  getCancellationPolicyLabel,
  getDepositLabel,
  formatMaxKilometrage,
  formatRentalTimeConstraints,
} from '@/features/vehiculos/utils/rules-formatter'
import { CreateRuleSetDialog } from './CreateRuleSetDialog'
import { EditRuleSetDialog } from './EditRuleSetDialog'
import type { CancellationPolicy, ReservationRuleSet } from '@rocket-lease/contracts'

const CANCELLATION_VARIANT: Record<CancellationPolicy, BadgeProps['variant']> = {
  FLEXIBLE: 'success',
  MODERATE: 'warning',
  STRICT: 'danger',
}

export function GestionReglasSets() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingSet, setEditingSet] = useState<ReservationRuleSet | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const ruleSetsQuery = useReservationRuleSets()
  const deleteRuleSetMutation = useDeleteReservationRuleSet()

  const ruleSets: ReservationRuleSet[] = ruleSetsQuery.data ?? []

  const handleEdit = (ruleSet: ReservationRuleSet) => {
    setEditingSet(ruleSet)
    setShowEditDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm(t('reservationRules.confirmDelete'))) {
      deleteRuleSetMutation.mutate(id)
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={t('reservationRules.title')}
        actions={
          <Button onClick={() => setShowCreateDialog(true)} size="sm">
            <Plus className="h-4 w-4" />
            {t('reservationRules.create')}
          </Button>
        }
      />

      {ruleSetsQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <p className="text-text-secondary">{t('general.loading')}</p>
        </div>
      ) : ruleSetsQuery.isError ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <p className="text-text-secondary">{t('error.default')}</p>
          <Button variant="secondary" onClick={() => ruleSetsQuery.refetch()}>
            {t('general.retry')}
          </Button>
        </div>
      ) : ruleSets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <p className="text-text-secondary">{t('reservationRules.empty')}</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            {t('reservationRules.createFirst')}
          </Button>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {ruleSets.map((ruleSet) => (
            <div key={ruleSet.id} className="rounded-2xl bg-surface-1 border border-white/6 overflow-hidden">
              {/* Header */}
              <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-base leading-tight">{ruleSet.name}</p>
                  {ruleSet.description && (
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">{ruleSet.description}</p>
                  )}
                </div>
                <div className="flex gap-0.5 shrink-0 -mt-1 -mr-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(ruleSet)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(ruleSet.id)}
                    disabled={deleteRuleSetMutation.isPending}
                    className="text-danger hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Badges */}
              <div className="px-4 pb-3 flex flex-wrap gap-2">
                <Badge variant={CANCELLATION_VARIANT[ruleSet.cancellationPolicy]}>
                  {getCancellationPolicyLabel(ruleSet.cancellationPolicy)}
                </Badge>
                <Badge variant={ruleSet.depositPercentage !== null ? 'default' : 'secondary'}>
                  {getDepositLabel(ruleSet.depositPercentage)}
                </Badge>
              </div>

              {/* Stats */}
              <div className="px-4 py-3 border-t border-white/6 flex flex-wrap gap-x-4 gap-y-1.5">
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Gauge className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  {formatMaxKilometrage(ruleSet.maxKilometrage)}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Clock className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  {formatRentalTimeConstraints(ruleSet.rentalTimeConstraints)}
                </span>
                {ruleSet.vehicleCount !== undefined && ruleSet.vehicleCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Car className="h-3.5 w-3.5 shrink-0" />
                    {ruleSet.vehicleCount} {ruleSet.vehicleCount === 1 ? t('reservationRules.vehicle') : t('reservationRules.vehicles')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateRuleSetDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      {editingSet && (
        <EditRuleSetDialog
          ruleSet={editingSet}
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open)
            if (!open) {
              setEditingSet(null)
            }
          }}
        />
      )}
    </div>
  )
}
