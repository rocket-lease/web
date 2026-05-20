import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { User, Envelope, Lock, Phone, IdentificationCard, CaretLeft } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { authApi } from '../api/auth.api'
import { t } from '@/i18n/es'
import type { ProblemDetails } from '@rocket-lease/contracts'

// Mirrors RegisterUserRequestSchema from @rocket-lease/contracts
const schema = z
  .object({
    name: z.string().min(1, 'Ingresá tu nombre completo').max(100),
    email: z.string().email('Ingresá un correo válido'),
    dni: z
      .string()
      .transform(v => v.replace(/\./g, ''))
      .pipe(z.string().regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 dígitos')),
    phone: z.string().min(1, 'Ingresá tu teléfono').max(20),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .refine(v => /[a-zA-Z]/.test(v), 'La contraseña debe contener al menos una letra')
      .refine(v => /[0-9]/.test(v), 'La contraseña debe contener al menos un número'),
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
      await authApi.signUp({
        name: data.name,
        email: data.email,
        dni: data.dni,
        phone: data.phone,
        password: data.password,
      })
      toast.success('Cuenta creada. Verificá tu correo para continuar.')
      navigate({ to: '/verificar', search: { channel: 'email', email: data.email } })
    } catch (err) {
      const problem = err as ProblemDetails
      const msg = problem?.detail ?? t('error.default')
      toast.error(msg)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-surface-0 px-5 pb-12" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
      <button
        onClick={() => window.history.back()}
        aria-label="Volver"
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text-secondary transition-colors hover:text-text-primary active:scale-[0.97]"
      >
        <CaretLeft size={20} />
      </button>
      <div className="flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/logo-symbol.png" alt="Rocket Lease" className="h-16 w-auto" />
          <h1 className="text-2xl font-bold text-text-primary">{t('auth.register.title')}</h1>
          <p className="text-sm text-text-muted">{t('auth.register.subtitle')}</p>
        </div>

        <div className="rounded-xl border border-white/6 bg-surface-1 p-6 shadow-elevated">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wider text-text-secondary uppercase">
                {t('auth.register.name')}
              </label>
              <Input
                autoComplete="name"
                autoFocus
                enterKeyHint="next"
                leftIcon={<User size={16} />}
                placeholder="Ana García"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wider text-text-secondary uppercase">
                {t('auth.register.email')}
              </label>
              <Input
                type="email"
                autoComplete="email"
                enterKeyHint="next"
                leftIcon={<Envelope size={16} />}
                placeholder="tu@correo.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wider text-text-secondary uppercase">
                {t('auth.register.dni')}
              </label>
              <Input
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="next"
                leftIcon={<IdentificationCard size={16} />}
                placeholder="12.345.678"
                error={errors.dni?.message}
                {...register('dni')}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wider text-text-secondary uppercase">
                {t('auth.register.phone')}
              </label>
              <Input
                type="tel"
                autoComplete="tel"
                enterKeyHint="next"
                leftIcon={<Phone size={16} />}
                placeholder="+54 9 11 1234-5678"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wider text-text-secondary uppercase">
                {t('auth.register.password')}
              </label>
              <Input
                type="password"
                autoComplete="new-password"
                enterKeyHint="next"
                leftIcon={<Lock size={16} />}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wider text-text-secondary uppercase">
                {t('auth.register.confirmPassword')}
              </label>
              <Input
                type="password"
                autoComplete="new-password"
                enterKeyHint="done"
                leftIcon={<Lock size={16} />}
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
          <button
            onClick={() => navigate({ to: '/login', replace: true })}
            className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            {t('auth.register.login')}
          </button>
        </p>
      </div>
      </div>
    </div>
  )
}
