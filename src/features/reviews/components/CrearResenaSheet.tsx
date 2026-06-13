import { useEffect, useState } from 'react'
import { Star, X } from '@phosphor-icons/react'
import type { CreateReviewRequest, LevelUpInfo } from '@rocket-lease/contracts'
import { Drawer, DrawerContent } from '@/ui/drawer'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'
import { Button } from '@/ui/button'
import { t, type I18nKey } from '@/i18n/es'
import { useCreateReview } from '../hooks/useCreateReview'
import { LevelUpCelebrationModal } from '@/features/lealtad/components/LevelUpCelebrationModal'

type TargetType = CreateReviewRequest['targetType']

interface CrearResenaSheetProps {
  reservationId: string
  /** Opciones de targetType disponibles según el rol */
  availableTargets: TargetType[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TARGET_LABELS: Record<TargetType, I18nKey> = {
  vehicle: 'resenas.create.targetType.vehicle',
  rentador: 'resenas.create.targetType.rentador',
  conductor: 'resenas.create.targetType.conductor',
}

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  disabled: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className="p-0.5 disabled:opacity-50 transition-transform active:scale-125"
            aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          >
            <Star
              size={28}
              weight={star <= value ? 'fill' : 'regular'}
              className={
                star <= value ? 'text-amber-400' : 'text-white/20'
              }
            />
          </button>
        )
      })}
    </div>
  )
}

export function CrearResenaSheet({
  reservationId,
  availableTargets,
  open,
  onOpenChange,
}: CrearResenaSheetProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [levelUpData, setLevelUpData] = useState<LevelUpInfo | null>(null)
  const singleTarget = availableTargets.length === 1 ? availableTargets[0] : null
  const [manualTarget, setManualTarget] = useState<TargetType | null>(null)
  const targetType = singleTarget ?? manualTarget
  const mutation = useCreateReview(reservationId)
  const isBusy = mutation.isPending

  useEffect(() => {
    setManualTarget(null)
  }, [availableTargets])

  function handleClose() {
    if (isBusy) return
    setRating(0)
    setComment('')
    setManualTarget(null)
    setLevelUpData(null)
    onOpenChange(false)
  }

  function handleSubmit() {
    if (!targetType || rating === 0 || isBusy) return
    mutation.mutate(
      { targetType, rating, comment: comment.trim() },
      {
        onSuccess: (result) => {
          if (result.levelUp) {
            setLevelUpData(result.levelUp)
          } else {
            handleClose()
          }
        },
      },
    )
  }

  const canSubmit = targetType !== null && rating > 0 && !isBusy

  return (
    <>
      <Drawer open={open} onOpenChange={(next) => { if (!isBusy) onOpenChange(next) }}>
        <DrawerContent>
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <p className="font-semibold text-text-primary">
              {t('resenas.create.title')}
            </p>
            <button
              type="button"
              onClick={handleClose}
              disabled={isBusy}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-text-primary disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-2 pb-4 space-y-5">
            {/* Selector de targetType — oculto si solo hay una opción */}
            {!singleTarget && (
              <div className="space-y-2">
                <Label>{t('resenas.create.targetType.label')}</Label>
                <div className="flex gap-2">
                  {availableTargets.map((tgt) => (
                    <button
                      key={tgt}
                      type="button"
                      onClick={() => setManualTarget(tgt)}
                      disabled={isBusy}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                        targetType === tgt
                          ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                          : 'border-white/8 bg-surface-2 text-text-secondary hover:bg-surface-3'
                      } disabled:opacity-50`}
                    >
                      {t(TARGET_LABELS[tgt])}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="space-y-2">
              <Label>{t('resenas.create.rating.label')}</Label>
              <StarRating value={rating} onChange={setRating} disabled={isBusy} />
            </div>

            {/* Comentario */}
            <div className="space-y-1.5">
              <Label htmlFor="resena-comment">{t('resenas.create.comment.label')}</Label>
              <Textarea
                id="resena-comment"
                placeholder={t('resenas.create.comment.placeholder')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
                disabled={isBusy}
                className="resize-none"
              />
              <p className="text-xs text-text-muted text-right">{comment.length}/500</p>
            </div>
          </div>

          <div className="border-t border-white/6 bg-surface-1 px-5 py-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={handleClose} disabled={isBusy}>
                {t('general.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                {isBusy ? t('resenas.create.sending') : t('resenas.create.cta')}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <LevelUpCelebrationModal
        open={levelUpData !== null}
        onClose={handleClose}
        oldLevel={levelUpData?.oldLevel ?? 'bronze'}
        newLevel={levelUpData?.newLevel ?? 'bronze'}
        benefits={levelUpData?.benefits ?? []}
      />
    </>
  )
}
