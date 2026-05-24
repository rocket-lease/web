import { fmt } from '@/lib/formatters'
import type { Message } from '@rocket-lease/contracts'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

/**
 * Burbuja de mensaje individual. Las propias (`isOwn`) se alinean a la derecha
 * con fondo de marca; las del otro participante se alinean a la izquierda.
 */
export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 ${
          isOwn
            ? 'rounded-br-sm bg-brand-500 text-white'
            : 'rounded-bl-sm bg-surface-2 text-text-primary'
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{message.body}</p>
        <p
          className={`mt-1 text-right text-[10px] ${
            isOwn ? 'text-white/60' : 'text-text-muted'
          }`}
        >
          {fmt.time(message.sentAt)}
        </p>
      </div>
    </div>
  )
}
