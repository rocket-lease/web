import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'
import { useMyIdentityVerification } from '../hooks/useMyIdentityVerification'

interface IdentityGateProps {
  children: React.ReactNode
  flow: 'reserve' | 'publish'
}

export function IdentityGate({ children, flow }: IdentityGateProps) {
  const navigate = useNavigate()
  const { verification, isLoading } = useMyIdentityVerification()

  useEffect(() => {
    if (!isLoading) {
      document.body.style.overflow = verification?.status === 'verified' ? '' : 'hidden'
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isLoading, verification?.status])

  if (isLoading) return null

  const isVerified = verification?.status === 'verified'

  return (
    <>
      {children}
      {!isVerified &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
            <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface-1 p-6 text-center shadow-elevated">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-bg text-warning">
                <ShieldAlert className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-xl font-bold text-text-primary">
                {flow === 'reserve'
                  ? t('identidad.guard.reserve.title')
                  : t('identidad.guard.publish.title')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {flow === 'reserve'
                  ? t('identidad.guard.reserve.copy')
                  : t('identidad.guard.publish.copy')}
              </p>

              <Button
                className="mt-6 w-full"
                onClick={() => navigate({ to: '/identidad' })}
              >
                {t('identidad.guard.cta')}
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}