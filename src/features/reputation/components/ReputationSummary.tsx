import { Star, Award } from 'lucide-react'
import { t } from '@/i18n/es'
import type { ReputationBadge } from '@rocket-lease/contracts'
import { Badge } from '@/ui/badge'

interface ReputationSummaryProps {
  score: number
  reviewCount: number
  badges?: ReputationBadge[]
}

export function ReputationSummary({ score, reviewCount, badges = [] }: ReputationSummaryProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-warning text-warning shrink-0" />
        <span className="text-sm font-semibold text-text-primary">{score.toFixed(1)}</span>
        <span className="text-xs text-text-muted">({reviewCount})</span>
      </div>

      {badges.includes('conductor_destacado') && (
        <>
          <div className="h-3.5 w-px bg-white/10" />
          <Badge variant="warning" className="gap-1">
            <Award className="h-3.5 w-3.5 shrink-0" />
            <span>{t('reputation.badge.conductor_destacado')}</span>
          </Badge>
        </>
      )}
    </div>
  )
}
