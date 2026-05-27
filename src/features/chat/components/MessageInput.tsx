import { useRef, useState } from 'react'
import { PaperPlaneTilt } from '@phosphor-icons/react'
import { t } from '@/i18n/es'

interface MessageInputProps {
  onSend: (body: string) => void
  disabled?: boolean
}

const MAX_CHARS = 1000

/**
 * Input de texto + botón de envío. Enter envía, Shift+Enter inserta salto de
 * línea. Muestra contador de caracteres cuando se acerca al límite (>800).
 */
export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const trimmed = value.trim()
  const canSend = trimmed.length > 0 && trimmed.length <= MAX_CHARS && !disabled

  const handleSend = () => {
    if (!canSend) return
    onSend(trimmed)
    setValue('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-white/8 bg-surface-1 px-3 py-3">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.input.placeholder')}
          rows={1}
          maxLength={MAX_CHARS}
          disabled={disabled}
          className="w-full resize-none rounded-xl border border-white/8 bg-surface-2 px-3 py-2.5 text-sm leading-[1.5] text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500 disabled:opacity-50 max-h-32 overflow-y-auto"
        />
        {value.length > 800 && (
          <p
            className={`absolute right-2 bottom-2 text-[10px] ${
              value.length >= MAX_CHARS ? 'text-danger-400' : 'text-text-muted'
            }`}
          >
            {value.length}/{MAX_CHARS}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        aria-label={t('chat.input.send')}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white disabled:opacity-40 active:scale-95 transition-transform"
      >
        <PaperPlaneTilt weight="fill" className="h-5 w-5" />
      </button>
    </div>
  )
}
