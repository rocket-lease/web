import { useEffect, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { AlertTriangle, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { authApi } from '../api/auth.api'
import { t } from '@/i18n/es'

export function VerificationBanner() {
  const { session, isLoading } = useAuth()
  const location = useLocation()
  const [needsVerify, setNeedsVerify] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (isLoading || !session) {
      setNeedsVerify(false)
      return
    }
    void (async () => {
      try {
        const status = await authApi.getVerificationStatus()
        setNeedsVerify(!status.email)
      } catch {
        setNeedsVerify(false)
      }
    })()
  }, [session, isLoading, location.pathname])

  if (!needsVerify || dismissed || location.pathname === '/verificar') return null

  return (
    <div className="bg-warning-bg border-b border-warning/30 px-4 py-2">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
        <p className="flex-1 text-xs text-text-primary">
          {t('auth.verify.banner')}
        </p>
        <Link
          to="/verificar"
          className="rounded-lg bg-warning/20 px-3 py-1 text-xs font-semibold text-warning hover:bg-warning/30 transition-colors"
        >
          {t('auth.verify.banner.cta')}
        </Link>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Cerrar"
          className="text-text-muted hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
