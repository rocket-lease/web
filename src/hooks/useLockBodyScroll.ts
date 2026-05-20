import { useEffect } from 'react'

/**
 * Hook que bloquea el scroll del `<body>` mientras el componente esté montado
 * y lo restaura al desmontar. Pensado para modales y drawers full-screen que
 * quieren impedir que el contenido de fondo se scrollee mientras están abiertos.
 *
 * Guarda el valor previo de `document.body.style.overflow` y lo restaura,
 * para no pisar configuraciones existentes (por ejemplo, otro modal anidado).
 */
export function useLockBodyScroll(): void {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])
}
