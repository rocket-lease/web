import { t } from '@/i18n/es'
import { ReviewCard } from '@/features/reviews/components/ReviewCard'
import { useUserReviews } from '@/features/reviews/hooks/useUserReviews'

interface OwnerReviewsSectionProps {
  userId: string
  /** Filtra qué reseñas mostrar: como rentador (a la persona y a sus autos) o como conductor. */
  role: 'conductor' | 'rentador'
}

/**
 * Reseñas recibidas por un usuario en el rol seleccionado, en su perfil público.
 * La sección solo se renderiza si hay reseñas para ese rol: si está vacía (o
 * todavía cargando), no se muestra nada para no ensuciar el perfil.
 */
export function OwnerReviewsSection({ userId, role }: OwnerReviewsSectionProps) {
  const { data: allReviews } = useUserReviews(userId)

  const reviews = (allReviews ?? []).filter((review) =>
    role === 'rentador'
      ? review.targetType === 'rentador' || review.targetType === 'vehicle'
      : review.targetType === 'conductor',
  )

  if (reviews.length === 0) return null

  return (
    <section className="mt-6">
      <div className="px-4 mb-3">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {t('perfil.reviewsTitle')}
        </p>
      </div>

      <div className="px-4 space-y-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  )
}
