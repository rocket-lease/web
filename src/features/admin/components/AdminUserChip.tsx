import { Star, User } from '@phosphor-icons/react'
import { useReputation } from '@/features/reputation/hooks/useReputation'
import { t } from '@/i18n/es'

interface AdminUserChipProps {
  userId: string
  role: 'conductor' | 'rentador'
}

export function AdminUserChip({ userId, role }: AdminUserChipProps) {
  const { data: rep } = useReputation(userId)
  const score = role === 'conductor' ? rep?.asDriver.score : rep?.asRenter.score

  const isConductor = role === 'conductor'
  const colorClass = isConductor ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/15 text-amber-400 border-amber-500/20'

  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${colorClass}`}>
      <User size={13} weight="duotone" className="shrink-0" />
      <span className="text-xs font-semibold">
        {isConductor ? t('admin.chat.canalConductor') : t('admin.chat.canalRentador')}
      </span>
      <span className="text-[10px] text-current/60 font-mono">#{userId.slice(0, 8)}</span>
      {score !== undefined && (
        <div className="ml-auto flex items-center gap-0.5">
          <Star size={11} weight="duotone" />
          <span className="text-[10px] font-semibold">{score.toFixed(1)}</span>
        </div>
      )}
    </div>
  )
}
