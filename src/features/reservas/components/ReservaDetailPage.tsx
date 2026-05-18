import { useEffect, useState } from 'react'
import { useParams, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Copy, Clock } from 'lucide-react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Skeleton } from '@/ui/skeleton'
import { Separator } from '@/ui/separator'
import { fmt } from '@/lib/formatters'
import { t } from '@/i18n/es'
import { reservarApi } from '@/features/reservar/api/reservar.api'
import { ConductorView } from './detail/ConductorView'
import { RentadorView } from './detail/RentadorView'

/**
 * Dispatcher del detalle de una reserva. Fetchea la reserva por id y delega
 * en `ConductorView` o `RentadorView` según la perspectiva.
 *
 * La perspectiva se determina así, en orden de prioridad:
 *   1. `?role=` en la URL (search param) — lo setea el listado al navegar.
 *   2. Ownership: si `user.id === reservation.rentadorId` → rentador; sino
 *      conductor. Fallback para deep-link sin search param.
 *
 * El endpoint `GET /reservations/:id` autoriza tanto al conductor como al
 * rentador de la reserva — el filtro de perspectiva es solo de UI.
 */
export function ReservaDetailPage() {
  const { id = '' } = useParams({ strict: false })
  const { role: roleSearch } = useSearch({ strict: false }) as { role?: 'conductor' | 'owner' }
  const { user } = useAuth()

  const { data: reservation, isLoading, isError } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservarApi.getById(id),
    enabled: !!id,
    gcTime: Infinity,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('reservas.detail.title')} showBack />
        <div className="px-4 py-5 space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError || !reservation) {
    return (
      <div className="flex flex-col">
        <PageHeader title={t('reservas.detail.title')} showBack />
        <div className="flex items-center justify-center flex-1 py-24">
          <p className="text-sm text-danger">
            {t('reservar.errors.RESERVATION_NOT_FOUND')}
          </p>
        </div>
      </div>
    )
  }

  const perspective: 'conductor' | 'owner' =
    roleSearch === 'owner' || roleSearch === 'conductor'
      ? roleSearch
      : user?.id === reservation.rentadorId
        ? 'owner'
        : 'conductor'

  const showTransferInfo = reservation.paymentMethod === 'bank_transfer' && reservation.transferCode && reservation.status !== 'confirmed'

  return (
    <div className="flex flex-col">
      <PageHeader title={t('reservas.detail.title')} showBack />
      {showTransferInfo && (
        <TransferInfoSection
          transferCode={reservation.transferCode ?? ''}
          transferAlias={reservation.transferAlias ?? null}
          transferExpiresAt={reservation.transferExpiresAt ?? null}
          totalCents={reservation.totalCents}
        />
      )}
      {perspective === 'owner' ? (
        <RentadorView reservation={reservation} />
      ) : (
        <ConductorView reservation={reservation} />
      )}
    </div>
  )
}

interface TransferInfoSectionProps {
  transferCode: string
  transferAlias: string | null
  transferExpiresAt: string | null
  totalCents: number
}

function TransferInfoSection({
  transferCode,
  transferAlias,
  transferExpiresAt,
  totalCents,
}: TransferInfoSectionProps) {
  const [now, setNow] = useState(() => Date.now())
  const handleCopy = (text: string) => navigator.clipboard.writeText(text)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const expiresIn = () => {
    if (!transferExpiresAt) return ''
    const diff = new Date(transferExpiresAt).getTime() - now
    if (diff <= 0) return 'Expirado'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <>
      <Separator />
      <div className="px-4 py-3 space-y-3">
        <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          {t('reservas.transfer.details')}
        </p>
        <div className="rounded-xl bg-amber-400/10 border border-amber-400/20 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <p className="text-xs text-text-muted">
              {t('reservas.transfer.expiresIn')} {expiresIn()}
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-muted">CBU / CVU</p>
              <button
                onClick={() => handleCopy(transferCode)}
                className="rounded p-1 hover:bg-surface-2 transition-colors"
              >
                <Copy className="h-3.5 w-3.5 text-text-muted" />
              </button>
            </div>
            <p className="font-mono text-sm font-semibold text-text-primary break-all">
              {transferCode}
            </p>
          </div>
          {transferAlias && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-muted">Alias</p>
                <button
                  onClick={() => handleCopy(transferAlias!)}
                  className="rounded p-1 hover:bg-surface-2 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5 text-text-muted" />
                </button>
              </div>
              <p className="font-mono text-sm font-semibold text-text-primary">
                {transferAlias}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-text-muted">{t('reservas.detail.total')}</p>
            <p className="text-lg font-bold text-brand-400">{fmt.currency(totalCents)}</p>
          </div>
        </div>
      </div>
    </>
  )
}
