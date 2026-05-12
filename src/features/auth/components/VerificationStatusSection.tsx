import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Mail, Phone, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { authApi } from '../api/auth.api'
import type { VerificationStatusResponse } from '../types'
import { t } from '@/i18n/es'

export function VerificationStatusSection() {
  const [status, setStatus] = useState<VerificationStatusResponse | null>(null)

  useEffect(() => {
    void authApi.getVerificationStatus().then(setStatus).catch(() => {})
  }, [])

  if (!status) return null

  return (
    <div className="px-4 mt-5">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
        {t('perfil.verification')}
      </p>
      <div className="space-y-2">
        <VerifiedRow
          icon={<Mail className="h-5 w-5" />}
          label={t('auth.verify.emailSection')}
          verified={status.email}
          channel="email"
        />
        <VerifiedRow
          icon={<Phone className="h-5 w-5" />}
          label={t('auth.verify.phoneSection')}
          verified={status.phone}
          channel="phone"
        />
      </div>
    </div>
  )
}

interface VerifiedRowProps {
  icon: React.ReactNode
  label: string
  verified: boolean
  channel: 'email' | 'phone'
}

function VerifiedRow({ icon, label, verified, channel }: VerifiedRowProps) {
  if (verified) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-surface-1 border border-success/20 px-3 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-bg text-success">
          {icon}
        </div>
        <span className="flex-1 text-sm font-medium text-text-primary">{label}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success">
          <CheckCircle className="h-3 w-3" />
          {t('auth.verify.verified')}
        </span>
      </div>
    )
  }
  return (
    <Link
      to="/verificar"
      search={{ channel }}
      className="flex items-center gap-3 rounded-xl bg-surface-1 border border-warning/20 px-3 py-3 hover:bg-surface-2 transition-colors"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-bg text-warning">
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-text-primary">{label}</span>
      <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning">
        <AlertCircle className="h-3 w-3" />
        Sin verificar
      </span>
      <ChevronRight className="h-4 w-4 text-text-muted" />
    </Link>
  )
}
