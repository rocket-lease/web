import { useState, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ChevronRight,
  Award,
  Settings,
  UserCircle,
  CreditCard,
  ArrowLeftRight,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react'
import { Avatar } from '@/ui/avatar'
import { Separator } from '@/ui/separator'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useIsAdmin } from '@/features/admin/hooks/useIsAdmin'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { useUserProfile } from '@/features/perfil/hooks/useUserProfile'
import { OwnerVehiclesSection } from './OwnerVehiclesSection'
import { OwnerReviewsSection } from './OwnerReviewsSection'
import { t, type I18nKey } from '@/i18n/es'
import { Bank, Coins, Tag, Trophy, Headset, WarningCircle, ShieldCheck as ShieldCheckFill } from '@phosphor-icons/react'
import { ReputationSummary } from '@/features/reputation/components/ReputationSummary'
import { ReputationWarningBanner } from '@/features/reputation/components/ReputationWarningBanner'
import { useReputation } from '@/features/reputation/hooks/useReputation'
import { NotificationBell } from '@/features/notificaciones/components/NotificationBell'

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
  const { activeRole, setActiveRole } = useAuth()
  const { isAdmin } = useIsAdmin()
  const isOwnProfile = !profileId
  const { data: ownProfile, isLoading: ownLoading } = useMyProfile()
  const { data: publicProfile, isLoading: publicLoading } = useUserProfile(profileId ?? '')
  const profile = isOwnProfile ? ownProfile : publicProfile
  const isLoading = isOwnProfile ? ownLoading : publicLoading
  const identityVerified = profile?.identityVerification?.status === 'verified'
  const licenseVerified = profile?.driverLicenseVerification?.status === 'verified'

  const { data: reputation } = useReputation(profile?.id)
  
  // El hub privado es exclusivamente la ruta `/perfil` (sin id). `/perfil/$id`
  // siempre muestra la vista pública, incluso si el id es el propio usuario, para
  // que pueda previsualizar cómo lo ven los demás.
  const canEdit = isOwnProfile
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

  const avatarNode = (
    <div className="relative shrink-0">
      <Avatar src={profile.avatarUrl} fallback={profile.name} size="xl" />
      {identityVerified && (
        <span className="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-success ring-2 ring-surface-1">
          <ShieldCheckFill weight="fill" className="h-3.5 w-3.5 text-white" />
        </span>
      )}
    </div>
  )

  // El nivel de lealtad es un atributo del conductor (US-63), así que solo se
  // muestra cuando el perfil se está viendo en ese rol.
  const showLevel = displayRole === 'conductor'
  const reputationNode = (
    <div className="flex items-center gap-3 mt-2">
      <ReputationSummary score={reputationScore} reviewCount={reviewCount} badges={currentReputation?.badges ?? []} />
      {showLevel && (
        <>
          <div className="h-3.5 w-px bg-white/10" />
          <div className="flex items-center gap-1">
            <Award className={`h-3.5 w-3.5 shrink-0 ${levelColors[profile.level]}`} />
            <span className={`text-xs font-semibold ${levelColors[profile.level]}`}>{levelLabels[profile.level]}</span>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="flex flex-col pb-20">
      <PageHeader
        title={canEdit ? t('perfil.title') : profile.name}
        showBack={!canEdit}
        actions={
          canEdit ? <NotificationBell /> : undefined
        }
      />

      {/* Profile hero — en el perfil propio es una card que abre tu vista pública */}
      {canEdit && ownProfile ? (
        <div className="px-4 pt-3">
          <button
            type="button"
            onClick={() => navigate({ to: '/perfil/$id', params: { id: ownProfile.id } })}
            className="flex w-full items-center gap-4 rounded-2xl border border-white/8 bg-surface-1 px-5 py-5 text-left shadow-elevated transition-all hover:bg-surface-2 active:scale-[0.99]"
          >
            {avatarNode}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-text-primary leading-tight truncate">{profile.name}</h2>
              <p className="text-sm text-text-muted truncate mt-0.5">{ownProfile.email}</p>
              {reputationNode}
            </div>
          </button>
        </div>
      ) : (
        <>
          <div className="px-4 py-5 flex items-center gap-4">
            {avatarNode}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-text-primary leading-tight truncate">{profile.name}</h2>
              {reputationNode}
            </div>
          </div>

          {(identityVerified || (displayRole === 'conductor' && licenseVerified)) && (
            <div className="px-4 mt-4 flex flex-wrap gap-2">
              {identityVerified && <VerifBadge label={t('perfil.verif.identidad' as I18nKey)} />}
              {displayRole === 'conductor' && licenseVerified && (
                <VerifBadge label={t('perfil.verif.licencia' as I18nKey)} />
              )}
            </div>
          )}
        </>
      )}

      {canEdit && profile && currentReputation && (
        <ReputationWarningBanner
          isLowReputation={currentReputation.isLowReputation}
          penaltyCount={currentReputation.penaltyCount}
        />
      )}

      {canEdit && <Separator />}

      {/* Vehículos publicados: solo tienen sentido en el rol rentador */}
      {!canEdit && profile && displayRole === 'rentador' && (
        <OwnerVehiclesSection ownerId={profile.id} />
      )}

      {/* Menú del perfil propio, agrupado por concepto */}
      {canEdit && (
        <div className="px-4 mt-5 space-y-6">
          <MenuSection title={t('perfil.group.cuenta' as I18nKey)}>
            <MenuRow
              icon={<UserCircle className="h-5 w-5 text-text-secondary" />}
              label={t('perfil.datos.title')}
              onClick={() => navigate({ to: '/perfil/datos' })}
            />
            <MenuRow
              icon={<ShieldCheck className="h-5 w-5 text-text-secondary" />}
              label={t('perfil.verificaciones.row' as I18nKey)}
              onClick={() => navigate({ to: '/perfil/verificaciones' })}
            />
            {/* Medios de pago: dónde el conductor paga (solo modo conductor) */}
            {activeRole === 'conductor' && (
              <MenuRow
                icon={<CreditCard className="h-5 w-5 text-text-secondary" />}
                label={t('paymentMethods.title' as I18nKey)}
                onClick={() => navigate({ to: '/perfil/medios-de-pago' })}
              />
            )}
            {/* Cuentas bancarias: dónde el rentador recibe pagos (solo modo rentador) */}
            {activeRole === 'rentador' && (
              <MenuRow
                icon={<Bank size={20} className="text-text-secondary" />}
                label={t('perfil.cuentas.row' as I18nKey)}
                onClick={() => navigate({ to: '/perfil/cuentas' })}
              />
            )}
          </MenuSection>

          <MenuSection title={t('perfil.beneficios.title' as I18nKey)}>
            <MenuRow
              icon={<Trophy size={20} className="text-text-secondary" />}
              label={t('perfil.beneficios.lealtad' as I18nKey)}
              onClick={() => navigate({ to: '/perfil/lealtad' })}
            />
            <MenuRow
              icon={<Coins size={20} className="text-text-secondary" />}
              label={t('perfil.beneficios.creditos' as I18nKey)}
              onClick={() => navigate({ to: '/perfil/creditos' })}
            />
            <MenuRow
              icon={<Tag size={20} className="text-text-secondary" />}
              label={t('perfil.beneficios.cupones' as I18nKey)}
              onClick={() => navigate({ to: '/perfil/cupones' })}
            />
          </MenuSection>

          <MenuSection title={t('perfil.group.actividad' as I18nKey)}>
            <MenuRow
              icon={<WarningCircle size={20} className="text-text-secondary" />}
              label={t('perfil.reportes.row')}
              onClick={() => navigate({ to: '/perfil/reportes' })}
            />
            <MenuRow
              icon={<Headset size={20} className="text-text-secondary" />}
              label={t('nav.soporte')}
              onClick={() => navigate({ to: '/soporte' })}
            />
            {isAdmin && (
              <MenuRow
                icon={<LayoutDashboard className="h-5 w-5 text-text-secondary" />}
                label={t('perfil.admin.row' as I18nKey)}
                href="/tickets"
              />
            )}
          </MenuSection>

          <MenuSection title={t('perfil.group.app' as I18nKey)}>
            <MenuRow
              icon={<Settings className="h-5 w-5 text-text-secondary" />}
              label={t('configuracion.title')}
              onClick={() => navigate({ to: '/configuracion' })}
            />
          </MenuSection>
        </div>
      )}

      {/* Reseñas recibidas: viven en la vista pública del perfil */}
      {!canEdit && profile && <OwnerReviewsSection userId={profile.id} role={displayRole} />}

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

      {!canEdit && (
        <button
          type="button"
          onClick={() => setLocalViewingRole(displayRole === 'rentador' ? 'conductor' : 'rentador')}
          className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-surface-3 px-6 py-3 text-sm font-semibold text-text-primary shadow-elevated backdrop-blur-md transition-transform active:scale-95"
        >
          <ArrowLeftRight className="h-4 w-4 text-brand-400" />
          {t(displayRole === 'rentador' ? 'perfil.viewAsConductor' : 'perfil.viewAsRentador')}
        </button>
      )}

    </div>
  )
}

/** Chip verde de "verificado" para el perfil público (identidad, licencia). */
function VerifBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
      <ShieldCheckFill weight="fill" className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

/** Bloque temático del menú de perfil con un subtítulo en mayúsculas. */
function MenuSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        {title}
      </p>
      {children}
    </div>
  )
}

interface MenuRowProps {
  icon: ReactNode
  label: string
  onClick?: () => void
  href?: string
  trailing?: ReactNode
}

/** Fila de menú con ícono, label, contenido opcional a la derecha y chevron. */
function MenuRow({ icon, label, onClick, href, trailing }: MenuRowProps) {
  const className =
    'flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors'
  const inner = (
    <>
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-left text-sm font-medium text-text-primary">{label}</span>
      {trailing}
      <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
    </>
  )
  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  )
}

