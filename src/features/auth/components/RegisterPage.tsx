import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { User, Mail, Lock, Phone, CreditCard, Rocket } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { authApi } from '../api/auth.api'
import { t } from '@/i18n/es'
import type { ProblemDetails } from '../types'

// Mirrors RegisterUserRequestSchema from @rocket-lease/contracts
const schema = z
  .object({
    name: z.string().min(1, 'Ingresá tu nombre completo').max(100),
    email: z.string().email('Ingresá un correo válido'),
    dni: z
      .string()
      .transform((v) => v.replace(/\./g, ''))
      .pipe(z.string().regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 dígitos')),
    phone: z.string().min(1, 'Ingresá tu teléfono').max(20),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .refine((v) => /[a-zA-Z]/.test(v), 'La contraseña debe contener al menos una letra')
      .refine((v) => /[0-9]/.test(v), 'La contraseña debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
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
      await authApi.signUp({
        name: data.name,
        email: data.email,
        dni: data.dni,
        phone: data.phone,
        password: data.password,
      })
      toast.success('Cuenta creada. Ya podés iniciar sesión.')
      navigate({ to: '/login' })
    } catch (err) {
      const problem = err as ProblemDetails
      const msg = problem?.detail ?? t('error.default')
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
                error={errors.name?.message}
                {...register('name')}
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
                {t('auth.register.dni')}
              </label>
              <Input
                inputMode="numeric"
                autoComplete="off"
                leftIcon={<CreditCard className="h-4 w-4" />}
                placeholder="12.345.678"
                error={errors.dni?.message}
                {...register('dni')}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
                {t('auth.register.phone')}
              </label>
              <Input
                type="tel"
                autoComplete="tel"
                leftIcon={<Phone className="h-4 w-4" />}
                placeholder="+54 9 11 1234-5678"
                error={errors.phone?.message}
                {...register('phone')}
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
