import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Bell,
  ChevronRight,
  Star,
  Award,
  Settings,
  Rocket,
  Save,
  Pencil,
  UserCircle,
  CreditCard,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/ui/avatar'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { fmt } from '@/lib/formatters'
import { OwnerVehiclesSection } from './OwnerVehiclesSection'
import { OwnerReviewsSection } from './OwnerReviewsSection'
import { t, type I18nKey } from '@/i18n/es'
import { WarningCircle, IdentificationCard } from '@phosphor-icons/react'


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
  const { user } = useAuth()
  const {
    data: profile,
    isLoading,
    isOwnProfile,
    uploadAvatar,
    isUploadingAvatar,
  } = useMyProfile(profileId)
  const identityVerification = profile?.identityVerification
  const driverLicenseVerification = profile?.driverLicenseVerification

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const reviewCount = useMemo(() => {
    if (!profile) return 0
    return Math.max(0, Math.round(profile.reputationScore * 10))
  }, [profile])

  const canEdit = isOwnProfile || user?.id === profile?.id

  const avatarPreviewUrl = useMemo(
    () => (selectedAvatarFile ? URL.createObjectURL(selectedAvatarFile) : null),
    [selectedAvatarFile],
  )

  useEffect(() => {
    if (!avatarPreviewUrl) return
    return () => URL.revokeObjectURL(avatarPreviewUrl)
  }, [avatarPreviewUrl])

  const currentAvatarSrc = avatarPreviewUrl ?? profile?.avatarUrl

  const handleUploadAvatar = async () => {
    if (!selectedAvatarFile) return
    try {
      await uploadAvatar(selectedAvatarFile)
      setSelectedAvatarFile(null)
      toast.success(t('perfil.saveSuccess'))
    } catch {
      toast.error(t('error.default'))
    }
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
    <div className="flex flex-col">
      <PageHeader
        title={canEdit ? t('perfil.title') : profile.name}
        showBack={!canEdit}
      />

      {/* Profile hero */}
      <div className="px-4 py-6 flex flex-col items-center text-center gap-3">
        <div className="relative">
          <Avatar
            src={currentAvatarSrc}
            fallback={profile.name}
            size="xl"
            className="ring-2 ring-brand-600/40 ring-offset-2 ring-offset-surface-0"
          />
          {canEdit && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  setSelectedAvatarFile(event.target.files?.[0] ?? null)
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow"
                aria-label="Editar foto de perfil"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">{profile.name}</h2>
          {canEdit && (
            <p className="text-sm text-text-muted">{profile.email}</p>
          )}
        </div>
        {canEdit && selectedAvatarFile && (
          <Button onClick={handleUploadAvatar} disabled={isUploadingAvatar}>
            <Save className="h-4 w-4" />
            {isUploadingAvatar ? t('perfil.saving') : 'Guardar foto'}
          </Button>
        )}

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
            <span className="text-xs text-text-muted">({reviewCount})</span>
          </div>
        </div>

        {/* Balance */}
        {canEdit && (
          <div className="w-full rounded-xl border border-info/20 bg-info/10 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-info">
              {t('perfil.balance.title')}
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-text-secondary">{t('perfil.balance.subtitle')}</p>
                <p className="text-2xl font-bold text-text-primary">
                  {fmt.currency(profile.balanceInCents)}
                </p>
              </div>
              <span className="rounded-full bg-info/15 px-3 py-1 text-xs font-medium text-info">
                Rocketokens
              </span>
            </div>
          </div>
        )}

        {canEdit && (
          <div className="w-full space-y-3 text-left">
            {identityVerification && (
              <VerificationCard
                title={t('perfil.identity.title')}
                statusLabel={t(`identidad.status.${identityVerification.status}` as const)}
                status={identityVerification.status}
                pendingCopy={t('perfil.identity.pending')}
                rejectedReasonLabel={t('perfil.identity.rejectedReason')}
                rejectedReason={identityVerification.rejectionReason}
                cta={identityVerification.status === 'rejected' ? t('perfil.identity.retry') : t('perfil.identity.cta')}
                onCta={() => navigate({ to: '/identidad' })}
              />
            )}

            {driverLicenseVerification && (
              <VerificationCard
                title={t('perfil.driverLicense.title')}
                statusLabel={t(`licencia.status.${driverLicenseVerification.status}` as const)}
                status={driverLicenseVerification.status}
                pendingCopy={t('perfil.driverLicense.pending')}
                rejectedReasonLabel={t('perfil.driverLicense.rejectedReason')}
                rejectedReason={driverLicenseVerification.rejectionReason}
                cta={driverLicenseVerification.status === 'rejected' ? t('perfil.driverLicense.retry') : t('perfil.driverLicense.cta')}
                onCta={() => navigate({ to: '/licencia' })}
              />
            )}
          </div>
        )}

      </div>

      {canEdit && <Separator />}

      {/* Vehículos publicados + reseñas del rentador (perfil ajeno) */}
      {!canEdit && profile && (
        <>
          <OwnerVehiclesSection ownerId={profile.id} />
          <OwnerReviewsSection />
        </>
      )}

      {/* Mis vehiculos shortcut */}
      {canEdit && (
        <button
          type="button"
          onClick={() => navigate({ to: '/mis-vehiculos' })}
          className="mx-4 mt-4 rounded-2xl bg-linear-to-r from-brand-900 to-brand-800 border border-brand-700/30 p-4 flex items-center gap-3 w-[calc(100%-2rem)] text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Mis vehículos</p>
            <p className="text-xs text-white/60 mt-0.5">Gestioná tu flota o publicá uno nuevo</p>
          </div>
          <ChevronRight className="h-4 w-4 text-brand-400 shrink-0" />
        </button>
      )}

      {canEdit && (
        <button
          type="button"
          onClick={() => navigate({ to: '/perfil/cuentas' })}
          className="mx-4 mt-4 rounded-2xl bg-linear-to-r from-slate-700 to-slate-600 border border-surface-6 p-4 flex items-center gap-3 w-[calc(100%-2rem)] text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-600">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10h18M3 14h18M7 6h10v2H7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">{t('bankAccount.title')}</p>
            <p className="text-xs text-white/60 mt-0.5">{t('bankAccount.empty')}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-brand-400 shrink-0" />
        </button>
      )}

      {canEdit && (
        <button
          type="button"
          onClick={() => navigate({ to: '/saldo' })}
          className="mx-4 mt-4 rounded-2xl bg-linear-to-r from-emerald-700 to-emerald-600 border border-emerald-500/30 p-4 flex items-center gap-3 w-[calc(100%-2rem)] text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">{t('wallet.title')}</p>
            <p className="text-xs text-white/60 mt-0.5">{t('wallet.shortcut')}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-brand-400 shrink-0" />
        </button>
      )}

      {/* Settings menu (solo perfil propio) */}
      {canEdit && (
        <div className="px-4 mt-5 space-y-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">{t('perfil.settings')}</p>

          <button
            type="button"
            onClick={() => navigate({ to: '/perfil/datos' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors text-text-secondary"
          >
            <UserCircle className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('perfil.datos.title')}</span>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: '/configuracion' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors text-text-secondary"
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('configuracion.title')}</span>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: '/perfil/medios-de-pago' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors text-text-secondary"
          >
            <CreditCard className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('paymentMethods.title' as I18nKey)}</span>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors text-text-secondary"
          >
            <Bell className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left text-sm font-medium text-text-primary">{t('perfil.notifications')}</span>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>
        </div>
      )}

    </div>
  )
}

