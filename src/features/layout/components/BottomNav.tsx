import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'

export interface NavTab {
  to: string
  icon: LucideIcon
  label: string
  badge?: number
}

interface BottomNavProps {
  tabs: NavTab[]
}

export function BottomNav({ tabs }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)', paddingLeft: '16px', paddingRight: '16px' }}
    >
      <div className="flex w-full max-w-md rounded-2xl bg-surface-1/95 backdrop-blur-xl border border-white/8 shadow-elevated overflow-hidden">
        {tabs.map(tab => (
          <Link
            key={tab.to}
            to={tab.to}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-text-muted transition-colors duration-150"
            activeProps={{ className: 'text-brand-400' }}
          >
            <div className="relative">
              <tab.icon className="h-5 w-5" strokeWidth={1.8} />
              {tab.badge != null && tab.badge > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
