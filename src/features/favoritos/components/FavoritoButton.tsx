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
        'group flex h-12 w-12 items-center justify-center transition-all duration-150',
        'active:opacity-80',
        isLoading && 'opacity-60 pointer-events-none',
        className,
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm transition-transform group-active:scale-90">
        <Heart
          size={20}
          weight={isFavorito ? 'fill' : 'regular'}
          color={isFavorito ? '#F59E0B' : '#ffffff'}
        />
      </span>
    </button>
  )
}
