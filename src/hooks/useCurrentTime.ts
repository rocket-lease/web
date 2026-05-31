import { useEffect, useState } from 'react'

/**
 * Devuelve `Date.now()` y lo refresca en intervalos regulares para que
 * cualquier comparación derivada del tiempo presente se reevalúe sin
 * depender de re-renders externos.
 *
 * Sirve para flags tipo "vence pronto" o "falta menos de X horas" que
 * comparan un timestamp futuro contra el ahora.
 *
 * @param intervalMs Frecuencia de refresco (default 60s).
 */
export function useCurrentTime(intervalMs: number = 60_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
