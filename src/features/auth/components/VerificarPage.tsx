import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Mail, Phone, CheckCircle, AlertTriangle, Rocket } from 'lucide-react'
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
  const search = useSearch({ from: '/verificar' }) as { channel?: VerificationChannel }
  const channel: VerificationChannel = search.channel === 'phone' ? 'phone' : 'email'
  const [status, setStatus] = useState<VerificationStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [identifier, setIdentifier] = useState<string>('')

  useEffect(() => {
    void (async () => {
      try {
        const s = await authApi.getVerificationStatus()
        setStatus(s)
        const session = await authApi.getSession()
        if (channel === 'email') {
          setIdentifier(maskEmail(session?.user?.email ?? null))
        } else {
          setIdentifier(maskPhone(session?.user?.phone ?? null))
        }
      } catch {
        toast.error(t('error.default'))
      } finally {
        setLoading(false)
      }
    })()
  }, [channel])

  const channelVerified =
    channel === 'email' ? !!status?.email : !!status?.phone

  useEffect(() => {
    if (channelVerified) {
      const target = channel === 'email' ? '/buscar' : '/perfil'
      const timer = setTimeout(() => navigate({ to: target }), 1500)
      return () => clearTimeout(timer)
    }
  }, [channelVerified, channel, navigate])

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
  icon: React.ReactNode
  label: string
  identifier: string
  verified: boolean
  onVerified: () => void
}

function ChannelCard({
  channel,
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
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
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

  const canResend = cooldown <= 0 && !resending

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
      const res = await authApi.verifyOtp(channel, code)
      if (res.verified) {
        toast.success(t('auth.verify.success'))
        onVerified()
        return
      }
      const reasonKey: Record<typeof res.reason, string> = {
        incorrect: 'auth.verify.error.incorrect',
        expired: 'auth.verify.error.expired',
        exhausted: 'auth.verify.error.exhausted',
        not_found: 'auth.verify.error.notFound',
      }
      setErrorMessage(t(reasonKey[res.reason] as never))
      setAttemptsLeft(res.attemptsLeft)
      if (res.reason === 'expired' || res.reason === 'exhausted' || res.reason === 'not_found') {
        setExpired(true)
      }
      setCode('')
    } catch {
      setErrorMessage(t('error.default'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setResending(true)
    try {
      await authApi.sendVerificationOtp(channel)
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setAttemptsLeft(null)
      setErrorMessage(null)
      setExpired(false)
      setCode('')
      toast.success('Código enviado')
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

        {attemptsLeft !== null && !expired && (
          <p className="text-xs text-text-muted">
            {t('auth.verify.attemptsLeft').replace('{n}', String(attemptsLeft))}
          </p>
        )}

        {expired && (
          <div className="flex items-center gap-2 rounded-lg bg-warning-bg border border-warning/30 px-3 py-2 text-xs text-warning">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting || code.length !== 6}
          size="lg"
          className="w-full"
        >
          {submitting ? 'Verificando...' : t('auth.verify.submit')}
        </Button>

        <Button
          type="button"
          variant="ghost"
          disabled={!canResend}
          onClick={handleResend}
          className="w-full"
        >
          {resending ? 'Enviando...' : resendLabel}
        </Button>
      </form>
    </div>
  )
}
