import { Link } from '@tanstack/react-router'
import { WarningCircle } from '@phosphor-icons/react'
import { t } from '@/i18n/es'

interface LevelProgressBarProps {
  totalXp: number
  xpForNextLevel: number | null
  progress: number | null
  pendingXp: number
  pendingCount: number
  level: string
}

const LEVEL_COLORS: Record<string, string> = {
  bronze: 'bg-amber-500',
  silver: 'bg-slate-300',
  gold: 'bg-yellow-400',
  platinum: 'bg-cyan-300',
}

const LEVEL_TEXT_COLORS: Record<string, string> = {
  bronze: 'text-amber-500',
  silver: 'text-slate-300',
  gold: 'text-yellow-400',
  platinum: 'text-cyan-300',
}

export function LevelProgressBar({ totalXp, xpForNextLevel, progress, pendingXp, pendingCount, level }: LevelProgressBarProps) {
  const barColor = LEVEL_COLORS[level] ?? 'bg-brand-500'
  const textColor = LEVEL_TEXT_COLORS[level] ?? 'text-brand-400'

  if (xpForNextLevel === null) {
    return (
      <div className="rounded-2xl bg-surface-1 p-4">
        <div className={`text-center text-sm font-semibold ${textColor}`}>
          {t('lealtad.noNextLevel')}
        </div>
        <p className="text-center text-xs text-text-muted mt-1">{totalXp.toLocaleString('es-AR')} XP</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {pendingXp > 0 && (
        <div className="flex items-start gap-2 rounded-xl bg-warning/10 border border-warning/20 px-3 py-2.5">
          <WarningCircle size={18} className="shrink-0 mt-0.5 text-warning" weight="fill" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-warning/90 leading-relaxed">
              {t('lealtad.pendingXp')
                .replace('{xp}', pendingXp.toLocaleString('es-AR'))
                .replace('{count}', String(pendingCount))}
            </p>
          </div>
          {pendingCount > 0 && (
            <Link
              to="/perfil/lealtad"
              className="shrink-0 text-xs font-semibold text-warning underline underline-offset-2 hover:text-warning/80 transition-colors whitespace-nowrap"
            >
              {t('lealtad.leaveReview')}
            </Link>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-surface-1 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">{t('lealtad.currentLevel')}</span>
          <span className="text-text-muted">{totalXp.toLocaleString('es-AR')} / {xpForNextLevel.toLocaleString('es-AR')} XP</span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(progress ?? 0, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
