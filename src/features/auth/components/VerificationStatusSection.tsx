import { Link } from '@tanstack/react-router'
import { Mail, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { useVerificationStatus } from '../hooks/useVerificationStatus'
import { t } from '@/i18n/es'

export function VerificationStatusSection() {
  const { status, loading } = useVerificationStatus()

  if (loading) {
    return <div className="h-[58px] rounded-xl bg-surface-1 border border-white/6 animate-pulse" />
  }

  if (!status) return null

  return (
    <div className="space-y-2">
      <VerifiedRow
        icon={<Mail className="h-5 w-5" />}
        label={t('auth.verify.emailSection')}
        verified={status.email}
        channel="email"
      />
    </div>
  )
}

interface VerifiedRowProps {
  icon: React.ReactNode
  label: string
  verified: boolean
  channel: 'email'
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
