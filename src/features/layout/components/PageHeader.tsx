import { useRouter } from '@tanstack/react-router'
import { CaretLeft } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  actions?: React.ReactNode
  icon?: React.ReactNode
  className?: string
  /** Fija el header al tope del viewport al scrollear. Útil en pantallas inmersivas sin header global. */
  sticky?: boolean
}

export function PageHeader({ title, subtitle, showBack = false, onBack, actions, icon, className, sticky = false }: PageHeaderProps) {
  const router = useRouter()

  return (
    <header
      className={cn(
        'flex items-center gap-3 px-4 py-4 border-b border-white/6 bg-surface-0',
        sticky && 'sticky top-0 z-40 bg-surface-0/90 backdrop-blur-md',
        className,
      )}
      style={sticky ? { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' } : undefined}
    >
      {showBack && (
        <button
          onClick={() => onBack ? onBack() : router.history.back()}
          aria-label="Volver"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text-secondary hover:text-text-primary transition-colors shrink-0 active:scale-[0.97]"
        >
          <CaretLeft size={16} weight="regular" />
        </button>
      )}

      {icon && (
        <div className="shrink-0 text-brand-500">{icon}</div>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-bold leading-tight text-text-primary truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  )
}
