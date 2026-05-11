import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Mail, Lock, Rocket } from 'lucide-react'
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.signIn(data)
      navigate({ to: '/buscar' })
    } catch (err) {
      const problem = err as ProblemDetails
      const msg = problem?.detail ?? t('auth.login.error')
      toast.error(msg)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-surface-0 px-5 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-elevated">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Rocket Lease
            </h1>
            <p className="mt-1 text-sm text-text-muted">{t('app.tagline')}</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-surface-1 border border-white/6 p-6 shadow-elevated">
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
                leftIcon={<Mail className="h-4 w-4" />}
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
                leftIcon={<Lock className="h-4 w-4" />}
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
