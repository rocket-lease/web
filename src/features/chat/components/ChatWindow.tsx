import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { ChatCircleDots } from '@phosphor-icons/react'
import { t } from '@/i18n/es'
import { useMessages } from '../hooks/useMessages'
import { useSendMessage } from '../hooks/useSendMessage'
import { markAsRead } from '../hooks/useUnreadCount'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'

interface ChatWindowProps {
  reservationId: string
  currentUserId: string
}

/**
 * Ventana de chat completa: lista de mensajes con auto-scroll y MessageInput.
 * Hace polling cada 5 segundos vía useMessages (refetchInterval).
 */
export function ChatWindow({
  reservationId,
  currentUserId,
}: ChatWindowProps) {
  const messagesQuery = useMessages(reservationId)
  const sendMessage = useSendMessage(reservationId, currentUserId)
  const bottomRef = useRef<HTMLDivElement>(null)

  const messages = messagesQuery.data?.items ?? []

  useEffect(() => {
    markAsRead(reservationId)
    return () => { markAsRead(reservationId) }
  }, [reservationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async (body: string) => {
    try {
      await sendMessage.mutateAsync(body)
    } catch {
      toast.error(t('chat.error.send'))
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messagesQuery.isPending && (
          <p className="text-center text-sm text-text-muted py-8">
            {t('general.loading')}
          </p>
        )}

        {messagesQuery.isError && (
          <p className="text-center text-sm text-danger-400 py-8">
            {t('chat.error.load')}
          </p>
        )}

        {!messagesQuery.isPending && !messagesQuery.isError && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted">
            <ChatCircleDots weight="duotone" className="h-12 w-12 opacity-40" />
            <p className="text-sm text-center">{t('chat.empty')}</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageInput
        onSend={handleSend}
        disabled={sendMessage.isPending}
      />
    </div>
  )
}
