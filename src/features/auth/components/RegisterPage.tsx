import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { User, Mail, Lock, Rocket } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { authApi } from '../api/auth.api'
import { t } from '@/i18n/es'

const schema = z
  .object({
    fullName: z.string().min(2, 'Ingresá tu nombre completo'),
    email: z.string().email('Ingresá un correo válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.signUp(data.email, data.password, data.fullName)
      toast.success('Cuenta creada. Revisá tu correo para confirmarla.')
      navigate({ to: '/buscar' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('error.default')
      toast.error(msg)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-surface-0 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-elevated">
            <Rocket className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{t('auth.register.title')}</h1>
          <p className="text-sm text-text-muted">{t('auth.register.subtitle')}</p>
        </div>

        <div className="rounded-2xl bg-surface-1 border border-white/6 p-6 shadow-elevated">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
                {t('auth.register.name')}
              </label>
              <Input
                autoComplete="name"
                leftIcon={<User className="h-4 w-4" />}
                placeholder="Ana García"
                error={errors.fullName?.message}
                {...register('fullName')}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
                {t('auth.register.email')}
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
                {t('auth.register.password')}
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
                {t('auth.register.confirmPassword')}
              </label>
              <Input
                type="password"
                autoComplete="new-password"
                leftIcon={<Lock className="h-4 w-4" />}
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full" size="lg">
              {isSubmitting ? 'Creando cuenta...' : t('auth.register.submit')}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-text-muted">
          {t('auth.register.hasAccount')}{' '}
          <Link to="/login" className="text-brand-400 font-semibold hover:text-brand-300">
            {t('auth.register.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}
