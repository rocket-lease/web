import { useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Copy, Clock, Bank } from '@phosphor-icons/react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { reservarApi } from '@/features/reservar/api/reservar.api'

export function TransferenciaPage() {
  const { id = '' } = useParams({ strict: false })
  const navigate = useNavigate()

  const { data: reservation } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservarApi.getById(id),
    enabled: !!id,
    refetchInterval: 2000,
  })

  const status = reservation?.status
  const transferCode = reservation?.transferCode ?? ''
  const transferAlias = reservation?.transferAlias ?? ''
  const transferExpiresAt = reservation?.transferExpiresAt ?? null
  const totalCents = reservation?.totalCents ?? 0

  const expiresAt = transferExpiresAt
    ? new Date(transferExpiresAt)
    : new Date()

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const expiresIn = () => {
    const diff = expiresAt.getTime() - Date.now()
    if (diff <= 0) return 'Expirado'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  useEffect(() => {
    if (status === 'confirmed') {
      navigate({ to: '/reservas/$id', params: { id } })
      return
    }
    if (!status) return

    const fallback = setTimeout(() => {
      navigate({ to: '/reservas/$id', params: { id } })
    }, 30000)

    return () => clearTimeout(fallback)
  }, [id, status, navigate])

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={t('reservas.transfer.title')}
        showBack
      />

      <div className="px-4 py-5 space-y-6 flex-1">
        {/* Info banner */}
        <div className="rounded-xl bg-amber-400/10 border border-amber-400/20 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            <p className="font-medium text-amber-400 text-sm">
              {t('reservas.transfer.pending')}
            </p>
          </div>
          <p className="text-xs text-text-muted">
            {t('reservas.transfer.expiresIn')} {expiresIn()}
          </p>
        </div>

        <Separator />

        {/* Datos de transferencia */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            {t('reservas.transfer.details')}
          </p>

          {/* CBU/CVU */}
          <div className="card p-4 space-y-2">
            <p className="text-xs text-text-muted">CBU / CVU</p>
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm font-semibold text-text-primary">{transferCode}</p>
              <button
                onClick={() => handleCopy(transferCode)}
                className="rounded-lg p-2 hover:bg-surface-2 transition-colors"
              >
                <Copy className="h-4 w-4 text-text-muted" />
              </button>
            </div>
          </div>

          {/* Alias */}
          <div className="card p-4 space-y-2">
            <p className="text-xs text-text-muted">Alias</p>
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm font-semibold text-text-primary">{transferAlias}</p>
              <button
                onClick={() => handleCopy(transferAlias)}
                className="rounded-lg p-2 hover:bg-surface-2 transition-colors"
              >
                <Copy className="h-4 w-4 text-text-muted" />
              </button>
            </div>
          </div>

          {/* Monto */}
          <div className="card p-4 space-y-1">
            <p className="text-xs text-text-muted">{t('reservas.detail.total')}</p>
            <p className="text-2xl font-bold text-brand-400">{fmt.currency(totalCents)}</p>
          </div>
        </div>

        <Separator />

        {/* Instrucciones */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bank className="h-4 w-4 text-text-muted" />
            <p className="text-sm font-medium text-text-primary">{t('reservas.transfer.instructions')}</p>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-text-muted">
            <li>{t('reservas.transfer.step1')}</li>
            <li>{t('reservas.transfer.step2')}</li>
            <li>{t('reservas.transfer.step3')}</li>
          </ol>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-white/10 bg-surface-1 p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-text-muted"
          onClick={() => navigate({ to: '/reservas/$id', params: { id } })}
        >
          Esperando confirmación...
        </Button>
      </div>
    </div>
  )
}
