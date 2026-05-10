import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@tanstack/react-router'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
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

  return (
    <div className="flex min-h-svh flex-col bg-surface-0 px-5 py-12">
      <div className="w-full max-w-sm mx-auto">
        <Link
          to="/login"
          className="mb-8 flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('auth.recover.back')}
        </Link>

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
      </div>
    </div>
  )
}
