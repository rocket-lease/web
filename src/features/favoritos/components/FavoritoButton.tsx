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
        'group flex h-16 w-16 items-start justify-end p-3.5 transition-all duration-150',
        'bg-gradient-to-bl from-black/70 via-black/30 to-transparent rounded-bl-[2.5rem]',
        'active:opacity-80',
        isLoading && 'opacity-60 pointer-events-none',
        className,
      )}
    >
      <Heart
        size={22}
        weight={isFavorito ? 'fill' : 'regular'}
        color={isFavorito ? '#F59E0B' : '#ffffff'}
        className="transition-transform group-active:scale-90"
      />
    </button>
  )
}
