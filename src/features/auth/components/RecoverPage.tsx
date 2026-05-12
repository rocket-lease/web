import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { EnvelopeSimple as Mail, ArrowLeft, CheckCircle, Lock, WarningCircle as AlertTriangle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { authApi } from '../api/auth.api'
import { supabase } from '@/lib/supabase'
import { t } from '@/i18n/es'

const passwordRule = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .refine((v) => /[a-zA-Z]/.test(v), 'La contraseña debe contener al menos una letra')
  .refine((v) => /[0-9]/.test(v), 'La contraseña debe contener al menos un número')

const requestSchema = z.object({
  email: z.string().email('Ingresá un correo válido'),
})
type RequestFormData = z.infer<typeof requestSchema>

const newPasswordSchema = z
  .object({
    password: passwordRule,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: t('auth.recover.mismatch'),
  })
type NewPasswordFormData = z.infer<typeof newPasswordSchema>

type Mode = 'request' | 'sent' | 'newPassword' | 'expired'

function parseHashParams(hash: string): URLSearchParams {
  return new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
}

const INITIAL_URL = (() => {
  if (typeof window === 'undefined') {
    return { hasCode: false, hasError: false }
  }
  const query = new URLSearchParams(window.location.search)
  const hash = parseHashParams(window.location.hash)
  const errorCode = query.get('error_code') ?? hash.get('error_code')
  return {
    hasCode: !!(query.get('code') || hash.get('access_token')),
    hasError:
      errorCode === 'otp_expired' || query.get('error') === 'access_denied',
  }
})()

function detectInitialMode(): Mode {
  if (INITIAL_URL.hasError) return 'expired'
  if (INITIAL_URL.hasCode) return 'newPassword'
  return 'request'
}

export function RecoverPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>(detectInitialMode)

  useEffect(() => {
    if (INITIAL_URL.hasCode) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setMode('newPassword')
      })
    }
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('newPassword')
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (mode === 'sent') return <SentScreen />
  if (mode === 'expired') return <ExpiredScreen onRetry={() => setMode('request')} />
  if (mode === 'newPassword') return <NewPasswordScreen onSuccess={() => navigate({ to: '/login' })} />
  return <RequestScreen onSent={() => setMode('sent')} />
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-surface-0 px-5 py-12">
      <div className="w-full max-w-sm mx-auto">{children}</div>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      to="/login"
      className="mb-8 flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      {t('auth.recover.back')}
    </Link>
  )
}

function RequestScreen({ onSent }: { onSent: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({ resolver: zodResolver(requestSchema) })

  const onSubmit = async (data: RequestFormData) => {
    try {
      await authApi.resetPassword(data.email)
      onSent()
    } catch {
      toast.error(t('error.default'))
    }
  }

  return (
    <PageShell>
      <BackLink />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{t('auth.recover.title')}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t('auth.recover.subtitle')}</p>
      </div>
      <div className="rounded-2xl bg-surface-1 border border-white/6 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
              {t('auth.recover.email')}
            </label>
            <Input
              type="email"
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              placeholder="tu@correo.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full" size="lg">
            {isSubmitting ? 'Enviando...' : t('auth.recover.submit')}
          </Button>
        </form>
      </div>
    </PageShell>
  )
}

function SentScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-surface-0 px-5">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success-bg border border-success/20">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Revisá tu correo</h2>
        <p className="mt-2 text-sm text-text-secondary">{t('auth.recover.success')}</p>
        <Link to="/login">
          <Button variant="secondary" className="mt-8 w-full">
            {t('auth.recover.back')}
          </Button>
        </Link>
      </div>
    </div>
  )
}

function ExpiredScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-surface-0 px-5">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-warning-bg border border-warning/20">
          <AlertTriangle className="h-8 w-8 text-warning" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Enlace expirado</h2>
        <p className="mt-2 text-sm text-text-secondary">{t('auth.recover.linkExpired')}</p>
        <Button onClick={onRetry} className="mt-8 w-full" size="lg">
          {t('auth.recover.submit')}
        </Button>
        <Link to="/login">
          <Button variant="ghost" className="mt-3 w-full">
            {t('auth.recover.back')}
          </Button>
        </Link>
      </div>
    </div>
  )
}

function NewPasswordScreen({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordFormData>({ resolver: zodResolver(newPasswordSchema) })

  const onSubmit = async (data: NewPasswordFormData) => {
    try {
      await authApi.updatePassword(data.password)
      toast.success(t('auth.recover.newSuccess'))
      onSuccess()
    } catch {
      toast.error(t('error.default'))
    }
  }

  return (
    <PageShell>
      <BackLink />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{t('auth.recover.newTitle')}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t('auth.recover.newSubtitle')}</p>
      </div>
      <div className="rounded-2xl bg-surface-1 border border-white/6 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
              {t('auth.recover.newPassword')}
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
              {t('auth.recover.confirmPassword')}
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              placeholder="••••••••"
              error={errors.confirm?.message}
              {...register('confirm')}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full" size="lg">
            {isSubmitting ? 'Guardando...' : t('auth.recover.newSubmit')}
          </Button>
        </form>
      </div>
    </PageShell>
  )
}
