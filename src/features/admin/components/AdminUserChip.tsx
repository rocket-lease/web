import { Star } from '@phosphor-icons/react'
import { Avatar } from '@/ui/avatar'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { useReputation } from '@/features/reputation/hooks/useReputation'
import { t } from '@/i18n/es'

interface AdminUserChipProps {
  userId: string
  role: 'conductor' | 'rentador'
}

export function AdminUserChip({ userId, role }: AdminUserChipProps) {
  const { data: profile } = useMyProfile(userId)
  const { data: rep } = useReputation(userId)
  const score = role === 'conductor' ? rep?.asDriver.score : rep?.asRenter.score

  const isConductor = role === 'conductor'
  const colorClass = isConductor
    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
  const roleLabel = isConductor ? t('admin.chat.canalConductor') : t('admin.chat.canalRentador')

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${colorClass}`}>
      <Avatar
        src={profile?.avatarUrl}
        alt={profile?.name}
        size="sm"
        fallback={profile?.name?.[0] ?? '?'}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">
          {profile?.name ?? `#${userId.slice(0, 8)}`}
        </p>
        <p className="text-[10px] opacity-70">{roleLabel}</p>
      </div>
      {score !== undefined && (
        <div className="flex items-center gap-0.5 shrink-0">
          <Star size={11} weight="duotone" />
          <span className="text-[10px] font-semibold">{score.toFixed(1)}</span>
        </div>
      )}
    </div>
  )
}
