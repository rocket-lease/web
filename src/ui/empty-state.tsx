import type { ReactNode } from 'react'

interface EmptyStateProps {
  /** Ícono ya configurado (≈26px), color text-text-muted. Solo se usa en `default`. */
  icon?: ReactNode
  title: string
  description?: string
  /** CTA opcional (botón o link) que se muestra debajo del texto. */
  action?: ReactNode
  /**
   * `default`: bloque centrado (ícono + título + subtítulo) a página/lista completa.
   * `compact`: una línea de texto gris para secciones embebidas dentro de una página
   * con más contenido (reseñas y vehículos en el perfil, reseñas en el detalle).
   */
  variant?: 'default' | 'compact'
  className?: string
}

/**
 * Estado vacío estándar de la app. Unifica el look de todas las listas/secciones
 * sin datos (reservas, favoritos, reseñas, notificaciones, etc.).
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  if (variant === 'compact') {
    return <p className={`py-6 text-center text-sm text-text-muted ${className ?? ''}`}>{title}</p>
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-center ${className ?? ''}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-1">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-text-primary">{title}</p>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
