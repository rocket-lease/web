import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import {
  ChevronRight,
  Star,
  Award,
  Settings,
  Save,
  Pencil,
  UserCircle,
  CreditCard,
  ArrowLeftRight,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { fmt } from '@/lib/formatters'
import { OwnerVehiclesSection } from './OwnerVehiclesSection'
import { OwnerReviewsSection } from './OwnerReviewsSection'
import { t, type I18nKey } from '@/i18n/es'
import { Bell, Bank } from '@phosphor-icons/react'
import { useVerificationStatus } from '@/features/auth/hooks/useVerificationStatus'


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
    uploadAvatar,
    isUploadingAvatar,
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

  const handleSwitchRole = () => {
    const next = activeRole === 'rentador' ? 'conductor' : 'rentador'
    setActiveRole(next)
    navigate({ to: next === 'rentador' ? '/dashboard' : '/buscar' })
  }

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
            <p className="text-xs font-semibold text-info">
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


      </div>

      {canEdit && <Separator />}

      {/* Vehículos publicados + reseñas del rentador (perfil ajeno) */}
      {!canEdit && profile && (
        <>
          <OwnerVehiclesSection ownerId={profile.id} />
          <OwnerReviewsSection />
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
        </div>
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

