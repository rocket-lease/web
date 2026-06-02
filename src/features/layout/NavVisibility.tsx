import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface NavVisibilityValue {
  visible: boolean
  setHidden: (key: string) => void
  setVisible: (key: string) => void
}

const NavVisibilityContext = createContext<NavVisibilityValue | null>(null)

/**
 * Provider que controla si la bottom navbar global se renderiza. Cualquier
 * page puede pedir ocultarla pasando una `key` propia; mientras al menos
 * una key esté presente, la nav queda oculta. Esto evita "race conditions"
 * cuando dos componentes piden ocultarla en simultáneo.
 *
 * Uso típico desde una page:
 *   const nav = useNavVisibility()
 *   useEffect(() => {
 *     if (condition) nav.setHidden('mi-page')
 *     else nav.setVisible('mi-page')
 *     return () => nav.setVisible('mi-page')
 *   }, [condition])
 */
export function NavVisibilityProvider({ children }: { children: ReactNode }) {
  const [hiddenBy, setHiddenBy] = useState<Set<string>>(() => new Set())

  const setHidden = useCallback((key: string) => {
    setHiddenBy(prev => {
      if (prev.has(key)) return prev
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }, [])

  const setVisible = useCallback((key: string) => {
    setHiddenBy(prev => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }, [])

  // Memoizado para que los consumers no se re-rendericen y los efectos
  // dependientes de `nav` no entren en loop.
  const value = useMemo(
    () => ({ visible: hiddenBy.size === 0, setHidden, setVisible }),
    [hiddenBy, setHidden, setVisible],
  )

  return (
    <NavVisibilityContext.Provider value={value}>
      {children}
    </NavVisibilityContext.Provider>
  )
}

export function useNavVisibility(): NavVisibilityValue {
  const ctx = useContext(NavVisibilityContext)
  if (!ctx) throw new Error('useNavVisibility must be used within NavVisibilityProvider')
  return ctx
}

/**
 * Hook conveniencia: oculta la nav mientras `hidden === true`, la restaura
 * al cambiar a `false` o al desmontar. La `key` evita conflictos entre
 * páginas que piden ocultar la nav simultáneamente.
 *
 * Las deps son las funciones estables del context (no `nav` entero), si no
 * cada cambio del value re-corre el effect y el cleanup en loop.
 */
export function useHideNav(key: string, hidden: boolean): void {
  const { setHidden, setVisible } = useNavVisibility()
  useEffect(() => {
    if (hidden) setHidden(key)
    else setVisible(key)
    return () => setVisible(key)
  }, [key, hidden, setHidden, setVisible])
}
