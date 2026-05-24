import { WhatsappLogo } from '@phosphor-icons/react'
import { t } from '@/i18n/es'

interface WhatsAppContactButtonProps {
  phone: string
  name: string
}

/**
 * Botón que abre un chat de WhatsApp con el rentador.
 * Solo visible en la vista del conductor.
 * El número se normaliza quitando todo lo que no sea dígito.
 */
export function WhatsAppContactButton({ phone, name }: WhatsAppContactButtonProps) {
  const digits = phone.replace(/\D/g, '')
  const url = `https://wa.me/${digits}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('chat.whatsapp.ariaLabel').replace('{name}', name)}
      className="flex items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-3 text-sm font-medium text-[#25D366] hover:bg-[#25D366]/20 active:scale-[0.99] transition-colors w-full"
    >
      <WhatsappLogo weight="fill" className="h-5 w-5" />
      {t('chat.whatsapp.cta').replace('{name}', name)}
    </a>
  )
}
