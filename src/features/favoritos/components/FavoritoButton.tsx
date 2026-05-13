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
  const { toggle, isLoading } = useToggleFavorito()
  const isFavorito = favIds.has(vehicleId)

  return (
    <button
      type="button"
      aria-label={isFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={isFavorito}
      disabled={isLoading}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(vehicleId, isFavorito)
      }}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150',
        'bg-black/40 backdrop-blur-sm',
        'active:scale-90',
        isLoading && 'opacity-60 pointer-events-none',
        className,
      )}
    >
      <Heart
        size={18}
        weight={isFavorito ? 'fill' : 'regular'}
        color={isFavorito ? '#F59E0B' : '#ffffff'}
      />
    </button>
  )
}
