import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { t } from '@/i18n/es'

interface HoldCountdownProps {
  expiresAt: string
  onExpire: () => void
}

export function HoldCountdown({ expiresAt, onExpire }: HoldCountdownProps) {
  const [remainingMs, setRemainingMs] = useState(
    () => new Date(expiresAt).getTime() - Date.now(),
  )

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = new Date(expiresAt).getTime() - Date.now()
      setRemainingMs(next)
      if (next <= 0) {
        window.clearInterval(id)
        onExpire()
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [expiresAt, onExpire])

  const totalSec = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60
  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`

  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">
      <Clock className="h-4 w-4 text-warning" />
      <span className="text-text-secondary">{t('reservar.holdExpiresIn')}</span>
      <span className="font-mono font-semibold text-text-primary">
        {formatted}
      </span>
    </div>
  )
}
