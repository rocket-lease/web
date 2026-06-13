import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import {
  ChevronRight,
  Award,
  Settings,
  UserCircle,
  CreditCard,
  ArrowLeftRight,
  ShieldCheck,
} from 'lucide-react'
import { Avatar } from '@/ui/avatar'
import { Separator } from '@/ui/separator'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { fmt } from '@/lib/formatters'
import { OwnerVehiclesSection } from './OwnerVehiclesSection'
import { OwnerReviewsSection, OwnReviewsSection } from './OwnerReviewsSection'
import { t, type I18nKey } from '@/i18n/es'
import { Bell, Bank, Coins, Tag, Trophy, Headset, WarningCircle } from '@phosphor-icons/react'
import { useVerificationStatus } from '@/features/auth/hooks/useVerificationStatus'
import { ReputationSummary } from '@/features/reputation/components/ReputationSummary'
import { ReputationWarningBanner } from '@/features/reputation/components/ReputationWarningBanner'
import { useReputation } from '@/features/reputation/hooks/useReputation'

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

interface PerfilPageProps {
  profileId?: string
}

export function PerfilPage({ profileId }: PerfilPageProps) {
  const navigate = useNavigate()
  const { user, activeRole, setActiveRole } = useAuth()
  const {
    data: profile,
    isLoading,
    isOwnProfile,
  } = useMyProfile(profileId)
  const { status: verificationStatus } = useVerificationStatus()
  const identityVerification = profile?.identityVerification
  const driverLicenseVerification = profile?.driverLicenseVerification
  const identityVerified = identityVerification?.status === 'verified'
  const licenseVerified = driverLicenseVerification?.status === 'verified'
  const emailVerified = verificationStatus?.email ?? false

  const anyVerifRejected =
    identityVerification?.status === 'rejected' ||
    driverLicenseVerification?.status === 'rejected'
  const anyVerifPending =
    identityVerification?.status === 'pending' ||
    driverLicenseVerification?.status === 'pending'
  const allVerifDone = identityVerified && licenseVerified && emailVerified

  const { data: reputation } = useReputation(profile?.id)
  
  const canEdit = isOwnProfile || user?.id === profile?.id
  const [localViewingRole, setLocalViewingRole] = useState<'conductor' | 'rentador'>('rentador')
  const displayRole = canEdit ? activeRole : localViewingRole

  const currentReputation = displayRole === 'conductor' ? reputation?.asDriver : reputation?.asRenter
  const reviewCount = currentReputation?.reviewCount ?? 0
  const reputationScore = currentReputation?.score ?? 0

  const handleSwitchRole = () => {
    const next = activeRole === 'rentador' ? 'conductor' : 'rentador'
    setActiveRole(next)
  }

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('perfil.title')} showBack={!isOwnProfile} />
        <div className="px-4 py-8 text-sm text-text-muted">{t('general.loading')}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-20">
      <PageHeader
        title={canEdit ? t('perfil.title') : profile.name}
        showBack={!canEdit}
        actions={
          canEdit ? (
            <Link
              to="/notificaciones"
              aria-label={t('nav.notificaciones')}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2/80 text-text-secondary hover:text-text-primary transition-colors active:scale-95"
            >
              <Bell size={22} />
            </Link>
          ) : undefined
        }
      />

      {/* Profile hero */}
      <div className="px-4 py-5 flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar
            src={profile.avatarUrl}
            fallback={profile.name}
            size="xl"
            className="ring-2 ring-brand-600/40 ring-offset-2 ring-offset-surface-0"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-text-primary leading-tight truncate">{profile.name}</h2>
          
          {!canEdit && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setLocalViewingRole('rentador')}
                className={`text-xs px-2 py-0.5 rounded-full border ${displayRole === 'rentador' ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'border-white/10 text-text-muted hover:text-text-secondary'}`}
              >
                Como Rentador
              </button>
              <button
                onClick={() => setLocalViewingRole('conductor')}
                className={`text-xs px-2 py-0.5 rounded-full border ${displayRole === 'conductor' ? 'bg-client/20 border-client text-client' : 'border-white/10 text-text-muted hover:text-text-secondary'}`}
              >
                Como Conductor
              </button>
            </div>
          )}

          {canEdit && (
            <p className="text-sm text-text-muted truncate mt-0.5">{profile.email}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <ReputationSummary score={reputationScore} reviewCount={reviewCount} badges={currentReputation?.badges ?? []} />
            <div className="h-3.5 w-px bg-white/10" />
            <div className="flex items-center gap-1">
              <Award className={`h-3.5 w-3.5 shrink-0 ${levelColors[profile.level]}`} />
              <span className={`text-xs font-semibold ${levelColors[profile.level]}`}>{levelLabels[profile.level]}</span>
            </div>
          </div>
        </div>
      </div>

      {canEdit && profile && currentReputation && (
        <ReputationWarningBanner 
          isLowReputation={currentReputation.isLowReputation} 
          penaltyCount={currentReputation.penaltyCount} 
        />
      )}

      {canEdit && <Separator />}

      {/* Vehículos publicados (perfil ajeno) */}
      {!canEdit && profile && (
        <>
          <OwnerVehiclesSection ownerId={profile.id} />
        </>
      )}

      {/* Settings menu (solo perfil propio) */}
      {canEdit && (
        <div className="px-4 mt-5 space-y-1">
          <p className="text-xs font-medium text-text-secondary mb-3">{t('perfil.settings')}</p>

          <button
            type="button"
            onClick={() => navigate({ to: '/perfil/datos' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors"
          >
            <UserCircle className="h-5 w-5 shrink-0 text-text-secondary" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('perfil.datos.title')}</span>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>

          {/* Medios de pago: dónde el conductor paga (solo modo conductor) */}
          {activeRole === 'conductor' && (
            <button
              type="button"
              onClick={() => navigate({ to: '/perfil/medios-de-pago' })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors"
            >
              <CreditCard className="h-5 w-5 shrink-0 text-text-secondary" />
              <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('paymentMethods.title' as I18nKey)}</span>
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </button>
          )}

          {/* Cuentas bancarias: dónde el rentador recibe pagos (solo modo rentador) */}
          {activeRole === 'rentador' && (
            <button
              type="button"
              onClick={() => navigate({ to: '/perfil/cuentas' })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors"
            >
              <Bank size={20} className="shrink-0 text-text-secondary" />
              <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('perfil.cuentas.row' as I18nKey)}</span>
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </button>
          )}

          {/* Verificaciones: identidad, licencia y email — submenu unificado */}
          <button
            type="button"
            onClick={() => navigate({ to: '/perfil/verificaciones' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors"
          >
            <ShieldCheck className={`h-5 w-5 shrink-0 ${allVerifDone ? 'text-success' : 'text-text-secondary'}`} />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('perfil.verificaciones.row' as I18nKey)}</span>
            {anyVerifRejected ? (
              <span className="text-xs font-medium text-danger">Acción requerida</span>
            ) : anyVerifPending ? (
              <span className="text-xs font-medium text-warning">En revisión</span>
            ) : allVerifDone ? (
              <ShieldCheck className="h-4 w-4 text-success" />
            ) : (
              <span className="text-xs font-medium text-warning">Completar</span>
            )}
            <ChevronRight className="h-4 w-4 text-text-muted ml-1" />
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: '/configuracion' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors"
          >
            <Settings className="h-5 w-5 shrink-0 text-text-secondary" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('configuracion.title')}</span>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: '/perfil/reportes' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors"
          >
            <WarningCircle size={20} className="shrink-0 text-text-secondary" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('perfil.reportes.row')}</span>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: '/soporte' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors"
          >
            <Headset size={20} className="shrink-0 text-text-secondary" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('nav.soporte')}</span>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>


        </div>
      )}

      {/* Sección Beneficios */}
      {canEdit && (
        <div className="px-4 mt-6 mb-2 space-y-1">
          <p className="text-xs font-medium text-text-secondary mb-3">{t('perfil.beneficios.title' as I18nKey)}</p>

          <button
            type="button"
            onClick={() => navigate({ to: '/perfil/creditos' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors"
          >
            <Coins size={20} className="shrink-0 text-text-secondary" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('perfil.beneficios.creditos' as I18nKey)}</span>
            <span className="text-sm font-semibold text-info tabular-nums">{fmt.currency(profile.balanceInCents)}</span>
            <ChevronRight className="h-4 w-4 text-text-muted ml-1" />
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: '/perfil/cupones' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors"
          >
            <Tag size={20} className="shrink-0 text-text-secondary" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('perfil.beneficios.cupones' as I18nKey)}</span>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: '/perfil/lealtad' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors"
          >
            <Trophy size={20} className="shrink-0 text-text-secondary" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('perfil.beneficios.lealtad' as I18nKey)}</span>
            <span className={`text-xs font-semibold ${levelColors[profile.level]}`}>{levelLabels[profile.level]}</span>
            <ChevronRight className="h-4 w-4 text-text-muted ml-1" />
          </button>
        </div>
      )}

      {/* Reseñas recibidas */}
      {profile && (
        canEdit ? (
          <OwnReviewsSection />
        ) : (
          <OwnerReviewsSection userId={profile.id} />
        )
      )}

      {canEdit && (
        <button
          type="button"
          onClick={handleSwitchRole}
          className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-surface-3 px-6 py-3 text-sm font-semibold text-text-primary shadow-elevated backdrop-blur-md transition-transform active:scale-95"
        >
          <ArrowLeftRight className="h-4 w-4 text-brand-400" />
          {t(activeRole === 'rentador' ? 'app.role.switchToConductor' : 'app.role.switchToRentador')}
        </button>
      )}

    </div>
  )
}

