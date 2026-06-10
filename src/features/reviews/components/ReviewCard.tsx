import { User } from 'lucide-react'
import { Star } from '@phosphor-icons/react'
import type { ReviewItem } from '@rocket-lease/contracts'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { Avatar } from '@/ui/avatar'
import { Badge } from '@/ui/badge'

interface ReviewCardProps {
  review: ReviewItem
}

const TARGET_LABELS: Record<string, string> = {
  vehicle: t('historial.resenas.targetType.vehicle'),
  rentador: t('historial.resenas.targetType.rentador'),
  conductor: t('historial.resenas.targetType.conductor'),
}

export function ReviewCard({ review }: ReviewCardProps) {
  const targetLabel = TARGET_LABELS[review.targetType] ?? ''

  return (
    <div className="bg-surface-1 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <User className="h-4 w-4" />
          </Avatar>
          <span className="text-sm font-medium text-text-primary">
            {review.reviewerName}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          {targetLabel}
        </Badge>
      </div>

      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={16}
            weight={i < review.rating ? 'fill' : 'regular'}
            className={i < review.rating ? 'text-amber-400' : 'text-white/20'}
          />
        ))}
        <span className="ml-1.5 text-xs text-text-muted">
          {fmt.rating(review.rating)}
        </span>
      </div>

      {review.comment && (
        <p className="text-sm text-text-secondary leading-relaxed">
          {review.comment}
        </p>
      )}

      <p className="text-xs text-text-muted">
        {fmt.dateShort(review.createdAt)}
      </p>
    </div>
  )
}
