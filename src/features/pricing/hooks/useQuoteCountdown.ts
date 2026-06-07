import { useEffect, useState } from 'react'

export interface QuoteCountdown {
  secondsLeft: number
  totalSeconds: number
  percentLeft: number
  isExpired: boolean
  label: string
}

/**
 * Devuelve el tiempo restante hasta `expiresAtIso` formateado como `mm:ss`
 * junto con el porcentaje del TTL original que aún queda. El TTL se infiere de
 * la primera lectura del `expiresAt` y se renueva cuando llega un nuevo quote.
 */
export function useQuoteCountdown(expiresAtIso: string | null | undefined): QuoteCountdown {
  const [now, setNow] = useState(() => Date.now())
  const [totalSeconds, setTotalSeconds] = useState(0)

  useEffect(() => {
    if (!expiresAtIso) {
      setTotalSeconds(0)
      return
    }
    const total = Math.max(
      0,
      Math.ceil((new Date(expiresAtIso).getTime() - Date.now()) / 1000),
    )
    setTotalSeconds(total)
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [expiresAtIso])

  if (!expiresAtIso) {
    return { secondsLeft: 0, totalSeconds: 0, percentLeft: 0, isExpired: false, label: '' }
  }

  const expiresAtMs = new Date(expiresAtIso).getTime()
  const secondsLeft = Math.max(0, Math.ceil((expiresAtMs - now) / 1000))
  const percentLeft =
    totalSeconds > 0
      ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100))
      : 0
  const isExpired = secondsLeft <= 0
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const label = `${minutes}:${seconds.toString().padStart(2, '0')}`

  return { secondsLeft, totalSeconds, percentLeft, isExpired, label }
}
