import { Spinner, ChatCircleDots } from '@phosphor-icons/react'
import { t } from '@/i18n/es'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useRentadorReviews } from '../hooks/useRentadorReviews'
import { ReviewCard } from './ReviewCard'

export function ResenasPage() {
  const { data: reviews, isLoading, isError } = useRentadorReviews()

  return (
    <div className="flex flex-col min-h-dvh bg-surface-0">
      <PageHeader
        title={t('historial.resenas.title')}
        showBack
        icon={<ChatCircleDots size={20} weight="regular" />}
      />

      <div className="flex-1 px-4 pt-4 space-y-3 pb-24">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-6 w-6 animate-spin text-text-muted" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-text-muted">{t('historial.resenas.error')}</p>
          </div>
        )}

        {reviews?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ChatCircleDots size={40} className="text-white/10 mb-3" />
            <p className="text-sm text-text-primary font-medium">
              {t('historial.resenas.empty')}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {t('historial.resenas.emptyHint')}
            </p>
          </div>
        )}

        {reviews?.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}
