import * as React from 'react'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
}

function Avatar({ src, alt, size = 'md', fallback, className, ...props }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  const sizeClass = sizeMap[size]

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 border border-white/10',
        sizeClass,
        className,
      )}
      {...props}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt ?? ''}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : fallback ? (
        <span className="font-semibold text-text-secondary select-none">{fallback.slice(0, 2).toUpperCase()}</span>
      ) : (
        <User className="h-1/2 w-1/2 text-text-muted" />
      )}
    </div>
  )
}

export { Avatar }
