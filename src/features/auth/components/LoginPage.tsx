import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Envelope, Lock } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { authApi } from '../api/auth.api'
import { t } from '@/i18n/es'
import type { ProblemDetails } from '../types'

// Mirrors LoginUserRequestSchema from @rocket-lease/contracts
const schema = z.object({
  email: z.string().email('Ingresá un correo válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .refine((v) => /[a-zA-Z]/.test(v), 'La contraseña debe contener al menos una letra')
    .refine((v) => /[0-9]/.test(v), 'La contraseña debe contener al menos un número'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { hint, returnTo } = useSearch({ from: '/login' })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.signIn(data)
      if (returnTo && typeof returnTo === 'string' && returnTo.startsWith('/')) {
        window.location.href = returnTo
        return
      }
      navigate({ to: '/buscar' })
    } catch (err) {
      const problem = err as ProblemDetails & { statusCode?: number; message?: string }
      if (problem?.statusCode === 403 || problem?.status === 403) {
        toast.error(t('auth.login.errorUnverified'))
        navigate({ to: '/verificar', search: { channel: 'email', email: data.email } })
        return
      }
      const msg = problem?.detail ?? problem?.message ?? t('auth.login.error')
      toast.error(msg)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-surface-0 px-5 py-12">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <img
            src="/logo-symbol.png"
            alt="Rocket Lease"
            className="h-20 w-auto"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Rocket Lease
            </h1>
            <p className="mt-1 text-sm text-text-muted">{t('app.tagline')}</p>
          </div>
        </div>

        {/* Contextual hint (e.g. redirected from favorites) */}
        {hint === 'favoritos' && (
          <div className="mb-4 rounded-xl border border-brand-500/20 bg-brand-500/10 px-4 py-3">
            <p className="text-center text-sm text-brand-300">{t('favoritos.loginHint')}</p>
          </div>
        )}

        {/* Form */}
        <div className="rounded-xl bg-surface-1 border border-white/6 p-6 shadow-elevated">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text-primary">{t('auth.login.title')}</h2>
            <p className="mt-1 text-sm text-text-secondary">{t('auth.login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
                {t('auth.login.email')}
              </label>
              <Input
                type="email"
                autoComplete="email"
                leftIcon={<Envelope size={16} />}
                placeholder="tu@correo.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
                {t('auth.login.password')}
              </label>
              <Input
                type="password"
                autoComplete="current-password"
                leftIcon={<Lock size={16} />}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Link
              to="/recuperar"
              className="self-end text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              {t('auth.login.forgot')}
            </Link>

            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full" size="lg">
              {isSubmitting ? 'Ingresando...' : t('auth.login.submit')}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-text-muted">
          {t('auth.login.noAccount')}{' '}
          <Link to="/registro" className="text-brand-400 font-semibold hover:text-brand-300">
            {t('auth.login.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
