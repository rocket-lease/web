import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@tanstack/react-router'
import { Envelope, ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { authApi } from '../api/auth.api'
import { t } from '@/i18n/es'

const schema = z.object({
  email: z.string().email('Ingresá un correo válido'),
})

type FormData = z.infer<typeof schema>

export function RecoverPage() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await authApi.resetPassword(data.email)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-surface-0 px-5">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success-bg border border-success/20">
            <CheckCircle size={32} color="#10B981" weight="fill" />
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

  return (
    <div className="flex min-h-svh flex-col bg-surface-0 px-5 py-12">
      <div className="w-full max-w-sm mx-auto">
        <Link
          to="/login"
          className="mb-8 flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          {t('auth.recover.back')}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">{t('auth.recover.title')}</h1>
          <p className="mt-2 text-sm text-text-secondary">{t('auth.recover.subtitle')}</p>
        </div>

        <div className="rounded-xl bg-surface-1 border border-white/6 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary uppercase tracking-wider">
                {t('auth.recover.email')}
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
            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full" size="lg">
              {isSubmitting ? 'Enviando...' : t('auth.recover.submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
