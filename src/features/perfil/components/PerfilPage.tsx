import {
  UserCheck,
  LogOut,
  Bell,
  ChevronRight,
  Shield,
  Star,
  Award,
  Settings,
  Rocket,
} from 'lucide-react'
import { Avatar } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Separator } from '@/ui/separator'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { t } from '@/i18n/es'

const levelColors: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-slate-300',
  gold: 'text-yellow-400',
  platinum: 'text-cyan-300',
}

const levelLabels: Record<string, string> = {
  bronze: t('perfil.level.bronze'),
  silver: t('perfil.level.silver'),
  gold: t('perfil.level.gold'),
  platinum: t('perfil.level.platinum'),
}

export function PerfilPage() {
  const { user, signOut } = useAuth()

  const profile = {
    fullName: user?.user_metadata?.full_name ?? 'Usuario',
    email: user?.email ?? '',
    avatarUrl: null as string | null,
    level: 'silver' as const,
    reputationScore: 4.7,
    reviewCount: 23,
    verificationStatus: 'verified' as const,
    isConductor: true,
    isRentador: false,
  }

  return (
    <div className="flex flex-col">
      <PageHeader title={t('perfil.title')} />

      {/* Profile hero */}
      <div className="px-4 py-6 flex flex-col items-center text-center gap-3">
        <Avatar
          src={profile.avatarUrl}
          fallback={profile.fullName}
          size="xl"
          className="ring-2 ring-brand-600/40 ring-offset-2 ring-offset-surface-0"
        />
        <div>
          <h2 className="text-xl font-bold text-text-primary">{profile.fullName}</h2>
          <p className="text-sm text-text-muted">{profile.email}</p>
        </div>

        {/* Level + reputation */}
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1.5">
            <Award className={`h-4 w-4 ${levelColors[profile.level]}`} />
            <span className="text-sm font-semibold text-text-primary">{levelLabels[profile.level]}</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="text-sm font-semibold text-text-primary">{profile.reputationScore}</span>
            <span className="text-xs text-text-muted">({profile.reviewCount})</span>
          </div>
        </div>

        {/* Verification */}
        <Badge variant={profile.verificationStatus === 'verified' ? 'success' : 'warning'}>
          <UserCheck className="h-3 w-3" />
          {profile.verificationStatus === 'verified' ? t('perfil.verified') : t('perfil.pendingVerification')}
        </Badge>
      </div>

      <Separator />

      {/* Become rentador banner */}
      {!profile.isRentador && (
        <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-brand-900 to-brand-800 border border-brand-700/30 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Publicá tu vehículo</p>
            <p className="text-xs text-text-muted mt-0.5">Generá ingresos alquilándolo</p>
          </div>
          <ChevronRight className="h-4 w-4 text-brand-400 shrink-0" />
        </div>
      )}

      {/* Settings menu */}
      <div className="px-4 mt-5 space-y-1">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">{t('perfil.settings')}</p>

        {[
          { icon: Bell, label: t('perfil.notifications') },
          { icon: Shield, label: t('perfil.verification') },
          { icon: Settings, label: 'Configuración' },
        ].map(item => (
          <button
            key={item.label}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors text-text-secondary"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 mt-6 mb-4">
        <Button
          variant="ghost"
          className="w-full text-danger hover:bg-danger-bg"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          {t('perfil.logout')}
        </Button>
      </div>
    </div>
  )
}
