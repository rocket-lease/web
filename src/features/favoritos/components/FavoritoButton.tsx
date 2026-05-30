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
        'group flex h-8 w-8 items-center justify-center transition-all duration-150 active:scale-90',
        className,
      )}
    >
      <Heart
        size={22}
        weight={isFavorito ? 'fill' : 'regular'}
        color={isFavorito ? '#F59E0B' : '#ffffff'}
        className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
      />
    </button>
  )
}
