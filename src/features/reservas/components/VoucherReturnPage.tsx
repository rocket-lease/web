import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { t } from '@/i18n/es'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { confirmReturn } from '../api/reservations.api'

export function VoucherReturnPage() {
  const { token } = useParams({ strict: false })
  const navigate = useNavigate()
  const calledRef = useRef(false)

  useEffect(() => {
    if (!token || calledRef.current) return
    calledRef.current = true

    confirmReturn(token)
      .then(({ reservationId }) => {
        toast.success(t('reservas.devolucion.exito'))
        void navigate({ to: '/reservas/$id', params: { id: reservationId } })
      })
      .catch(() => {
        toast.error(t('reservas.devolucion.qrInvalido'))
        void navigate({ to: '/buscar' })
      })
  }, [token, navigate])

  return (
    <div className="flex flex-col min-h-dvh bg-surface-0">
      <PageHeader
        title={t('reservas.devolucion.confirmando')}
        showBack
        onBack={() => navigate({ to: '/buscar' })}
      />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-muted">{t('general.loading')}</p>
      </div>
    </div>
  )
}
