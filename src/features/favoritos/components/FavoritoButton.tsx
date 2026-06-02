import { Heart } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useFavoritoIds } from '../hooks/useFavoritos'
import { useToggleFavorito } from '../hooks/useToggleFavorito'

interface FavoritoButtonProps {
  vehicleId: string
  className?: string
}

export function FavoritoButton({ vehicleId, className }: FavoritoButtonProps) {
  const favIds = useFavoritoIds()
  const { toggle } = useToggleFavorito()
  const isFavorito = favIds.has(vehicleId)

  return (
    <button
      type="button"
      aria-label={isFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={isFavorito}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(vehicleId, isFavorito)
      }}
      className={cn(
        'group relative flex h-7 w-7 items-center justify-center transition-all duration-150 active:scale-90 before:absolute before:-inset-2 before:content-[""]',
        className,
      )}
    >
      <Heart
        size={22}
        weight="fill"
        color={isFavorito ? '#F59E0B' : 'rgba(0,0,0,0.65)'}
        stroke="white"
        strokeWidth={32}
        style={{ paintOrder: 'stroke fill' }}
      />
    </button>
  )
}
