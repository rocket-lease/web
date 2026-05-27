import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from '@tanstack/react-router'
import { Car, IdentificationCard, ShieldWarning, WarningCircle } from '@phosphor-icons/react'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { t } from '@/i18n/es'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'

interface VerificationGateProps {
  children: React.ReactNode
  flow: 'reserve' | 'publish'
}

type VerificationItem = {
  key: 'identity' | 'driverLicense'
  title: string
  status: 'not_started' | 'pending' | 'verified' | 'rejected'
  cta: string
  retryCta: string
  copy: string
  rejectedReason?: string | null
  href: '/identidad' | '/licencia'
  icon: 'identity' | 'license'
}

function statusLabel(status: VerificationItem['status']): string {
  return t(`verificaciones.status.${status}` as const)
}

function statusVariant(status: VerificationItem['status']): 'success' | 'warning' | 'danger' | 'secondary' {
  if (status === 'verified') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'rejected') return 'danger'
  return 'secondary'
}

export function VerificationGate({ children, flow }: VerificationGateProps) {
  const navigate = useNavigate()
  const { data: profile, isLoading } = useMyProfile()

  useEffect(() => {
    if (!isLoading) {
      const missing = getMissingVerifications(profile, flow)
      document.body.style.overflow = missing.length === 0 ? '' : 'hidden'
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [flow, isLoading, profile])

  if (isLoading) return null

  const missing = getMissingVerifications(profile, flow)

  return (
    <>
      {children}
      {missing.length > 0 &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6">
            <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-surface-1 shadow-elevated">
              <div className="bg-linear-to-br from-brand-600/20 via-surface-1 to-surface-0 px-5 pb-5 pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-bg text-warning">
                    <ShieldWarning size={24} weight="duotone" />
                  </div>
                  <div className="flex-1">
                    <Badge variant="warning">{t('verificaciones.gate.badge')}</Badge>
                    <h2 className="mt-3 text-2xl font-bold text-text-primary">
                      {flow === 'reserve'
                        ? t('verificaciones.gate.reserve.title')
                        : t('verificaciones.gate.publish.title')}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {flow === 'reserve'
                        ? t('verificaciones.gate.reserve.copy')
                        : t('verificaciones.gate.publish.copy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-5 py-5">
                {missing.map((item) => (
                  <VerificationCard key={item.key} item={item} onCta={() => navigate({ to: item.href })} />
                ))}
              </div>

              <div className="border-t border-white/8 px-5 py-4">
                <Button
                  className="w-full"
                  onClick={() => navigate({ to: missing[0]?.href ?? '/identidad' })}
                >
                  {missing.length === 1
                    ? missing[0]?.cta
                    : t('verificaciones.gate.cta')}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

function getMissingVerifications(profile: ReturnType<typeof useMyProfile>['data'] | undefined, flow: 'reserve' | 'publish'): VerificationItem[] {
  if (!profile) return []

  const items: VerificationItem[] = [
    {
      key: 'identity',
      title: t('verificaciones.identity.title'),
      status: profile.identityVerification.status,
      cta: t('verificaciones.identity.cta'),
      retryCta: t('verificaciones.identity.retry'),
      copy: t('verificaciones.identity.copy'),
      rejectedReason: profile.identityVerification.rejectionReason,
      href: '/identidad',
      icon: 'identity',
    },
  ]

  if (flow === 'reserve') {
    items.push({
      key: 'driverLicense',
      title: t('verificaciones.driverLicense.title'),
      status: profile.driverLicenseVerification.status,
      cta: t('verificaciones.driverLicense.cta'),
      retryCta: t('verificaciones.driverLicense.retry'),
      copy: t('verificaciones.driverLicense.copy'),
      rejectedReason: profile.driverLicenseVerification.rejectionReason,
      href: '/licencia',
      icon: 'license',
    })
  }

  return items.filter((item) => item.status !== 'verified')
}

function VerificationCard({ item, onCta }: { item: VerificationItem; onCta: () => void }) {
  const isRejected = item.status === 'rejected'

  return (
    <div className="rounded-3xl border border-white/8 bg-surface-2 p-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.status === 'verified' ? 'bg-success-bg text-success' : item.status === 'pending' ? 'bg-warning-bg text-warning' : item.status === 'rejected' ? 'bg-danger-bg text-danger' : 'bg-brand-600/15 text-brand-300'}`}>
          {item.icon === 'identity' ? (
            <IdentificationCard size={22} weight="duotone" />
          ) : (
            <Car size={22} weight="duotone" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-text-primary">{item.title}</p>
            <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">{item.copy}</p>
        </div>
      </div>

      {isRejected && item.rejectedReason && (
        <div className="mt-3 rounded-2xl border border-danger/20 bg-danger-bg p-3 text-sm text-danger">
          <div className="flex items-center gap-2 font-semibold">
            <WarningCircle size={16} weight="duotone" />
            {t('verificaciones.rejected.reasonTitle')}
          </div>
          <p className="mt-1 text-text-primary">{item.rejectedReason}</p>
        </div>
      )}

      {item.status !== 'verified' && (
        <Button variant="secondary" className="mt-4 w-full" onClick={onCta}>
          {item.status === 'rejected' ? item.retryCta : item.cta}
        </Button>
      )}
    </div>
  )
}