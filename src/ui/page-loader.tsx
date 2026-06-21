import { Spinner } from '@phosphor-icons/react'

/**
 * Indicador de carga centrado para páginas de detalle o formularios, donde no hay
 * una "forma" de contenido clara que anticipar con un skeleton. Para listas, usar
 * skeletons que imiten las cards/filas reales en su lugar.
 */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={`flex flex-1 items-center justify-center py-20 ${className ?? ''}`}>
      <Spinner className="h-7 w-7 animate-spin text-text-muted" />
    </div>
  )
}
