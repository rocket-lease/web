import { useNavigate } from '@tanstack/react-router'
import { Star, SignOut, UserCircle } from '@phosphor-icons/react'
import { Avatar } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { authApi } from '@/features/auth/api/auth.api'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'

export function AdminPerfilPage() {
  const { data: profile, isLoading } = useMyProfile()
  const navigate = useNavigate()

  async function handleLogout() {
    await authApi.signOut()
    window.location.href = '/login'
  }

  if (isLoading) {
    return <div className="flex-1 px-4 py-8 text-sm text-text-muted">{t('general.loading')}</div>
  }

  if (!profile) return null

  const score = profile.reputationScore ?? 0

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-10 pt-6 space-y-5">
      {/* Identity card */}
      <div className="rounded-2xl bg-surface-1 border border-amber-500/20 p-5 flex items-center gap-4">
        <Avatar src={profile.avatarUrl} alt={profile.name} size="xl" fallback={profile.name?.[0]} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-text-primary text-lg truncate">{profile.name}</p>
          <p className="text-xs text-text-muted truncate">{profile.email}</p>
          <div className="mt-1.5 flex items-center gap-1 rounded-full w-fit bg-amber-500/15 px-2 py-0.5">
            <UserCircle size={11} className="text-amber-400" weight="duotone" />
            <span className="text-[10px] font-semibold text-amber-400">{t('admin.perfil.role')}</span>
          </div>
        </div>
      </div>

      {/* Reputation card */}
      <div className="rounded-2xl bg-surface-1 border border-white/6 p-5 space-y-3">
        <p className="text-sm font-semibold text-text-primary">{t('admin.perfil.reputation.title')}</p>
        <p className="text-xs text-text-muted">{t('admin.perfil.reputation.subtitle')}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Star size={22} weight="duotone" className="text-amber-400" />
            <span className="text-3xl font-bold text-text-primary tabular-nums">
              {score.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-text-muted">{t('admin.perfil.reputation.outOf')}</span>
        </div>
      </div>

      {/* Logout */}
      <div className="rounded-2xl bg-surface-1 border border-white/6 p-5">
        <p className="text-sm font-semibold text-text-primary mb-1">{t('admin.perfil.session.title')}</p>
        <p className="text-xs text-text-muted mb-4">{profile.email}</p>
        <Button
          variant="secondary"
          className="w-full border-danger/30 text-danger gap-2"
          onClick={() => void handleLogout()}
        >
          <SignOut size={16} />
          {t('admin.perfil.session.logout')}
        </Button>
      </div>
    </div>
  )
}
