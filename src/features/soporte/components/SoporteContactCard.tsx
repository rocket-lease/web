import { MessageSquare, Mail, Clock, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactOption {
  icon: React.FC<{ className?: string }>
  label: string
  value: string
  href?: string
  className?: string
}

function ContactRow({ icon: Icon, label, value, href, className }: ContactOption) {
  const content = (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600/15 border border-brand-600/20">
        <Icon className="h-4 w-4 text-brand-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text-primary truncate">{value}</p>
      </div>
      {href && <ExternalLink className="h-4 w-4 text-text-muted shrink-0" />}
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-surface-2 rounded-xl transition-colors px-1">
        {content}
      </a>
    )
  }
  return <div className="px-1">{content}</div>
}

export function SoporteContactCard() {
  return (
    <div className="rounded-2xl bg-surface-1 border border-white/6 p-4">
      <p className="text-sm font-semibold text-text-primary mb-1">¿Necesitás más ayuda?</p>
      <p className="text-xs text-text-muted mb-3">Nuestro equipo está listo para ayudarte</p>

      <div className="divide-y divide-white/6">
        <ContactRow
          icon={MessageSquare}
          label="Chat en la app"
          value="Respuesta inmediata"
        />
        <ContactRow
          icon={() => (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-brand-400">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.857L0 24l6.335-1.51A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.857 0-3.6-.48-5.112-1.32l-.366-.217-3.772.9.937-3.666-.239-.384A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
          )}
          label="WhatsApp"
          value="+54 11 3456-7890"
          href="https://wa.me/5411345678900"
        />
        <ContactRow
          icon={Mail}
          label="Email"
          value="hola@rocketleaser.com"
          href="mailto:hola@rocketleaser.com"
        />
        <ContactRow
          icon={Clock}
          label="Horario de atención"
          value="Lun-Vie 9:00 a 20:00 hs"
        />
      </div>
    </div>
  )
}