interface VerificationCardProps {
  title: string
  statusLabel: string
  status: 'not_started' | 'pending' | 'verified' | 'rejected'
  pendingCopy: string
  rejectedReasonLabel: string
  rejectedReason: string | null | undefined
  cta: string
  onCta: () => void
}

function VerificationCard({
  title,
  statusLabel,
  status,
  pendingCopy,
  rejectedReasonLabel,
  rejectedReason,
  cta,
  onCta,
}: VerificationCardProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-surface-1 p-4 text-left">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${status === 'verified' ? 'bg-success-bg text-success' : status === 'rejected' ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning'}`}>
          <IdentificationCard size={22} weight="duotone" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {title}
          </p>
          <p className="text-sm font-semibold text-text-primary">{statusLabel}</p>
        </div>
        <Badge
          variant={
            status === 'verified'
              ? 'success'
              : status === 'rejected'
                ? 'danger'
                : 'warning'
          }
        >
          {statusLabel}
        </Badge>
      </div>

      {status === 'pending' && (
        <p className="mt-3 text-sm text-text-secondary">
          {pendingCopy}
        </p>
      )}

      {status === 'rejected' && rejectedReason && (
        <div className="mt-3 rounded-xl border border-danger/20 bg-danger-bg p-3 text-sm text-danger">
          <div className="flex items-center gap-2 font-semibold">
            <WarningCircle size={16} weight="duotone" />
            {rejectedReasonLabel}
          </div>
          <p className="mt-1 text-text-primary">{rejectedReason}</p>
        </div>
      )}

      {status !== 'verified' && (
        <Button
          variant="secondary"
          className="mt-4 w-full"
          onClick={onCta}
        >
          {cta}
        </Button>
      )}
    </div>
  )
}
