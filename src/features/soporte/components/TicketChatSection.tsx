import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ChatCircleDots, Info } from '@phosphor-icons/react'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import { useTicketMessages } from '../hooks/useTicketMessages'
import { useSendTicketMessage } from '../hooks/useSendTicketMessage'

interface TicketChatSectionProps {
  ticketId: string
  currentUserId: string
  channelParticipantId: string
  isClosed: boolean
  label?: string
  accentClass?: string
}

export function TicketChatSection({
  ticketId,
  currentUserId,
  channelParticipantId,
  isClosed,
  label,
  accentClass = 'ring-brand-500 bg-brand-500',
}: TicketChatSectionProps) {
  const messagesQuery = useTicketMessages(ticketId, channelParticipantId)
  const sendMessage = useSendTicketMessage(ticketId, currentUserId, channelParticipantId)
  const messages = messagesQuery.data?.items ?? []
  const [messageBody, setMessageBody] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSend() {
    const body = messageBody.trim()
    if (!body || sendMessage.isPending) return
    setMessageBody('')
    try {
      await sendMessage.mutateAsync(body)
    } catch {
      toast.error(t('ticketMessages.error.send'))
    }
  }

  return (
    <div className="rounded-2xl bg-surface-1 border border-white/6 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/6 px-4 py-3">
        <ChatCircleDots className="h-4 w-4 text-brand-400" weight="duotone" />
        <p className="font-semibold text-sm text-text-primary flex-1">
          {label ?? t('ticketMessages.title')}
        </p>
      </div>

      <div className="flex flex-col min-h-[200px] max-h-[360px]">
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messagesQuery.isPending && messagesQuery.isFetching && (
            <p className="text-center text-sm text-text-muted py-4">{t('general.loading')}</p>
          )}
          {!messagesQuery.isPending && messages.length === 0 && (
            <p className="text-center text-sm text-text-muted py-4">{t('ticketMessages.empty')}</p>
          )}
          {messages.map((msg) => {
            if (msg.messageType === 'info_request') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="flex items-start gap-2 rounded-2xl border border-warning/20 bg-warning/8 px-3 py-2 max-w-[88%]">
                    <Info size={14} weight="duotone" className="text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-warning mb-0.5">
                        {t('ticketMessages.infoRequest')}
                      </p>
                      <p className="text-sm text-text-primary leading-relaxed break-words">{msg.body}</p>
                      <p className="mt-1 text-[10px] text-text-muted">{fmt.time(msg.sentAt)}</p>
                    </div>
                  </div>
                </div>
              )
            }

            const isOwn = msg.senderId === currentUserId
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                    isOwn
                      ? `rounded-br-sm ${accentClass} text-white`
                      : 'rounded-bl-sm bg-surface-2 text-text-primary'
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{msg.body}</p>
                  <p className={`mt-1 text-right text-[10px] ${isOwn ? 'text-white/60' : 'text-text-muted'}`}>
                    {fmt.time(msg.sentAt)}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {!isClosed && (
          <div className="border-t border-white/6 flex gap-2 px-3 py-2">
            <input
              type="text"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend() } }}
              placeholder={t('ticketMessages.inputPlaceholder')}
              maxLength={1000}
              disabled={sendMessage.isPending}
              className="flex-1 rounded-full bg-surface-2 px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!messageBody.trim() || sendMessage.isPending}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white disabled:opacity-40 active:scale-95 transition-transform"
              aria-label={t('ticketMessages.sendAriaLabel')}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
