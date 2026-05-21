import { useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { t } from '@/i18n/es'
import {
  useReservationRuleSets,
  useDeleteReservationRuleSet,
} from '@/features/rentador/hooks/useReservationRules'
import {
  getCancellationPolicyLabel,
  getDepositLabel,
} from '@/features/vehiculos/utils/rules-formatter'
import { CreateRuleSetDialog } from './CreateRuleSetDialog'
import { EditRuleSetDialog } from './EditRuleSetDialog'
import type { ReservationRuleSet } from '@rocket-lease/contracts'

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
            <Card key={ruleSet.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{ruleSet.name}</CardTitle>
                    {ruleSet.description && (
                      <CardDescription className="mt-1 text-sm">
                        {ruleSet.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        handleEdit(ruleSet)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(ruleSet.id)}
                      disabled={deleteRuleSetMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getCancellationPolicyLabel(ruleSet.cancellationPolicy)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getDepositLabel(ruleSet.depositPercentage)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-text-muted">
                  {ruleSet.maxKilometrage.type === 'LIMITED' && (
                    <p>
                      <span className="text-text-primary font-medium">Km máx:</span> {ruleSet.maxKilometrage.value}
                    </p>
                  )}
                  {(ruleSet.rentalTimeConstraints?.minDays || ruleSet.rentalTimeConstraints?.maxDays) && (
                    <p>
                      <span className="text-text-primary font-medium">Duración:</span>
                      {ruleSet.rentalTimeConstraints?.minDays && ` min ${ruleSet.rentalTimeConstraints.minDays}d`}
                      {ruleSet.rentalTimeConstraints?.minDays && ruleSet.rentalTimeConstraints?.maxDays && ' •'}
                      {ruleSet.rentalTimeConstraints?.maxDays && ` max ${ruleSet.rentalTimeConstraints.maxDays}d`}
                    </p>
                  )}
                </div>

                {ruleSet.vehicleCount !== undefined && (
                  <p className="text-xs text-text-muted">
                    {ruleSet.vehicleCount > 0
                      ? t('reservationRules.assignedTo') + ': ' + ruleSet.vehicleCount
                      : t('reservationRules.notAssigned')}
                  </p>
                )}
              </CardContent>
            </Card>
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
