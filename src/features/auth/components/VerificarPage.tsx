import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Mail, Phone, CheckCircle, Rocket } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { authApi } from '../api/auth.api'
import type {
  VerificationChannel,
  VerificationStatusResponse,
} from '../types'
import { t } from '@/i18n/es'

const RESEND_COOLDOWN_SECONDS = 30

function maskEmail(email: string | null): string {
  if (!email) return ''
  const [user, domain] = email.split('@')
  if (!domain) return email
  const head = user.slice(0, 2)
  return `${head}${'*'.repeat(Math.max(0, user.length - 2))}@${domain}`
}

function maskPhone(phone: string | null): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return phone
  const tail = digits.slice(-4)
  return `${'*'.repeat(digits.length - 4)} ${tail}`
}

export function VerificarPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/verificar' }) as {
    channel?: VerificationChannel
    email?: string
  }
  const channel: VerificationChannel = search.channel === 'phone' ? 'phone' : 'email'
  const pendingEmail = search.email ?? null
  const [status, setStatus] = useState<VerificationStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [identifier, setIdentifier] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const session = await authApi.getSession()
        const sessionEmail = session?.user?.email ?? null
        const sessionPhone = session?.user?.phone ?? null
        setHasSession(!!session)

        if (session) {
          const s = await authApi.getVerificationStatus()
          setStatus(s)
        } else {
          setStatus({ email: false, phone: false })
        }

        const resolvedEmail = sessionEmail ?? pendingEmail ?? ''
        setEmail(resolvedEmail)
        if (channel === 'email') {
          setIdentifier(maskEmail(resolvedEmail || null))
        } else {
          setIdentifier(maskPhone(sessionPhone))
        }
      } catch {
        toast.error(t('error.default'))
      } finally {
        setLoading(false)
      }
    })()
  }, [channel, pendingEmail])

  const channelVerified =
    channel === 'email' ? !!status?.email : !!status?.phone

  useEffect(() => {
    if (channelVerified) {
      const target = !hasSession
        ? '/login'
        : channel === 'email'
          ? '/buscar'
          : '/perfil'
      const timer = setTimeout(() => navigate({ to: target }), 1500)
      return () => clearTimeout(timer)
    }
  }, [channelVerified, channel, navigate, hasSession])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface-0">
        <p className="text-text-muted">{t('general.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-surface-0 px-5 py-12">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-elevated">
            <Rocket className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{t('auth.verify.title')}</h1>
          <p className="text-sm text-text-muted text-center">
            {channel === 'email'
              ? t('auth.verify.subtitleEmail')
              : t('auth.verify.subtitlePhone')}
          </p>
        </div>

        <ChannelCard
          channel={channel}
          email={email}
          icon={channel === 'email' ? <Mail className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
          label={channel === 'email' ? t('auth.verify.emailSection') : t('auth.verify.phoneSection')}
          identifier={identifier}
          verified={channelVerified}
          onVerified={() =>
            setStatus((s) =>
              s ? { ...s, [channel]: true } : { email: channel === 'email', phone: channel === 'phone' },
            )
          }
        />
      </div>
    </div>
  )
}

interface ChannelCardProps {
  channel: VerificationChannel
  email: string
  icon: React.ReactNode
  label: string
  identifier: string
  verified: boolean
  onVerified: () => void
}

function ChannelCard({
  channel,
  email,
  icon,
  label,
  identifier,
  verified,
  onVerified,
}: ChannelCardProps) {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const interval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (verified || cooldown <= 0) return
    interval.current = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1))
    }, 1000)
    return () => {
      if (interval.current) clearInterval(interval.current)
    }
  }, [cooldown, verified])

  const canResend = cooldown <= 0 && !resending && channel === 'email'

  const resendLabel = useMemo(() => {
    if (cooldown > 0)
      return t('auth.verify.resendIn').replace('{seconds}', String(cooldown))
    return t('auth.verify.resend')
  }, [cooldown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) {
      setErrorMessage(t('auth.verify.error.incorrect'))
      return
    }
    setSubmitting(true)
    setErrorMessage(null)
    try {
      if (channel === 'email') {
        await authApi.verifyEmailOtp(email, code)
      } else {
        await authApi.verifyPhoneOtp(code)
      }
      toast.success(t('auth.verify.success'))
      onVerified()
    } catch {
      setErrorMessage(t('auth.verify.error.incorrect'))
      setCode('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setResending(true)
    try {
      await authApi.resendEmailOtp(email)
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setErrorMessage(null)
      setCode('')
      toast.success(t('auth.verify.sent'))
    } catch {
      toast.error(t('error.default'))
    } finally {
      setResending(false)
    }
  }

  if (verified) {
    return (
      <div className="rounded-2xl bg-surface-1 border border-success/30 p-5 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-bg text-success">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">{label}</p>
          <p className="text-xs text-text-muted">{identifier}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-3 py-1 text-xs font-semibold text-success">
          <CheckCircle className="h-3.5 w-3.5" />
          {t('auth.verify.verified')}
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-surface-1 border border-white/6 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-brand-400">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">{label}</p>
          <p className="text-xs text-text-muted">{identifier}</p>
        </div>
      </div>

      <form onSubmit={handleVerify} className="flex flex-col gap-3" noValidate>
        <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
          {t('auth.verify.code')}
        </label>
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          error={errorMessage ?? undefined}
        />

        <Button
          type="submit"
          disabled={submitting || code.length !== 6}
          size="lg"
          className="w-full"
        >
          {submitting ? t('auth.verify.verifying') : t('auth.verify.submit')}
        </Button>

        {channel === 'email' && (
          <Button
            type="button"
            variant="ghost"
            disabled={!canResend}
            onClick={handleResend}
            className="w-full"
          >
            {resending ? t('auth.verify.sending') : resendLabel}
          </Button>
        )}
      </form>
    </div>
  )
}
