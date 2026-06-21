import { Link } from '@tanstack/react-router'
import type { Icon } from '@phosphor-icons/react'
import { useId } from 'react'

export interface NavTab {
  to: string
  /** Search params opcionales para la nav (ej: `{role: 'owner'}` para `/reservas?role=owner`). */
  search?: Record<string, string>
  icon: Icon
  label: string
  badge?: number
}

interface BottomNavProps {
  tabs: NavTab[]
  activeRole: 'conductor' | 'rentador'
}

const roleGradient = {
  conductor: { from: 'var(--color-client)', to: 'var(--color-brand-500)' },
  rentador:  { from: 'var(--color-owner)', to: 'var(--color-brand-500)' },
}

export function BottomNav({ tabs, activeRole }: BottomNavProps) {
  const uid = useId().replace(/:/g, '')
  const { from, to } = roleGradient[activeRole]

  return (
    <>
      {/*
        Global gradient defs — referenced via CSS fill: url(#id).
        Inline SVGs in the same HTML document share the same paint-server scope.
      */}
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute', overflow: 'hidden', pointerEvents: 'none' }}>
        <defs>
          <linearGradient id={`rl-g-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
      </svg>

      <style>{`
        [data-nav-active="${uid}"] svg path,
        [data-nav-active="${uid}"] svg circle,
        [data-nav-active="${uid}"] svg rect,
        [data-nav-active="${uid}"] svg polygon {
          fill: url(#rl-g-${uid}) !important;
        }
        .rl-nav-label-active-${uid} {
          background: linear-gradient(135deg, ${from} 0%, ${to} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .rl-nav-badge-active-${uid} {
          background: linear-gradient(135deg, ${from} 0%, ${to} 100%);
        }
      `}</style>

      <nav
        className="shrink-0 bottom-nav"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        <div className="flex w-full">
          {tabs.map(tab => (
            <Link
              key={tab.to + JSON.stringify(tab.search ?? {})}
              to={tab.to}
              search={tab.search}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors duration-150"
            >
              {({ isActive }) => (
                <div
                  className="flex flex-col items-center gap-1"
                  {...(isActive ? { [`data-nav-active`]: uid } : {})}
                >
                  <div className="relative">
                    <tab.icon
                      size={22}
                      weight={isActive ? 'duotone' : 'regular'}
                      className={isActive ? undefined : 'text-text-muted'}
                    />
                    {tab.badge != null && tab.badge > 0 && (
                      <span
                        className={`absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white rl-nav-badge-active-${uid}`}
                      >
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium leading-none ${isActive ? `rl-nav-label-active-${uid}` : 'text-text-muted'}`}>
                    {tab.label}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
