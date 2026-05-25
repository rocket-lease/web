import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { RESERVATION_STATUS } from '@rocket-lease/contracts'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { profileApi } from '@/features/perfil/api/profile.api'
import { reservarApi } from '@/features/reservar/api/reservar.api'
import { ChatWindow } from '@/features/chat/components/ChatWindow'
import { WhatsAppContactButton } from '@/features/chat/components/WhatsAppContactButton'
import { t } from '@/i18n/es'

/**
 * Página de chat interno entre conductor y rentador para una reserva.
 *
 * El conductor ve además el botón de WhatsApp con el teléfono del rentador
 * (requiere fetch adicional al perfil público). El rentador solo ve el chat.
 */
function ChatPage() {
  const { id: reservationId = '' } = useParams({ strict: false })
  const { user } = useAuth()

  const reservationQuery = useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: () => reservarApi.getById(reservationId),
    staleTime: 30_000,
  })

  const reservation = reservationQuery.data

  const isConductor =
    reservation !== undefined && user !== null && reservation.conductorId === user.id

  const rentadorProfileQuery = useQuery({
    queryKey: ['profile', reservation?.rentador.id],
    queryFn: () => profileApi.getProfileById(reservation!.rentador.id),
    enabled: isConductor && reservation !== undefined,
    staleTime: 60_000,
  })

  const chatAllowed =
    reservation !== undefined &&
    (reservation.status === RESERVATION_STATUS.confirmed ||
      reservation.status === RESERVATION_STATUS.in_progress)

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-surface-1">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
        <Link
          to="/reservas/$id"
          params={{ id: reservationId }}
          aria-label={t('general.back')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-text-primary active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-4 w-4" weight="bold" />
        </Link>
        <h1 className="text-base font-semibold text-text-primary">
          {t('chat.title')}
        </h1>
      </div>

      {/* WhatsApp CTA — solo visible al conductor cuando hay teléfono */}
      {isConductor && rentadorProfileQuery.data?.phone && (
        <div className="border-b border-white/8 px-4 py-3">
          <WhatsAppContactButton
            phone={rentadorProfileQuery.data.phone}
            name={reservation?.rentador.name ?? ''}
          />
        </div>
      )}

      {/* Cuerpo del chat */}
      <div className="flex-1 overflow-hidden">
        {reservationQuery.isPending && (
          <p className="py-12 text-center text-sm text-text-muted">
            {t('general.loading')}
          </p>
        )}

        {reservation !== undefined && user !== null && chatAllowed && (
          <ChatWindow
            reservationId={reservationId}
            currentUserId={user.id}
          />
        )}

        {reservation !== undefined && !chatAllowed && (
          <p className="py-12 text-center text-sm text-danger-400">
            {t('chat.error.load')}
          </p>
        )}
      </div>
    </div>
  )
}

function ChatRoute() {
  return (
    <AuthGate>
      <ChatPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/reservas_/$id_/chat')({
  component: ChatRoute,
})
