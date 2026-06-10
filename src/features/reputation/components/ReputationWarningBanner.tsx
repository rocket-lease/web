import { TriangleAlert } from 'lucide-react'
import { t } from '@/i18n/es'

interface ReputationWarningBannerProps {
  isLowReputation: boolean
  penaltyCount: number
}

export function ReputationWarningBanner({ isLowReputation, penaltyCount }: ReputationWarningBannerProps) {
  const isLow = isLowReputation || false;
  const count = penaltyCount || 0;

  if (!isLow && count === 0) {
    return null
  }

  const isSuspended = count >= 3

  let message = ''
  let variantClass = ''
  let iconClass = ''

  if (isSuspended) {
    message = t('reputation.banner.suspended')
    variantClass = 'bg-danger-bg border-danger/20 text-danger'
    iconClass = 'text-danger'
  } else if (count > 0) {
    message = t('reputation.banner.warning')
    variantClass = 'bg-warning-bg border-warning/20 text-warning'
    iconClass = 'text-warning'
  } else if (isLow) {
    message = t('reputation.banner.lowScore')
    variantClass = 'bg-warning-bg border-warning/20 text-warning'
    iconClass = 'text-warning'
  }

  return (
    <div className={`mx-4 mb-4 flex items-start gap-3 rounded-xl border p-3 ${variantClass}`}>
      <TriangleAlert className={`h-5 w-5 shrink-0 ${iconClass}`} />
      <p className="text-sm font-medium leading-tight pt-0.5">{message}</p>
    </div>
  )
}
