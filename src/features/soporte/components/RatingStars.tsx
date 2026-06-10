import { Star } from '@phosphor-icons/react'

interface RatingStarsProps {
  value: number | null
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: number
}

export function RatingStars({ value, onChange, readonly = false, size = 32 }: RatingStarsProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'active:scale-110 hover:scale-110'}`}
          aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            weight={(value !== null && value !== undefined && star <= value) ? 'fill' : 'regular'}
            className={(value !== null && value !== undefined && star <= value)
              ? 'text-amber-400'
              : 'text-text-muted'}
          />
        </button>
      ))}
    </div>
  )
}
