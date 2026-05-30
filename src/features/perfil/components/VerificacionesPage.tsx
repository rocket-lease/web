import { useNavigate } from '@tanstack/react-router'
import {
  EnvelopeSimple,
  IdentificationCard,
  Car,
  CaretRight,
  ShieldCheck,
  WarningCircle,
} from '@phosphor-icons/react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { useVerificationStatus } from '@/features/auth/hooks/useVerificationStatus'
import { t } from '@/i18n/es'

type VerifStatus = 'not_started' | 'pending' | 'verified' | 'rejected'

const STATUS_META: Record<VerifStatus, { label: string; color: string }> = {
  verified: { label: 'Verificada', color: 'text-success' },
  pending: { label: 'En revisión', color: 'text-warning' },
  rejected: { label: 'Rechazada', color: 'text-danger' },
  not_started: { label: 'Pendiente', color: 'text-text-muted' },
}

export function VerificacionesPage() {
  const navigate = useNavigate()
  const { data: profile, isLoading: loadingProfile } = useMyProfile()
  const { status: verification, loading: loadingVerification } = useVerificationStatus()

  if (loadingProfile || loadingVerification) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('perfil.verificaciones.title')} showBack sticky />
        <div className="px-4 py-8 text-sm text-text-muted">{t('general.loading')}</div>
      </div>
    )
  }

  const emailStatus: VerifStatus = verification?.email ? 'verified' : 'not_started'
  const identityStatus: VerifStatus = profile?.identityVerification?.status ?? 'not_started'
  const licenseStatus: VerifStatus = profile?.driverLicenseVerification?.status ?? 'not_started'

  return (
    <div className="flex flex-col pb-6">
      <PageHeader title={t('perfil.verificaciones.title')} showBack sticky />

      <div className="px-4 mt-4 space-y-1">
        <VerifRow
          icon={<EnvelopeSimple size={20} />}
          label={t('auth.verify.emailSection')}
          status={emailStatus}
          onPress={emailStatus !== 'verified' ? () => navigate({ to: '/verificar', search: { channel: 'email' } }) : undefined}
        />
        <VerifRow
          icon={<IdentificationCard size={20} />}
          label={t('verificaciones.identity.title')}
          status={identityStatus}
          onPress={() => navigate({ to: '/identidad' })}
        />
        <VerifRow
          icon={<Car size={20} />}
          label={t('verificaciones.driverLicense.title')}
          status={licenseStatus}
          onPress={() => navigate({ to: '/licencia' })}
        />
      </div>
    </div>
  )
}

function VerifRow({
  icon,
  label,
  status,
  onPress,
}: {
  icon: React.ReactNode
  label: string
  status: VerifStatus
  onPress?: () => void
}) {
  const { label: statusLabel, color } = STATUS_META[status]

  const content = (
    <>
      <span className="shrink-0 text-text-secondary">{icon}</span>
      <span className="flex-1 text-left text-sm font-medium text-text-primary">{label}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {status === 'verified' ? (
          <ShieldCheck size={15} className="text-success" />
        ) : (
          <WarningCircle size={15} className={color} weight="fill" />
        )}
        <span className={`text-xs font-medium ${color}`}>{statusLabel}</span>
      </div>
      {onPress && <CaretRight size={15} className="text-text-muted shrink-0 ml-1" />}
    </>
  )

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 hover:bg-surface-2 transition-colors"
      >
        {content}
      </button>
    )
  }
  return (
    <div className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5">
      {content}
    </div>
  )
}
