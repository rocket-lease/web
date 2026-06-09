import { useState } from 'react'
import { Spinner, ChatCircleDots } from '@phosphor-icons/react'
import { t } from '@/i18n/es'
import { ReviewCard } from '@/features/reviews/components/ReviewCard'
import { useUserReviews } from '@/features/reviews/hooks/useUserReviews'
import { useRentadorReviews } from '@/features/reviews/hooks/useRentadorReviews'
import { useConductorReviews } from '@/features/reviews/hooks/useConductorReviews'

interface OwnerReviewsSectionProps {
  userId: string
}

export function OwnerReviewsSection({ userId }: OwnerReviewsSectionProps) {
  const { data: reviews, isLoading } = useUserReviews(userId)

  if (isLoading) {
    return (
      <section className="mt-6">
        <div className="px-4 mb-3">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
            {t('perfil.reviewsTitle')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      </section>
    )
  }

  return (
    <section className="mt-6">
      <div className="px-4 mb-3">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {t('perfil.reviewsTitle')}
        </p>
      </div>

      {!reviews || reviews.length === 0 ? (
        <div className="mx-4 rounded-2xl bg-surface-2 border border-white/5 px-4 py-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-1">
            <ChatCircleDots size={20} className="text-text-muted" weight="regular" />
          </div>
          <p className="text-sm font-medium text-text-secondary">{t('perfil.reviewsEmpty')}</p>
          <p className="mt-1 text-xs text-text-muted">{t('perfil.reviewsEmptyHint')}</p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  )
}

export function OwnReviewsSection() {
  const [tab, setTab] = useState<'rentador' | 'conductor'>('rentador')
  const rentadorQuery = useRentadorReviews()
  const conductorQuery = useConductorReviews()

  const isLoading = tab === 'rentador' ? rentadorQuery.isLoading : conductorQuery.isLoading
  const reviews = tab === 'rentador' ? rentadorQuery.data : conductorQuery.data

  return (
    <section className="mt-6">
      <div className="px-4 mb-3">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {t('perfil.reviewsTitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-3">
        <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => setTab('rentador')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === 'rentador'
                ? 'bg-surface-0 text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {t('perfil.reviews.tabRentador')}
          </button>
          <button
            type="button"
            onClick={() => setTab('conductor')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === 'conductor'
                ? 'bg-surface-0 text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {t('perfil.reviews.tabConductor')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <div className="mx-4 rounded-2xl bg-surface-2 border border-white/5 px-4 py-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-1">
            <ChatCircleDots size={20} className="text-text-muted" weight="regular" />
          </div>
          <p className="text-sm font-medium text-text-secondary">
            {tab === 'rentador' ? t('perfil.reviews.emptyRentador') : t('perfil.reviews.emptyConductor')}
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  )
}
